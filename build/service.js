const child_process = require("child_process");
const ipc = require('electron').ipcMain;
const fs = require("fs");
const win = require("./window");
const path = require('path');
const url = require('url');

function exec(command) {
    console.log("run:", command);
    return new Promise((resolve, reject) => {
        child_process.exec(command, function(err, stdout, stderr) {
            resolve({ err, stdout, stderr });
        });
    });
}

function once(channel, callback) {
    ipc.on(channel, async function(event, { rechannel, data }) {
        data = await callback(data);
        event.sender.send(rechannel, data);
    });
}

function mkdirs(dir) {
    var dirs = dir.split("/");
    for (var i = 1; i <= dirs.length; i++) {
        let tmp = dirs.slice(0, i).join("/");
        if (tmp && !fs.existsSync(tmp))
            fs.mkdirSync(tmp);
    }
}

once("save", async function(data) {
    var dir = "scripts/" + data.appid;
    var demoDir = dir + "/demo";
    var dataDir = dir + "/data";
    mkdirs(__dirname + "/" + demoDir);
    mkdirs(__dirname + "/" + dataDir);
    for (let i = 0; i < data.scripts.length; i++) {
        const script = data.scripts[i];
        if (/^data:image\/\w+;base64,/.test(script.demo)) {
            fs.writeFileSync(__dirname + "/" + demoDir + "/" + i + ".jpg", new Buffer(script.demo.replace(/^data:image\/\w+;base64,/, ""), "base64"));
            script.demo = demoDir + "/" + i + ".jpg";
        }
        if (/^data:image\/\w+;base64,/.test(script.data)) {
            fs.writeFileSync(__dirname + "/" + dataDir + "/" + i + ".jpg", new Buffer(script.data.replace(/^data:image\/\w+;base64,/, ""), "base64"));
            script.data = dataDir + "/" + i + ".jpg";
        }
    }
    fs.writeFileSync(__dirname + "/" + dir + "/app.json", JSON.stringify(data));
});

once("screenshot", async function() {
    await exec("adb shell screencap -p /sdcard/screen.png");
    await exec("adb pull /sdcard/screen.png");
    await exec("adb shell rm /sdcard/screen.png");
});

once("home", async function() {
    await exec(`adb shell input keyevent 3`);
});

once("back", async function({ x, y }) {
    await exec(`adb shell input keyevent 4`);
});

once("tap", async function({ x, y }) {
    if (x >= 0 && y >= 0) {
        await exec(`adb shell input touchscreen tap ${x} ${y}`);
    }
});

once("swipe", async function({ x1, y1, x2, y2, ms }) {
    if (x1 >= 0 && y1 >= 0 && x2 >= 0 && y2 >= 0) {
        await exec(`adb shell input touchscreen swipe ${x1} ${y1} ${x2} ${y2} ${ms||300}`);
    }
});

ipc.on("serviceList", async function() {
    let filenames = fs.readdirSync(__dirname + "/" + "scripts/");
    let list = [];
    for (let filename of filenames) {
        try {
            let dir = __dirname + "/" + "scripts/" + filename;
            if (fs.statSync(dir).isDirectory()) {
                let data = fs.readFileSync(dir + "/app.json", "utf8");
                data = JSON.parse(data);
                data.appid = filename;
                list.push(data);
            }
        } catch (error) {
            console.log(error);
        }
    }
    win.win.webContents.send("serviceList", list);
});