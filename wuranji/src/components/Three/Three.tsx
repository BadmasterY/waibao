import React, { useEffect } from 'react';
import { message } from 'antd';
import { useDispatch } from 'react-redux';

import isPC from '../../utils/isPC';
import initFn from './modules/init';
import animate, { setAnimation } from './modules/animate';

import Page from './page/page';

import { actions } from '../../redux/ducks/system';

import './three.css';

function Three() {
    const dispatch = useDispatch();

    function init() {
        if (isPC) {
            message.info('pc');
        } else {
            message.info('mobile');
        }

        const initReturn = initFn('three', true);

        const page = Page(initReturn, setTotal, setLoaded, setCurrentPart);

        const { promise, callback } = page;

        Promise.all(promise).then(() => {
            loaded();
            setAnimation(true);
        }).catch(err => {
            console.error(err);
            message.error('加载失败!', 0);
        });

        animate(initReturn, () => {
            // 处理一些回调
            callback();
        });
    }

    /**
     * 设置零部件名称, 拆装时使用
     * @param part 零部件名称
     */
    function setCurrentPart(part: string) {
        const action = actions.systemSetPart({ part });
        dispatch(action);
    }

    function loaded() {
        const action = actions.systemLoading();
        dispatch(action);
    }

    function setLoaded(loaded = 1) {
        const action = actions.systemLoaded({ loaded });
        dispatch(action);
    }

    function setTotal(total: number) {
        const action = actions.systemTotal({ total });
        dispatch(action);
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div id="three"></div>
    );
}

export default Three;