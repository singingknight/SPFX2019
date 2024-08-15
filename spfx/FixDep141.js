const fs = require('fs');
const lockedVersionFile = 'package-lock.json';
if (fs.existsSync(lockedVersionFile)) {
    const lockedVersionJson = JSON.parse(fs.readFileSync(lockedVersionFile));
    if (lockedVersionJson.dependencies) {
        const lockedVinylFSJson = lockedVersionJson.dependencies["vinyl-fs"];
        if (lockedVinylFSJson && lockedVinylFSJson["dependencies"] && lockedVinylFSJson["dependencies"]["graceful-fs"] && lockedVinylFSJson["dependencies"]["graceful-fs"]["version"] != "4.2.11") {
            lockedVinylFSJson["dependencies"]["graceful-fs"] = {
                "version": "4.2.11",
                "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
                "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
                "dev": true
            };
            fs.writeFileSync(lockedVersionFile, JSON.stringify(lockedVersionJson, undefined, 2));
            console.log("Fixed graceful-fs version to 4.2.11 in package-lock.json");
            console.log("Run nmp install again");
        }
    }
}

const vinylFSFile = 'node_modules/vinyl-fs/package.json';
if (fs.existsSync(vinylFSFile)) {
    const vinylFSJson = JSON.parse(fs.readFileSync(vinylFSFile));
    if (vinylFSJson && vinylFSJson["dependencies"] && vinylFSJson["dependencies"]["graceful-fs"] && vinylFSJson["dependencies"]["graceful-fs"] != "4.2.11") {
        vinylFSJson["dependencies"]["graceful-fs"] = "4.2.11";
        fs.writeFileSync(vinylFSFile, JSON.stringify(vinylFSJson, undefined, 2));
        console.log("Fixed graceful-fs version to 4.2.11 in node-modules/vinyl-fs/package.json");
        console.log("Run nmp install again");
    }
}