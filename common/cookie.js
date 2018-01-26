class CookieProvider {
    constructor(key) {}
    getCookie(host) {
        let sb = [];
        let cookie = this.get(host);
        for (let k in cookie) {
            let v = cookie[k];
            sb.push(`${k}=${v}`);
        }
        return sb.length > 0 ? sb.join("; ") : undefined;
    }
    setCookie(host, cookies) {
        for (let text of cookies.split(";")) {
            let ss = text.split("=");
            if (ss.length > 1) {
                this.setKv(host, ss[0], ss[1]);
            }
        }
    }
    set(host, cookie) {
        if (cookie instanceof Array) {
            for (let text of cookie) {
                this.set(host, text);
            }
        } else if (typeof cookie === "string") {
            let ss = cookie.split(";")[0].split("=");
            if (ss.length > 1) {
                this.setKv(host, ss[0], ss[1]);
            }
        } else if (typeof cookie === "object") {
            for (let k in cookie) {
                let v = cookie[k];
                this.setKv(host, k, v);
            }
        }
    }
    get(host) {
        return {};
    }
    setKv() {

    }
}
exports.CookieProvider = CookieProvider;

class JsonCookie extends CookieProvider {
    constructor(key) {
        super(key);
        this.storage = {};
    }
    get(host) {
        return this.storage[host] = this.storage[host] || {};
    }
    setKv(host, key, value) {
        if (key && value) {
            let cookie = this.get(host);
            cookie[key.trim()] = value.trim();
        }
    }
}
exports.JsonCookie = JsonCookie;

const fs = require("fs");
class FileJsonCookie extends JsonCookie {
    constructor(key) {
        super(key);
        this.key = key;
        try {
            let text = fs.readFileSync("./cache/" + this.key + ".json");
            this.storage = JSON.parse(text);
        } catch (error) {}
        this.setCount = 0;
    }
    setKv(host, key, value) {
        super.setKv(host, key, value);
        this.setCount++;
        setTimeout(() => {
            this.setCount--;
            if (!this.setCount) {
                fs.writeFileSync("./cache/" + this.key + ".json", JSON.stringify(this.storage));
            }
        }, 1000);
    }
}

exports.FileJsonCookie = FileJsonCookie;