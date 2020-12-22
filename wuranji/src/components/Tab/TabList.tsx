import React from 'react';
import { message } from 'antd';
import { useSelector } from 'react-redux';

import { pubSub } from '../../utils/pubSub';

import { State } from '../../interfaces/state';

const list = ['减速机', '耙齿', '机架', '驱动装置'];

function TabList() {
    const { part } = useSelector((state: State) => state.system);

    function mouseDownFn(index: number) {
        pubSub.publish('onAssembly', list[index]);
    }

    function mouseUpFn(index: number) {
        if(part !== list[index]) {
            message.error('放置位置错误!');
            return;
        }

        // 只有放置正确时才会触发
        pubSub.publish('onDisassembly');
    }

    // 重置
    function reset() {
        pubSub.publish('reset');
    }

    return (
        <div id="tab-list">
            <ul>
                {
                    list.map((value, index) => (
                        <li
                            key={index}
                            className="list-item"
                            onMouseDown={() => mouseDownFn(index)}
                            onMouseUp={() => mouseUpFn(index)}
                        >
                            <div className={`item-img item-img-${index}`}></div>
                            <p>{value}</p>
                        </li>
                    ))
                }
            </ul>
            <div className="list-reset" onClick={reset}></div>
        </div>
    );
}

export default TabList;