import picker from '../utils/picker';
import ipc from "../utils/electron";
import cv from '../utils/cv';
import WaitPic from './WaitPic';

class ClickPic extends WaitPic {
    async run(x) {
        var size = ipc.size;
        let dst = await super.run(x);
        await ipc.call("tap", { x: dst.x * size.scale, y: dst.y * size.scale });
    }
}

export default ClickPic;