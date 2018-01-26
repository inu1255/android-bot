import ipc from "../utils/electron";
import Action from './Action';

class BackBtn extends Action {
    async run(x) {
        await ipc.call("home");
    }
}

export default BackBtn;