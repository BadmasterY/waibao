export interface SystemPayload {
    total?: number;
    loaded?: number;
    isStart?: boolean;
    isRoaming?: boolean;
    current?: string;
    part?: string;
}

export interface SystemAction {
    type?: string;
    payload?: SystemPayload;
}

export interface SystemState {
    isLoading: boolean;
    isStart: boolean;
    isRoaming: boolean;
    total: number;
    loaded: number;
    current: string;
    part: string;
}