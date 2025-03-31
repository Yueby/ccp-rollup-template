import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import * as dotenv from 'dotenv';
import fs from 'fs-extra';
import { builtinModules } from 'module';
import { dirname, join } from 'path';
import copy from 'rollup-plugin-copy';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config();

// 环境变量配置
const env = {
    // Cocos Creator 扩展部署路径
    extensionPath: process.env.COCOS_EXTENSION_PATH || '/path/to/your/CocosCreator/extensions',
    // 构建模式
    buildMode: process.env.BUILD_MODE || 'development',
    // 是否自动部署
    autoDeploy: process.env.AUTO_DEPLOY !== 'false',
};

// 扩展部署工具 - 使用fs-extra实现跨平台兼容
function deployExtension(options) {
    const { src, dest } = options;
    return {
        name: 'deploy-extension',
        async closeBundle() {
            if (!src || !dest || !env.autoDeploy) {
                return;
            }

            try {
                console.log('正在将扩展部署到目标目录...');
                // 确保目标目录存在
                await fs.ensureDir(dirname(dest));
                // 如果目标目录已存在，先删除
                if (await fs.pathExists(dest)) {
                    await fs.remove(dest);
                }
                // 复制文件
                await fs.copy(src, dest);
                console.log('扩展部署完成！');
            } catch (error) {
                console.error('部署过程中出错:', error);
            }
        },
    };
}

// 变量替换工具
function replaceVariables(appName) {
    return {
        name: 'replace-variables',
        transform(code) {
            return {
                code: code.replace(
                    /const packageName = ['"][^'"]*['"];/,
                    `const packageName = '${appName}';`
                ),
                map: null,
            };
        },
    };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const appName = pkgJson.name;
const outputDir = `dist/${appName}`;

// 显示构建信息
console.log(`构建模式: ${env.buildMode}`);
console.log(`应用名称: ${appName}`);
console.log(`输出目录: ${outputDir}`);
if (env.autoDeploy) {
    console.log(`部署路径: ${env.extensionPath}/${appName}`);
} else {
    console.log('自动部署已禁用');
}

export default {
    input: {
        main: 'source/main.ts',
    },
    output: {
        dir: outputDir,
        format: 'commonjs',
        sourcemap: false,
        entryFileNames: '[name].js',
    },
    plugins: [
        replaceVariables(appName),
        typescript({
            tsconfig: './tsconfig.json',
            outDir: outputDir,
            sourceMap: false,
            compilerOptions: {
                sourceMap: false,
                inlineSourceMap: false,
                inlineSources: false,
            },
        }),
        commonjs(),
        // 仅在生产模式下压缩代码
        env.buildMode === 'production' && terser(),
        alias({
            entries: [
                { find: '@', replacement: join(__dirname, 'source') },
                { find: '~types', replacement: join(__dirname, '@types') },
            ],
        }),
        json(),
        nodeResolve({
            preferBuiltins: false,
            resolveOnly: (module) => module === 'string_decoder' || !builtinModules.includes(module),
            exportConditions: ['node'],
        }),
        copy({
            targets: [
                {
                    src: 'assets/package.json',
                    dest: outputDir,
                    rename: 'package.json',
                    transform: (contents) => {
                        const tempPkgJson = JSON.parse(contents.toString('utf-8'));
                        tempPkgJson.name = pkgJson.name;
                        tempPkgJson.version = pkgJson.version;
                        tempPkgJson.description = pkgJson.description;
                        tempPkgJson.author = pkgJson.author;
                        tempPkgJson.editor = pkgJson.editor;
                        tempPkgJson.main = './main.js';
                        return JSON.stringify(tempPkgJson, null, 2);
                    },
                },
                { src: 'i18n/**/*', dest: `${outputDir}/i18n` },
                { src: 'assets/README.md', dest: outputDir, rename: 'README.md' },
                { src: 'assets/README_CN.md', dest: outputDir, rename: 'README_CN.md' },
            ],
            verbose: true,
        }),
        // 根据环境变量决定是否部署
        env.autoDeploy &&
        deployExtension({
            src: `${__dirname}/${outputDir}`,
            dest: `${env.extensionPath}/${appName}`,
        }),
    ].filter(Boolean), // 过滤掉假值（如 false 或 undefined）
    external: ['fs', 'path', 'os', 'electron'],
};
