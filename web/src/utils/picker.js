class Picker {
    constructor() {}
    /**
     * @param {String} [type] 
     * @param {Boolean} [multiple] 
     * @returns {File}
     */
    pick(type, multiple) {
        return new Promise((resolve, reject) => {
            this.input = document.createElement('input');
            this.input.type = 'file';
            this.input.accept = type || "*";
            if (multiple) this.input.multiple = 'multiple';
            this.input.addEventListener('change', function(e) {
                var files = Array.from(e.target.files);
                if (multiple) resolve(files);
                else resolve(files[0]);
            });
            this.input.click();
        });
    }
    /**
     * @param {String|File} url 
     * @param {{width:Number,height:Number}} [size] 
     * @return {Promise<HTMLCanvasElement>}
     */
    toCanvas(url, size) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            if (url instanceof File) {
                img.url = window.URL.createObjectURL(url);
            } else {
                img.src = url;
            }
            img.onload = function() {
                var canvas = document.createElement("canvas");
                if (size && size.width && size.height) {
                    canvas.width = size.width;
                    canvas.height = size.height;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
                // canvas.toDataURL()
            };
            img.onerror = function(err) {
                reject(err);
            };
        });
    }
    /**
     * @param {Array<Number>} arr 
     */
    arr2rect(arr) {
        return {
            left: Math.min(arr[0], arr[2]),
            top: Math.min(arr[1], arr[3]),
            width: Math.abs(arr[0] - arr[2]),
            height: Math.abs(arr[1] - arr[3]),
        };
    }
    /**
     * 
     * @param {String|File} url 
     * @param {Array<Number>|{left:Number,top:Number,width:Number,height:Number}} rect 
     * @return {Promise<HTMLCanvasElement>}
     */
    clip(url, rect) {
        if (rect instanceof Array) {
            rect = this.arr2rect(rect);
        }
        return new Promise((resolve, reject) => {
            this.toCanvas(url).then(function(canvas) {
                var ctx = canvas.getContext("2d");
                var image = ctx.getImageData(rect.left, rect.top, rect.width, rect.height);
                canvas.width = rect.width;
                canvas.height = rect.height;
                ctx.putImageData(image, 0, 0, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            }, reject);
        });
    }
    /**
     * @param {String|File} url 
     * @param {HTMLCanvasElement} canvas
     * @return {Promise<HTMLCanvasElement>}
     */
    drawBackground(url, canvas) {
        return new Promise(function(resolve, reject) {
            var bg = new Image();
            if (url instanceof File) {
                bg.url = window.URL.createObjectURL(url);
            } else {
                bg.src = url;
            }
            bg.onload = function() {
                var img = new Image();
                img.src = canvas.toDataURL("image/png");
                img.onload = function() {
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas);
                };
                img.onerror = function(err) {
                    reject(err);
                };
            };
            bg.onerror = function(err) {
                reject(err);
            };
        });
    }
}

export default new Picker();