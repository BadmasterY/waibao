const uA = navigator.userAgent.toLowerCase();

const ipad = uA.match(/ipad/i) !== null;
const iphone = uA.match(/iphone os/i) !== null;
const midp = uA.match(/midp/i) !== null;
const uc7 = uA.match(/rv:1.2.3.4/i) !== null;
const uc = uA.match(/ucweb/i) !== null;
const android = uA.match(/android/i) !== null;
const windowsce = uA.match(/windows ce/i) !== null;
const windowsmd = uA.match(/windows mobile/i) !== null;

let isPC: boolean;
if (!(ipad || iphone || midp || uc7 || uc || android || windowsce || windowsmd)) {
    isPC = true;
} else {
    isPC = false;
}

export default isPC;