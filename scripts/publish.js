#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const semver = require("semver");
const git = require("git-rev-sync");
/**
 * Use cases
 *
 *  If no version is published, pick the version from the package.json and publish that version
 *
 *  If a version is published and the minor and major matches the package.json, publish a patch
 *
 *  If the packaje.json version minor and major differs from the published version, pick the latest published patch for the version of the package.json and increment the patch number
 *
 */
async function execute(command) {
    return new Promise((onSuccess, onError) => {
        child_process_1.exec(command, (error, stdout, stderr) => {
            stdout.length && console.log(stdout);
            stderr.length && console.error(stderr);
            if (error) {
                onError(stderr);
            }
            else {
                onSuccess(stdout);
            }
        });
    });
}
async function getBranch() {
    return git.branch();
}
async function setVersion(newVersion) {
    return await execute(`npm version ${newVersion} --force --no-git-tag-version --allow-same-version`);
}
async function publish(npmTag = null) {
    if (!npmTag) {
        return await execute(`npm publish`);
    }
    else {
        return await execute(`npm publish --tag=${npmTag}`);
    }
}
const fs = require("fs");
async function getVersion() {
    const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const pkgJsonVersion = json.version;
    const version = semver.parse(pkgJsonVersion.trim());
    if (!version) {
        throw new Error("Unable to parse semver from " + pkgJsonVersion);
    }
    const commit = git.short();
    if (!commit) {
        throw new Error("Unable to get git commit");
    }
    return `${version.major}.${version.minor}.${version.patch}-${git.short()}`;
}
console.log(`Current directory: ${process.cwd()}`);
const run = async () => {
    let branch = process.env.BRANCH_NAME || process.env.TRAVIS_BRANCH || (await getBranch());
    let npmTag = null;
    let gitTag = process.env.TRAVIS_TAG || null;
    let latestVersion;
    let newVersion = null;
    console.log(`Using branch ${branch}`);
    // Travis keeps the branch name in the tags' builds
    if (gitTag) {
        if (semver.valid(gitTag)) {
            // If the tags is a valid semver, we publish using that version and without any npmTag
            npmTag = null;
            newVersion = gitTag;
        }
    }
    else if (branch === "master") {
        npmTag = "latest";
    }
    else if (branch === "develop") {
        npmTag = "next";
    }
    else if (branch.startsWith("dev-")) {
        npmTag = branch;
    }
    if (!newVersion) {
        newVersion = await getVersion();
    }
    await setVersion(newVersion);
    console.log(`Publishing branch ${branch} with version=${newVersion} and tag=${npmTag ||
        "<empty tag>"}`);
    await publish(npmTag);
};
run().catch(e => {
    console.error("Error:");
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaURBQXFDO0FBQ3JDLGlDQUFrQztBQUNsQyxvQ0FBcUM7QUFFckM7Ozs7Ozs7OztHQVNHO0FBRUgsS0FBSyxrQkFBa0IsT0FBTztJQUM1QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDaEQsb0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3RDLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxLQUFLO0lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QixDQUFDO0FBRUQsS0FBSyxxQkFBcUIsVUFBa0I7SUFDMUMsTUFBTSxDQUFDLE1BQU0sT0FBTyxDQUNsQixlQUFlLFVBQVUsb0RBQW9ELENBQzlFLENBQUM7QUFDSixDQUFDO0FBRUQsS0FBSyxrQkFBa0IsU0FBaUIsSUFBSTtJQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDWixNQUFNLENBQUMsTUFBTSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFD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QVUsWUFBWSxNQUFNO1FBQ3hFLGFBQWEsRUFBRSxDQUNoQixDQUFDO0lBRUYsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBRUYsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKFwic2VtdmVyXCIpO1xuaW1wb3J0IGdpdCA9IHJlcXVpcmUoXCJnaXQtcmV2LXN5bmNcIik7XG5cbi8qKlxuICogVXNlIGNhc2VzXG4gKlxuICogIElmIG5vIHZlcnNpb24gaXMgcHVibGlzaGVkLCBwaWNrIHRoZSB2ZXJzaW9uIGZyb20gdGhlIHBhY2thZ2UuanNvbiBhbmQgcHVibGlzaCB0aGF0IHZlcnNpb25cbiAqXG4gKiAgSWYgYSB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCBhbmQgdGhlIG1pbm9yIGFuZCBtYWpvciBtYXRjaGVzIHRoZSBwYWNrYWdlLmpzb24sIHB1Ymxpc2ggYSBwYXRjaFxuICpcbiAqICBJZiB0aGUgcGFja2FqZS5qc29uIHZlcnNpb24gbWlub3IgYW5kIG1ham9yIGRpZmZlcnMgZnJvbSB0aGUgcHVibGlzaGVkIHZlcnNpb24sIHBpY2sgdGhlIGxhdGVzdCBwdWJsaXNoZWQgcGF0Y2ggZm9yIHRoZSB2ZXJzaW9uIG9mIHRoZSBwYWNrYWdlLmpzb24gYW5kIGluY3JlbWVudCB0aGUgcGF0Y2ggbnVtYmVyXG4gKlxuICovXG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGUoY29tbWFuZCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChvblN1Y2Nlc3MsIG9uRXJyb3IpID0+IHtcbiAgICBleGVjKGNvbW1hbmQsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgIHN0ZG91dC5sZW5ndGggJiYgY29uc29sZS5sb2coc3Rkb3V0KTtcbiAgICAgIHN0ZGVyci5sZW5ndGggJiYgY29uc29sZS5lcnJvcihzdGRlcnIpO1xuXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgb25FcnJvcihzdGRlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25TdWNjZXNzKHN0ZG91dCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRCcmFuY2goKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGdpdC5icmFuY2goKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0VmVyc2lvbihuZXdWZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gYXdhaXQgZXhlY3V0ZShcbiAgICBgbnBtIHZlcnNpb24gJHtuZXdWZXJzaW9ufSAtLWZvcmNlIC0tbm8tZ2l0LXRhZy12ZXJzaW9uIC0tYWxsb3ctc2FtZS12ZXJzaW9uYFxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoKG5wbVRhZzogc3RyaW5nID0gbnVsbCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghbnBtVGFnKSB7XG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoYG5wbSBwdWJsaXNoYCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGF3YWl0IGV4ZWN1dGUoYG5wbSBwdWJsaXNoIC0tdGFnPSR7bnBtVGFnfWApO1xuICB9XG59XG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0VmVyc2lvbigpIHtcbiAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKCdwYWNrYWdlLmpzb24nLCAndXRmOCcpKVxuXG4gIGNvbnN0IHBrZ0pzb25WZXJzaW9uID0ganNvbi52ZXJzaW9uO1xuXG4gIGNvbnN0IHZlcnNpb24gPSBzZW12ZXIucGFyc2UocGtnSnNvblZlcnNpb24udHJpbSgpKTtcblxuICBpZiAoIXZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcGFyc2Ugc2VtdmVyIGZyb20gXCIgKyBwa2dKc29uVmVyc2lvbik7XG4gIH1cblxuICBjb25zdCBjb21taXQgPSBnaXQuc2hvcnQoKTtcblxuICBpZiAoIWNvbW1pdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBnZXQgZ2l0IGNvbW1pdFwiKTtcbiAgfVxuXG4gIHJldHVybiBgJHt2ZXJzaW9uLm1ham9yfS4ke3ZlcnNpb24ubWlub3J9LiR7dmVyc2lvbi5wYXRjaH0tJHtnaXQuc2hvcnQoKX1gO1xufVxuXG5jb25zb2xlLmxvZyhgQ3VycmVudCBkaXJlY3Rvcnk6ICR7cHJvY2Vzcy5jd2QoKX1gKTtcblxuY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICBsZXQgYnJhbmNoID1cbiAgICBwcm9jZXNzLmVudi5CUkFOQ0hfTkFNRSB8fCBwcm9jZXNzLmVudi5UUkFWSVNfQlJBTkNIIHx8IChhd2FpdCBnZXRCcmFuY2goKSk7XG5cbiAgbGV0IG5wbVRhZzogc3RyaW5nID0gbnVsbDtcblxuICBsZXQgZ2l0VGFnOiBzdHJpbmcgPSBwcm9jZXNzLmVudi5UUkFWSVNfVEFHIHx8IG51bGw7XG5cbiAgbGV0IGxhdGVzdFZlcnNpb247XG5cbiAgbGV0IG5ld1ZlcnNpb246IHN0cmluZyA9IG51bGw7XG5cbiAgY29uc29sZS5sb2coYFVzaW5nIGJyYW5jaCAke2JyYW5jaH1gKTtcblxuICAvLyBUcmF2aXMga2VlcHMgdGhlIGJyYW5jaCBuYW1lIGluIHRoZSB0YWdzJyBidWlsZHNcbiAgaWYgKGdpdFRhZykge1xuICAgIGlmIChzZW12ZXIudmFsaWQoZ2l0VGFnKSkge1xuICAgICAgLy8gSWYgdGhlIHRhZ3MgaXMgYSB2YWxpZCBzZW12ZXIsIHdlIHB1Ymxpc2ggdXNpbmcgdGhhdCB2ZXJzaW9uIGFuZCB3aXRob3V0IGFueSBucG1UYWdcbiAgICAgIG5wbVRhZyA9IG51bGw7XG4gICAgICBuZXdWZXJzaW9uID0gZ2l0VGFnO1xuICAgIH1cbiAgfSBlbHNlIGlmIChicmFuY2ggPT09IFwibWFzdGVyXCIpIHtcbiAgICBucG1UYWcgPSBcImxhdGVzdFwiO1xuICB9IGVsc2UgaWYgKGJyYW5jaCA9PT0gXCJkZXZlbG9wXCIpIHtcbiAgICBucG1UYWcgPSBcIm5leHRcIjtcbiAgfSBlbHNlIGlmIChicmFuY2guc3RhcnRzV2l0aChcImRldi1cIikpIHtcbiAgICBucG1UYWcgPSBicmFuY2g7XG4gIH1cblxuICBpZiAoIW5ld1ZlcnNpb24pIHtcbiAgICBuZXdWZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbigpO1xuICB9XG5cbiAgYXdhaXQgc2V0VmVyc2lvbihuZXdWZXJzaW9uKTtcblxuICBjb25zb2xlLmxvZyhcbiAgICBgUHVibGlzaGluZyBicmFuY2ggJHticmFuY2h9IHdpdGggdmVyc2lvbj0ke25ld1ZlcnNpb259IGFuZCB0YWc9JHtucG1UYWcgfHxcbiAgICBcIjxlbXB0eSB0YWc+XCJ9YFxuICApO1xuXG4gIGF3YWl0IHB1Ymxpc2gobnBtVGFnKTtcbn07XG5cbnJ1bigpLmNhdGNoKGUgPT4ge1xuICBjb25zb2xlLmVycm9yKFwiRXJyb3I6XCIpO1xuICBjb25zb2xlLmVycm9yKGUpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59KTtcbiJdfQ==