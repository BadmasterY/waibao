import * as THREE from 'three';
import { InitReturn } from '../../../interfaces/init';
import { pubSub } from '../../../utils/pubSub';
// import loader from '../modules/loader';
import loader, { gltfLoader } from '../modules/loader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import isPC from '../../../utils/isPC';
import createAnimate from '../modules/createAnimate';
import { Tween } from '@tweenjs/tween.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

/**
 * this is a page page
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Page(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void) {
    const { scene, camera, renderer, composer } = initReturn;
    let mixer: THREE.AnimationMixer;
    const clock = new THREE.Clock(true);
    THREE.Cache.enabled = true;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.tabIndex = -1;

    let changePerspectiveAimate: Tween<Record<string, any>> | undefined;
    let outlinePass: OutlinePass;
    let effectFXAA: ShaderPass;
    let selectedObjects: THREE.Object3D[] = [];
    const modles: Record<string, THREE.Object3D> = {};
    const moveModles: Record<string, THREE.Object3D> = {};
    let rotation: 'default' | 'x' | 'y' | 'z' = 'default';
    let isAssembly = false;
    let assembly = '';
    let isDisassebly = false;
    let isAorDis = false;
    let group: THREE.Group;
    let cloneModle: THREE.Object3D | undefined;
    let isInHoverBox = false;

    const cloneMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: .4,
        depthWrite: false,
        color: '0xff0000',
    });

    document.addEventListener('resize', onWindowResize, false);

    document.addEventListener('pointerdown', mouseDownFn, false);
    document.addEventListener('touchstart', touchStartFn, false);

    const pageGroup = new THREE.Group();
    pageGroup.name = 'Page';

    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: .4 });
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.set(3, 7, 3);
    cube.position.setZ(.5);
    pageGroup.add(cube);

    console.log(cube);

    if (!isPC) {
        const bg = new THREE.TextureLoader().load(require('../../../assets/images/bg.png').default);
        scene.background = bg;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = !isPC;
    controls.enablePan = true;
    controls.enableZoom = false;
    controls.enableKeys = true;
    controls.minDistance = 5;
    controls.maxDistance = 7;
    controls.keyPanSpeed = 7;
    if (isPC) controls.maxPolarAngle = Math.PI / (8 / 9);

    camera.userData.lastPosition = camera.position.clone();
    camera.userData.lastTarget = controls.target.clone();

    controls.mouseButtons = {
        RIGHT: THREE.MOUSE.ROTATE,
        LEFT: THREE.MOUSE.DOLLY,
        MIDDLE: THREE.MOUSE.DOLLY,
    };

    controls.keys = {
        UP: 87,
        BOTTOM: 83,
        LEFT: 65,
        RIGHT: 68,
    };

    controls.addEventListener('change', () => {
        if (!isPC) return;
        if (camera.position.y < 1.5 && !changePerspectiveAimate) {
            camera.position.copy(camera.userData.lastPosition);
            controls.target.copy(camera.userData.lastTarget);
        } else {
            camera.userData.lastPosition = camera.position.clone();
            camera.userData.lastTarget = controls.target.clone();
        }
    });

    if (composer) {
        outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
        outlinePass.selectedObjects = selectedObjects;
        outlinePass.pulsePeriod = 5;
        outlinePass.edgeThickness = 4;
        outlinePass.edgeStrength = 10;
        outlinePass.visibleEdgeColor = new THREE.Color('0xfc8888');
        outlinePass.hiddenEdgeColor = new THREE.Color('0x190a05');
        composer.addPass(outlinePass);

        effectFXAA = new ShaderPass(FXAAShader);
        effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        composer.addPass(effectFXAA);
    }

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    const total = isPC ? 2 : 1;
    setTotal(total);
    scene.add(pageGroup); // add to scene

    // animate callback
    function callback() {
        mixer.update(clock.getDelta());
        controls.update();
    }

    // promise array
    const promise: (Promise<any> | THREE.Group)[] = [];

    if (isPC) {
        const p2 = new Promise<null>((resolve, reject) => {
            loader(require('../../../assets/models/ChangFang.fbx').default).then(group => {
                // 成功加载之后调用
                setLoaded();
                group.scale.set(0.01, 0.01, 0.01);
                pageGroup.add(group);
                resolve(null);
            }).catch(err => reject(err));
        });
        promise.push(p2);
    }

    const path = isPC ? 'ChuWuJi_DH(1).glb' : 'ChuWuJi_YDD_DH.glb';
    const p3 = new Promise<null>((resolve, reject) => {
        gltfLoader(require(`../../../assets/models/new/${path}`).default).then(gltf => {
            const scale = isPC ? .7 : .6;
            gltf.scene.scale.set(scale, scale, scale);
            group = gltf.scene;
            pageGroup.add(group);
            //动画编写
            mixer = new THREE.AnimationMixer(group);
            gltf.animations.forEach(animate => {
                mixer.clipAction(animate).play();
            });

            group.traverse(child => {
                switch (child.name) {
                    case 'QuDongZhuangZhi':
                        modles.qdzz = child;
                        moveModles.qdzz = child.clone();
                        moveModles.qdzz.traverse(chil => {
                            if (child.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        break;
                    case 'PaChi':
                        modles.pc = child;
                        moveModles.pc = child.clone();
                        moveModles.pc.traverse(chil => {
                            if (child.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        break;
                    case 'JiJia':
                        modles.jj = child;
                        moveModles.jj = child.clone();
                        moveModles.jj.traverse(chil => {
                            if (child.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        break;
                    case 'JianSuJi':
                        modles.jsj = child;
                        moveModles.jsj = child.clone();
                        moveModles.jsj.traverse(chil => {
                            if (child.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        break;
                }
            });

            resolve(null);

        }).catch(err => reject(err));
    });

    const HJG = new THREE.AmbientLight(0xffffff);
    HJG.intensity = .75;
    pageGroup.add(HJG);

    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(0, 100, 50);
    spotLight.userData.initIntensity = spotLight.intensity;

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    pageGroup.add(spotLight);

    promise.push(p3);

    promise.push(pageGroup);
    scene.add(pageGroup);

    pubSub.subscribe('changeRotate', changeRotate);

    pubSub.subscribe('changePerspective', changePerspective);

    pubSub.subscribe('changeStructure', changeStructure);

    pubSub.subscribe('enterRoaming', () => controls.enabled = true);
    pubSub.subscribe('leaveRoaming', () => controls.enabled = false);

    pubSub.subscribe('changeLight', changeLight);

    pubSub.subscribe('changeTitle', changeTitle);

    pubSub.subscribe('onAssembly', () => isAssembly = true);

    pubSub.subscribe('reset', reset);

    function changeRotate(rot: 'default' | 'x' | 'y' | 'z') {
        rotation = rot;
        // do somthing...
    }

    function changePerspective(str: string) {
        changePerspectiveAimate?.stop();
        changePerspectiveAimate = undefined;

        switch (str) {
            case "主视角":
                changePerspectiveAimate = createAnimate({
                    data: {
                        posX: camera.position.x,
                        posY: camera.position.y,
                        posZ: camera.position.z,
                        rotX: camera.rotation.x,
                        rotY: camera.rotation.y,
                        rotZ: camera.rotation.z,
                        targetX: controls.target.x,
                        targetY: controls.target.y,
                        targetZ: controls.target.z,
                    },
                    targetData: {
                        posX: 0,
                        posY: 1.5,
                        posZ: 5,
                        rotX: 0,
                        rotY: 0,
                        rotZ: 0,
                        targetX: 0,
                        targetY: 0,
                        targetZ: 0,
                    },
                    time: 300,
                    onUpdate({
                        posX, posY, posZ,
                        rotX, rotY, rotZ,
                        targetX, targetY, targetZ,
                    }) {
                        camera.position.set(posX, posY, posZ);
                        camera.rotation.set(rotX, rotY, rotZ);
                        controls.target.set(targetX, targetY, targetZ);
                    },
                    onComplete() {
                        changePerspectiveAimate = undefined;
                    },
                });
                break;
            case "俯视角":
                changePerspectiveAimate = createAnimate({
                    data: {
                        posX: camera.position.x,
                        posY: camera.position.y,
                        posZ: camera.position.z,
                        rotX: camera.rotation.x,
                        rotY: camera.rotation.y,
                        rotZ: camera.rotation.z,
                        targetX: controls.target.x,
                        targetY: controls.target.y,
                        targetZ: controls.target.z,
                    },
                    targetData: {
                        posX: 0,
                        posY: 5,
                        posZ: 0,
                        rotX: - Math.PI / 2,
                        rotY: 0,
                        rotZ: 0,
                        targetX: 0,
                        targetY: 0,
                        targetZ: 0,
                    },
                    time: 300,
                    onUpdate({
                        posX, posY, posZ,
                        rotX, rotY, rotZ,
                        targetX, targetY, targetZ,
                    }) {
                        camera.position.set(posX, posY, posZ);
                        camera.rotation.set(rotX, rotY, rotZ);
                        controls.target.set(targetX, targetY, targetZ);
                    },
                    onComplete() {
                        changePerspectiveAimate = undefined;
                    },
                });
                break;
            case "左视角":
                changePerspectiveAimate = createAnimate({
                    data: {
                        posX: camera.position.x,
                        posY: camera.position.y,
                        posZ: camera.position.z,
                        rotX: camera.rotation.x,
                        rotY: camera.rotation.y,
                        rotZ: camera.rotation.z,
                        targetX: controls.target.x,
                        targetY: controls.target.y,
                        targetZ: controls.target.z,
                    },
                    targetData: {
                        posX: -5,
                        posY: 1.5,
                        posZ: 0,
                        rotX: 0,
                        rotY: -Math.PI / 2,
                        rotZ: 0,
                        targetX: 0,
                        targetY: 0,
                        targetZ: 0,
                    },
                    time: 300,
                    onUpdate({
                        posX, posY, posZ,
                        rotX, rotY, rotZ,
                        targetX, targetY, targetZ,
                    }) {
                        camera.position.set(posX, posY, posZ);
                        camera.rotation.set(rotX, rotY, rotZ);
                        controls.target.set(targetX, targetY, targetZ);
                    },
                    onComplete() {
                        changePerspectiveAimate = undefined;
                    },
                });
                break;
            default:
                console.warn('changePerspective unkone pos:', str);
                break;

        }
    }

    function changeStructure(str: string) {
        selectedObjects = [];
        switch (str) {
            case '驱动装置':
                selectedObjects.push(modles.qdzz);
                break;
            case '减速机':
                selectedObjects.push(modles.jsj);
                break;
            case '机架':
                selectedObjects.push(modles.jj);
                break;
            case '耙齿':
                selectedObjects.push(modles.pc);
                break;
        }
        outlinePass.selectedObjects = selectedObjects;
    }

    function changeLight(oldLight: number, newLight: number) {
        const { initIntensity } = spotLight.userData;

        const changeLight = (newLight - 50) / 100;
        spotLight.intensity = initIntensity + (3 * changeLight);
    }

    function changeTitle(title: string) {
        rotation = 'default';
        selectedObjects = [];
        outlinePass.selectedObjects = selectedObjects;
        isAorDis = false;

        console.log(title);

        if (title === '拆装') {
            isAorDis = true;
        }
    }

    function startFn() {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(group.children, true);

        if (intersects.length > 0) {
            const target = intersects[0];

            if (target.object.name === 'JianSuJi' || target.object.parent?.name === 'JianSuJi') {
                cloneModle = moveModles.jsj.clone();
            }else if(target.object.name === 'JiJia' || target.object.parent?.name === 'JiJia'){
                cloneModle = moveModles.jj.clone();
            }else if(target.object.name === 'QuDongZhuangZhi' || target.object.parent?.name === 'QuDongZhuangZhi'){
                cloneModle = moveModles.qdzz.clone();
            }else if(target.object.name === 'PaChi' || target.object.parent?.name === 'PaChi'){
                cloneModle = moveModles.pc.clone();
            }
        }

        if(cloneModle) isDisassebly = true;

    }

    function moveFn() {
        if (isAssembly || isDisassebly) {
            controls.enabled = false;
        }
    }

    function endFn() {
        cloneModle = undefined;
    }

    function mouseDownFn(event: MouseEvent) {
        if (!isAorDis) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        startFn();
    }

    function touchStartFn(event: TouchEvent) {
        if (!isAorDis) return;
        if (event.touches.length === 0) return;
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;

        startFn();
    }

    function mouseMoveFn(event: MouseEvent) {
    }

    function touchMoveFn(event: TouchEvent) {

    }

    function mouseUpFn(event: MouseEvent) {

    }

    function touchEndFn(event: TouchEvent) {

    }

    function reset() {
        group.traverse(child => {
            child.visible = true;
        });
    }

    function onWindowResize() {

        effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

    }

    return {
        name: 'Page',
        promise,
        callback,
    }
}


export default Page;