import React, { useState, useEffect } from 'react';

import isPC from '../../utils/isPC';

import './fullButton.css';

function FullButton() {
    const [isFull, setFull] = useState(false);

    function full() {
        if (!isFull) {
            setFull(true);
            document.documentElement.requestFullscreen();
        }
        else {
            setFull(false);
            document.exitFullscreen();
        }
    }

    function fullScreenChange(ev: Event) {
        if (document.fullscreenElement) {
            setFull(true);
        } else {
            setFull(false);
        }
    }

    useEffect(() => {
        document.addEventListener('fullscreenchange', fullScreenChange, false);

        return () => {
            document.removeEventListener('fullscreenchange', fullScreenChange, false);
        }
    });

    return (
        <div id={
            isPC ?
                isFull ?
                    'isFull'
                    :
                    'fullBtn'
                :
                'full_mobile'
        } onClick={full}></div>
    );
}

export default FullButton;