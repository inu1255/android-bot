const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const config = require("../common/config");
var windowState = {};
try {
    windowState = global.nodeStorage.getItem('windowstate');
} catch (err) {
    // the file is there, but corrupt. Handle appropriately.
}
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
class Windows {
    constructor() {
        app.on('ready', this.createWindow.bind(this));

        // 当全部窗口关闭时退出。
        app.on('window-all-closed', () => {
            // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
            // 否则绝大部分应用及其菜单栏会保持激活。
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            // 在macOS上，当单击dock图标并且没有其他窗口打开时，
            // 通常在应用程序中重新创建一个窗口。
            if (this.win === null) {
                this.createWindow();
            }
        });

    }
    createWindow() {
        if (this.win) return;
        // 创建浏览器窗口。
        this.win = new BrowserWindow({
            title: 'ElectronApp',
            x: windowState.bounds && windowState.bounds.x || undefined,
            y: windowState.bounds && windowState.bounds.y || undefined,
            width: windowState.bounds && windowState.bounds.width || 1280,
            height: windowState.bounds && windowState.bounds.height || 960,
        });

        // 然后加载应用的 index.html。
        this.win.loadURL(config.dev ? "http://localhost:8080" : url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));

        // 打开开发者工具。
        // this.win.webContents.openDevTools();

        // 当 window 被关闭，这个事件会被触发。
        this.win.on('closed', () => {
            // 取消引用 window 对象，如果你的应用支持多窗口的话，
            // 通常会把多个 window 对象存放在一个数组里面，
            // 与此同时，你应该删除相应的元素。
            this.win = null;
        });
    }
}

module.exports = new Windows();