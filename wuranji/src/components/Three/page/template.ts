import * as THREE from 'three';

import { InitReturn } from '../../../interfaces/init';
import isPC from '../../../utils/isPC';
// import loader from '../modules/loader';

/**
 * this is a page template
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Template(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void) {
    const { scene } = initReturn;

    const pageGroup = new THREE.Group();
    pageGroup.name = 'template'; // name, E.g: `'template'`

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    setTotal(0);
    scene.add(pageGroup); // add to scene

    // animate callback
    function callback() {
    }

    // promise array
    const promise: (Promise<any> | THREE.Group)[] = [];

    // const p1 = new Promise((resolve, reject) => {
    //     loader(require('../../../assets/models/qiu.fbx')).then(group => {
    //         // 成功加载之后调用
    //         setLoaded();

    //         resolve();
    //     }).catch(err => reject(err));
    // });

    // promise.push(p1);

    promise.push(pageGroup);

    return {
        name: 'Template', // use with initPage, E.g: `'template'`
        promise,
        callback,
    }
}

export default Template;