import React from 'react';
import { useSelector } from 'react-redux';

import { Props } from '../../interfaces/loading';
import { State } from '../../interfaces/state';

import './loading.css';

function Loading(props: Props) {
    const { className } = props;
    const { total, loaded } = useSelector((state: State) => state.system);

    return (
        <div id="loading" className={className}>
            <div className="loading-box">
                <div className="bg-box">
                    <div className="progress-box">
                        <div className="box-bg box-progress"></div>
                        <div className="box-bg box-mask" style={{
                            top: total > 0 ?
                                `-${(Math.floor((loaded / total) * 100))}%` : '0%'
                        }}></div>
                    </div>
                    <div className="box-bg box-bg-1"></div>
                    <div className="box-bg box-bg-2"></div>
                </div>
                <p className="loading-text">全速加载中... {
                    total > 0 ?
                        (Math.floor((loaded / total) * 100)) : 0
                } %</p>
            </div>
        </div>
    );
}

export default Loading;