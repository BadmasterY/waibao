import React from 'react';
import { useSelector } from 'react-redux';

import TabTitle from './TabTitle';
import TabContent from './TabContent';
import TabList from './TabList';

import TabListMobile from './TabListMobile';
import TabControlMobile from './TabControlMobile';

import isPC from '../../utils/isPC';

import { State } from '../../interfaces/state';

import './tab.css';

const listName = ['视角', '结构', '拆装'];

function Home() {
    const { current, isStart } = useSelector((state: State) => state.system);

    return (
        <>
            <div id={isPC ? "tab" : "tab-mobile"}>
                {
                    isPC ?
                        <>
                            <TabTitle />
                            <TabContent />
                        </>
                        :
                        <>
                            {
                                isStart ?
                                    <>
                                        <TabListMobile />
                                        <TabControlMobile />
                                    </>
                                    :
                                    ''
                            }
                        </>
                }
            </div>
            {
                isPC && current === listName[2] ?
                    <TabList />
                    :
                    ''
            }
        </>
    )
}

export default Home;