const { ipcRenderer } = require("electron");
import picker from './picker';
import cv from './cv';
const paint = require('./paint').paint;

function pointPen(render, resolve) {
    this.move = function(bx, by, ex, ey) {
        render([ex, ey]);
    };
    this.end = function(bx, by, ex, ey) {
        resolve([ex, ey]);
    };
}
pointPen.render = function(data, drawer) {
    if (data && data.length === 2) {
        let ctx = drawer.ctx;
        ctx.beginPath();
        ctx.arc(data[0], data[1], 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(data[0], data[1], 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
};

function arrPen(render, resolve) {
    this.move = function(bx, by, ex, ey) {
        render([bx, by, ex, ey]);
    };
    this.end = function(bx, by, ex, ey) {
        resolve([bx, by, ex, ey]);
    };
}
arrPen.render = function(data, drawer) {
    if (data && data.length >= 4) {
        let ctx = drawer.ctx;
        ctx.beginPath();
        var bx = data[0],
            by = data[1],
            ex = data[2],
            ey = data[3];
        var xei = Math.atan((ey - by) / (ex - bx));
        var deg = 0.5;
        ctx.moveTo(bx, by);
        ctx.lineTo(ex, ey);
        if (ex > bx) {
            ctx.lineTo(ex - 10 * Math.cos(deg - xei), ey + 10 * Math.sin(deg - xei));
            ctx.lineTo(ex - 10 * Math.cos(deg + xei), ey - 10 * Math.sin(deg + xei));
        } else {
            ctx.lineTo(ex + 10 * Math.cos(deg - xei), ey - 10 * Math.sin(deg - xei));
            ctx.lineTo(ex + 10 * Math.cos(deg + xei), ey + 10 * Math.sin(deg + xei));
        }
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fill();
    }
};
paint.pens.set("pointPen", pointPen);
paint.pens.set("arrPen", arrPen);

function call(channel, data) {
    return new Promise((resolve, reject) => {
        var rechannel = channel + Math.floor(Math.random() * 1000);
        ipcRenderer.send(channel, {
            rechannel,
            data
        });
        ipcRenderer.once(rechannel, function(event, data) {
            resolve(data);
        });
        setTimeout(() => reject("timeout"), 30e3);
    });
}

var SIZE = {};

async function screenshot() {
    await call("screenshot");
    var img = new Image();
    return await new Promise((resolve, reject) => {
        img.onload = function() {
            var canvas = document.createElement("canvas");
            var scale = img.width / 360;
            SIZE.width = img.width;
            SIZE.height = img.height;
            SIZE.scale = scale;
            canvas.width = 360;
            canvas.height = img.height / scale;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = 'screen.png?t=' + new Date().getTime();
    });
}

export default {
    call,
    screenshot,
    size: SIZE
};