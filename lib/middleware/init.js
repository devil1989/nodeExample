//@ts-check
const uuid = require('uuid/v4')
const config = require("../../config")
const ip = require('ip')
const util=require("../util.js");



module.exports = (app) => {
    const serverId = config.host || ip.toLong(ip.address()) & 255;

    return function (context, next) {
        var id = uuid().replace(/-/g, "");
        context.state.scope = {
            __requestId: id
        };
        //所有页面的公共初始化数据
        context.state.scope.outPutPublicInfo=util.outPutPublicInfo(JSON.stringify({initData:""}));
        context.state.requestId = id;
        context.set("X-Server-ID", serverId)
        context.set("X-UA-Compatible", "IE=edge,chrome=1")
        context.set('X-Powered-By', 'Node')
        return next();
    };
};