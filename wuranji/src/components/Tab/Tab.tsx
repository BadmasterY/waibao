import React from 'react';
import { useSelector } from 'react-redux';

import TabTitle from './TabTitle';
import TabContent from './TabContent';
import TabList from './TabList';

import isPC from '../../utils/isPC';

import { State } from '../../interfaces/state';

import './tab.css';

function Home() {
    const { current } = useSelector((state: State) => state.system);

    return (
        <>
            <div id="tab">
                {
                    isPC ?
                        <>
                            <TabTitle />
                            <TabContent />
                        </>
                        :
                        <>mobile</>
                }
            </div>
            {
                isPC && current === 2 ?
                    <TabList />
                    :
                    ''
            }
        </>
    )
}

export default Home;