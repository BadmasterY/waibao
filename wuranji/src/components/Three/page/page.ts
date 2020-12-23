import * as THREE from 'three';
import { Vector3 } from 'three';
import { useDispatch } from 'react-redux';
import { InitReturn } from '../../../interfaces/init';

import { pubSub } from '../../../utils/pubSub';
import loader from '../modules/loader';

/**
 * this is a page page
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Page(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void) {
    const { scene, camera } = initReturn;
    THREE.Cache.enabled = true;

    const pageGroup = new THREE.Group();
    pageGroup.name = 'Page'; 

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    setTotal(2);
    scene.add(pageGroup); // add to scene

    // animate callback
    function callback() {
    }


    pubSub.publish('changePerspective', function( str: string){
        console.log(str);
        
        if(str == "主视角"){
            console.log(0);
            camera.position.set(0,1.5,5);
            camera.rotation.set(0, 0, 0);
        }else if(str == "俯视角"){
            console.log(1);
            camera.position.set(-1.5,1.5,5);
            camera.rotation.set( Math.PI/2, 0, 0);
            
        }else if(str == "左视角"){
            console.log(2);
            camera.position.set(-1.5,1.5,5);
            camera.rotation.set( 0, Math.PI/2, 0);

        }
    });

    pubSub.publish('changeStructure', function( str: string){
        console.log(str);
        
        if(str == "减速机"){
            
        }
        else if(str == "耙齿"){
            
            
        }
        else if(str == "驱动装置"){
            

        }
        else if(str == "机架"){
            

        }
    });



  


    // promise array
    const promise: (Promise<any> | THREE.Group)[] = [];

    console.log(require('../../../assets/models/ChuWuJi_DH.fbx'));

    const url = require('../../../assets/models/ChuWuJi_DH.fbx').default;
    console.log(url);
    const p1 = new Promise<null>((resolve, reject) => {
        loader(url).then(group => {
            // 成功加载之后调用
            setLoaded();
            group.scale.set(0.003,0.003,0.003);
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

    promise.push(p1);
    promise.push(p2);

    promise.push(pageGroup);
    scene.add(pageGroup);

    return {
        name: 'Page',
        promise,
        callback,
    }
}


export default Page;