import {
    SystemState as State,
    SystemAction as Action,
    SystemPayload as Payload
} from '../../interfaces/system';

export const types = {
    LOADED: 'systemLoaded',
    TOTAL: 'systemTotal',
    LOADING: 'systemLoading',
    START: 'systemStart',
    CURRENT: 'systemSetCurrent',
    PART: 'systemSetPart',
    ROAMING: 'systemSetRoaming',
};

const initialState: State = {
    isLoading: true,
    isStart: false,
    isRoaming: false,
    total: 0,
    loaded: 0,
    current: '',
    part: '',
    isTrigger: ''
};

export default function reducer(state = initialState, action: Action) {
    const { payload } = action;
    switch (action.type) {
        case types.LOADING:
            return Object.assign({}, state, { isLoading: false, loaded: state.total });
        case types.START:
            const startState = Object.assign({}, state);
            if (payload?.isStart !== undefined)
                startState.isStart = payload.isStart;
            return startState;
        case types.ROAMING:
            const roamingState = Object.assign({}, state);
            if (payload?.isRoaming !== undefined)
                roamingState.isRoaming = payload.isRoaming;
            return roamingState;
        case types.LOADED:
            const loadedState = Object.assign({}, state);
            if (payload?.loaded !== undefined) {
                loadedState.loaded += payload.loaded;
            } else {
                loadedState.loaded++;
            }
            return loadedState;
        case types.TOTAL:
            const totalState = Object.assign({}, state);
            if (payload?.total)
                totalState.total += payload.total;
            return totalState;
        case types.CURRENT:
            const currentState = Object.assign({}, state);
            if (payload?.current !== undefined)
                currentState.current = payload.current;
            return currentState;
        case types.PART:
            const partState = Object.assign({}, state);
            if (payload?.part !== undefined)
                partState.part = payload.part;
            return partState;
        default:
            return state;
    }
}

export const actions = {
    systemLoading: () => ({ type: types.LOADING }),
    systemStart: (payload?: Payload) => ({ type: types.START, payload }),
    systemLoaded: (payload?: Payload) => ({ type: types.LOADED, payload }),
    systemTotal: (payload: Payload) => ({ type: types.TOTAL, payload }),
    systemSetCurrent: (payload: Payload) => ({ type: types.CURRENT, payload }),
    systemSetPart: (payload: Payload) => ({ type: types.PART, payload }),
    systemSetRoaming: (payload: Payload) => ({ type: types.ROAMING, payload }),
};