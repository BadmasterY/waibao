/**
 * 发布订阅模式 
 */
export interface PubSub {
    /**
     * 事件列表
     */
    list: Record<string, Function[]>,
    /**
     * 订阅事件
     * @param key 事件
     * @param fn 触发事件执行的函数
     */
    subscribe(key: string, fn: Function): void,
    /**
     * 发布事件
     * @param key 事件
     * @param arg 参数
     */
    publish(key: string, ...arg: any[]): void,
    /**
     * 取消订阅
     * @param key 事件
     * @param fn 触发事件执行的函数
     */
    unSubscribe(key: string, fn: Function): boolean,
}