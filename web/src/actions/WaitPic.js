import picker from '../utils/picker';
import ipc from "../utils/electron";
import cv from '../utils/cv';
import Action from './Action';

class WaitPic extends Action {
    get pen() {
        return "rectPen";
    }
    async onSuccess(v, data) {
        var arr = v.drawer.warpData(data);
        var url = (await picker.clip(v.current.demo, arr)).toDataURL("image/jpeg");
        v.$set(v.current, "data", url);
    }
    async run(x) {
        let diff = 10;
        while (diff >= 10) {
            var url = await ipc.screenshot();
            window.eee = url;
            diff = await cv.compare(url, x.demo);
            console.log("图片一致性", diff);
        }
        let best = await cv.find(url, x.data);
        console.log("最佳点", best);
        return best;
    }
}

export default WaitPic;