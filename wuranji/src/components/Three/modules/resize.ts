import { InitReturn } from '../../../interfaces/init';

/**
 * call in resize
 * @param dom render dom
 * @param initReturn Init() returns
 */
function resize(dom: HTMLElement, initReturn: InitReturn): void {
    const { offsetWidth, offsetHeight } = dom;
    const { camera, renderer, composer } = initReturn;

    camera.aspect = offsetWidth / offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(offsetWidth, offsetHeight);
    composer?.setSize(offsetWidth, offsetHeight);
}

export default resize;