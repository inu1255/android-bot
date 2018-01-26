import { sleep } from '../utils/utils';
import Click from './Click';
import ClickPic from './ClickPic';
import Swipe from './Swipe';
import WaitPic from './WaitPic';
import HomeBtn from './HomeBtn';
import BackBtn from './BackBtn';
import Sleep from './Sleep';
import JumpPic from './JumpPic';
import Jump from './Jump';

class Actions {
    constructor() {
        this.actions = {
            "点击": new Click(this),
            "点击图片": new ClickPic(this),
            "滑动": new Swipe(this),
            "等待秒数": new Sleep(this),
            "等待图片": new WaitPic(this),
            "Home键": new HomeBtn(this),
            "Back键": new BackBtn(this),
            "如果图片": new JumpPic(this),
            "跳转": new Jump(this),
        };
    }
    async run(vue) {
		var prev = vue.idx;
        while (vue.idx < vue.scripts.length) {
            var cmd = vue.scripts[vue.idx];
            if (!cmd) return;
            console.log("执行第", vue.idx, "步", cmd);
            var action = this.actions[cmd.type];
            if (action.run) {
                await action.run(cmd, vue);
                await sleep(500);
            }
            if (cmd.jump) {
                vue.idx = cmd.jump;
            } else {
                vue.idx++;
            }
        }
		vue.idx = prev;
    }
}

export default Actions;