import ipc from "../utils/electron";
import { sleep } from "../utils/utils";
import Action from './Action';

class Sleep extends Action {
    init(vue) {
        vue.$set(vue.current, "data", 1);
    }
    async run(cmd) {
        await sleep(cmd.data * 1e3);
    }
}

export default Sleep;