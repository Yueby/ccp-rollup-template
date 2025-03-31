/**
 * Preinstall script
 */

import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATH = {
    packageJSON: join(__dirname, '../package.json'),
};

function checkCreatorTypesVersion(version) {
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
        const result = spawnSync(cmd, ['view', '@cocos/creator-types', 'versions', '--json'], {
            encoding: 'utf8',
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: true
        });
        
        if (!result.stdout) {
            console.error('Failed to fetch versions:', result.stderr?.toString());
            return false;
        }

        let versionList = result.stdout.toString().trim();
        try {
            versionList = JSON.parse(versionList);
            return Array.isArray(versionList) && versionList.includes(version);
        } catch (error) {
            console.error('Failed to parse versions:', error);
            return false;
        }
    } catch (error) {
        console.error('Error checking creator types version:', error);
        return false;
    }
}

try {
    const str = readFileSync(PATH.packageJSON, 'utf8');
    const json = JSON.parse(str);
    const version = json.devDependencies['@cocos/creator-types'].replace(/[\^~]/, '');

    if (!checkCreatorTypesVersion(version)) {
        console.log('\x1b[33mWarning:\x1b[0m');
        console.log('  @en');
        console.log('    Version check of @cocos/creator-types failed.');
        console.log(`    The definition of ${version} has not been released yet. Please export the definition to the ./node_modules directory by selecting "Developer -> Export Interface Definition" in the menu of the Creator editor.`);
        console.log('    The definition of the corresponding version will be released on npm after the editor is officially released.');
        console.log('  @zh');
        console.log('    @cocos/creator-types 版本检查失败。');
        console.log(`    ${version} 定义还未发布，请先通过 Creator 编辑器菜单 "开发者 -> 导出接口定义"，导出定义到 ./node_modules 目录。`);
        console.log(`    对应版本的定义会在编辑器正式发布后同步发布到 npm 上。`);
    }
} catch (error) {
    console.error(error);
}
