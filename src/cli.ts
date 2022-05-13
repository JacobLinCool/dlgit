#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import ora from "ora";
import { clear_cache, default_cache } from "./cache";
import Dlgit from "./dlgit";

const package_json = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

const program = new Command()
    .name(package_json.name)
    .version(package_json.version)
    .showHelpAfterError(true);

program
    .argument("<remote>", "Remote repository to download from (e.g. Open-OJ/3OJ#gh-pages)")
    .option("-s, --sub <dir>", "Subdirectory to download", "")
    .option("-c, --cache <cache>", "Cache directory", default_cache)
    .option("-T, --ttl <ttl>", "Cache TTL (ms)", (1000 * 60 * 60 * 24).toString())
    .option("-t, --to <to>", "Destination directory", "")
    .option("-f, --force", "Overwrite existing directory if it exists", false)
    .action(function () {
        const start = Date.now();
        const opts = this.opts();
        opts.ttl = parseInt(opts.ttl, 10);
        const dlgit = new Dlgit();
        const spinner = ora(`Starting...`).start();
        dlgit.on("download", (data) => {
            spinner.text = `Downloading... (${data.location.url}, ${data.location.branch})`;
        });
        dlgit.on("cloned", (data) => {
            spinner.succeed(`Cloned`).start();
        });
        dlgit.on("checkedout", (data) => {
            spinner.succeed(`Checked out`).start();
        });
        dlgit.on("downloaded", (data) => {
            spinner.succeed(`Downloaded! (cached: ${data.cached})`);
        });
        dlgit.on("cached", (data) => {
            spinner.succeed(`Cached! (expired after ${Math.round(data.ttl / 1000)}s)`);
        });
        dlgit.on("done", (data) => {
            spinner.succeed(
                `Done in ${((Date.now() - start) / 1000).toFixed(2)} s! (dest: ${data.dest})`,
            );
        });
        dlgit.download(this.args[0], opts).catch((err) => {
            spinner.fail(err.message);
        });
    });

program
    .command("clear-cache")
    .description("Clear the cache")
    .option("-c, --cache [cache]", "Cache directory", default_cache)
    .action(function () {
        clear_cache(this.opts().cache);
    });

program
    .command("parse <remote>")
    .description("Parse remote repository location")
    .action(function () {
        const remote = this.args[0];
        const location = locate(remote);
        console.log(JSON.stringify(location, null, 4));
    });

program.parse();
