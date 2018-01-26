const fetch = require("node-fetch");
const Cookie = require("./cookie").FileJsonCookie;

function getLoc(url) {
    var m = /^([^:]+):\/\/([^?#/]+)(:\d+)?((\/[^?#/]*)*)(\?[^#]*)?(#[^?]*)?(\?[^#]*)?/.exec(url);
    if (!m) return null;
    return {
        protocal: m[1],
        host: m[2],
        port: m[3],
        uri: m[4]
    };
}

class Request {
    constructor(key, cookie, option) {
        this.option = option || Request.option;
        this.cookies = cookie || new Cookie(key);
    }
    getDomain(url) {
        let ss = getLoc(url).host.split(".");
        return ss.slice(ss.length - 2).join(".");
    }
    setCookie(url, cookie) {
        let host = this.getDomain(url);
        return this.cookies.set(host, cookie);
    }
    request(url, data, method, headers) {
        let host = this.getDomain(url);
        var option = Object.assign({}, this.option);
        option.method = method || (data ? "POST" : "GET");
        if (data) {
            option.body = data;
        }
        if (headers) {
            option.headers = Object.assign({ cookie: this.cookies.getCookie(host) }, headers);
        } else {
            option.headers = { cookie: this.cookies.getCookie(host) };
        }
        return new Promise((resolve, reject) => {
            fetch(url, option).then((res) => {
                let cookie = res.headers.getAll("set-cookie");
                this.cookies.set(host, cookie);
                if (res.ok) {
                    let type = res.headers.getAll("content-type")[0] || "";
                    if (type.indexOf("json") >= 0)
                        return res.json();
                    else if (type.indexOf("text") >= 0)
                        return res.text();
                    else
                        return res.buffer();
                } else {
                    reject(res);
                }
            }, err => reject(err)).then((data) => {
                resolve(data);
            }, err => reject(err));
        });
    }
    postForm(uri, data, headers) {
        if (typeof data === "object") {
            let li = [];
            for (let k in data) {
                let v = data[k];
                li.push(`${k}=${v}`);
            }
            data = li.join("&");
        }
        return this.request(uri, data, "POST", Object.assign({
            "content-type": "application/x-www-form-urlencoded"
        }, headers));
    }
    postJson(uri, data, headers) {
        if (typeof data === "object") data = JSON.stringify(data);
        return this.request(uri, data, "POST", Object.assign({
            "content-type": "application/json"
        }, headers));
    }
    get(uri, data, headers) {
        if (typeof data === "object") {
            let li = [];
            for (let k in data) {
                let v = data[k];
                li.push(`${k}=${v}`);
            }
            data = li.join("&");
        }
        if (data) {
            uri += (uri.indexOf("?") < 0 ? "?" : "&") + data;
        }
        return this.request(uri, false, "GET", headers);
    }
}

Request.option = {
    // credentials: "include",
    headers: {}
};

module.exports = Request;