import { readdirSync, statSync, readFileSync, writeFileSync, lstatSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { join } from "path";

const replacementDir = {
    "https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.js": "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js",
    "https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js": "https://cdn.jsdelivr.net/npm/vuetify@2.6.2/dist/vuetify.min.js"
}

function _copyFolderRecursiveSync( source: string, target: string ): void {
    let filesToCopy = [];

    // Check if folder needs to be created or integrated
    // let targetFolder = join(target, basename(source));
    let targetFolder = target;
    if (!existsSync(targetFolder)) {
        mkdirSync(targetFolder);
    }

    // Copy
    if (lstatSync(source).isDirectory()) {
        filesToCopy = readdirSync(source);
        filesToCopy.forEach(function (file) {
            let curSource = join(source, file);
            if (lstatSync(curSource).isDirectory()) {
                _copyFolderRecursiveSync(curSource, join(targetFolder, file));
            } else {
                copyFileSync(curSource, join(targetFolder, file));
            }
        });
    }
}

function _walkDirectory(directory: string, filter?: string): string[] {
    let files = [] as string[];

    for(let i of readdirSync(directory)) {
        let name = directory + "/" + i;
        if(statSync(name).isDirectory()) {
            files = files.concat(_walkDirectory(name, filter));
        } else {
            if(filter) {
                if(name.match(filter)) {
                    files.push(name);
                }
            } else {
                files.push(name);
            }
        }
    }

    return files;
}

function _replaceInFile(file: string, old: string, replacement: string): void {
    let filecontents = readFileSync(file, {encoding: 'utf-8'});
    let regex = new RegExp(old, "g");
    filecontents = filecontents.replace(regex, replacement);
    writeFileSync(file, filecontents, {encoding: 'utf-8'});
}

function _prettyPrintStatus(current: number, total: number, currentStatus: string): void {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write("[" + current.toString() + "/" + total.toString() + "] " + currentStatus);
}

_copyFolderRecursiveSync("out", "deploy");
_copyFolderRecursiveSync("html", "deploy/html");
copyFileSync("package.json", "deploy/package.json");
copyFileSync("yarn.lock", "deploy/yarn.lock");
copyFileSync("run.sh", "deploy/run.sh");

process.stdout.write("[  /  ] Searching for files...");
const files = _walkDirectory("deploy", ".html");
for(let fileIndex=0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];
    _prettyPrintStatus(fileIndex+1, files.length, file);
    for(let old in replacementDir) {
        _replaceInFile(file, old, replacementDir[old]);
    }
}
_replaceInFile("deploy/utils.js", "dev", "");
_prettyPrintStatus(files.length, files.length, "Finished!\n");
