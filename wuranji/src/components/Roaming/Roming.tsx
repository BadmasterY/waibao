import React, { useState } from 'react';

import isPC from '../../utils/isPC';
import { pubSub } from '../../utils/pubSub';

import './roaming.css';

function Roaming() {
    const [isRoaming, setRoaming] = useState(false);

    function switchRoaming() {
        if (isRoaming) {
            setRoaming(false);
            pubSub.publish('leaveRoaming');
        } else {
            setRoaming(true);
            pubSub.publish('enterRoaming');
        }
    }

    return (
        <div id={
            isPC ?
                isRoaming ?
                    "isRoaming"
                    :
                    "roaming"
                :
                "roaming-mobile"
        } onClick={switchRoaming}></div>
    );
}

export default Roaming;