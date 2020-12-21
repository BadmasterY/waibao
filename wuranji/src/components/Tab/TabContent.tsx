import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { pubSub } from '../../utils/pubSub';

import { State } from '../../interfaces/state';

const perspectiveList = ['主视角', '俯视角', '左视角'];
const structureList = ['减速机', '耙齿', '驱动装置', '机架'];

function TabContent() {
    const { current } = useSelector((state: State) => state.system);

    const [perspectiveCurrent, setPerspectiveCurrent] = useState(-1);
    const [structureCurrent, setStructureCurrent] = useState(-1);

    useEffect(() => {
        setStructureCurrent(-1);
        setPerspectiveCurrent(-1);
    }, [current]);

    function changePerspective(index: number) {
        setPerspectiveCurrent(index);

        pubSub.publish('changePerspective', perspectiveList[index]);
    }

    function changeStructure(index: number) {
        setStructureCurrent(index);

        pubSub.publish('changeStructure', structureList[index]);
    }

    function renderPerspective() {
        return (
            <ul className="content-list perspective">
                {
                    perspectiveList.map((value, index) => (
                        <li
                            key={index}
                            className={`list-item ${perspectiveCurrent === index ? `list-item-current` : ''}`}
                            onClick={() => changePerspective(index)}
                        >
                            {value}
                        </li>
                    ))
                }
            </ul>
        );
    }

    function renderStructure() {
        return (
            <ul className="content-list structure">
                {
                    structureList.map((value, index) => (
                        <li
                            key={index}
                            className={`list-item ${structureCurrent === index ? `list-item-current` : ''}`}
                            onClick={() => changeStructure(index)}
                        >
                            {value}
                        </li>
                    ))
                }
            </ul>
        );
    }

    function renderDisassembly() {
        return (
            <div className="content-text">
                <p>【组装】：将装配区域中的组件拖动到污染机对应位置完成组装</p>
                <p>【拆分】：将组件从三维模型中拖动到装配区域完成拆卸</p>
            </div>
        );
    }

    return (
        <div id="tab-content">
            {
                current === 0 ? renderPerspective() : ''
            }
            {
                current === 1 ? renderStructure() : ''
            }
            {
                current === 2 ? renderDisassembly() : ''
            }
        </div>
    );
}

export default TabContent;