import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

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

export default loader;