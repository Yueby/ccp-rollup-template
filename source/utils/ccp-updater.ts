import { app, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import logger from './logger';

// 更新检查路径
const updateCheckPath = String.raw``;

/**
 * 比较两个语义化版本号
 * @param v1 版本号1
 * @param v2 版本号2
 * @returns 如果v1 > v2返回1，如果v1 < v2返回-1，如果相等返回0
 */
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    // 比较各部分的数值
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0; // 版本号相等
}

/**
 * 递归复制目录
 * @param src 源目录
 * @param dest 目标目录
 */
async function copyDir(src: string, dest: string) {
    // 确保目标目录存在
    await fs.promises.mkdir(dest, { recursive: true });

    // 读取源目录内容
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // 如果是目录，递归复制
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            // 复制文件
            await fs.promises.copyFile(srcPath, destPath);
        }
    }
}

/**
 * 自动更新扩展
 * @param localDir 本地目录
 */
async function autoUpdate(localDir: string) {
    try {
        logger.info('开始自动更新...');

        // 获取目标目录 (排除 node_modules 和 .git 目录)
        const ignorePatterns = ['node_modules', '.git'];

        // 清空本地目录（除了忽略的目录）
        const localEntries = await fs.promises.readdir(localDir, { withFileTypes: true });
        for (const entry of localEntries) {
            if (ignorePatterns.includes(entry.name)) continue;

            const fullPath = path.join(localDir, entry.name);
            if (entry.isDirectory()) {
                await fs.promises.rm(fullPath, { recursive: true, force: true });
            } else {
                await fs.promises.unlink(fullPath);
            }
        }

        // 从远程复制所有文件（除了忽略的目录）
        const remoteEntries = await fs.promises.readdir(updateCheckPath, { withFileTypes: true });
        for (const entry of remoteEntries) {
            if (ignorePatterns.includes(entry.name)) continue;

            const srcPath = path.join(updateCheckPath, entry.name);
            const destPath = path.join(localDir, entry.name);

            if (entry.isDirectory()) {
                await copyDir(srcPath, destPath);
            } else {
                await fs.promises.copyFile(srcPath, destPath);
            }
        }

        logger.info('自动更新完成！');
        return true;
    } catch (error) {
        logger.error('自动更新失败:', error);
        return false;
    }
}

// 检查更新
export async function checkUpdate() {
    try {
        // 读取远程和本地的 package.json
        const remotePkgPath = path.join(updateCheckPath, 'package.json');
        const realDirname = await fs.promises.realpath(__dirname);
        const localPkgPath = path.join(realDirname, 'package.json');
        const localDir = realDirname; // 直接使用realDirname作为本地目录

        if (!fs.existsSync(remotePkgPath)) {
            // logger.debug('无法访问更新检查路径');
            return;
        }

        const remoteVersion = JSON.parse(fs.readFileSync(remotePkgPath, 'utf-8')).version;
        const localVersion = JSON.parse(fs.readFileSync(localPkgPath, 'utf-8')).version;

        // 比较版本号 - 仅当远程版本大于本地版本时才提示更新
        if (compareVersions(remoteVersion, localVersion) > 0) {
            // 显示更新提示
            const title = Editor.I18n.t('hierarchy-extension.title');
            const result = await Editor.Dialog.info(title, {
                detail: `发现新版本 ${remoteVersion}，当前版本 ${localVersion}。\n点击"更新"自动更新，点击"手动更新"打开更新文件夹。`,
                buttons: ['取消', '更新', '手动更新'],
            });

            // 根据用户选择执行操作
            if (result.response === 1) {
                // 自动更新
                const updateResult = await autoUpdate(localDir);

                if (updateResult) {
                    const result = await Editor.Dialog.info(title, {
                        detail: `更新成功！新版本 ${remoteVersion} 已安装。\n您可以选择：\n1. 重启编辑器以应用更新\n2. 去扩展管理器中刷新并重新启用本插件`,
                        buttons: ['取消', '关闭编辑器'],
                    });

                    // 如果选择"关闭编辑器"
                    if (result.response === 1) {
                        app.quit();
                    }
                } else {
                    const result = await Editor.Dialog.error(title, {
                        detail: `更新失败，请尝试手动更新。`,
                        buttons: ['取消', '打开更新文件夹'],
                    });

                    if (result.response === 1) {
                        shell.openPath(updateCheckPath);
                    }
                }
            } else if (result.response === 2) {
                // 打开文件夹进行手动更新
                shell.openPath(updateCheckPath);
            }
        }
    } catch (error) {
        logger.error('检查更新失败:', error);
    }
}
