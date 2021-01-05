import * as THREE from 'three';
import { InitReturn } from '../../../interfaces/init';
import { pubSub } from '../../../utils/pubSub';
import loader, { gltfLoader } from '../modules/loader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import isPC from '../../../utils/isPC';
import createAnimate from '../modules/createAnimate';
import { Tween } from '@tweenjs/tween.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

const textureLoader = new THREE.TextureLoader();
const new_img = textureLoader.load(require('../../../assets/images/modelsImg/ChuWuJi01_Basecolor.jpg').default);
new_img.wrapS = THREE.RepeatWrapping;
new_img.wrapT = THREE.RepeatWrapping;

const matMap = textureLoader.load(require('../../../assets/images/test.jpg').default);
matMap.wrapS = THREE.RepeatWrapping;
matMap.wrapT = THREE.RepeatWrapping;

const partMap = {
    'QuDongZhuangZhi': '驱动装置',
    'JianSuJi': '减速机',
    'PaChi': '耙齿',
    'JiJia': '机架',
};

const SHITOU = isPC ? 'ShiTou_DH' : 'ShiTou';

/**
 * this is a page page
 * @param initReturn Init() returns
 * @param setTotal setTotal function, accept a number type parameter,
 *                  this parameter is the number of models loaded for the current scene.
 * @param setLoaded setLoaded function, once after loading each model
 */
function Page(initReturn: InitReturn, setTotal: (number: number) => void, setLoaded: (loaded?: number) => void, setCurrentPart: (partName: string) => void, setErrorMsg: (ctx: string) => void) {
    const { scene, camera, renderer, composer } = initReturn;
    let mixer: THREE.AnimationMixer;
    const clock = new THREE.Clock(true);
    THREE.Cache.enabled = true;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.tabIndex = -1;
    renderer.domElement.id = 'three-canvas';

    const mobileDom = document.getElementById('tab-mobile');

    let changePerspectiveAimate: Tween<Record<string, any>> | undefined;
    let outlinePass: OutlinePass;
    let effectFXAA: ShaderPass;
    let selectedObjects: THREE.Object3D[] = [];
    const modles: Record<string, THREE.Object3D> = {};
    const moveModles: Record<string, THREE.Object3D> = {};
    let rotation: 'default' | 'x' | 'y' | 'z' = 'default';
    let useRotate = true;
    let lastControlEnabled: boolean | undefined;
    let isAssembly = false;
    let isDisassebly = false;
    let isAorDis = false;
    let group: THREE.Group;
    let cloneModle: THREE.Object3D | undefined;
    let selectModle: THREE.Object3D | undefined;
    let shitou: THREE.Object3D | undefined;
    let isInHoverBox = false;
    let part: '' | 'JianSuJi' | 'QuDongZhuangZhi' | 'PaChi' | 'JiJia' = '';
    const rotStartPos = { x: 0, y: 0 };
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let moveTop = false;
    let moveDown = false;
    let useControls = false;
    let p = '';
    let timer: NodeJS.Timeout | undefined;
    const groupAABBBox = new THREE.Box3();
    const cameraAABBBox = new THREE.Box3();
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMatrail = new THREE.MeshStandardMaterial({ visible: false });
    const box = new THREE.Mesh(boxGeometry, boxMatrail);
    box.position.copy(camera.position);
    cameraAABBBox.setFromObject(box);

    const direction = new THREE.Vector3();
    const velocity = new THREE.Vector3();

    const cloneMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: .25,
        depthWrite: false,
        depthTest: false,
        // color: '0xff0000',
    });

    document.addEventListener('resize', onWindowResize, false);

    document.addEventListener('touchstart', scaleTouchStart, false);
    document.addEventListener('touchmove', scaleTouchMove, false);
    document.addEventListener('touchend', scaleTouchEnd, false);

    document.addEventListener('contextmenu', (event) => { event.preventDefault(); });

    renderer.domElement.addEventListener('pointerdown', mouseDownFn, false);
    renderer.domElement.addEventListener('pointerdown', controlsDown, false);

    renderer.domElement.addEventListener('pointermove', mouseMoveFn, false);

    renderer.domElement.addEventListener('pointerup', mouseUpFn, false);
    renderer.domElement.addEventListener('pointerup', controlsUp, false);

    renderer.domElement.addEventListener('keydown', onKeyDown, false);
    renderer.domElement.addEventListener('keyup', onKeyUp, false);

    if (!isPC && mobileDom) {
        mobileDom.addEventListener('touchstart', touchStartFn, false);
        mobileDom.addEventListener('touchmove', touchMoveFn, false);
        mobileDom.addEventListener('touchend', touchEndFn, false);

        mobileDom.addEventListener('touchstart', rotateTouchStart, false);
        mobileDom.addEventListener('touchmove', rotateTouchMove, false);
        mobileDom.addEventListener('touchend', rotateTouchEnd, false);
    }

    document.addEventListener('gesturestart', function (event) {
        event.preventDefault();
    });
    document.addEventListener('dblclick', function (event) {
        event.preventDefault();
    })

    const pageGroup = new THREE.Group();
    pageGroup.name = 'Page';
    pageGroup.userData = {
        initScale: pageGroup.scale.x,
    };

    camera.userData = {
        lastPosition: camera.position.clone(),
    };

    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        visible: false,
    });
    const cube = new THREE.Mesh(geometry, material);
    // cube.visible = false;
    if (isPC) {
        cube.scale.set(1.8, 6.5, 2);
        cube.position.setZ(.5);
    } else {
        cube.scale.set(2, 3, 3);
        cube.position.set(0, 1, .5);
    }
    pageGroup.add(cube);

    if (!isPC) {
        const bg = new THREE.TextureLoader().load(require('../../../assets/images/bg.png').default);
        scene.background = bg;
    }

    const controls = new PointerLockControls(camera, renderer.domElement);
    controls.isLocked = false;

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
        (effectFXAA.uniforms as any)['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        composer.addPass(effectFXAA);
    }

    // number of modules
    // 通过 isPC 判断模型数量
    // pc: 2
    // mobile: 1
    // const total = isPC ? 2 : 1;
    // setTotal(total);
    scene.add(pageGroup); // add to scene

    // animate callback
    function callback() {
        mixer.update(clock.getDelta());
        updateControls();
    }

    function updateControls() {
        if (!useControls) return;
        if (!moveForward && !moveBackward && !moveTop && !moveDown && !moveLeft && !moveRight) return;

        velocity.x = 0;
        velocity.y = 0;
        velocity.z = 0;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.y = Number(moveDown) - Number(moveTop);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // 转化为单位向量

        if (moveForward || moveBackward) velocity.z -= direction.z * .1;
        if (moveTop || moveDown) velocity.y -= direction.y * .1;
        if (moveLeft || moveRight) velocity.x -= direction.x * .1;

        let right = -velocity.x * .5;
        let forward = -velocity.z * .5;

        controls.moveRight(right);
        controls.moveForward(forward);

        let y = camera.position.y + velocity.y * .5;

        if (y < 1.5) y = 1.5;
        if (y > 5) y = 5;

        camera.position.setY(y);
        box.position.copy(camera.position);

        groupAABBBox.setFromObject(group);
        cameraAABBBox.setFromObject(box);

        if (groupAABBBox.intersectsBox(cameraAABBBox)) {
            camera.position.copy(camera.userData.lastPosition);
        }

        camera.userData.lastPosition = camera.position.clone();
    }

    function onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'w': // w
                moveForward = true;
                break;
            case 'a': // a
                moveLeft = true;
                break;
            case 's': // s
                moveBackward = true;
                break;
            case 'd': // d
                moveRight = true;
                break;
            case 'q': // q
                moveTop = true;
                break;
            case 'e': // e
                moveDown = true;
                break;
        }
    }

    function onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case 'w': // w
                moveForward = false;
                break;
            case 'a': // a
                moveLeft = false;
                break;
            case 's': // s
                moveBackward = false;
                break;
            case 'd': // d
                moveRight = false;
                break;
            case 'q': // q
                moveTop = false;
                break;
            case 'e': // e
                moveDown = false;
                break;
        }
    }

    function controlsDown(event: MouseEvent) {
        if (!useControls) return;
        if (event.button !== 2) return;

        controls.lock();
    }

    function controlsUp(event: MouseEvent) {
        if (!useControls) return;

        controls.unlock();
    }

    // promise array
    const promise: (Promise<any> | THREE.Group)[] = [];

    if (isPC) {
        let pLoaded = 0;
        const p2 = new Promise<null>((resolve, reject) => {
            loader(
                require('../../../assets/models/ChangFang.fbx').default,
                (url, loaded, total) => {
                    // const newProgress = loaded / total;
                    // const load = newProgress - pLoaded;
                    // setLoaded(load < 0 ? 0 : load);
                    // if (load > 0) pLoaded = newProgress;
                }
            ).then(group => {
                // 成功加载之后调用
                // setLoaded();
                group.scale.set(0.01, 0.01, 0.01);
                pageGroup.add(group);
                resolve(null);
            }).catch(err => reject(err));
        });
        promise.push(p2);
    }

    let p3Loaded = 0;
    const path = isPC ? 'ChuWuJi_DH.glb' : 'ChuWuJi_YDD.glb';
    const p3 = new Promise<null>((resolve, reject) => {
        gltfLoader(
            require(`../../../assets/models/new/${path}`).default,
            (url, loaded, total) => {
                // const newProgress = loaded / total;
                // const load = newProgress - p3Loaded;
                // setLoaded(load < 0 ? 0 : load);
                // if (load > 0) p3Loaded = newProgress;
            }
        ).then(gltf => {
            const scale = isPC ? .55 : .6;
            group = gltf.scene;
            if (isPC) group.position.setY(.5);
            group.scale.set(scale, scale, scale);
            group.userData = {
                pos: group.position.clone(),
                rot: group.rotation.clone(),
                sca: group.scale.clone(),
            };
            pageGroup.add(group);
            //动画编写
            mixer = new THREE.AnimationMixer(group);
            gltf.animations.forEach(animate => {
                mixer.clipAction(animate).play();
            });

            group.traverse(child => {
                if (!isPC && child.type === 'Mesh') {
                    (child as any).material.metalness = 0.3;
                }
                switch (child.name) {
                    case 'ShiTou_DH':
                        if (!isPC) shitou = child;
                        break;
                    case 'ShiTou':
                        if (isPC) shitou = child;
                        break;
                    case 'QuDongZhuangZhi':
                        modles.qdzz = child;
                        modles.qdzz.userData = { lastVisible: child.visible };
                        moveModles.qdzz = child.clone();
                        moveModles.qdzz.scale.set(.0033, .0033, .0033);
                        moveModles.qdzz.traverse(chil => {
                            if (chil.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        moveModles.qdzz.visible = false;
                        pageGroup.add(moveModles.qdzz);
                        break;
                    case 'JiJia4':
                        (child as any).material.metalness = .3;
                        break;
                    case 'JiJia3':
                        (child as any).material.matelness = .7;
                        (child as any).material.color = new THREE.Color(0xededed);
                        break;
                    case 'JiJia1':
                        if (!isPC) (child as any).material.roughness = 1;
                        break;
                    case 'waike1':
                        (child as any).material.roughness = .8;
                        break;
                    case 'PaChi':
                        child.traverse(c => {
                            if (c.type === 'Mesh'){
                                ((c as THREE.Mesh).material as any).emissive = new THREE.Color(isPC ? 0x4a4a4a : 0x414141);
                                ((c as THREE.Mesh).material as any).roughness = 1;
                            }
                        });
                        modles.pc = child;
                        modles.pc.userData = { lastVisible: child.visible };
                        moveModles.pc = child.clone();
                        moveModles.pc.scale.set(.0033, .0033, .0033);
                        moveModles.pc.traverse(chil => {
                            if (chil.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        moveModles.pc.visible = false;
                        pageGroup.add(moveModles.pc);
                        break;
                    case 'JiJia':
                        modles.jj = child;
                        modles.jj.userData = { lastVisible: child.visible };
                        moveModles.jj = child.clone();
                        moveModles.jj.scale.set(.0033, .0033, .0033);
                        moveModles.jj.traverse(chil => {
                            if (chil.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        moveModles.jj.visible = false;
                        pageGroup.add(moveModles.jj);
                        break;
                    case 'JianSuJi':
                        modles.jsj = child;
                        modles.jsj.userData = { lastVisible: child.visible };
                        moveModles.jsj = child.clone();
                        moveModles.jsj.scale.set(.0033, .0033, .0033);
                        moveModles.jsj.traverse(chil => {
                            if (chil.type === 'Mesh') {
                                const c = (chil as THREE.Mesh);
                                c.material = cloneMaterial.clone();
                            }
                        });
                        moveModles.jsj.visible = false;
                        pageGroup.add(moveModles.jsj);
                        break;
                }
            });

            resolve(null);

        }).catch(err => reject(err));
    });

    const HJG = new THREE.AmbientLight(0xffffff);
    HJG.intensity = .75;
    pageGroup.add(HJG);

    const spotLight = new THREE.SpotLight(0xffffff, isPC ? 1 : 1.5);
    spotLight.position.set(0, 100, 50);
    spotLight.userData.initIntensity = spotLight.intensity;

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    // if (isPC) {
    spotLight.position.set(0, 50, 25);
    const spotLight_copy_1 = spotLight.clone();
    spotLight_copy_1.intensity = .2;
    spotLight_copy_1.position.set(-30, 0, 0);

    pageGroup.add(spotLight_copy_1);

    const spotLight_copy_2 = spotLight.clone();
    spotLight_copy_2.intensity = .2;
    spotLight_copy_2.position.set(30, 0, 0);

    pageGroup.add(spotLight_copy_2);

    const spotLight_copy_3 = spotLight.clone();
    spotLight_copy_3.intensity = .2;
    spotLight_copy_3.position.set(0, 0, -30);

    pageGroup.add(spotLight_copy_3);
    // }
    if (!isPC) {
        spotLight.position.set(0, 0, 30);
    }

    pageGroup.add(spotLight);

    promise.push(p3);

    promise.push(pageGroup);
    scene.add(pageGroup);

    pubSub.subscribe('changeRotate', changeRotate);

    pubSub.subscribe('changePerspective', changePerspective);

    pubSub.subscribe('changeStructure', changeStructure);

    pubSub.subscribe('enterRoaming', () => {
        useControls = true;
    });
    pubSub.subscribe('leaveRoaming', () => {
        useControls = false;
    });

    pubSub.subscribe('changeLight', changeLight);

    pubSub.subscribe('changeTitle', changeTitle);
    pubSub.subscribe('endLight', endLight);

    pubSub.subscribe('touchMove', touchMoveFn);
    pubSub.subscribe('touchEnd', touchEndFn);

    pubSub.subscribe('onAssembly', (pName: string) => {
        isAssembly = true;
        switch (pName) {
            case '耙齿':
                cloneModle = moveModles.pc;
                part = 'PaChi';
                break;
            case '驱动装置':
                cloneModle = moveModles.qdzz;
                part = 'QuDongZhuangZhi';
                break;
            case '机架':
                cloneModle = moveModles.jj;
                part = 'JiJia';
                break;
            case '减速机':
                cloneModle = moveModles.jsj;
                part = 'JianSuJi';
                break;
            default:
                console.warn('unknow part name:', pName);
                break;
        }
    });

    pubSub.subscribe('onDisassembly', onDisassembly);

    pubSub.subscribe('reset', reset);

    pubSub.subscribe('resetAll', resetPos);

    function changeRotate(rot: 'default' | 'x' | 'y' | 'z') {
        rotation = rot;
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
                    },
                    targetData: {
                        posX: 0,
                        posY: 1.5,
                        posZ: 5,
                        rotX: 0,
                        rotY: 0,
                        rotZ: 0,
                    },
                    time: 300,
                    onUpdate({
                        posX, posY, posZ,
                        rotX, rotY, rotZ,
                    }) {
                        camera.position.set(posX, posY, posZ);
                        camera.rotation.set(rotX, rotY, rotZ);
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
                    },
                    targetData: {
                        posX: 0,
                        posY: 5,
                        posZ: 0,
                        rotX: - Math.PI / 2,
                        rotY: 0,
                        rotZ: 0,
                    },
                    time: 300,
                    onUpdate({
                        posX, posY, posZ,
                        rotX, rotY, rotZ,
                    }) {
                        camera.position.set(posX, posY, posZ);
                        camera.rotation.set(rotX, rotY, rotZ);
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
                    },
                    targetData: {
                        posX: -5,
                        posY: 1.5,
                        posZ: 0,
                        rotX: 0,
                        rotY: -Math.PI / 2,
                        rotZ: 0,
                    },
                    time: 300,
                    onUpdate({
                        posX, posY, posZ,
                        rotX, rotY, rotZ,
                    }) {
                        camera.position.set(posX, posY, posZ);
                        camera.rotation.set(rotX, rotY, rotZ);
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
        if (!isPC) useRotate = false;
        const { initIntensity } = spotLight.userData;

        const changeLight = (newLight - 50) / 100;
        spotLight.intensity = initIntensity + (3 * changeLight);
    }

    function endLight() {
        if (!isPC) useRotate = true;
    }

    function changeTitle(title: string) {
        rotation = 'default';
        selectedObjects = [];
        outlinePass.selectedObjects = selectedObjects;
        isAorDis = false;
        useRotate = true;

        if (title !== '亮度') resetPos();

        switch (title) {
            case '拆装':
                isAorDis = true;
                if (shitou) shitou.visible = false;
                reset();
                break;
            default:
                showAll();
                if (shitou) shitou.visible = true;
                break;
        }
    }

    function onDisassembly(isOK: boolean) {
        if (isPC) {
            if (lastControlEnabled !== undefined) {
                useControls = lastControlEnabled;
            }
            lastControlEnabled = undefined;
        } else {
            useRotate = true;
        }

        if (cloneModle) {
            cloneModle.visible = false;
            cloneModle = undefined;
        }


        if (isOK) {
            switch (part) {
                case 'QuDongZhuangZhi':
                    modles.qdzz.visible = false;
                    modles.qdzz.userData.lastVisible = false;
                    break;
                case 'PaChi':
                    modles.pc.visible = false;
                    modles.pc.userData.lastVisible = false;
                    break;
                case 'JianSuJi':
                    modles.jsj.visible = false;
                    modles.jsj.userData.lastVisible = false;
                    break;
                case 'JiJia':
                    modles.jj.visible = false;
                    modles.jj.userData.lastVisible = false;
                    break;
                default:
                    break;
            }
        } else {
            switch (part) {
                case 'QuDongZhuangZhi':
                    modles.qdzz.visible = modles.qdzz.userData.lastVisible;
                    break;
                case 'PaChi':
                    modles.pc.visible = modles.pc.userData.lastVisible;
                    break;
                case 'JianSuJi':
                    modles.jsj.visible = modles.jsj.userData.lastVisible;
                    break;
                case 'JiJia':
                    modles.jj.visible = modles.jj.userData.lastVisible;
                    break;
                default:
                    break;
            }
        }

        mouse.x = 0;
        mouse.y = 0;

        isDisassebly = false;
        isAssembly = false;

        part = '';

        setCurrentPart('');
    }

    function startFn() {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(group.children, true);

        if (intersects.length > 0) {
            let target = intersects[0];

            if (target.object.name === SHITOU || target.object.parent?.name === SHITOU || target.object.parent?.parent?.name === SHITOU) {
                target = intersects[1];
            }

            if (!target.object.visible) return;
            if (target.object.parent && !target.object.parent.visible) return;

            if (target.object.name === 'JianSuJi' || target.object.parent?.name === 'JianSuJi' || target.object.parent?.parent?.name === 'JianSuJi') {
                cloneModle = moveModles.jsj;
                part = 'JianSuJi';
                setCurrentPart('减速机');
            } else if (target.object.name === 'JiJia' || target.object.parent?.name === 'JiJia' || target.object.parent?.parent?.name === 'JiJia') {
                cloneModle = moveModles.jj;
                part = 'JiJia';
                setCurrentPart('机架');
            } else if (target.object.name === 'QuDongZhuangZhi' || target.object.parent?.name === 'QuDongZhuangZhi' || target.object.parent?.parent?.name === 'QuDongZhuangZhi') {
                cloneModle = moveModles.qdzz;
                part = 'QuDongZhuangZhi';
                setCurrentPart('驱动装置');
            } else if (target.object.name === 'PaChi' || target.object.parent?.name === 'PaChi' || target.object.parent?.parent?.name === 'PaChi') {
                cloneModle = moveModles.pc;
                part = 'PaChi';
                setCurrentPart('耙齿');
            }
        }

        if (cloneModle) isDisassebly = true;

    }

    function moveFn() {
        if (!isAssembly && !isDisassebly) return;
        if (!cloneModle) return;

        if (isPC) {
            if (lastControlEnabled === undefined) {
                lastControlEnabled = useControls;
            }
            useControls = false;
        } else {
            useRotate = false;
        }

        isInHoverBox = false;

        raycaster.setFromCamera(mouse, camera);
        const cubeHover = raycaster.intersectObject(cube, true);

        if (cubeHover.length > 0) isInHoverBox = true;

        switch (part) {
            case 'QuDongZhuangZhi':
                selectModle = modles.qdzz;
                break;
            case 'PaChi':
                selectModle = modles.pc;
                break;
            case 'JianSuJi':
                selectModle = modles.jsj;
                break;
            case 'JiJia':
                selectModle = modles.jj;
                break;
            default:
                break;
        }

        cloneModle.visible = true;
        if (selectModle) {
            if (isAssembly) selectModle.visible = selectModle.userData.lastVisible;
            if (isDisassebly) selectModle.visible = false;
        }

        let offset = 0;

        if (part === 'QuDongZhuangZhi') {
            offset = isPC ? -.4 : -.2;
        } else if (part === 'JianSuJi') {
            offset = isPC ? -.5 : -.3;
        } else if (part === 'PaChi') {
            offset = isPC ? -.2 : 0;
        }

        const mv = new THREE.Vector3(
            mouse.x,
            mouse.y + offset,
            .5
        );
        mv.unproject(camera);

        cloneModle.position.copy(mv);
    }

    function endFn() {
        if (!cloneModle) return;
        if (!cloneModle.visible) return;

        cloneModle.visible = false;
        cloneModle = undefined;

        if (isInHoverBox) {
            if (isAssembly) {
                switch (part) {
                    case 'QuDongZhuangZhi':
                        if (modles.qdzz.visible) setErrorMsg('请拆卸后重试!');
                        modles.qdzz.visible = true;
                        modles.qdzz.userData.lastVisible = true;
                        break;
                    case 'PaChi':
                        if (modles.pc.visible) setErrorMsg('请拆卸后重试!');
                        modles.pc.visible = true;
                        modles.pc.userData.lastVisible = true;
                        break;
                    case 'JianSuJi':
                        if (modles.jsj.visible) setErrorMsg('请拆卸后重试!');
                        modles.jsj.visible = true;
                        modles.jsj.userData.lastVisible = true;
                        break;
                    case 'JiJia':
                        if (modles.jj.visible) setErrorMsg('请拆卸后重试!');
                        modles.jj.visible = true;
                        modles.jj.userData.lastVisible = true;
                        break;
                    default:
                        break;
                }

                if (part !== '')
                    pubSub.publish('onAssemblyThree', partMap[part]);
            }
            if (isDisassebly) {
                if (selectModle) {
                    selectModle.visible = true;
                    selectModle.userData.lastVisible = true;
                    selectModle = undefined;
                }

                if (p !== '')
                    pubSub.publish('touchEndFn', p);
            }
        } else {
            if (selectModle) {
                selectModle.visible = selectModle.userData.lastVisible;
                selectModle = undefined;
            }
        }

        mouse.x = 0;
        mouse.y = 0;

        if (!isPC) {
            useRotate = true;
        } else {
            if (lastControlEnabled !== undefined) {
                useControls = lastControlEnabled;
            }
            lastControlEnabled = undefined;
        }

        isDisassebly = false;
        isAssembly = false;
    }

    function mouseDownFn(event: MouseEvent) {
        if (!isAorDis) return;
        if (event.button !== 0) return;
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
        if (!isAorDis) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        moveFn();
    }

    function touchMoveFn(event: TouchEvent) {
        if (!isAorDis) return;
        if (event.touches.length === 0) return;
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;

        p = '';
        const el = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
        if (el && findClassName(el.className, 'use-with-event')) {
            if (part !== '')
                p = partMap[part];
        }

        moveFn();
    }

    function findClassName(className: string, current: string) {
        const classArray = className.split(' ');
        const index = classArray.findIndex(value => value === current);

        return index !== -1;
    }

    function mouseUpFn(event: MouseEvent) {
        if (!isAorDis) return;
        if (event.button !== 0) return;
        endFn();
    }

    function touchEndFn(event: TouchEvent) {
        if (!isAorDis) return;

        if (p !== '') {
            pubSub.publish('touchEndFn', p);
        }
        endFn();
    }

    function rotateTouchStart(event: TouchEvent) {
        if (timer) {
            clearTimeout(timer);
            useRotate = true;
        }
        if (!useRotate) return;
        if (event.touches.length === 0) return;

        rotStartPos.x = event.touches[0].clientX;
        rotStartPos.y = event.touches[0].clientY;

        const { x, y, z } = group.rotation;

        group.userData = Object.assign({}, group.userData, {
            rotX: x,
            rotY: y,
            rotZ: z,
        });
    }

    function rotateTouchMove(event: TouchEvent) {
        if (!useRotate) return;
        if (event.touches.length === 0) return;

        const { clientX, clientY } = event.touches[0];

        const x = clientX - rotStartPos.x;
        const y = clientY - rotStartPos.y;

        switch (rotation) {
            case 'default':
                rotDefault(x, y);
                break;
            case 'x':
                rotX(y);
                break;
            case 'y':
                rotY(x);
                break;
            case 'z':
                rotZ(x, y);
                break;
            default:
                console.warn('unknow rotation:', rotation);
                break;
        }
    }

    function rotateTouchEnd(event: TouchEvent) {
        if (!useRotate) return;

        rotStartPos.x = 0;
        rotStartPos.y = 0;

        const { x, y, z } = group.rotation;

        group.userData.rotX = x;
        group.userData.rotY = y;
        group.userData.rotZ = z;
    }

    function rotDefault(posX: number, posY: number) {
        const { rotX, rotY, rotZ } = group.userData;
        const { innerWidth, innerHeight } = window;

        const ratioX = posX / innerWidth;
        const ratioY = posY / innerHeight;

        group.rotation.set(
            rotX + ratioY * Math.PI,
            rotY + ratioX * Math.PI,
            rotZ,
        );
    }

    function rotX(posY: number) {
        const { rotX, rotY, rotZ } = group.userData;
        const { innerHeight } = window;

        const ratioY = posY / innerHeight;

        group.rotation.set(
            rotX + ratioY * Math.PI,
            rotY,
            rotZ,
        );
    }

    function rotY(posX: number) {
        const { rotX, rotY, rotZ } = group.userData;
        const { innerWidth } = window;

        const ratioX = posX / innerWidth;

        group.rotation.set(
            rotX,
            rotY + ratioX * Math.PI,
            rotZ,
        );
    }

    function rotZ(posX: number, posY: number) {
        const { rotX, rotY, rotZ } = group.userData;
        const { innerWidth, innerHeight } = window;

        const ratioX = posX / innerWidth;
        const ratioY = posY / innerHeight;

        let ratio: number;
        if (Math.abs(ratioX) > Math.abs(ratioY)) {
            ratio = ratioX;
        } else {
            ratio = ratioY;
        }

        group.rotation.set(
            rotX,
            rotY,
            rotZ + ratio * Math.PI,
        );
    }

    function reset() {
        for (const key in modles) {
            modles[key].visible = false;
            modles[key].userData.lastVisible = false;
        }
    }

    function showAll() {
        for (const key in modles) {
            modles[key].visible = true;
            modles[key].userData.lastVisible = true;
        }
    }

    function resetPos() {
        group.position.copy(group.userData.pos);
        group.rotation.copy(group.userData.rot);
        group.scale.copy(group.userData.sca);
    }

    let startDistance = 0;
    let startScale = 0;
    function scaleTouchStart(ev: TouchEvent) {
        if (ev.touches.length < 2) return;

        useRotate = false;

        const x0 = ev.touches[0].clientX;
        const y0 = ev.touches[0].clientY;

        const x1 = ev.touches[1].clientX;
        const y1 = ev.touches[1].clientY;

        const x = x1 - x0;
        const y = y1 - y0;

        startDistance = x * x + y * y;

        startScale = pageGroup.scale.x;
    }

    const size = 1280 * 720;
    function scaleTouchMove(ev: TouchEvent) {
        if (ev.touches.length < 2) return;

        useRotate = false;

        const x0 = ev.touches[0].clientX;
        const y0 = ev.touches[0].clientY;

        const x1 = ev.touches[1].clientX;
        const y1 = ev.touches[1].clientY;

        const x = x1 - x0;
        const y = y1 - y0;

        const distance = x * x + y * y;
        const moved = distance - startDistance;

        let scale = startScale + moved / size;

        if (scale > 1.25) scale = 1.25;
        if (scale < .75) scale = .75;

        pageGroup.scale.set(scale, scale, scale);
    }

    function scaleTouchEnd(ev: TouchEvent) {
        startScale = 0;
        startDistance = 0;

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => useRotate = true, 500);
    }

    function onWindowResize() {
        (effectFXAA.uniforms as any)['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    }

    return {
        name: 'Page',
        promise,
        callback,
    }
}


export default Page;