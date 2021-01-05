import React, { useEffect } from 'react';
import { message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import initFn from './modules/init';
import animate, { setAnimation } from './modules/animate';

import Page from './page/page';
import isPC from '../../utils/isPC';

import { actions } from '../../redux/ducks/system';

import { State } from '../../interfaces/state';

import './three.css';

let timer: NodeJS.Timeout | undefined;
let totalNum = .5;

function Three() {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state: State) => state.system);

    if (!isLoading && timer) {
        clearTimeout(timer);
    }

    function init() {
        const initReturn = initFn('three', true);

        function load() {
            setLoaded(totalNum > 0 ? totalNum : 0);

            if (totalNum > 0)
                totalNum -= .1;

            timer = setTimeout(load, 10000);
        }

        timer = setTimeout(() => load(), 1200);

        const page = Page(initReturn, setTotal, setLoaded, setCurrentPart, setErrorMsg);

        const { promise, callback } = page;

        Promise.all(promise).then(() => {
            setTimeout(() => loaded(), 1000);
            setAnimation(true);
        }).catch(err => {
            console.error(err);
            // message.error('加载失败!', 0);
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

    function setErrorMsg(ctx: string) {
        message.error(ctx);
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
        const total = isPC ? 2 : 1;
        setTotal(total);
        init();
    }, []);

    return (
        <div id="three"></div>
    );
}

export default Three;