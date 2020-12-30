import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useSelector } from 'react-redux';

import { pubSub } from '../../utils/pubSub';

import { State } from '../../interfaces/state';

const list = ['减速机', '耙齿', '机架', '驱动装置'];
const listMap: Record<string, string> = {
    '减速机': 'jsj',
    '耙齿': 'pc',
    '机架': 'jj',
    '驱动装置': 'qdzz',
};

function TabList() {
    const { part } = useSelector((state: State) => state.system);
    const [showList, setShow] = useState(([] as string[]).concat(list));

    function onAssemblyThree(part: string) {
        const newList: string[] = [];

        for (const value of showList) {
            if (value !== part) newList.push(value);
        }

        setShow(newList);
    }

    useEffect(() => {
        pubSub.subscribe('onAssemblyThree', onAssemblyThree);

        return () => { pubSub.unSubscribe('onAssemblyThree', onAssemblyThree); };
    });

    function mouseDownFn(value: string) {
        pubSub.publish('onAssembly', value);
    }

    function mouseUpFn() {
        if(part === '') {
            pubSub.publish('onDisassembly', false);
            return;
        }

        const newList = ([] as string[]).concat(showList, part);

        setShow(newList);

        pubSub.publish('onDisassembly', true);
    }

    // 重置
    function reset() {
        pubSub.publish('reset');
        setShow(([] as string[]).concat(list));
    }

    return (
        <div id="tab-list">
            <ul
                onPointerUp={() => mouseUpFn()}
            >
                {
                    showList.map((value, index) => (
                        <li
                            key={index}
                            className="list-item"
                            onPointerDown={() => mouseDownFn(value)}
                        >
                            <div className={`item-img item-img-${listMap[value]}`}></div>
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