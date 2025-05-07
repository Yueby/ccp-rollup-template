# CCP Rollup Template

一个用于开发 Cocos Creator 扩展的模板项目，使用 Rollup 进行打包。

## 功能特点

- 基于 Rollup 的现代构建系统
- TypeScript 支持
- 自动更新到 Cocos Creator 扩展目录
- 交互式初始化脚本
- 环境变量配置支持
- 国际化支持
- ESLint 和 Prettier 代码质量工具
- VSCode 配置和推荐扩展
- 跨平台文件操作支持

## 初始化步骤

1. 克隆此仓库到本地：

    ```bash
    git clone https://github.com/your-username/ccp-rollup-template.git my-extension
    cd my-extension
    ```

2. 安装依赖：

    ```bash
    # 使用 pnpm 安装依赖（推荐）
    pnpm install

    # 或者使用 npm
    npm install

    # 或者使用 yarn
    yarn install
    ```

3. 运行初始化脚本配置您的项目：

    ```bash
    pnpm init-extension
    ```

4. 按照提示输入您的项目信息：

    - 项目名称
    - 显示名称
    - 项目描述
    - 版本号
    - 作者
    - 最低支持的编辑器版本
    - Cocos Creator 扩展目录路径（可选）

5. 配置环境变量（如果未在初始化时设置）：

    编辑项目根目录下的 `.env` 文件，设置以下参数：

    ```
    # Cocos Creator 扩展部署路径
    COCOS_EXTENSION_PATH=/path/to/your/CocosCreator/extensions

    # 构建模式 (development 或 production)
    BUILD_MODE=development

    # 是否在构建后自动部署到扩展目录
    AUTO_DEPLOY=true
    ```

6. 开始开发您的扩展！

## 开发命令

- `pnpm build` - 构建扩展
- `pnpm watch` - 监视文件变化并自动重新构建
- `pnpm dev` - 等同于 watch 命令，监视文件变化
- `pnpm package` - 打包扩展以便分发
- `pnpm init-project` - 初始化扩展项目配置

## 环境变量说明

项目使用 `.env` 文件进行配置，主要包含以下环境变量：

- `COCOS_EXTENSION_PATH` - Cocos Creator 扩展目录的路径，用于自动部署
- `BUILD_MODE` - 构建模式，可选值为 `development` 或 `production`
    - `development` 模式会生成源码映射，便于调试
    - `production` 模式会压缩代码，优化性能
- `AUTO_DEPLOY` - 是否在构建后自动部署扩展，可选值为 `true` 或 `false`

## 目录结构

- `source/` - 源代码目录
    - `utils/` - 工具函数
- `assets/` - 资源和模板目录
- `i18n/` - 国际化资源目录
- `scripts/` - 构建和工具脚本
- `.vscode/` - VSCode 配置文件

## 代码质量工具

项目集成了以下代码质量工具：

1. **ESLint** - 静态代码分析工具，用于发现和修复问题
2. **Prettier** - 代码格式化工具，确保代码风格一致

## VSCode 集成

为 VSCode 用户提供了开箱即用的配置：

1. **推荐扩展** - 自动推荐安装相关的 VSCode 扩展
2. **编辑器设置** - 预设的编辑器配置，确保最佳开发体验
3. **任务配置** - 通过 VSCode 任务直接运行常用命令

## 配置说明

模板已预先配置了一个完整的 Rollup 构建流程，包括：

1. **TypeScript 编译** - 使用最新的 TypeScript 特性
2. **代码压缩** - 使用 terser 进行代码优化
3. **依赖处理** - 自动处理外部依赖
4. **资源复制** - 复制必要的文件到输出目录
5. **自动部署** - 构建后自动复制到扩展目录

修改 `rollup.config.mjs` 中的 `deployExtension` 配置可以自定义扩展的部署位置。

## 许可证

MIT
