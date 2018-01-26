let dev = process.argv.indexOf("--dev") > 0;
let config = {
    appname: "snatch",
    dev
};
try { Object.assign(config, require("./_config.js")); } catch (error) {}
module.exports = config;