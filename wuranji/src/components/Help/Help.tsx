import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { State } from '../../interfaces/state';

import HelpButton from './HelpButton';
import HelpContent from './HelpContent';

import './help.css';

function Help() {
    const [showContent, setShow] = useState(false);

    const { isRoaming } = useSelector((state: State) => state.system);

    function onShow() {
        setShow(true);
    }

    function onClose() {
        setShow(false);
    }

    return (
        <>
            {
                isRoaming ?
                    <HelpButton onClick={onShow} />
                    :
                    ''
            }
            {
                isRoaming && showContent ?
                    <HelpContent onClick={onClose} />
                    :
                    ''
            }
        </>
    );
}

export default Help;