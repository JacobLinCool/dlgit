import EventEmitter from "node:events";
import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import simple_git from "simple-git";
import { setup_cache } from "./cache";

export class Dlgit extends EventEmitter {
    constructor() {
        super();
    }

    async download({
        owner = "",
        repo = "",
        branch = "",
        dir = "",
        cache = path.join(os.tmpdir(), ".dlgit"),
        ttl = 1000 * 60 * 60 * 24,
        to = process.cwd(),
    } = {}) {
        setup_cache(cache);
        const temp = path.join(cache, `-${owner}-${repo}-${branch}`);
        const completed = path.join(cache, `${owner}-${repo}-${branch}`);

        if (
            !fs.existsSync(path.join(completed, dir, ".dlgit")) ||
            fs.statSync(path.join(completed, dir, ".dlgit")).mtimeMs < Date.now() - ttl
        ) {
            this.emit("download", { temp, cache: completed });

            if (fs.existsSync(temp)) {
                fs.rmSync(temp, { recursive: true });
            }
            fs.mkdirSync(temp, { recursive: true });
            const git = simple_git({ baseDir: temp });

            const config: Record<string, null | string> = {
                "--no-checkout": null,
                "--depth": "1",
                "--single-branch": null,
            };
            if (branch) {
                config["--branch"] = branch;
            }
            await git.clone(`https://github.com/${owner}/${repo}/`, temp, config);

            if (dir) {
                await git.addConfig("core.sparseCheckout", "true");
                fs.writeFileSync(path.join(temp, ".git/info/sparse-checkout"), dir);
            }

            branch = (await git.branchLocal()).current;
            await git.checkout(branch);

            fs.rmSync(path.join(temp, ".git"), { recursive: true });
            fs.cpSync(temp, completed, { recursive: true, preserveTimestamps: true });
            fs.writeFileSync(path.join(completed, dir, ".dlgit"), Date.now().toString());
            this.emit("downloaded", { cached: completed });
            fs.rmSync(temp, { recursive: true });
        } else {
            this.emit("cached", {
                cached: completed,
                ttl: ttl - (Date.now() - fs.statSync(path.join(completed, dir)).mtimeMs),
            });
        }

        fs.copySync(path.join(completed, dir), path.join(to, path.basename(dir || repo)));
        fs.rmSync(path.join(to, path.basename(dir || repo), ".dlgit"));
        this.emit("done", { dest: path.resolve(to, path.basename(dir || repo)) });
    }

    public dl = this.download;
}

export default Dlgit;
