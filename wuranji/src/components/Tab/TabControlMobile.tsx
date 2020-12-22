import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../../redux/ducks/system';
import { pubSub } from '../../utils/pubSub';

import { State } from '../../interfaces/state';

const list = ['旋转', '结构', '亮度', '拆装'];

function TabControlMobile() {
    const { current } = useSelector((state: State) => state.system);
    const dispatch = useDispatch();

    function onClick(current: string) {
        const action = actions.systemSetCurrent({ current });
        dispatch(action);

        pubSub.publish('changeTitle', current);
    }

    return (
        <div id="tab-control-mobile">
            <ul className="control-list">
                {
                    list.map((value, index) => (
                        <li
                            key={value}
                            className={
                                `list-item list-item-${index} ${current === value ? `current-item-${index}` : ""}`
                            }
                            onClick={() => onClick(value)}
                        >
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}

export default TabControlMobile;