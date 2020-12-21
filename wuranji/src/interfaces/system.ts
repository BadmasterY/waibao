export interface SystemPayload {
    total?: number;
    loaded?: number;
    isStart?: boolean;
    current?: number;
    part?: string;
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
    current: number;
    part: string;
}