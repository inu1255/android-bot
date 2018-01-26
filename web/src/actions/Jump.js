import picker from '../utils/picker';
import ipc from "../utils/electron";
import cv from '../utils/cv';
import Action from './Action';

class Jump extends Action {
    init(vue) {
        vue.$set(vue.current, "jump", 1);
    }
}

export default Jump;