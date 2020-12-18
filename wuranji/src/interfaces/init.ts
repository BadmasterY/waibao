import Stats from "three/examples/jsm/libs/stats.module";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

export interface InitReturn {
    dom: HTMLElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    composer?: EffectComposer;
    stats?: Stats;
}