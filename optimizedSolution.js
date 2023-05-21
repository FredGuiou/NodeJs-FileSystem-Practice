// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";

// CONSTANTS
const kFolderPath = process.argv[2] ?? "./playground";

async function getExtAndSize(folderPath) {
    try {
        let totalSize = 0;
        const exts = new Set();

        const files = await fs.readdir(folderPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(folderPath, file.name);

            const arrPromises = [];
            if (file.isDirectory()) {
                const { size, extensions } = await getExtAndSize(filePath);

                totalSize += size;

                for (const ext of extensions) {
                    exts.add(ext);
                }
            } else {
                const promise = fs.stat(filePath);
                arrPromises.push(promise);
                
                const fileExt = path.extname(file.name);
                exts.add(fileExt);
            }

            const sizeResults = await Promise.all(arrPromises);
            totalSize += sizeResults.reduce((prev, curr) => prev + curr.size, 0);
        }

        return { extensions: [...exts], size: totalSize };
    } catch (error) {
        console.log(error);

        return void 0;
    }
}

console.time("exec");
const { size, extensions } = await getExtAndSize(kFolderPath);
console.timeEnd("exec");

console.log(`Extensions: ${extensions.join(", ")}`);
console.log(`Size: ${size} bytes`);
