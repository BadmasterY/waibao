import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { InitReturn } from '../../../interfaces/init';

let isAnimation = false;
let clearColor = new THREE.Color(0xdf00ff);
let opacity = 0.1;

/**
 * methods that are constantly called to update scene rendering
 * @param initReturn Init() returns
 * @param callback three pages callback collection
 */
function animate(initReturn: InitReturn, callback = () => { }): void {
    const { scene, camera, renderer, composer, stats } = initReturn;

    requestAnimationFrame(animate.bind(null, initReturn, callback));

    renderer.setClearColor(clearColor, opacity);
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
    TWEEN.update();
    if (stats) stats.update();

    if (!isAnimation) return;
    callback();
}

export default animate;