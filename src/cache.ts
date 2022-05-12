import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function setup_cache(dir = path.join(os.tmpdir(), ".dlgit")) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function clear_cache(dir = path.join(os.tmpdir(), ".dlgit")) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
    }
}
