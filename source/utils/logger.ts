/**
 * 日志工具
 * 封装日志输出，便于统一管理和格式化
 */

let packageName = '';

/**
 * 设置包名，用于日志前缀
 * @param name 包名
 */
export function setPackageName(name: string): void {
    packageName = name;
}

/**
 * 获取日志前缀
 * @returns 格式化的日志前缀
 */
function getPrefix(): string {
    return `[${packageName}]`;
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    NONE,
}

/**
 * 当前日志级别
 */
let currentLogLevel = LogLevel.INFO;

/**
 * 设置日志级别
 * @param level 日志级别
 */
export function setLogLevel(level: LogLevel): void {
    currentLogLevel = level;
}

/**
 * 输出调试信息
 * @param message 日志信息
 * @param optionalParams 额外参数
 */
export function debug(message: string, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
        console.debug(`${getPrefix()} ${message}`, ...optionalParams);
    }
}

/**
 * 输出普通信息
 * @param message 日志信息
 * @param optionalParams 额外参数
 */
export function info(message: string, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.INFO) {
        console.info(`${getPrefix()} ${message}`, ...optionalParams);
    }
}

/**
 * 输出警告信息
 * @param message 日志信息
 * @param optionalParams 额外参数
 */
export function warn(message: string, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.WARN) {
        console.warn(`${getPrefix()} ${message}`, ...optionalParams);
    }
}

/**
 * 输出错误信息
 * @param message 日志信息
 * @param optionalParams 额外参数
 */
export function error(message: string, ...optionalParams: any[]): void {
    if (currentLogLevel <= LogLevel.ERROR) {
        console.error(`${getPrefix()} ${message}`, ...optionalParams);
    }
}

export default {
    setPackageName,
    setLogLevel,
    debug,
    info,
    warn,
    error,
    LogLevel,
};
