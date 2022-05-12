import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const default_cache = path.join(os.tmpdir(), ".dlgit");

export function setup_cache(dir = default_cache) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function clear_cache(dir = default_cache) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
    }
}
