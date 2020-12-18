import React from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../../redux/ducks/system';
import { pubSub } from '../../utils/pubSub';

import './back.css';

function Back() {
    const dispatch = useDispatch();

    function goBack() {
        const action = actions.systemStart({ isStart: false });
        dispatch(action);

        pubSub.publish('back');
    }

    return (
        <div id="back" onClick={goBack}></div>
    );
}

export default Back;