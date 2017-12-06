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
        console.log(`> ${command}`);
        child_process_1.exec(command, (error, stdout, stderr) => {
            stdout.trim().length && console.log('  ' + stdout.replace(/\n/g, '\n  '));
            stderr.trim().length && console.error('! ' + stderr.replace(/\n/g, '\n  '));
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
    return await execute(`npm version "${newVersion}" --force --no-git-tag-version --allow-same-version`);
}
async function publish(npmTag = []) {
    return await execute(`npm publish` + npmTag.map($ => ' "--tag=' + $ + '"').join(''));
}
const fs = require("fs");
async function getVersion() {
    const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const pkgJsonVersion = json.version;
    const version = semver.parse(pkgJsonVersion.trim());
    if (!version) {
        throw new Error("Unable to parse semver from " + pkgJsonVersion);
    }
    return `${version.major}.${version.minor}.${version.patch}`;
}
async function getSnapshotVersion() {
    const commit = git.short();
    if (!commit) {
        throw new Error("Unable to get git commit");
    }
    const time = new Date().toISOString().replace(/(\..*$)/g, '').replace(/([^\dT])/g, '').replace('T', '.');
    return (await getVersion()) + '-' + time + '.' + commit;
}
console.log(`Current directory: ${process.cwd()}`);
const run = async () => {
    let branch = process.env.BRANCH_NAME || process.env.TRAVIS_BRANCH || (await getBranch());
    let npmTag = null;
    let gitTag = process.env.TRAVIS_TAG || null;
    let newVersion = null;
    console.log(`Using branch ${branch}`);
    // Travis keeps the branch name in the tags' builds
    if (gitTag) {
        if (semver.valid(gitTag)) {
            // If the tags is a valid semver, we publish using that version and without any npmTag
            npmTag = null;
            newVersion = gitTag;
        }
        else {
            npmTag = 'tag-' + gitTag;
            newVersion = await getSnapshotVersion();
        }
    }
    else {
        newVersion = await getSnapshotVersion();
        if (branch === "master") {
            npmTag = "latest";
        }
        else if (branch === "develop") {
            npmTag = "next";
        }
        else if (branch.startsWith("dev-")) {
            npmTag = branch;
        }
    }
    console.log(`Publishing branch ${branch} with version=${newVersion} and tag=${npmTag || "<empty tag>"}`);
    await setVersion(newVersion);
    if (npmTag) {
        await publish([npmTag]);
    }
    else {
        await publish();
    }
    try {
        const repoName = (await execute('npm v . name')).trim();
        const extraTag = (npmTag ? 'latest-' : 'stable-') + (await getVersion());
        await execute(`npm dist-tag add "${repoName}@${newVersion}" "${extraTag}"`);
    }
    catch (e) {
        console.error('Error setting extra npm dist-tag');
        console.error(e);
    }
};
run().catch(e => {
    console.error("Error:");
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaURBQXFDO0FBQ3JDLGlDQUFrQztBQUNsQyxvQ0FBcUM7QUFFckM7Ozs7Ozs7OztHQVNHO0FBRUgsS0FBSyxrQkFBa0IsT0FBTztJQUM1QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDNUIsb0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFNUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxLQUFLO0lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QixDQUFDO0FBRUQsS0FBSyxxQkFBcUIsVUFBa0I7SUFDMUMsTUFBTSxDQUFDLE1BQU0s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SyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNsRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25CLENBQUM7QUFDSCxDQUFDLENBQUM7QUFFRixHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCB7IGV4ZWMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoXCJzZW12ZXJcIik7XG5pbXBvcnQgZ2l0ID0gcmVxdWlyZShcImdpdC1yZXYtc3luY1wiKTtcblxuLyoqXG4gKiBVc2UgY2FzZXNcbiAqXG4gKiAgSWYgbm8gdmVyc2lvbiBpcyBwdWJsaXNoZWQsIHBpY2sgdGhlIHZlcnNpb24gZnJvbSB0aGUgcGFja2FnZS5qc29uIGFuZCBwdWJsaXNoIHRoYXQgdmVyc2lvblxuICpcbiAqICBJZiBhIHZlcnNpb24gaXMgcHVibGlzaGVkIGFuZCB0aGUgbWlub3IgYW5kIG1ham9yIG1hdGNoZXMgdGhlIHBhY2thZ2UuanNvbiwgcHVibGlzaCBhIHBhdGNoXG4gKlxuICogIElmIHRoZSBwYWNrYWplLmpzb24gdmVyc2lvbiBtaW5vciBhbmQgbWFqb3IgZGlmZmVycyBmcm9tIHRoZSBwdWJsaXNoZWQgdmVyc2lvbiwgcGljayB0aGUgbGF0ZXN0IHB1Ymxpc2hlZCBwYXRjaCBmb3IgdGhlIHZlcnNpb24gb2YgdGhlIHBhY2thZ2UuanNvbiBhbmQgaW5jcmVtZW50IHRoZSBwYXRjaCBudW1iZXJcbiAqXG4gKi9cblxuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZShjb21tYW5kKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKG9uU3VjY2Vzcywgb25FcnJvcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGA+ICR7Y29tbWFuZH1gKTtcbiAgICBleGVjKGNvbW1hbmQsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgIHN0ZG91dC50cmltKCkubGVuZ3RoICYmIGNvbnNvbGUubG9nKCcgICcgKyBzdGRvdXQucmVwbGFjZSgvXFxuL2csICdcXG4gICcpKTtcbiAgICAgIHN0ZGVyci50cmltKCkubGVuZ3RoICYmIGNvbnNvbGUuZXJyb3IoJyEgJyArIHN0ZGVyci5yZXBsYWNlKC9cXG4vZywgJ1xcbiAgJykpO1xuXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgb25FcnJvcihzdGRlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25TdWNjZXNzKHN0ZG91dCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRCcmFuY2goKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGdpdC5icmFuY2goKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0VmVyc2lvbihuZXdWZXJzaW9uOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gYXdhaXQgZXhlY3V0ZShcbiAgICBgbnBtIHZlcnNpb24gXCIke25ld1ZlcnNpb259XCIgLS1mb3JjZSAtLW5vLWdpdC10YWctdmVyc2lvbiAtLWFsbG93LXNhbWUtdmVyc2lvbmBcbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHVibGlzaChucG1UYWc6IHN0cmluZ1tdID0gW10pOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gYXdhaXQgZXhlY3V0ZShgbnBtIHB1Ymxpc2hgICsgbnBtVGFnLm1hcCgkID0+ICcgXCItLXRhZz0nICsgJCArICdcIicpLmpvaW4oJycpKTtcbn1cblxuaW1wb3J0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRWZXJzaW9uKCkge1xuICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoJ3BhY2thZ2UuanNvbicsICd1dGY4JykpO1xuXG4gIGNvbnN0IHBrZ0pzb25WZXJzaW9uID0ganNvbi52ZXJzaW9uO1xuXG4gIGNvbnN0IHZlcnNpb24gPSBzZW12ZXIucGFyc2UocGtnSnNvblZlcnNpb24udHJpbSgpKTtcblxuICBpZiAoIXZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcGFyc2Ugc2VtdmVyIGZyb20gXCIgKyBwa2dKc29uVmVyc2lvbik7XG4gIH1cblxuICByZXR1cm4gYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U25hcHNob3RWZXJzaW9uKCkge1xuICBjb25zdCBjb21taXQgPSBnaXQuc2hvcnQoKTtcbiAgaWYgKCFjb21taXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZ2V0IGdpdCBjb21taXRcIik7XG4gIH1cbiAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC8oXFwuLiokKS9nLCAnJykucmVwbGFjZSgvKFteXFxkVF0pL2csICcnKS5yZXBsYWNlKCdUJywgJy4nKTtcblxuICByZXR1cm4gKGF3YWl0IGdldFZlcnNpb24oKSkgKyAnLScgKyB0aW1lICsgJy4nICsgY29tbWl0O1xufVxuXG5jb25zb2xlLmxvZyhgQ3VycmVudCBkaXJlY3Rvcnk6ICR7cHJvY2Vzcy5jd2QoKX1gKTtcblxuY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICBsZXQgYnJhbmNoID1cbiAgICBwcm9jZXNzLmVudi5CUkFOQ0hfTkFNRSB8fCBwcm9jZXNzLmVudi5UUkFWSVNfQlJBTkNIIHx8IChhd2FpdCBnZXRCcmFuY2goKSk7XG5cbiAgbGV0IG5wbVRhZzogc3RyaW5nID0gbnVsbDtcblxuICBsZXQgZ2l0VGFnOiBzdHJpbmcgPSBwcm9jZXNzLmVudi5UUkFWSVNfVEFHIHx8IG51bGw7XG5cbiAgbGV0IG5ld1ZlcnNpb246IHN0cmluZyA9IG51bGw7XG5cbiAgY29uc29sZS5sb2coYFVzaW5nIGJyYW5jaCAke2JyYW5jaH1gKTtcblxuICAvLyBUcmF2aXMga2VlcHMgdGhlIGJyYW5jaCBuYW1lIGluIHRoZSB0YWdzJyBidWlsZHNcbiAgaWYgKGdpdFRhZykge1xuICAgIGlmIChzZW12ZXIudmFsaWQoZ2l0VGFnKSkge1xuICAgICAgLy8gSWYgdGhlIHRhZ3MgaXMgYSB2YWxpZCBzZW12ZXIsIHdlIHB1Ymxpc2ggdXNpbmcgdGhhdCB2ZXJzaW9uIGFuZCB3aXRob3V0IGFueSBucG1UYWdcbiAgICAgIG5wbVRhZyA9IG51bGw7XG4gICAgICBuZXdWZXJzaW9uID0gZ2l0VGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBucG1UYWcgPSAndGFnLScgKyBnaXRUYWc7XG4gICAgICBuZXdWZXJzaW9uID0gYXdhaXQgZ2V0U25hcHNob3RWZXJzaW9uKCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG5ld1ZlcnNpb24gPSBhd2FpdCBnZXRTbmFwc2hvdFZlcnNpb24oKTtcblxuICAgIGlmIChicmFuY2ggPT09IFwibWFzdGVyXCIpIHtcbiAgICAgIG5wbVRhZyA9IFwibGF0ZXN0XCI7XG4gICAgfSBlbHNlIGlmIChicmFuY2ggPT09IFwiZGV2ZWxvcFwiKSB7XG4gICAgICBucG1UYWcgPSBcIm5leHRcIjtcbiAgICB9IGVsc2UgaWYgKGJyYW5jaC5zdGFydHNXaXRoKFwiZGV2LVwiKSkge1xuICAgICAgbnBtVGFnID0gYnJhbmNoO1xuICAgIH1cbiAgfVxuXG4gIGNvbnNvbGUubG9nKGBQdWJsaXNoaW5nIGJyYW5jaCAke2JyYW5jaH0gd2l0aCB2ZXJzaW9uPSR7bmV3VmVyc2lvbn0gYW5kIHRhZz0ke25wbVRhZyB8fCBcIjxlbXB0eSB0YWc+XCJ9YCk7XG5cbiAgYXdhaXQgc2V0VmVyc2lvbihuZXdWZXJzaW9uKTtcblxuXG4gIGlmIChucG1UYWcpIHtcbiAgICBhd2FpdCBwdWJsaXNoKFtucG1UYWddKTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBwdWJsaXNoKCk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHJlcG9OYW1lID0gKGF3YWl0IGV4ZWN1dGUoJ25wbSB2IC4gbmFtZScpKS50cmltKCk7XG4gICAgY29uc3QgZXh0cmFUYWcgPSAobnBtVGFnID8gJ2xhdGVzdC0nIDogJ3N0YWJsZS0nKSArIChhd2FpdCBnZXRWZXJzaW9uKCkpO1xuICAgIGF3YWl0IGV4ZWN1dGUoYG5wbSBkaXN0LXRhZyBhZGQgXCIke3JlcG9OYW1lfUAke25ld1ZlcnNpb259XCIgXCIke2V4dHJhVGFnfVwiYCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZXR0aW5nIGV4dHJhIG5wbSBkaXN0LXRhZycpO1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gIH1cbn07XG5cbnJ1bigpLmNhdGNoKGUgPT4ge1xuICBjb25zb2xlLmVycm9yKFwiRXJyb3I6XCIpO1xuICBjb25zb2xlLmVycm9yKGUpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59KTtcbiJdfQ==