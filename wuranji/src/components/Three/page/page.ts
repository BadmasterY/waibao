import * as THREE from 'three';
import { InitReturn } from '../../../interfaces/init';
import { pubSub } from '../../../utils/pubSub';
// import loader from '../modules/loader';
import loader, { gltfLoader } from '../modules/loader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

/**
 * this is a page page
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Page(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void) {
    const { scene, camera, dom } = initReturn;
    let mixer: THREE.AnimationMixer;
    const clock = new THREE.Clock(true);
    THREE.Cache.enabled = true;
    let isstart:boolean = false;
    const pageGroup = new THREE.Group();
    pageGroup.name = 'Page'; 
    let mouseDown:boolean = false;
    let mouseX:number = 0;
    const controls = new OrbitControls( camera, document.body );
    controls.enablePan = true;
    controls.enableZoom = false;
    controls.enableKeys = true;
    controls.minDistance = 5;
    controls.maxDistance = 7;
    controls.keyPanSpeed = 7;
    controls.mouseButtons = {
        RIGHT:THREE.MOUSE.ROTATE,
        LEFT: THREE.MOUSE.DOLLY,
        MIDDLE:THREE.MOUSE.DOLLY

    }
    controls.keys = {
        UP: 87,
        BOTTOM: 83,
        LEFT: 65,
        RIGHT: 68,
    }
    

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    setTotal(2);
    scene.add(pageGroup); // add to scene

    // animate callback
    function callback() {
        mixer.update(clock.getDelta());
        controls.update();
    }

    // promise array
    const promise: (Promise<any> | THREE.Group)[] = [];

    const url = require('../../../assets/models/ChuWuJi_DH.fbx').default;
    const p1 = new Promise<null>((resolve, reject) => {
        loader(url).then(group => {
            // 成功加载之后调用
            setLoaded();
            group.scale.set(0.003,0.003,0.003);

            //动画编写
            const mixer = new THREE.AnimationMixer( group );
            mixer.clipAction( group.animations[0] ).play();

            //pageGroup.add(group);
            resolve(null);
        }).catch(err => reject(err));
    });
    
    const p2 = new Promise<null>((resolve, reject) => {
        loader(require('../../../assets/models/ChangFang.fbx').default).then(group => {
            // 成功加载之后调用
            setLoaded();
            group.scale.set(0.01,0.01,0.01);
            pageGroup.add(group);
            resolve(null);
        }).catch(err => reject(err));
    });

    const p3 = new Promise<null>((resolve, reject) => {
        gltfLoader(require('../../../assets/models/new/ChuWuJi_DH(1).glb').default).then(gltf => {
            console.log(gltf);
            gltf.scene.scale.set(0.5,0.5,0.5);
            pageGroup.add(gltf.scene);
            //动画编写
            mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach(animate => {
                mixer.clipAction(animate).play();
            });
            resolve(null);

        }).catch(err => reject(err));
    });

    const HJG = new THREE.AmbientLight(0xffffff);
    pageGroup.add(HJG);

    //promise.push(p1);
    promise.push(p2);
    promise.push(p3);

    promise.push(pageGroup);
    scene.add(pageGroup);

    pubSub.subscribe('changePerspective', function( str: string){
        
        if(str === "主视角"){
            camera.position.set(0,1.5,5);
            camera.rotation.set(0, 0, 0);
        }else if(str === "俯视角"){
            camera.position.set(0,5,0);
            camera.rotation.set( -Math.PI/2, 0, 0);
            
        }else if(str === "左视角"){
            camera.position.set(-5,1.5,0);
            camera.rotation.set( 0, -Math.PI/2, 0);

        }
    });

    {/*
    // document.addEventListener("keydown", function(event)
    // {
    //     if(document.getElementById("start")?.className === "" ){return;}
    //     console.log(camera.position);
    //     // if(event.key == "w" && camera.position.z > 2.5 ){

    //     //     camera.position.x -= 0.5 * Math.sin(camera.rotation.y%Math.PI * 180 / Math.PI);
    //     //     camera.position.z -= 0.5 * Math.cos(camera.rotation.y%Math.PI * 180 / Math.PI);
    //     // }

    //     // if(event.key == "s" && camera.position.z < 10){

    //     //     camera.position.x += 0.5 * Math.sin(camera.rotation.y%Math.PI * 180 / Math.PI);
    //     //     camera.position.z += 0.5 * Math.cos(camera.rotation.y%Math.PI * 180 / Math.PI);
    //     // }
      
    //         if(event.key == "w" && camera.position.z > 2.5){
    //             // camera.rotation.set(0,Math.PI/2,0);
    //             // 度数 = camera.rotation.y%math.pi * 180/Math.PI
    //             // x轴距离 = 0.5*sin(度数)   z轴距离 = 0.5*cos(度数) 
    //             camera.position.z -= 0.5;
    //         }
    
    //         if(event.key == "s" && camera.position.z < 10){
    //             camera.position.z += 0.5;
    //         }

    //         if(event.key == "a" && camera.position.x > -5){
    //             camera.position.x -= 0.5;
    //         }
    
    //         if(event.key == "d" && camera.position.x < 5){
    //             camera.position.x += 0.5;
    //         }

    // });

    // document.addEventListener("mousedown", function(event){

    //     event.preventDefault();
             
    //          if(event.button == 2){
    //             mouseDown = true;
    //             mouseX = event.clientX;//出发事件时的鼠标指针的水平坐标

    //             // rotateStart.set( event.clientX, event.clientY );
    //             if(document.getElementById("start")?.className !== "" ){

    //                 document.addEventListener( 'mousemove', onMouseMove2, false );
    //             }
    //         }
    // });

    // document.addEventListener("mouseup", function(event){
            
    //         event.preventDefault();
            
    //         if(event.button == 2)
    //         {
    //             mouseDown = false;
    //             document.removeEventListener("mousemove", onMouseMove2);
    //         }
    // });

    // function onMouseMove2(event:any){
    //     if(!mouseDown ){
    //         return;
    //     }       
    //     var deltaX = event.clientX - mouseX;
    //     mouseX = event.clientX;
    //     rotateScene(deltaX);        
    // }
    
    // function rotateScene(deltaX:number){
    //     //设置旋转方向
    //     var deg = deltaX/279;
    //     //deg 设置模型旋转的弧度
    //     //pageGroup.rotation.y += deg;
    //     camera.rotation.y += deg;
    //     camera.rotation.set(0,camera.rotation.y,0);
        
        
    // }
*/}



    pubSub.subscribe('changeStructure', function( str: string){
        
        if(str === "减速机"){
            console.log(pageGroup);
        }
        else if(str === "耙齿"){
            
            
        }
        else if(str === "驱动装置"){
            

        }
        else if(str === "机架"){
            

        }
    });


    pubSub.subscribe("changeTitle",function(str:string){
        
    });

    return {
        name: 'Page',
        promise,
        callback,
    }
}


export default Page;