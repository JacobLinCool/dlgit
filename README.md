# dlgit

Download part of a git repository without wasting your bandwidth.

Working in progress... Now only support GitHub.

## Why

`dlgit` can download only part of a git repository by using `spare checkout` and cache, it can reduce the time to download the entire repository.

## Usage

### Install Globally

```sh
npm i -g dlgit
dlgit --help

# dg --help
# this should work as well since dg is the alias of dlgit
```

### Just Run

```sh
npx dlgit --help
```

## Help

```sh
❯ dlgit -h
Usage: dlgit [options] [command]

Options:
  -V, --version          output the version number
  -o, --owner [owner]    Github Owner
  -r, --repo [repo]      Github Repo
  -b, --branch [branch]  Github Branch
  -d, --dir [dir]        Directory to download
  -c, --cache [cache]    Cache directory
  -T, --ttl [ttl]        Cache TTL (ms)
  -t, --to [to]          Destination directory
  -h, --help             display help for command

Commands:
  clear-cache [options]
```

## API

It supports both `ESM` and `CJS` modules.

```ts
import Dlgit from "dlgit";

Dlgit.dl({
    owner: "owner",
    repo: "repo",
    branch: "branch",
    dir: "dir",
    cache: "cache",
    ttl: 1000 * 60 * 60 * 24,
    to: "to",
});
```
