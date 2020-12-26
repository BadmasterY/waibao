import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function loader(url: string, onProgress = (url: string, loaded: number, total: number) => { }) {
    const m = new THREE.LoadingManager(undefined, onProgress);
    const l = new FBXLoader(m);

    return new Promise<THREE.Group>((resolve, reject) => {
        l.load(
            url,
            group => resolve(group),
            undefined,
            err => reject(err),
        );
    });
}

export function gltfLoader(url: string, onProgress = (url: string, loaded: number, total: number) => { }) {
    const m = new THREE.LoadingManager(undefined, onProgress);
    const l = new GLTFLoader(m);

    return new Promise<GLTF>((resolve, reject) => {
        l.load(
            url,
            group => resolve(group),
            undefined,
            err => reject(err),
        );
    });
}

export default loader;