import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { InitReturn } from '../../../interfaces/init';
import resize from './resize';
/**
 * init scene camera and renderer
 * @param domId use dom id
 * @param useProcessing if need processing
 */
function initFn(domId: string, useProcessing = false): InitReturn {
    // render dom
    const dom = document.getElementById(domId);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio); // set mobile pixe
    renderer.shadowMap.enabled = true;
    
    let composer: EffectComposer | undefined;
    // use post-processing or not
    if(useProcessing) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.setPixelRatio(window.devicePixelRatio);
    }

    if (dom) {
        composer?.setSize(dom.offsetWidth, dom.offsetHeight);
        renderer.setSize(dom.offsetWidth, dom.offsetHeight);
        dom.appendChild(renderer.domElement);
    } else {
        throw new Error(`[Error] render dom is not found, check 'domId'!`);
    }

    const initReturn = {
        dom,
        scene,
        camera,
        renderer,
        composer,
    };

    // add resize event
    window.addEventListener('resize', () => { resize(dom, initReturn) });

    return initReturn;
}

export default initFn;