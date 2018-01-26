import ipc from "../utils/electron";
import Action from './Action';

class Swipe extends Action {
    get pen() {
        return "arrPen";
    }
    onSuccess(v, data) {
        var point = { x1: data[0], y1: data[1], x2: data[2], y2: data[3] };
        v.$set(v.current, "data", point);
    }
    async run(cmd) {
        var size = ipc.size;
        var x1 = cmd.data.x1 * size.width / 1e4;
        var y1 = cmd.data.y1 * size.height / 1e4;
        var x2 = cmd.data.x2 * size.width / 1e4;
        var y2 = cmd.data.y2 * size.height / 1e4;
        await ipc.call("swipe", { x1, y1, x2, y2 });
    }
}

export default Swipe;