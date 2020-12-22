import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useSelector } from 'react-redux';

import { pubSub } from '../../utils/pubSub';

import { State } from '../../interfaces/state';

const list = ['旋转', '结构', '亮度', '拆装'];
const rotate = ['default', 'x', 'y', 'z'];
const structure = ['减速机', '耙齿', '驱动装置', '机架'];
const orient = ['横屏', '竖屏'];

const MIN = 7;
const MAX = 94;

let isTouchStart = false;
let startPos = 0;
let oldPos = 0;

function TabListMobile() {
    const { current, part } = useSelector((state: State) => state.system);

    const [orientation, setOrientation] = useState('');
    const [rotateCurrent, setRotate] = useState(rotate[0]);
    const [structureCurrent, setStructure] = useState('');
    const [light, setLight] = useState(50);

    window.addEventListener('load', VorH, false);

    useEffect(() => {
        setStructure('');
    }, [current]);

    useEffect(() => {
        window.addEventListener('orientationchange', VorH, false);

        return () => window.removeEventListener('orientationchange', VorH, false);
    }, []);

    function VorH() {
        isTouchStart = false;
        if (window.orientation == 90 || window.orientation == -90) {
            setOrientation(orient[0]);
            document.body.style.touchAction = 'pan-x';
        } else if (window.orientation == 0 || window.orientation == 180) {
            setOrientation(orient[1]);
            document.body.style.touchAction = 'pan-y';
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
                            <div className={`list-bg list-bg-${index}`}></div>
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

        ev.preventDefault();

        const { clientX, clientY } = ev.changedTouches[0];
        startPos = orientation === orient[0] ? clientY : clientX;
        oldPos = light;
    }

    function brightnessTouchMove(ev: React.TouchEvent) {
        if (!isTouchStart) return;
        if (ev.changedTouches.length === 0) return;

        ev.preventDefault();

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

    function onTouchStart(current: string) {
        pubSub.publish('onAssembly', current);
    }

    function onTouchEnd(current: string) {
        if (part !== current) {
            message.error('放置位置错误!');
            return;
        }

        // 只有放置正确时才会触发
        pubSub.publish('onDisassembly');
    }

    function renderDisassembly() {
        return (
            <ul className="mobile-list">
                {
                    structure.map((value, index) => (
                        <li
                            key={index}
                            className="list-item structure"
                            onTouchStart={() => onTouchStart(value)}
                            onTouchEnd={() => onTouchEnd(value)}
                        >
                            <div className={`list-bg list-bg-${index}`}></div>
                            <p>{value}</p>
                        </li>
                    ))
                }
            </ul>
        );
    }

    return (
        <div id="tab-list-mobile">
            {
                renderList()
            }
        </div>
    );
}

export default TabListMobile;