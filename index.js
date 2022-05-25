const shell = require("shelljs");
const readline = require("readline");
const inputReader = require("wait-console-input");

const git = {
  checkout: (branch) => shell.exec(`git checkout ${branch}`),
  getCurrentBranch: () =>
    shell.exec("git branch --show-current").stdout.replace(/\n/gi, ""),
  getCommitInfo: (startFromCommiId) =>
    shell
      .exec(`git log --pretty=oneline --reverse ${startFromCommiId}^^..HEAD`)
      .stdout.split("\n")
      .filter((value) => !!value)
      .map((str) => {
        const parts = str.split(" ");
        const id = parts[0];
        const message = parts.slice(1).join("");
        return { id, message };
      }),
  cherryPick: (id) => shell.exec(`git cherry-pick -n ${id}`),
};

const parseArgs = () => ({
  branch: process.argv[2],
  id: process.argv[3],
});

const { branch, id } = parseArgs();

const currentBranch = git.getCurrentBranch;

git.checkout(branch);

const idList = git.getCommitInfo(id);

git.checkout(currentBranch);

idList.forEach(({ id, message }, index) => {
  git.cherryPick(id);

  let key = undefined;
  do {
    key = inputReader.readChar("Press C to continue or A to abort");
  } while (key !== "c" && key !== "a");

  switch (key) {
    case "c":
      shell.exec("git commit --no-edit");
      console.log(`Commited ${index + 1}/${idList.length}`);
      break;
    case "a":
      console.log(`Stopped on ${index + 1}/${idList.length} ${id} ${message}`);
      process.exit(0);
  }
});
