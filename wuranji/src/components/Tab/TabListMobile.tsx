import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import { pubSub } from '../../utils/pubSub';
import { actions } from '../../redux/ducks/system';

import { State } from '../../interfaces/state';
import isPC from '../../utils/isPC';

const list = ['旋转', '结构', '亮度', '拆装'];
const rotate = ['default', 'x', 'y', 'z'];
const structure = ['减速机', '耙齿', '驱动装置', '机架'];
const orient = ['横屏', '竖屏'];

const MIN = 7;
const MAX = 94;

let isTouchStart = false;
let startPos = 0;
let oldPos = 0;

const listMap: Record<string, string> = {
    '减速机': 'jsj',
    '耙齿': 'pc',
    '机架': 'jj',
    '驱动装置': 'qdzz',
};

function TabListMobile() {
    const { current, part } = useSelector((state: State) => state.system);
    const dispatch = useDispatch();

    const [orientation, setOrientation] = useState('');
    const [rotateCurrent, setRotate] = useState(rotate[0]);
    const [structureCurrent, setStructure] = useState('');
    const [light, setLight] = useState(50);
    const [showList, setShow] = useState(([] as string[]).concat(structure));

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


    useEffect(() => {
        setStructure('');
    }, [current]);

    useEffect(() => {
        VorH();
        window.addEventListener('orientationchange', VorH, false);

        return () => window.removeEventListener('orientationchange', VorH, false);
    }, []);

    useEffect(() => {
        pubSub.subscribe('touchEndFn', onTouchEnd);

        return () => { pubSub.unSubscribe('touchEndFn', onTouchEnd); };
    });

    function VorH() {
        isTouchStart = false;
        if (window.orientation === 90 || window.orientation === -90) {
            setOrientation(orient[0]);
        } else if (window.orientation === 0 || window.orientation === 180) {
            setOrientation(orient[1]);
        }

    }

    function renderList() {
        switch (current) {
            case list[0]:
                return renderRotate();
            case list[1]:
                return renderStructure();
            case list[2]:
                return renderBrightness();
            case list[3]:
                return renderDisassembly();
            default:
                return <></>;
        }
    }

    function changeRotate(current: string) {
        setRotate(current);

        pubSub.publish('changeRotate', current);
    }

    function renderRotate() {
        return (
            <ul className="mobile-list">
                {
                    rotate.map((value, index) => (
                        <li
                            key={index}
                            className={
                                `list-item rotate-${index} ${rotateCurrent === value ? `rotate-current-${index}` : ''}`
                            }
                            onClick={() => changeRotate(value)}
                        >
                        </li>
                    ))
                }
            </ul>
        );
    }

    function changeStructure(current: string) {
        setStructure(current);

        pubSub.publish('changeStructure', current);
    }

    function renderStructure() {
        return (
            <ul className="mobile-list">
                {
                    structure.map((value, index) => (
                        <li
                            key={index}
                            className={
                                `list-item structure ${structureCurrent === value ? `structure-current` : ''}`
                            }
                            onClick={() => changeStructure(value)}
                        >
                            <div className={`list-bg list-bg-${listMap[value]}`}></div>
                            <p>{value}</p>
                        </li>
                    ))
                }
            </ul>
        );
    }

    function brightnessTouchStart(ev: React.TouchEvent) {
        if (ev.changedTouches.length === 0) return;
        isTouchStart = true;

        const { clientX, clientY } = ev.changedTouches[0];
        startPos = orientation === orient[0] ? clientY : clientX;
        oldPos = light;
    }

    function brightnessTouchMove(ev: React.TouchEvent) {
        if (!isTouchStart) return;
        if (ev.changedTouches.length === 0) return;

        const { clientX, clientY } = ev.changedTouches[0];
        const movePos = orientation === orient[0] ? clientY : clientX;
        const ratio = orientation === orient[0] ? 212 : 260;
        const changePos = orientation === orient[0] ? ((startPos - movePos) / ratio) * 100 : ((movePos - startPos) / ratio) * 100;
        let newLight = changePos + oldPos;

        if (newLight > MAX) newLight = MAX;
        if (newLight < MIN) newLight = MIN;

        setLight(newLight);

        pubSub.publish('changeLight', oldPos, newLight);
    }

    function brightnessTouchEnd(ev: React.TouchEvent) {
        isTouchStart = false;
        startPos = 0;
        oldPos = 0;

        pubSub.publish('endLight');
    }

    function renderBrightness() {
        return (
            <div className="list-brightness">
                <div className="brightness-progress"></div>
                <div
                    className="brightness-btn"
                    style={orientation !== orient[0] ? { left: `${light}%` } : { bottom: `${light}%` }}
                    onTouchStart={brightnessTouchStart}
                    onTouchMove={brightnessTouchMove}
                    onTouchEnd={brightnessTouchEnd}
                >
                </div>
            </div>
        );
    }

    function onTouchStart(e: React.TouchEvent, current: string) {
        pubSub.publish('onAssembly', current);
    }

    let timer: NodeJS.Timeout | undefined;
    function onTouchMove(e: React.TouchEvent) {
        // if (timer) clearTimeout(timer);
        // if (e.touches.length > 0) {
        //     const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);

        //     if (el && el.id === 'three-canvas') {
        pubSub.publish('touchMove', e);

        // timer = setTimeout(() => { pubSub.publish('touchEnd', e); }, 120);
        // }
        // }
    }

    function touchEnd(e: React.TouchEvent) {
        if (e.touches.length > 0) {
            const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);

            console.log('end');
            if (el && el.id === 'three-canvas') {
                pubSub.publish('touchEnd', e);
            }
        }
    }

    function onTouchEnd(part: string) {
        if (part === '') {
            pubSub.publish('onDisassembly', false);
            return;
        }

        const index = showList.findIndex(value => value === part);

        if (index === -1) {
            const newList = ([] as string[]).concat(showList, part);

            setShow(newList);
        }

        pubSub.publish('onDisassembly', true);
    }

    function renderDisassembly() {
        return (
            <>
                <div className="drag-box">可将拆卸后的零件拖拽到下方区域</div>
                <ul
                    className="mobile-list use-with-event"
                // onTouchEnd={(e) => onTouchEnd()}
                >
                    {
                        showList.map((value, index) => (
                            <li
                                key={index}
                                className="list-item structure use-with-event"
                                onTouchStart={(e) => onTouchStart(e, value)}
                                onTouchMove={onTouchMove}
                            // onTouchEndCapture={touchEnd}
                            >
                                <div className={`list-bg list-bg-${listMap[value]} use-with-event`}></div>
                                <p className='use-with-event'>{value}</p>
                            </li>
                        ))
                    }
                </ul>
            </>
        );
    }

    // 重置
    function reset() {
        pubSub.publish('reset');
        setShow(([] as string[]).concat(structure));
    }

    return (
        <>
            <div id="tab-list-mobile">
                {
                    renderList()
                }
            </div>
            {
                current === '拆装' ?
                    <div className="list-reset" onClick={reset}></div>
                    :
                    ''
            }
        </>
    );
}

export default TabListMobile;