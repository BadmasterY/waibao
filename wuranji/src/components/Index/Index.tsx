import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Loading from '../Loading/Loading';
import Start from '../Start/Start';
import Tab from '../Tab/Tab';
import Three from '../Three/Three';
import FullButton from '../FullButton/FullButton';
import Roaming from '../Roaming/Roming';
import Back from '../Back/Back';
import Help from '../Help/Help';

import { actions } from '../../redux/ducks/system';
import isPC from '../../utils/isPC';

import { State } from '../../interfaces/state';

function Index() {
    const { isLoading } = useSelector((state: State) => state.system);
    const dispatch = useDispatch();

    useEffect(() => {
        const action = actions.systemSetCurrent({ current: isPC ? "视角" : "旋转" });
        dispatch(action);
    }, []);

    return (
        <>
            <Loading className={isLoading ? '' : 'hidden-loading'} />
            <Start />
            <Tab />
            {/* <Three /> */}
            <FullButton />
            <Roaming />
            <Back />
            <Help />
        </>
    );
}

export default Index;