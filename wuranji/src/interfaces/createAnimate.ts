export interface Options {
    data: Record<string, any>, 
    targetData: Record<string, any>, 
    time: number, 
    delay?: number, 
    onStart?: () => void, 
    onUpdate?: (data: Record<string, any>) => void, 
    onComplete?: () => void
}