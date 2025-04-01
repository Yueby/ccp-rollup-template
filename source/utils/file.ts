/**
 * @file file.ts
 * @description 文件操作工具函数集合
 */

import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { util } from './util';

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 文件是否存在
 */
export function fileExists(filePath: string): boolean {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        logger.error(`检查文件失败: ${error}`);
        return false;
    }
}

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 * @returns 操作是否成功
 */
export function ensureDir(dirPath: string): boolean {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        return true;
    } catch (error) {
        logger.error(`创建目录失败: ${error}`);
        return false;
    }
}

/**
 * 获取当前插件的根目录路径
 * @returns 插件根目录的绝对路径
 */
export async function getPluginRootDir(): Promise<string> {
    try {
        // 获取当前文件的真实目录路径
        const realDirPath = await fs.promises.realpath(__dirname);

        // 在打包环境中，__dirname将指向dist/[appName]/utils/
        // 因此只需要向上导航一级到达插件根目录
        return path.join(realDirPath, '..');
    } catch (error) {
        logger.error(`获取插件目录失败: ${error}`);
        // 如果无法获取真实路径，则返回相对路径
        return path.join(__dirname, '..');
    }
}

/**
 * 获取临时文件目录
 * @returns 临时文件目录的绝对路径
 */
export async function getTempDir(): Promise<string> {
    try {
        // 先获取插件根目录
        const rootDir = await getPluginRootDir();
        // 在插件根目录下创建temp目录
        const tempDir = path.join(rootDir, 'temp');

        // 确保目录存在
        ensureDir(tempDir);

        return tempDir;
    } catch (error) {
        logger.error(`获取临时目录失败: ${error}`);
        // 如果失败，返回相对路径
        const tempDir = path.join(__dirname, '../temp');
        ensureDir(tempDir);
        return tempDir;
    }
}

/**
 * 读取文件内容
 * @param filePath 文件路径
 * @returns 文件内容或null（如果读取失败）
 */
export function readFile(filePath: string): string | null {
    try {
        if (!fileExists(filePath)) {
            return null;
        }

        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        logger.error(`读取文件失败: ${error}`);
        return null;
    }
}

/**
 * 写入文件
 * @param filePath 文件路径
 * @param content 文件内容
 * @param ensureDirExists 是否确保目录存在
 * @returns 操作是否成功
 */
export function writeFile(filePath: string, content: string, ensureDirExists = true): boolean {
    try {
        if (ensureDirExists) {
            const dirPath = path.dirname(filePath);
            ensureDir(dirPath);
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    } catch (error) {
        logger.error(`写入文件失败: ${error}`);
        return false;
    }
}

/**
 * 创建临时文件
 * @param fileName 文件名
 * @param content 文件内容
 * @returns 临时文件的绝对路径或null（如果创建失败）
 */
export async function createTempFile(fileName: string, content: string): Promise<string | null> {
    try {
        const tempDir = await getTempDir();
        const filePath = path.join(tempDir, fileName);

        if (writeFile(filePath, content)) {
            return filePath;
        }

        return null;
    } catch (error) {
        logger.error(`创建临时文件失败: ${error}`);
        return null;
    }
}

/**
 * 删除文件
 * @param filePath 文件路径
 * @returns 操作是否成功
 */
export function deleteFile(filePath: string): boolean {
    try {
        if (!fileExists(filePath)) {
            return true; // 文件不存在视为删除成功
        }

        fs.unlinkSync(filePath);
        return true;
    } catch (error) {
        logger.error(`删除失败: ${error}`);
        return false;
    }
}

/**
 * 获取文件的相对路径（相对于项目assets目录）
 * @param absolutePath 文件的绝对路径
 * @returns 相对于assets的路径（以db://assets开头）或null
 */
export function getAssetRelativePath(absolutePath: string): string | null {
    try {
        // @ts-ignore - 直接使用Editor.Project.path
        const projectPath = Editor.Project.path;
        const assetsPath = path.join(projectPath, 'assets');

        if (absolutePath.startsWith(assetsPath)) {
            // 提取相对于assets的路径
            const relativePath = absolutePath.slice(assetsPath.length).replace(/\\/g, '/');
            return `db://assets${relativePath}`;
        }

        return null;
    } catch (error) {
        logger.error(`获取相对路径失败: ${error}`);
        return null;
    }
}

/**
 * 获取资源的数据库URL
 * @param filePath 文件路径，可以是绝对路径或相对于项目的路径
 * @param dbPrefix 数据库URL前缀，默认为'db://assets'
 * @returns 资源数据库URL或null（如果转换失败）
 */
export function getAssetDbUrl(filePath: string, dbPrefix = 'db://assets'): string | null {
    try {
        // 如果已经是db://格式，直接返回
        if (filePath.startsWith('db://')) {
            return filePath;
        }

        // 尝试将路径转换为绝对路径
        let absolutePath = filePath;

        // 如果是相对路径，转换为绝对路径
        if (!path.isAbsolute(filePath)) {
            try {
                // @ts-ignore - 直接使用Editor.Project.path
                const projectPath = Editor.Project.path;
                absolutePath = path.join(projectPath, filePath);
            } catch (error) {
                logger.error(`获取项目路径失败`);
                return null;
            }
        }

        // 检查是否在assets目录内
        const result = getAssetRelativePath(absolutePath);
        if (result) {
            return result;
        }

        // 如果不在assets目录内，尝试直接构建db URL
        // 提取文件名
        const fileName = path.basename(filePath);

        // 构建简单的db URL
        return `${dbPrefix}/${fileName}`;
    } catch (error) {
        logger.error(`获取资源URL失败: ${error}`);
        return null;
    }
}

/**
 * 将 AssetDB URL 转换为文件系统路径
 * @param dbUrl AssetDB URL (如 db://assets/...)
 * @returns 文件系统完整路径
 */
export function assetDbUrlToFsPath(dbUrl: string): string {
    try {
        if (!dbUrl.startsWith('db://')) {
            return dbUrl; // 不是 AssetDB URL，直接返回
        }

        // @ts-ignore - 直接使用Editor.Project.path
        const projectPath = Editor.Project.path;

        // 处理 db://assets/ 前缀
        if (dbUrl.startsWith('db://assets/')) {
            const relativePath = dbUrl.replace('db://assets/', '');
            return path.join(projectPath, 'assets', relativePath);
        }

        // 其他类型的 db:// URL
        const relativePath = dbUrl.replace(/^db:\/\//, '');
        return path.join(projectPath, relativePath);
    } catch (error) {
        logger.warn(`URL转换失败: ${error}`);
        return dbUrl;
    }
}

/**
 * 将文件系统路径转换为 AssetDB URL
 * @param fsPath 文件系统路径
 * @returns AssetDB URL 格式或原路径（如果转换失败）
 */
export function fsPathToAssetDbUrl(fsPath: string): string {
    try {
        const dbUrl = getAssetDbUrl(fsPath);
        return dbUrl || fsPath;
    } catch (error) {
        logger.warn(`路径转换失败: ${error}`);
        return fsPath;
    }
}

/**
 * 导入资源到Cocos Creator项目
 * @param sourcePath 源文件路径
 * @param targetUrl 目标URL (db://assets/...)
 * @returns 操作是否成功
 */
export async function importAsset(sourcePath: string, targetUrl: string): Promise<boolean> {
    try {
        if (!fileExists(sourcePath)) {
            logger.error(`导入失败: 源文件不存在: ${sourcePath}`);
            return false;
        }

        if (!targetUrl || !targetUrl.startsWith('db://')) {
            logger.error(`导入失败: 无效的目标URL: ${targetUrl}`);
            return false;
        }

        // 获取源文件的绝对路径和规范化路径
        const absoluteSourcePath = path.isAbsolute(sourcePath)
            ? sourcePath
            : path.resolve(sourcePath);
        const normalizedSourcePath = path.normalize(absoluteSourcePath);

        // 获取目标URL对应的文件系统路径并规范化
        let targetFsPath;
        try {
            targetFsPath = assetDbUrlToFsPath(targetUrl);
            const normalizedTargetPath = path.normalize(targetFsPath);

            // 比较源路径和目标路径是否相同
            if (normalizedSourcePath === normalizedTargetPath) {
                return false;
            }

            // 检查源路径是否在目标路径之内，或目标路径在源路径之内
            if (
                normalizedSourcePath.startsWith(normalizedTargetPath + path.sep) ||
                normalizedTargetPath.startsWith(normalizedSourcePath + path.sep)
            ) {
                logger.warn(`警告: 源路径和目标路径嵌套，可能导致意外结果`);
            }
        } catch (e) {
            // 路径转换错误，但不阻止导入尝试
        }

        // 导入资源
        try {
            await Editor.Message.request('asset-db', 'import-asset', sourcePath, targetUrl, {
                overwrite: true,
                rename: true,
            });

            return true;
        } catch (importError) {
            logger.error(`编辑器导入API返回错误: ${importError}`);
            return false;
        }
    } catch (error) {
        logger.error(`导入过程发生未处理异常: ${error}`);
        return false;
    }
}

/**
 * 刷新资源库
 * @returns 操作是否成功
 */
export function refreshAssetDB(): boolean {
    try {
        Editor.Message.send('asset-db', 'refresh');
        return true;
    } catch (error) {
        logger.error(`刷新资源失败: ${error}`);
        return false;
    }
}

/**
 * 使用Editor API刷新指定资源URL或UUID的资源
 * @param urlOrUUID 资源的URL或UUID
 * @returns 操作是否成功
 */
export async function refreshAsset(urlOrUUID: string): Promise<boolean> {
    try {
        if (!urlOrUUID) {
            logger.error('刷新资源失败: 未提供有效的URL或UUID');
            return false;
        }

        await Editor.Message.request('asset-db', 'refresh-asset', urlOrUUID);
        return true;
    } catch (error) {
        logger.error(`刷新资源失败: ${error}`);
        return false;
    }
}

/**
 * 使用Editor API将资源从源URL移动到目标URL
 * @param sourceUrl 源资源URL
 * @param targetUrl 目标资源URL
 * @returns 操作是否成功
 */
export async function moveAssetWithAPI(sourceUrl: string, targetUrl: string): Promise<boolean> {
    try {
        if (
            !sourceUrl ||
            !targetUrl ||
            !sourceUrl.startsWith('db://') ||
            !targetUrl.startsWith('db://')
        ) {
            logger.error('移动资源失败: URL格式错误或未提供');
            return false;
        }

        await Editor.Message.request('asset-db', 'move-asset', sourceUrl, targetUrl);
        return true;
    } catch (error) {
        logger.error(`移动资源失败`);
        return false;
    }
}

/**
 * 监听文件变化
 * @param filePath 要监听的文件路径
 * @param onChange 文件变化时的回调函数
 * @param options 监听选项
 * @returns 监听器对象，用于停止监听
 */
export function watchFile(
    filePath: string,
    onChange: (eventType: string, filename: string | null) => void,
    options: {
        persistent?: boolean;
        debounceTime?: number;
    } = {}
): fs.FSWatcher | null {
    try {
        // 默认选项
        const defaultOptions = {
            persistent: true,
            debounceTime: 300,
        };

        // 合并选项
        const watchOptions = { ...defaultOptions, ...options };

        // 检查文件是否存在
        if (!fileExists(filePath)) {
            logger.warn(`监听文件不存在: ${filePath}`);
            return null;
        }

        // 如果指定了防抖时间，则使用防抖函数包装回调
        let changeHandler = onChange;
        if (watchOptions.debounceTime > 0) {
            try {
                // 直接使用已导入的util对象
                changeHandler = util.debounce(onChange, watchOptions.debounceTime);
            } catch (error) {
                logger.warn(`使用原始回调: ${error}`);
            }
        }

        // 创建并返回文件监听器
        logger.info(`开始监听文件: ${filePath}`);
        return fs.watch(filePath, { persistent: watchOptions.persistent }, changeHandler);
    } catch (error) {
        logger.error(`监听器创建失败: ${error}`);
        return null;
    }
}

/**
 * 停止文件监听
 * @param watcher 文件监听器对象
 * @returns 操作是否成功
 */
export function stopWatchFile(watcher: fs.FSWatcher | null): boolean {
    if (!watcher) {
        return false;
    }

    try {
        logger.info(`停止监听文件`);
        watcher.close();
        return true;
    } catch (error) {
        logger.error(`停止监听失败: ${error}`);
        return false;
    }
}

/**
 * 文件操作工具集命名空间
 * 可以通过 file.xxx 的方式调用上面的函数
 */
export const file = {
    fileExists,
    ensureDir,
    getPluginRootDir,
    getTempDir,
    readFile,
    writeFile,
    createTempFile,
    deleteFile,
    getAssetRelativePath,
    getAssetDbUrl,
    assetDbUrlToFsPath,
    fsPathToAssetDbUrl,
    importAsset,
    refreshAssetDB,
    refreshAsset,
    moveAssetWithAPI,
    watchFile,
    stopWatchFile,
};
