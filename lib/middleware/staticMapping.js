'use strict';

let NODE_ENV = process.env.NODE_ENV || "prod",
    bundle;
if (NODE_ENV === 'dev') { //dev环境不需要mapping
    bundle = function(options) {
        var staticServer = options.staticServer;
        return (context, next) => {
            context.state.scope.bundle = function(path) {
                //因为打包的问题，dev环境的dll文件路径不对，这里手动替换
                path=path.replace("dll/prod/","dll/dev/");
                return staticServer + path;
            };
            return next();
        };
    };
} else { //生产环境
    bundle = (options) => {
        let { staticServer, staticResourceMappingPath, updateCallback } = options;
        let mapping = require(staticResourceMappingPath) || {};

        return (context, next) => {
            context.state.scope.bundle = function(path) {
                return staticServer + mapping[path];
            }
            return next()
        };
    };
}
module.exports = bundle;