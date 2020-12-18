import React from 'react';
import { useSelector } from 'react-redux';

import Loading from '../Loading/Loading';
import Start from '../Start/Start';
import Tab from '../Tab/Tab';
import Three from '../Three/Three';
import FullButton from '../FullButton/FullButton';
import Roaming from '../Roaming/Roming';
import Back from '../Back/Back';

import { State } from '../../interfaces/state';

function Index() {
    const { isLoading } = useSelector((state: State) => state.system);

    return (
        <>
            <Loading className={isLoading ? '' : 'hidden-loading'} />
            <Start />
            <Tab />
            {/* <Three /> */}
            <FullButton />
            <Roaming />
            <Back />
        </>
    );
}

export default Index;