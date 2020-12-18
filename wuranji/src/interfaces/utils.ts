export interface PubSub {
    list: Record<string, Function[]>,
    subscribe(key: string, fn: Function): void,
    publish(key: string, ...arg: any[]): void,
    unSubscribe(key: string, fn: Function): boolean,
}