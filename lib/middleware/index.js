const helmet = require("koa-helmet");//设置一些安全性相关的HTTP头
const init = require("./init");//该中间件将scope挂在到context.state上。 以便后面将数据都挂在到scope上
const bodyParser = require("koa-bodyparser");//对于POST请求的处理，koa-bodyparser中间件可以把koa2上下文的formData数据解析到ctx.request.body中
const conditional = require("koa-conditional-get");//添加缓存功能和koa-etag一起使用
const etag = require("koa-etag");//添加缓存功能和koa-conditional-get一起使用
const chunkmap = require("./staticMapping.js");//dev不需要mapping
const convert = require("koa-convert");//处理插件在koa框架不同版本下的兼容问题
const pkg = require("../../package.json");
const config = require("../../config");
const Path = require("path");
const router = require("../../router/index").router;
const session = require('koa-session');
const auth=require("./auth.js");
const jwt = require('koa-jwt');




    

//是按顺序流程来执行的，所以如果再root之前有其他中间件报错了，比如helmet中对数据解析出错，就直接在那边停住了
module.exports = (app) => {//顺序注册，顺序执行的【和网上说得逆序执行不同，不知道为什么】；各个组件之间连接执行，需通过next()
    app.use(helmet());
    app.use(init(app));
    app.use(session(config.session, app));//这个组件指数把设置的session绑定到ctx并且同步到cookie,最后cookie会自动带到客户端那边


    //同一页面的设置，鉴权，全在这里
    app.use(auth.init(app));
    // app.use((ctx, next)=>{
    //     // ctx.path = ctx.path.replace('/assets/', '/');//这句话的意思：访问http://localhost:4410/assets这个链接，实际是重新路由到http://localhost:4410
    //     return next();//所有的中间件，都需要使用return next();这样才能从刚才停顿的yield处继续执行，也就是执行下一个插件
    // });

    // app.use(tracker());

    // app.use(customError({
    //     path: Path.resolve(__dirname, "../../errorPages")
    // }));
    // app.use(log({
    //     warningConfigs: config.warning,
    //     serverName: config.host,
    //     projectName: pkg.name,
    //     fileName: config.logFilePath
    // }));
    // app.use(tracker());
    app.use(convert(bodyParser()));
    // app.use(convert(compress({
    //     filter: function(content_type) {
    //         return /text/i.test(content_type);
    //     },
    //     threshold: 2048,
    //     flush: require('zlib').Z_SYNC_FLUSH
    // })));
    // app.use(convert(conditional()));
    // app.use(convert(etag()));
    // app.use(proxy({
    //     apiServer: config.apiServer,
    //     reqConfig: {
    //         'gzip': true
    //     }
    // }));
    app.use(chunkmap({
        staticServer: config.staticServer,
        staticResourceMappingPath: config.staticResourceMappingPath
    }));

    
    

    //登录态验证中间件
    app.use(jwt({
        secret:config.auth.secret,
        algorithms:["HS256"],//这个必须设置，否则verify的时候会出错；hash加签的方式，可以用md5，一般都用HS256，
        passthrough: true,//验证出错,也继续执行:默认会抛出错误
        debug: true // 开启debug可以看到准确的错误信息
    }).unless({path: ["/ajax/captcha"] }));

    app.use(convert(router.routes()));//路由
    app.use(convert(router.allowedMethods()));//根据ctx.status设置response响应头
};