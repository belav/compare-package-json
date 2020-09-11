#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

function run() {
    let pathToJson = process.argv[2];
    if (!pathToJson) {
        pathToJson = "./";
    }
    const packageJsonPath = path.resolve(pathToJson, "package.json")
    if (!fs.existsSync(packageJsonPath)) {
        console.error("There was no package.json found at " + packageJsonPath);
        return;
    }
    const packageJson = require(packageJsonPath);

    const packageLockJsonPath = path.resolve(pathToJson, "package-lock.json");
    if (!fs.existsSync(packageLockJsonPath)) {
        console.error("There was no package-lock.json found at " + packageJsonPath);
        return;
    }
    const packageLockJson = require(packageLockJsonPath);

    const dependencyVersions = {};
    let longestName = "";
    let longestVersion = "";

    function doStuff(dependencies) {
        for (const name in dependencies) {
            if (name.length > longestName.length) {
                longestName = name;
            }
            const packageVersion = dependencies[name];
            if (packageVersion.length > longestVersion.length) {
                longestVersion = packageVersion;
            }
            dependencyVersions[name] = {
                name,
                packageVersion,
                lockVersion: packageLockJson.dependencies[name].version,
            };
        }
    }

    doStuff(packageJson.dependencies);
    doStuff(packageJson.devDependencies);

    const dependencyNames = Object.keys(dependencyVersions).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    for (const name of dependencyNames) {
        const dependency = dependencyVersions[name];
        if (dependency.packageVersion === dependency.lockVersion) {
            continue;
        }
        console.log(
            dependency.name.padEnd(longestName.length + 1) +
            " | " +
            dependency.packageVersion.padEnd() +
            " | " +
            dependency.lockVersion,
        );
    }
};

run();
