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
    const description = await prompt('项目描述: ');

    // 使用默认值或用户输入
    const projectName = name || defaultName;
    const projectDescription = description;

    // 1. 更新 package.json
    const packageJsonPath = path.join(rootDir, 'package.json');
    let packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    
    packageJsonContent = packageJsonContent.replace(/ccp-rollup-template/g, projectName);
    fs.writeFileSync(packageJsonPath, packageJsonContent);
    console.log('- 已更新 package.json');

    // 2. 更新 assets/package.json
    const assetsPackageJsonPath = path.join(rootDir, 'assets', 'package.json');
    let assetsPackageJsonContent = fs.readFileSync(assetsPackageJsonPath, 'utf8');
    assetsPackageJsonContent = assetsPackageJsonContent.replace(/ccp-rollup-template/g, projectName);
    fs.writeFileSync(assetsPackageJsonPath, assetsPackageJsonContent);
    console.log('- 已更新 assets/package.json');

    // 3. 更新 i18n/zh.js
    const zhPath = path.join(rootDir, 'i18n', 'zh.js');
    let zhContent = fs.readFileSync(zhPath, 'utf8');
    // 更新title和description
    zhContent = zhContent
        .replace(/title: "[^"]+"/g, `title: "${projectName}"`)
        .replace(/description: "[^"]+"/g, `description: "${projectDescription || '一个基于rollup的Cocos Creator扩展'}"`);
    fs.writeFileSync(zhPath, zhContent);
    console.log('- 已更新 i18n/zh.js');

    // 4. 更新 i18n/en.js
    const enPath = path.join(rootDir, 'i18n', 'en.js');
    let enContent = fs.readFileSync(enPath, 'utf8');
    // 更新title和description
    enContent = enContent
        .replace(/title: "[^"]+"/g, `title: "${projectName}"`)
        .replace(/description: "[^"]+"/g, `description: "${projectDescription || 'A Cocos Creator extension based on rollup'}"`);
    fs.writeFileSync(enPath, enContent);
    console.log('- 已更新 i18n/en.js');

    console.log('\n项目初始化完成！');
    console.log('\n现在您可以运行以下命令构建项目:');
    console.log('pnpm build');

    rl.close();
}

// 运行初始化函数
initProject().catch((error) => {
    console.error('初始化过程中出错:', error);
    rl.close();
});
