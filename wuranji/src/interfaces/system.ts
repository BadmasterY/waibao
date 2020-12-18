export interface SystemPayload {
    total?: number;
    loaded?: number;
    isStart?: boolean;
}

export interface SystemAction {
    type?: string;
    payload?: SystemPayload;
}

export interface SystemState {
    isLoading: boolean;
    isStart: boolean;
    total: number;
    loaded: number;
}