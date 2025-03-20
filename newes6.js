import { execSync } from "child_process";

const author = "prasbhara0604@gmail.com";
const branch = "main";

for (let year = 2019; year <= 2025; year++) {
    const endMonth = year === 2025 ? 2 : 12; // Sampai Februari 2025 saja
    for (let month = 1; month <= endMonth; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00+08:00`;
            const message = `Commit #${day} on ${date}`;

            execSync(`echo "Fake commit for ${date}" > fake_commit.txt`);
            execSync("git add fake_commit.txt");
            execSync(`GIT_COMMITTER_DATE="${date}" git commit -m "${message}" --date "${date}" --author="${author}"`);
        }
    }
}

console.log("Fake commits created from 2019 to February 2025!");
