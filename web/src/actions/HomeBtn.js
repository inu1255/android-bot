import ipc from "../utils/electron";
import Action from './Action';

class HomeBtn {
    async run(x) {
        await ipc.call("home");
    }
}

export default HomeBtn;