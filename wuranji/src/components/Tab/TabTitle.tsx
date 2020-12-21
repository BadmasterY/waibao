import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { actions } from '../../redux/ducks/system';
import { pubSub } from '../../utils/pubSub';

import { State } from '../../interfaces/state';

const list = ['sj', 'jg', 'cz'];

function TabTitle() {
    const { current } = useSelector((state: State) => state.system);
    const dispatch = useDispatch();

    function changeCurrent(current: number) {
        const action = actions.systemSetCurrent({ current });
        dispatch(action);

        pubSub.publish('changeTitle', list[current]);
    }

    return (
        <div id="tab-title">
            {
                list.map((value, index) => (
                    <div
                        key={index}
                        className={`titles title-${current === index ? `${value}-current` : value}`}
                        onClick={() => changeCurrent(index)}
                    ></div>
                ))
            }
        </div>
    );
}

export default TabTitle;