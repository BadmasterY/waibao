import { PubSub } from '../interfaces/utils';

export const pubSub: PubSub = {
    list: {},
    subscribe(key: string, fn: Function) {
        if(!this.list[key]) {
            this.list[key] = [];
        }

        this.list[key].push(fn);
    },
    publish(key: string, ...arg: any[]) {
        if(!Array.isArray(this.list[key])) return;

        for(const fn of this.list[key]) {
            fn.call(this, ...arg);
        }
    },
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
