import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function loader(url: string, onProgress = (xhr: ProgressEvent) => { }) {
    const l = new FBXLoader();

    return new Promise<THREE.Group>((resolve, reject) => {
        l.load(
            url,
            group => resolve(group),
            xhr => onProgress(xhr),
            err => reject(err),
        );
    });
}

export function gltfLoader(url: string, onProgress = (xhr: ProgressEvent) => { }) {
    const l = new GLTFLoader();

    return new Promise<GLTF>((resolve, reject) => {
        l.load(
            url,
            group => resolve(group),
            xhr => onProgress(xhr),
            err => reject(err),
        );
    });
}

export default loader;