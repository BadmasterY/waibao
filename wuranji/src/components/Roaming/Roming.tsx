import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import isPC from '../../utils/isPC';
import { pubSub } from '../../utils/pubSub';
import { actions } from '../../redux/ducks/system';

import { State } from '../../interfaces/state';

import './roaming.css';

function Roaming() {
    const { isRoaming } = useSelector((state: State) => state.system);
    const dispatch = useDispatch();

    function enterRoaming() {
        pubSub.publish('enterRoaming');

        const action = actions.systemSetRoaming({ isRoaming: true });
        dispatch(action);
    }

    function leaveRoaming() {
        pubSub.publish('leaveRoaming');

        const action = actions.systemSetRoaming({ isRoaming: false });
        dispatch(action);
    }

    return (
        // <div id={
        //     isPC ?
        //         isRoaming ?
        //             "isRoaming"
        //             :
        //             "roaming"
        //         :
        //         "roaming-mobile"
        // } onClick={switchRoaming}></div>
        <>
            {
                isPC ?
                    <>
                        {
                            isRoaming ?
                                <div id="view" onClick={leaveRoaming}></div>
                                :
                                <div id="roaming" onClick={enterRoaming}></div>
                        }
                    </>
                    :
                    ''
            }
        </>
    );
}

export default Roaming;