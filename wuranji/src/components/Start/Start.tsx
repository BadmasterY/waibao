import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../../redux/ducks/system';

import { State } from '../../interfaces/state';

import './start.css';

function Start() {
    const { isStart } = useSelector((state: State) => state.system);
    const dispatch = useDispatch();

    function clickStart() {
        const action = actions.systemStart({ isStart: true });
        dispatch(action);
    }

    return (
        <div id="start" className={isStart ? 'hidden-start' : ''}>
            <div className="start-text"></div>
            <div className="start-btn" onClick={clickStart}></div>
        </div>
    );
}

export default Start;