/**
 * 项目配置信息
 * 这个文件包含项目的核心配置参数
 */

/**
 * 项目包名
 * 这将用于i18n引用、面板ID等
 */
export const packageName = '';

/**
 * 项目版本号
 */
export const version = '';

/**
 * 获取i18n键名
 * @param key i18n键名后缀
 * @returns 完整的i18n键名
 */
export const i18n = (key: string) => `${packageName}.${key}`;
