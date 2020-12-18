import React from 'react';

import TabTitle from './TabTitle';
import TabContent from './TabContent';

import isPC from '../../utils/isPC';

import './tab.css';

function Home() {
    return (
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
    )
}

export default Home;