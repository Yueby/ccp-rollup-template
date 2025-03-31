#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// 提示用户输入
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function initProject() {
    console.log('欢迎使用 Cocos Creator 扩展模板初始化工具！');
    console.log('请回答以下问题来配置您的项目：\n');

    // 获取当前目录名作为默认项目名
    const defaultName = path.basename(rootDir);

    // 获取用户输入
    const name = await prompt(`项目名称 (${defaultName}): `);
    const title = await prompt(`显示名称 (${name || defaultName}): `);
    const description = await prompt('项目描述: ');
    const version = await prompt('版本 (1.0.0): ');
    const author = await prompt('作者: ');
    const minEditorVersion = await prompt('最低支持的编辑器版本 (3.3.0): ');
    const cocosExtensionPath = await prompt(
        'Cocos Creator 扩展目录路径 (可选，留空稍后在 .env 文件中配置): '
    );

    // 使用默认值或用户输入
    const projectName = name || defaultName;
    const projectTitle = title || projectName;
    const projectVersion = version || '1.0.0';
    const projectDescription = description;
    const projectAuthor = author;
    const editorVersion = minEditorVersion || '3.3.0';

    // 更新 package.json
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.name = projectName;
    packageJson.title = projectTitle;
    packageJson.version = projectVersion;
    packageJson.description = `i18n:${projectName}.description`;
    packageJson.author = projectAuthor;
    packageJson.editor = `>=${editorVersion}`;
    packageJson.main = `dist/${projectName}/main.js`;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));

    // 更新 assets/package.json
    const assetsPackageJsonPath = path.join(rootDir, 'assets', 'package.json');
    const assetsPackageJson = JSON.parse(fs.readFileSync(assetsPackageJsonPath, 'utf8'));

    assetsPackageJson.name = projectName;
    assetsPackageJson.author = projectAuthor;
    assetsPackageJson.editor = `>=${editorVersion}`;
    assetsPackageJson.description = `i18n:${projectName}.description`;

    fs.writeFileSync(assetsPackageJsonPath, JSON.stringify(assetsPackageJson, null, 4));

    // 更新 i18n 文件
    const zhPath = path.join(rootDir, 'i18n', 'zh.js');
    const enPath = path.join(rootDir, 'i18n', 'en.js');

    const zhContent = `"use strict";
module.exports = {
    title: "${projectTitle}",
    description: "${projectDescription || '一个基于rollup的Cocos Creator扩展'}",
};`;

    const enContent = `"use strict";
module.exports = {
    title: "${projectTitle}",
    description: "${projectDescription || 'A Cocos Creator extension based on rollup'}",
};`;

    fs.writeFileSync(zhPath, zhContent);
    fs.writeFileSync(enPath, enContent);

    // 更新 README 文件
    const readmePath = path.join(rootDir, 'assets', 'README.md');
    const readmeCNPath = path.join(rootDir, 'assets', 'README_CN.md');

    const readmeContent = `# ${projectTitle}

${projectDescription || 'A Cocos Creator extension based on rollup'}

## Features

- Feature 1
- Feature 2

## Installation

1. Download the extension package
2. Import it into Cocos Creator

## Usage

...

## License

...

`;

    const readmeCNContent = `# ${projectTitle}

${projectDescription || '一个基于rollup的Cocos Creator扩展'}

## 功能特性

- 功能1
- 功能2

## 安装方法

1. 下载扩展包
2. 导入到Cocos Creator中

## 使用方法

...

## 许可证

...

`;

    fs.writeFileSync(readmePath, readmeContent);
    fs.writeFileSync(readmeCNPath, readmeCNContent);

    // 更新 source/main.ts 中的包名
    const mainTsPath = path.join(rootDir, 'source', 'main.ts');
    let mainTsContent = fs.readFileSync(mainTsPath, 'utf8');

    // 替换packageName变量，虽然构建时会自动替换，但在开发时直接看到正确的值更好
    mainTsContent = mainTsContent.replace(
        /const packageName = ['"][^'"]*['"];/,
        `const packageName = '${projectName}';`
    );
    fs.writeFileSync(mainTsPath, mainTsContent);

    // 更新 .env 文件
    const envPath = path.join(rootDir, '.env');
    const envContent = `# Cocos Creator 扩展部署路径
# 修改为您的 Cocos Creator 扩展目录路径
COCOS_EXTENSION_PATH=${cocosExtensionPath || '/path/to/your/CocosCreator/extensions'}

# 构建模式 (development 或 production)
BUILD_MODE=development

# 是否在构建后自动部署到扩展目录
AUTO_DEPLOY=true
`;

    fs.writeFileSync(envPath, envContent);

    console.log('\n项目初始化完成！');
    console.log('已更新以下文件:');
    console.log('- package.json');
    console.log('- assets/package.json');
    console.log('- i18n/zh.js');
    console.log('- i18n/en.js');
    console.log('- assets/README.md');
    console.log('- assets/README_CN.md');
    console.log('- source/main.ts');
    console.log('- .env');

    console.log('\n现在您可以运行以下命令构建项目:');
    console.log('pnpm build');

    if (!cocosExtensionPath) {
        console.log(
            '\n注意: 您需要在 .env 文件中配置 Cocos Creator 扩展目录路径以启用自动部署功能。'
        );
    }

    rl.close();
}

// 运行初始化函数
initProject().catch((error) => {
    console.error('初始化过程中出错:', error);
    rl.close();
});
