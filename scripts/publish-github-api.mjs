import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const token = process.env.CARESPEAK_GITHUB_PAT;
const owner = "sanjiaoxing886";
const repo = "carespeak-doctor-english";

if (!token) throw new Error("CARESPEAK_GITHUB_PAT is required");

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${response.status} ${payload.message ?? response.statusText}`);
  }
  return payload;
}

const files = execFileSync("git", ["ls-files", "-z"])
  .toString()
  .split("\0")
  .filter(Boolean);
const currentRef = await github(`/repos/${owner}/${repo}/git/ref/heads/main`);

const entries = [];
for (let index = 0; index < files.length; index += 6) {
  const batch = files.slice(index, index + 6);
  const blobs = await Promise.all(
    batch.map(async (path) => {
      const content = await readFile(path);
      const blob = await github(`/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }),
      });
      return { path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );
  entries.push(...blobs);
}

const tree = await github(`/repos/${owner}/${repo}/git/trees`, {
  method: "POST",
  body: JSON.stringify({ tree: entries }),
});
const commit = await github(`/repos/${owner}/${repo}/git/commits`, {
  method: "POST",
  body: JSON.stringify({
    message: "Publish CareSpeak medical English app",
    tree: tree.sha,
    parents: [currentRef.object.sha],
  }),
});
await github(`/repos/${owner}/${repo}/git/refs/heads/main`, {
  method: "PATCH",
  body: JSON.stringify({ sha: commit.sha }),
});

console.log(`Published ${files.length} files at ${commit.sha}`);
