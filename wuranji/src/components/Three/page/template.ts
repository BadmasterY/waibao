import * as THREE from 'three';
import { Vector3 } from 'three';

import { InitReturn } from '../../../interfaces/init';
import isPC from '../../../utils/isPC';
import animate from '../modules/animate';
import loader from '../modules/loader';

/**
 * this is a page template
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Template(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void) {
    const { scene, camera } = initReturn;

    THREE.Cache.enabled = true;

    const pageGroup = new THREE.Group();
    pageGroup.name = 'template'; // name, E.g: `'template'`

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    setTotal(2);
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
            group.scale.set(0.005,0.005,0.005);
            group.rotateOnWorldAxis(new Vector3(0,1,0), Math.PI/4);

            //动画编写
            console.log(group.animations.length);
            const mixer = new THREE.AnimationMixer( group );
            mixer.clipAction( group.animations[0] ).play();

            pageGroup.add(group);
            resolve(null);
        }).catch(err => reject(err));
    });
    
    const p2 = new Promise<null>((resolve, reject) => {
        loader(require('../../../assets/models/ChangFang.fbx').default).then(group => {
            // 成功加载之后调用
            setLoaded();
            group.scale.set(0.01,0.01,0.01);
            //pageGroup.add(group);

            resolve(null);
        }).catch(err => reject(err));
    });

    const HJG = new THREE.AmbientLight(0xffffff);
    pageGroup.add(HJG);
// camera.rotateX(Math.PI/4);

    promise.push(p1);
    promise.push(p2);

    promise.push(pageGroup);
    scene.add(pageGroup);

    return {
        name: 'Template', // use with initPage, E.g: `'template'`
        promise,
        callback,
    }
}

export default Template;