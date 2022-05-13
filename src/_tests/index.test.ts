import fs from "node:fs";
import { Dlgit, clear_cache } from "../";

describe("Parse Remote Location", () => {
    const dlgit = new Dlgit();

    const githubs = [
        "owner/repo",
        "github:owner/repo",
        "git@github.com:owner/repo",
        "https://github.com/owner/repo",
        "git@github.com:owner/repo.git",
        "https://github.com/owner/repo.git",

        "owner/repo#branch/abc",
        "github:owner/repo#branch/abc",
        "git@github.com:owner/repo#branch/abc",
        "https://github.com/owner/repo#branch/abc",
        "git@github.com:owner/repo.git#branch/abc",
        "https://github.com/owner/repo.git#branch/abc",
    ];

    for (const github of githubs) {
        it(`should parse "${github}"`, () => {
            const parsed = dlgit.parse(github);
            expect(parsed).toEqual({
                url: parsed.url.endsWith(".git")
                    ? "https://github.com/owner/repo.git"
                    : "https://github.com/owner/repo",
                repo: "repo",
                branch: github.includes("#") ? "branch/abc" : "",
            });
        });
    }

    const gitlabs = [
        "gitlab:owner/repo",
        "git@gitlab.com:owner/repo",
        "https://gitlab.com/owner/repo",
        "git@gitlab.com:owner/repo.git",
        "https://gitlab.com/owner/repo.git",

        "gitlab:owner/repo#branch/abc",
        "git@gitlab.com:owner/repo#branch/abc",
        "https://gitlab.com/owner/repo#branch/abc",
        "git@gitlab.com:owner/repo.git#branch/abc",
        "https://gitlab.com/owner/repo.git#branch/abc",
    ];

    for (const gitlab of gitlabs) {
        it(`should parse "${gitlab}"`, () => {
            const parsed = dlgit.parse(gitlab);
            expect(parsed).toEqual({
                url: parsed.url.endsWith(".git")
                    ? "https://gitlab.com/owner/repo.git"
                    : "https://gitlab.com/owner/repo",
                repo: "repo",
                branch: gitlab.includes("#") ? "branch/abc" : "",
            });
        });
    }

    const bitbuckets = [
        "bitbucket:owner/repo",
        "git@bitbucket.org:owner/repo",
        "https://bitbucket.org/owner/repo",
        "git@bitbucket.org:owner/repo.git",
        "https://bitbucket.org/owner/repo.git",

        "bitbucket:owner/repo#branch/abc",
        "git@bitbucket.org:owner/repo#branch/abc",
        "https://bitbucket.org/owner/repo#branch/abc",
        "git@bitbucket.org:owner/repo.git#branch/abc",
        "https://bitbucket.org/owner/repo.git#branch/abc",
    ];

    for (const bitbucket of bitbuckets) {
        it(`should parse "${bitbucket}"`, () => {
            const parsed = dlgit.parse(bitbucket);
            expect(parsed).toEqual({
                url: parsed.url.endsWith(".git")
                    ? "https://bitbucket.org/owner/repo.git"
                    : "https://bitbucket.org/owner/repo",
                repo: "repo",
                branch: bitbucket.includes("#") ? "branch/abc" : "",
            });
        });
    }

    const selfhosts = [
        "git@gitlab.noj.tw:noj/codebase/frontend",
        "https://gitlab.noj.tw/noj/codebase/frontend",
        "git@gitlab.noj.tw:noj/codebase/frontend.git#branch/abc",
        "https://gitlab.noj.tw/noj/codebase/frontend.git#branch/abc",
    ];

    for (const selfhost of selfhosts) {
        it(`should parse "${selfhost}"`, () => {
            const parsed = dlgit.parse(selfhost);
            expect(parsed).toEqual({
                url: parsed.url.endsWith(".git")
                    ? "https://gitlab.noj.tw/noj/codebase/frontend.git"
                    : "https://gitlab.noj.tw/noj/codebase/frontend",
                repo: "frontend",
                branch: selfhost.includes("#") ? "branch/abc" : "",
            });
        });
    }

    it("sould fail to parse invalid location", () => {
        expect(() => dlgit.parse("invalid url")).toThrow();
    });
});

describe("Download", () => {
    clear_cache();
    const dlgit = new Dlgit();

    it("should download all files from default branch", async () => {
        await dlgit.download("JacobLinCool/Cimple-Lib");
        expect(fs.existsSync("./Cimple-Lib")).toBe(true);
        fs.rmSync("./Cimple-Lib", { recursive: true });
    });

    it("should download subdirectory from default branch", async () => {
        await dlgit.download("JacobLinCool/Cimple-Lib", {
            sub: "/.github/workflows",
        });
        expect(fs.existsSync("./workflows")).toBe(true);
        fs.rmSync("./workflows", { recursive: true });
    });

    it("should download all files from specified branch", async () => {
        await dlgit.download("JacobLinCool/Cimple-Lib#main");
        expect(fs.existsSync("./Cimple-Lib")).toBe(true);
        fs.rmSync("./Cimple-Lib", { recursive: true });
    });

    it("should download subdirectory from specified branch", async () => {
        await dlgit.download("JacobLinCool/Cimple-Lib#main", {
            sub: "/.github/workflows",
        });
        expect(fs.existsSync("./workflows")).toBe(true);
        fs.rmSync("./workflows", { recursive: true });
    });

    it("should be cached", async () => {
        const start = Date.now();
        await dlgit.download("JacobLinCool/Cimple-Lib");
        const end = Date.now();
        expect(fs.existsSync("./Cimple-Lib")).toBe(true);
        fs.rmSync("./Cimple-Lib", { recursive: true });
        expect(end - start).toBeLessThan(300);
    });

    it("custom cache directory", async () => {
        await dlgit.download("JacobLinCool/Cimple-Lib", {
            cache: "./cache",
        });
        expect(fs.existsSync("./Cimple-Lib")).toBe(true);
        fs.rmSync("./Cimple-Lib", { recursive: true });
        expect(fs.existsSync("./cache")).toBe(true);
        fs.rmSync("./cache", { recursive: true });
    });

    it("should throw", async () => {
        await expect(dlgit.download("Hello")).rejects.toThrow();
    });
});
