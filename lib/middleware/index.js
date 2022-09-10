const helmet = require("koa-helmet");//设置一些安全性相关的HTTP头：比如X-Frame-Options为SAMEORIGIN，防止页面被其他站点的iframe嵌入，还有很多其他设置

// get请求的headers中没有content-type这个字段；
// post 的 enctype 有两种：详见https://blog.csdn.net/diaojian7730/article/details/102177425；实现原理详见：https://www.cnblogs.com/imlucky/archive/2012/10/29/2744302.html
//     application/x-www-form-urlencoded ：这种就是一般的文本表单用post传地数据，只要将得到的data用querystring解析下就可以了，一般就是简单的表单请求
//     multipart/form-data ：用于文件的上传[表单种包含上传文件用到]：它既可以发送文本数据，也支持二进制数据上载

// Content-Type【说穿了就是用什么方法来解析你传过来的数据】：用于定义用户的浏览器或相关设备如何显示将要加载的数据，或者如何处理将要加载的数据
// MIME【说穿了其实指的就是文件后缀名，用什么方式打开查看】：MIME类型就是设定某种扩展名的文件用一种应用程序来打开的方式类型，当该扩展名文件被访问的时候，浏览器会自动使用指定应用程序来打开。多用于指定一些客户端自定义的文件名，以及一些媒体文件打开方式。
// content-type:
//         application/x-cdf 应用型文件
//         text/HTML HTML文件（会自动调用html的解析器）
//         image/JPEG jpg 图片
//         image/GIF gif图片
//         text/plain：文本【浏览器在获取到这种文件时并不会对其进行处理】

//对于POST请求的处理，koa-bodyparser中间件可以把koa2上下文的formData数据【也就是请求头中包含这样的信息： Content-Type: application/x-www-form-urlencoded】解析到ctx.request.body中
const bodyParser = require("koa-bodyparser");
const conditional = require("koa-conditional-get");//添加缓存功能和koa-etag一起使用
const etag = require("koa-etag");//添加缓存功能和koa-conditional-get一起使用
const chunkmap = require("./staticMapping.js");//dev不需要mapping
const convert = require("koa-convert");//处理插件在koa框架不同版本下的兼容问题
const pkg = require("../../package.json");
const config = require("../../config");
const Path = require("path");
const router = require("../../routes/index").router;
const session = require('koa-session');
const auth=require("./auth.js");
const jwt = require('koa-jwt');
const koastatic = require('koa-static');
const compress = require('koa-compress');



    

//是按顺序流程来执行的，所以如果再root之前有其他中间件报错了，比如helmet中对数据解析出错，就直接在那边停住了
module.exports = (app) => {//顺序注册，顺序执行的【和网上说得逆序执行不同，不知道为什么】；各个组件之间连接执行，需通过next()
    app.use(helmet());
    app.use(session(config.session, app));//这个组件指数把设置的session绑定到ctx并且同步到cookie,最后cookie会自动带到客户端那边

    //登录态验证中间件
    app.use(jwt({
        secret:config.auth.secret,
        algorithms:["HS256"],//这个必须设置，否则verify的时候会出错；hash加签的方式，可以用md5，一般都用HS256，
        passthrough: true,//验证出错,也继续执行:默认会抛出错误
        debug: true // 开启debug可以看到准确的错误信息
    }).unless({path: ["/ajax/captcha"] }));

    app.use(convert(bodyParser()));

    //压缩:注意，它必须放在koastatic前面，否则会无效
    app.use(compress({
        // filter(content_type) {
        //     return false
        //     // return /text/i.test(content_type)
        // },
        threshold: 1024,//阀值，超过1K需要压缩
        gzip: {
            flush: require('zlib').constants.Z_SYNC_FLUSH
        },
        deflate: {
            flush: require('zlib').constants.Z_SYNC_FLUSH,
        },
        br: false // disable brotli
    }));


    //Path.resolve(__dirname, '../../static')表示，把static文件夹最为静态资源访问的入口，访问http://localhost:4410会自动锚定到static文件夹，这个理解很关键，关系到staticServer的设置，不需要添加static前缀
    app.use(koastatic(Path.resolve(__dirname, '../../'+config.staticPath), {maxage:30*24*60*60*1000}));//这个是前端资源的静态资源服务器，存放前端的静态发布的版本
    app.use(koastatic(Path.resolve(__dirname, '../../static'), {maxage:30*24*60*60*1000}));//这个是后端的静态资源，存放用户上传的数据

    // app.use(koastatic(Path.resolve(__dirname, '../../static'), {maxage:30*24*60*60*1000}));//详见https://github.com/koajs/static
    // app.use((ctx, next)=>{
    //     ctx.path = ctx.path.replace('/assets/', '/');//这句话的意思：访问http://localhost:4410/recommend/,实际上是路由到http://localhost:4410,这个是针对全局的，包括static资源和其他所有请求
    //     return next();//所有的中间件，都需要使用return next();这样才能从刚才停顿的yield处继续执行，也就是执行下一个插件
    // });
    //统一的数据处理和鉴权，数据是基于ctx.request.body，所以放在bodyParser后面
    //如果放到bodyParser前面，那么处理的数据的源头得用koa2上下文的formData数据，就不麻烦了，直接用ctx.request.body
    app.use(auth.init(app));


    

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

    //html的静态路径转化：dev，qa，yz，prod执行不同策略，yz或prod都用hash的静态链接
    app.use(chunkmap({
        staticServer: config.staticServer,
        staticResourceMappingPath: config.staticResourceMappingPath
    }));

    app.use(convert(router.routes()));//路由
    app.use(convert(router.allowedMethods()));//根据ctx.status设置response响应头
};