//@ts-check
const uuid = require('uuid/v4')
const config = require("../../config")
const ip = require('ip')
const util=require("../util.js");



module.exports = (app) => {
    //这个是服务器初始化代码，和页面请求无关
    const serverId = config.host || ip.toLong(ip.address()) & 255;

    return function (context, next) {

        //这里是每个页面请求的代码，页面发起任何ajax或者html请求，只要是请求都会走这里

        return next();
    };
};
//使用方法见同目录的index.js//const init=require(...);app.use(init(app));