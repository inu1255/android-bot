class CV {
    /**
     * @param {ImageData} image
     */
    constructor(image) {
        this.data = image.data;
        this.width = image.width;
        this.height = image.height;
        var depth = this.data.length / this.width / this.height;
        this.depth = Math.floor(depth);
    }
    getPixel(x, y) {
        if (this.depth == 1) {
            return this.data[y * this.width + x];
        }
        var index = y * this.width * this.depth + x * this.depth;
        var pixel = [];
        for (let i = 0; i < this.depth; i++) {
            pixel.push(this.data[i + index]);
        }
        return pixel;
    }
    /**
     * @param {CV} other 
     */
    compare(other) {
        if (this.depth !== other.depth) throw "depth mush match";
        if (this.width !== other.width) throw "width mush match";
        if (this.height !== other.height) throw "height mush match";
        var total = 0;
        for (let i = 0; i < this.data.length; i += 4) {
            total += Math.abs(this.data[i] + this.data[i + 1] + this.data[i + 2] + this.data[i + 3] - other.data[i] - other.data[i + 1] - other.data[i + 2] - other.data[i + 3]);
            // total += (this.data[i] - other.data[i]) * (this.data[i] - other.data[i]);
        }
        return total / this.data.length;
    }
    /**
     * @param {{left:Number,top:Number,width:Number,height:Number}} rect 
     */
    clip(rect) {
        // var ny = rect.top + rect.height;
        // var nx = rect.left + rect.width;
        // var data = new Uint8ClampedArray(rect.height * rect.width * this.depth);
        // var i = 0;
        // for (let y = rect.top; y < ny; y++) {
        //     var line = y * this.width * this.depth;
        //     var begin = line + rect.left * this.depth;
        //     var end = line + (nx) * this.depth;
        //     for (let x = begin; x < end; x++) {
        //         data[i++] = this.data[x];
        //     }
        // }
        // return new CV(new ImageData(data, rect.width, rect.height));
        if (!this.ctx) {
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            this.ctx = canvas.getContext("2d");
            this.ctx.putImageData(new ImageData(this.data, this.width, this.height), 0, 0);
        }
        return new CV(this.ctx.getImageData(rect.left, rect.top, rect.width, rect.height));
    }
    /**
     * @param {{width:Number,height:Number}} size 
     */
    resize(size) {
        if (!this.ctx) {
            var src = document.createElement("canvas");
            src.width = this.width;
            src.height = this.height;
            var ctx = src.getContext("2d");
            ctx.putImageData(new ImageData(this.data, this.width, this.height), 0, 0);
            var canvas = document.createElement("canvas");
            canvas.width = size.width;
            canvas.height = size.height;
            this.ctx = canvas.getContext("2d");
            this.ctx.drawImage(src, 0, 0, size.width, size.height);
        }
        return new CV(this.ctx.getImageData(0, 0, size.width, size.height));
    }
    /**
     * @param {CV} other 
     */
    find(other) {
        var min = { v: 1e10 };
        // var max = { v: 0 };
        var nx = this.width - other.width;
        var ny = this.height - other.height;
        for (let y = 0; y < ny; y++) {
            for (let x = 0; x < nx; x++) {
                var clip = this.clip({ top: y, left: x, width: other.width, height: other.height });
                var tmp = clip.compare(other);
                if (tmp < min.v) {
                    min.v = tmp;
                    min.x = x;
                    min.y = y;
                }
                // if (tmp > max.v) {
                //     max.v = tmp;
                //     max.x = x;
                //     max.y = y;
                // }
            }
        }
        min.x += other.width / 2;
        min.y += other.height / 2;
        return min;
    }
    toImageData() {
        return new ImageData(this.data, this.width, this.height);
    }
    /**
     * @param {{(x:Number,y:Number,pixel:Number|Array<Number>)}} callback 
     */
    forEach(callback) {
        var index = 0;
        if (this.depth == 1) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    callback(x, y, this.data[index++]);
                }
            }
            return;
        }
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                var pixel = [];
                for (let d = 0; d < this.width; d++) {
                    pixel.push(this.data[index++]);
                }
                callback(x, y, pixel);
            }
        }
    }
}

/**
 * @param {String} url 
 * @returns {CV}
 */
function open(url) {
    return new Promise((resolve, reject) => {
        let canvas = document.createElement("canvas");
        let img = new Image();
        img.src = url;
        img.onload = () => {
            var ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            var image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            resolve(new CV(image));
        };
        img.onerror = reject;
    });
}

function find(src, dst, debug) {
    return new Promise((resolve, reject) => {
        Promise.all([open(src), open(dst)]).then(function([img1, img2]) {
            var scale = 1;
            var pixel = img1.width * img1.height;
            if (1e5 < pixel) {
                scale = Math.sqrt(pixel / 1e5);
            }
            console.log("缩小", scale);
            let small1 = img1.resize({ width: img1.width / scale, height: img1.height / scale, });
            let small2 = img2.resize({ width: img2.width / scale, height: img2.height / scale, });
            var min = small1.find(small2);
            min.x *= scale;
            min.y *= scale;
            // if (debug) {
            //     var canvas = document.createElement("canvas");
            //     canvas.width = img1.width;
            //     canvas.height = img1.height;
            //     var ctx = canvas.getContext("2d");
            //     ctx.putImageData(img1.toImageData(), 0, 0);
            //     ctx.putImageData(img2.toImageData(), min.x - img2.width / 2, min.y - img2.height / 2);
            //     ctx.strokeRect(min.x, min.y, 5, 5);
            //     document.body.appendChild(canvas);
            // }
            resolve(min);
        }, reject);
    });
}

function compare(src, dst) {
    return new Promise((resolve, reject) => {
        Promise.all([open(src), open(dst)]).then(function([img1, img2]) {
            var width = Math.max(img1.width, img2.width);
            var height = Math.max(img1.height, img2.height);
            let big1 = img1.resize({ width, height });
            let big2 = img2.resize({ width, height });
            var min = big1.compare(big2);
            resolve(min);
        }, reject);
    });
}

export default {
    open,
    find,
    compare
};