import TWEEN from '@tweenjs/tween.js';

import { Options } from '../../../interfaces/createAnimate';

/**
 * 创建动画
 * @param opts 动画参数
 */
function createAnimate(opts: Options) {
    const { data, targetData, time, delay = 0, onStart, onUpdate, onComplete } = opts;

    return new TWEEN.Tween(data)
        .to(targetData, time)
        .delay(delay)
        .onStart(() => {
            if (onStart) onStart();
        })
        .onUpdate(data => {
            if (onUpdate) onUpdate(data);
        })
        .onComplete(() => {
            if (onComplete) onComplete();
        })
        .start();
}

export default createAnimate;