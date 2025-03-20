import { execSync } from "child_process";
import random from "random";

const author = "prasbhara0604@gmail.com";
const branch = "main";

for (let day = 1; day <= 9; day++) {
    const date = `2025-03-${String(day).padStart(2, "0")}T12:00:00+08:00`;
    const commitCount = random.int(10, 25); // Random 10 - 25 commit per hari

    for (let commit = 1; commit <= commitCount; commit++) {
        const commitTime = `2025-03-${String(day).padStart(2, "0")}T${random.int(0, 23)}:${random.int(0, 59)}:${random.int(0, 59)}+08:00`;
        const message = `Commit #${commit} on ${commitTime}`;

        execSync(`echo "Fake commit for ${commitTime}" > fake_commit.txt`);
        execSync("git add fake_commit.txt");
        execSync(`GIT_COMMITTER_DATE="${commitTime}" git commit -m "${message}" --date "${commitTime}" --author="${author}"`);
    }

    console.log(`✅ ${commitCount} commits created for ${date}`);
}

console.log("🎉 Fake commits from 1 - 9 Maret 2025 created successfully!");
