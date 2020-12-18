import { PubSub } from '../interfaces/utils';

/*****************
 * 发布订阅模式  
 *****************/
export const pubSub: PubSub = {
    /**
     * 事件列表
     */
    list: {},
    /**
     * 订阅事件
     * @param key 事件
     * @param fn 触发事件执行的函数
     */
    subscribe(key: string, fn: Function) {
        if(!this.list[key]) {
            this.list[key] = [];
        }

        this.list[key].push(fn);
    },
    /**
     * 发布事件
     * @param key 事件
     * @param arg 参数
     */
    publish(key: string, ...arg: any[]) {
        if(!Array.isArray(this.list[key])) return;

        for(const fn of this.list[key]) {
            fn.call(this, ...arg);
        }
    },
    /**
     * 取消订阅
     * @param key 事件
     * @param fn 触发事件执行的函数
     */
    unSubscribe(key: string, fn: Function) {
        if(!this.list[key]) return false;

        if(!fn) {
            this.list[key] = [];
            return true;
        }else {
            const index = this.list[key].findIndex(item => item === fn);
            if(index !== -1) {
                this.list[key].splice(index, 1);
                return true;
            }else {
                return false;
            }
        }
    }
};
