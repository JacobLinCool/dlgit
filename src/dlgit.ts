import EventEmitter from "node:events";
import path from "node:path";
import fs from "fs-extra";
import simple_git from "simple-git";
import { default_cache, setup_cache } from "./cache";
import { hash, locate } from "./utils";

export class Dlgit extends EventEmitter {
    constructor() {
        super();
    }

    async download(
        remote = "",
        { sub = "", cache = default_cache, ttl = 1000 * 60 * 60 * 24, to = "", force = false } = {},
    ) {
        setup_cache(cache);

        const location = locate(remote);
        if (!location) {
            throw new Error(`Invalid remote location: ${remote}`);
        }

        const key = hash(location.url + "|" + location.branch);
        const temp = path.resolve(cache, `-${key}`);
        const completed = path.resolve(cache, key);

        if (
            !fs.existsSync(path.join(completed, sub, ".dlgit")) ||
            fs.statSync(path.join(completed, sub, ".dlgit")).mtimeMs < Date.now() - ttl
        ) {
            this.emit("download", { location, sub, temp, cache: completed });

            if (fs.existsSync(temp)) {
                fs.rmSync(temp, { recursive: true });
            }
            fs.mkdirSync(temp, { recursive: true });
            const git = simple_git({ baseDir: temp });

            const config: Record<string, null | string> = {
                "--filter=blob:none": null,
                "--no-checkout": null,
                "--depth": "1",
            };
            if (location.branch) {
                config["--branch"] = location.branch;
            }
            await git.clone(location.url, temp, config);
            this.emit("cloned", { location, temp });

            if (sub) {
                await git.addConfig("core.sparseCheckout", "true");
                fs.writeFileSync(path.join(temp, ".git/info/sparse-checkout"), sub);
            }

            const branch = (await git.branchLocal()).current;
            if (!location.branch) {
                location.branch = branch;
            }
            await git.checkout(location.branch);
            this.emit("checkedout", { location, temp });

            fs.rmSync(path.join(temp, ".git"), { recursive: true });
            fs.copySync(temp, completed, { recursive: true, preserveTimestamps: true });
            fs.writeFileSync(path.join(completed, sub, ".dlgit"), Date.now().toString());
            this.emit("downloaded", { cached: completed });
            fs.rmSync(temp, { recursive: true });
        } else {
            this.emit("cached", {
                cached: completed,
                ttl: ttl - (Date.now() - fs.statSync(path.join(completed, sub)).mtimeMs),
            });
        }

        to = path.resolve(to || path.join(process.cwd(), path.basename(sub || location.repo)));
        if (!force && fs.existsSync(to) && fs.readdirSync(to).length > 0) {
            throw new Error(`Target directory "${to}" is not empty`);
        }

        fs.copySync(path.join(completed, sub), to);
        fs.rmSync(path.join(to, ".dlgit"));
        this.emit("done", { dest: to });
    }

    public dl = this.download;

    parse(remote: string) {
        const location = locate(remote);
        if (!location) {
            throw new Error(`Invalid remote location: ${remote}`);
        }

        return location;
    }
}

export default Dlgit;
