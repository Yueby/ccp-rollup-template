import logger from './utils/logger';

const packageName = 'ccp-rollup-template';

// 设置日志包名
logger.setPackageName(packageName);

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    /**
     * @en Example of a method that can be called from the panel
     * @zh 可以从面板调用的方法示例
     */
    async exampleMethod(text: string) {
        logger.info(`收到消息: ${text}`);
        return 'success';
    },
};

/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
export function load() {
    logger.info('插件已加载');
}

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export function unload() {
    logger.info('插件已卸载');
}
