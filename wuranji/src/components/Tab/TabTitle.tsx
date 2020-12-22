import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../../redux/ducks/system';
import { pubSub } from '../../utils/pubSub';

import { State } from '../../interfaces/state';

const list = ['sj', 'jg', 'cz'];
const listName = ['视角', '结构', '拆装'];

function TabTitle() {
    const { current } = useSelector((state: State) => state.system);
    const dispatch = useDispatch();

    function changeCurrent(current: number) {
        const action = actions.systemSetCurrent({ current: listName[current] });
        dispatch(action);

        pubSub.publish('changeTitle', listName[current]);
    }

    return (
        <div id="tab-title">
            {
                list.map((value, index) => (
                    <div
                        key={index}
                        className={`titles title-${current === listName[index] ? `${value}-current` : value}`}
                        onClick={() => changeCurrent(index)}
                    ></div>
                ))
            }
        </div>
    );
}

export default TabTitle;