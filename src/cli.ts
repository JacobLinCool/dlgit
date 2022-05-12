#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Command } from "commander";
import ora from "ora";
import { clear_cache } from "./cache";
import Dlgit from "./dlgit";

const package_json = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

const program = new Command()
    .name(package_json.name)
    .version(package_json.version)
    .showHelpAfterError(true);

program
    .option("-o, --owner [owner]", "Github Owner", "desktop")
    .option("-r, --repo [repo]", "Github Repo", "desktop")
    .option("-b, --branch [branch]", "Github Branch", "")
    .option("-d, --dir [dir]", "Directory to download", "docs")
    .option("-c, --cache [cache]", "Cache directory", path.join(os.tmpdir(), ".dlgit"))
    .option("-T, --ttl [ttl]", "Cache TTL (ms)", (1000 * 60 * 60 * 24).toString())
    .option("-t, --to [to]", "Destination directory", process.cwd())
    .action(function () {
        const start = Date.now();
        const opts = this.opts();
        opts.ttl = parseInt(opts.ttl, 10);
        const dlgit = new Dlgit();
        const spinner = ora(`Starting... ${JSON.stringify(opts)}`).start();
        dlgit.on("download", (data) => {
            spinner.text = `Downloading... (temp: ${data.temp})`;
        });
        dlgit.on("downloaded", (data) => {
            spinner.succeed(`Downloaded! (cached: ${data.cached})`);
        });
        dlgit.on("cached", (data) => {
            spinner.succeed(
                `Cached! (cached: ${data.cached}, ttl: ${Math.round(data.ttl / 1000)} s)`,
            );
        });
        dlgit.on("done", (data) => {
            spinner.succeed(
                `Done in ${Math.round((Date.now() - start) / 1000)} s! (dest: ${data.dest})`,
            );
        });
        dlgit.download(opts);
    });

program
    .command("clear-cache")
    .option("-c, --cache [cache]", "Cache directory", path.join(os.tmpdir(), ".dlgit"))
    .action(function () {
        clear_cache(this.opts().cache);
    });

program.parse();
