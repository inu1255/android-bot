import ipc from "../utils/electron";
import Action from './Action';

class Click extends Action {
    get pen() {
        return "pointPen";
    }
    onSuccess(v, data) {
        var point = { x: data[0], y: data[1] };
        v.$set(v.current, "data", point);
    }
    async run(cmd) {
        var size = ipc.size;
        var x = cmd.data.x * size.width / 1e4;
        var y = cmd.data.y * size.height / 1e4;
        await ipc.call("tap", { x, y });
    }
}

export default Click;