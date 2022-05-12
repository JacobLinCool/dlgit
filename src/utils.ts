import crypto from "node:crypto";

const domain_suffix: Record<string, string> = {
    github: "com",
    gitlab: "com",
    bitbucket: "org",
};

/**
 * Locate the URL of given repository.
 * @param location The repository location.
 * @returns The URL and branch of the repository.
 */
export function locate(location: string): {
    url: string;
    repo: string;
    branch: string;
} {
    const regex =
        /^(?:(?:https:\/\/)?([^:/]+\.[^:/]+)\/|git@([^:/]+)[:/]|([^/]+):)?([^/\s]+)\/([^/\s#]+)(?:\/)?(?:#(.+))?/;
    const match = regex.exec(location);

    const [_, http_domain, ssh_domain, prefix, owner, repo, branch] = match;
    const site = (http_domain || ssh_domain || prefix || "github").replace(/\.(com|org)$/, "");
    if (!domain_suffix[site]) {
        return null;
    }

    return {
        url: `https://${site}.${domain_suffix[site]}/${owner}/${repo}`,
        repo,
        branch: branch || "",
    };
}

export function hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex").substring(0, 10);
}
