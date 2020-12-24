import * as THREE from 'three';
import { InitReturn } from '../../../interfaces/init';
import { pubSub } from '../../../utils/pubSub';
import loader from '../modules/loader';

import isPC from '../../../utils/isPC';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * this is a page page
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Page(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void) {
    const { scene, camera, renderer } = initReturn;
    THREE.Cache.enabled = true;
    let isstart: boolean = false;

    const pageGroup = new THREE.Group();
    pageGroup.name = 'Page';

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.mouseButtons = {
        LEFT: THREE.MOUSE.DOLLY,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
    }

    controls.enablePan = true;
    controls.enableZoom = false;
    controls.enableKeys = true;
    controls.minDistance = 5;
    controls.maxDistance = 7;
    controls.keyPanSpeed = .05;
    if (isPC) controls.maxPolarAngle = Math.PI / 2;

    //W:87,S:83,A:65,D:68 
    controls.keys = {
        LEFT: 65,
        RIGHT: 68,
        UP: 87,
        BOTTOM: 83,
    };

    controls.addEventListener('change', () => {
        if (!isPC) return;
        if (camera.position.y < 0) {
            camera.position.copy(camera.userData.lastPosition);
            controls.target.copy(camera.userData.lastTarget);
        } else {
            camera.userData.lastPosition = camera.position.clone();
            camera.userData.lastTarget = controls.target.clone();
        }
    });

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    setTotal(2);
    scene.add(pageGroup); // add to scene

    // animate callback
    function callback() {
        controls.update();
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
            group.scale.set(0.003, 0.003, 0.003);
            // group.rotateOnWorldAxis(new Vector3(0,1,0), Math.PI/4);

            //动画编写
            console.log(group.animations.length);
            const mixer = new THREE.AnimationMixer(group);
            mixer.clipAction(group.animations[0]).play();

            pageGroup.add(group);
            resolve(null);
        }).catch(err => reject(err));
    });

    const p2 = new Promise<null>((resolve, reject) => {
        loader(require('../../../assets/models/ChangFang.fbx').default).then(group => {
            // 成功加载之后调用
            setLoaded();
            group.scale.set(0.01, 0.01, 0.01);
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

    pubSub.subscribe('changePerspective', function (str: string) {
        // console.log(pageGroup.children[1]);

        if (str === "主视角") {
            camera.position.set(0, 0, 5);
            camera.rotation.set(0, 0, 0);
        } else if (str === "俯视角") {
            console.log(1);
            camera.position.set(0, 5, 0);
            camera.rotation.set(-Math.PI / 2, 0, 0);

        } else if (str === "左视角") {
            console.log(2);
            camera.position.set(-5, 0, 0);
            camera.rotation.set(0, -Math.PI / 2, 0);

        }
    });

    // document.addEventListener("keydown", function (event) {
    //     if (event.key == "w" && camera.position.z > 2.5) {
    //         camera.position.z -= 0.05;
    //     }

    //     if (event.key == "s" && camera.position.z < 10) {
    //         camera.position.z += 0.05;
    //     }

    //     if (event.key == "a" && camera.position.x > -5) {
    //         camera.position.x -= 0.05;
    //     }

    //     if (event.key == "d" && camera.position.x < 5) {
    //         camera.position.x += 0.05;
    //     }

    // });

    document.addEventListener("mousedown", function (event) {

        event.preventDefault();

        console.log(event.button);
        if (event.button == 2) {
            console.log(event);
            isstart = true;
            let mouseX = event.clientX;//出发事件时的鼠标指针的水平坐标

            //     rotateStart.set( event.clientX, event.clientY );
            //     document.addEventListener( 'mousemove', onMouseMove2, false );
        }
    });
    document.addEventListener("mousemove", function (event) {


    });
    document.addEventListener("mouseup", function (event) {

        event.preventDefault();

        console.log(event.button);
        if (event.button == 2) {
            console.log(event);
            isstart = false;
        }
    });

    // document.addEventListener("mousedown", function(event)
    // {
    //      event.preventDefault();
    //      mouseDown = 
    //      console.log(event.button);
    //      if(event.button == 2){

    //      }

    // });

    // function onMouseDown(event){
    //     event.preventDefault();
    //     mouseDown = true;
    //     mouseX = event.clientX;//出发事件时的鼠标指针的水平坐标

    //     rotateStart.set( event.clientX, event.clientY );
    //     document.addEventListener( 'mousemove', onMouseMove2, false );
    // }

    // function onMouseup(event){      
    //     mouseDown = false;

    //     document.removeEventListener("mousemove", onMouseMove2);
    // }

    // function onMouseMove2(event){
    //     if(!mouseDown){
    //         return;
    //     }       
    //     var deltaX = event.clientX - mouseX;
    //     mouseX = event.clientX;
    //     rotateScene(deltaX);        
    // }


    pubSub.subscribe('changeStructure', function (str: string) {
        console.log(str);

        if (str === "减速机") {

        }
        else if (str === "耙齿") {


        }
        else if (str === "驱动装置") {


        }
        else if (str === "机架") {


        }
    });

    return {
        name: 'Page',
        promise,
        callback,
    }
}


export default Page;