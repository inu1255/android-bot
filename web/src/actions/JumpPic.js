import picker from '../utils/picker';
import ipc from "../utils/electron";
import cv from '../utils/cv';
import WaitPic from './WaitPic';

class JumpPic extends WaitPic {
    init(vue) {
        vue.$set(vue.current, "jump", 1);
    }
}

export default JumpPic;