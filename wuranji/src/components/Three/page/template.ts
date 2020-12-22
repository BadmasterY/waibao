import * as THREE from 'three';

import { InitReturn } from '../../../interfaces/init';
import isPC from '../../../utils/isPC';
import loader from '../modules/loader';

/**
 * this is a page template
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Template(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void) {
    const { scene } = initReturn;

    THREE.Cache.enabled = true;

    const pageGroup = new THREE.Group();
    pageGroup.name = 'template'; // name, E.g: `'template'`

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    setTotal(1);
    scene.add(pageGroup); // add to scene

    // animate callback
    function callback() {
    }

    // promise array
    const promise: (Promise<any> | THREE.Group)[] = [];

    console.log(require('../../../assets/models/ChuWuJi_DH.fbx'));

    const url = require('../../../assets/models/ChuWuJi_DH.fbx').default;
    console.log(url);
    const p1 = new Promise<null>((resolve, reject) => {
        loader(url).then(group => {
            // 成功加载之后调用
            setLoaded();

            console.log(group);

            resolve(null);
        }).catch(err => reject(err));
    });

    promise.push(p1);

    promise.push(pageGroup);

    return {
        name: 'Template', // use with initPage, E.g: `'template'`
        promise,
        callback,
    }
}

export default Template;