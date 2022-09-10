// desc:这个文件，通过路由实现了后端的mvc架构，执行路由的中间通过render和getController来连接各自的view和controller

const koaRouter=require("koa-router");
const path = require("path");
const views = require("co-views");//用于渲染tamplate
const minifier = require('html-minifier').minify;
const router=koaRouter();
var config = require("../config");
var reg1 = /\./;
var cacheController = {};



function* render(viewPath,opts) {
    var viewPath=path.join(this.state.controller, viewPath);
    this.state.scope.__renderTime = new Date();
    var body = yield views(path.resolve(__dirname + "/../views"), { map: { html: "nunjucks" } })(viewPath, this.state.scope);
    if(config.enableHTMLCompress){
        body = minifier(body,{
            removeComments:true,
            removeEmptyAttributes: false,
            removeEmptyElements:false,
            removeTagWhitespace:false,
            removeAttributeQuotes:false,
            collapseWhitespace:true
        });
    }

    this.body = body;//body是一个字符串，返回的都是字符串，告诉浏览器数据用什么格式解析也用字符串传递
    this.state.scope = null;
    this.set("Cache-Control", opts.cache||"public");
}

//ajax请求和html页面请求一毛一样，yield后面“不能是字符串”否则会出现500 可以是表达式，对象，数组等
function* renderJSON(JSONData) {
    var body = yield JSONData;
    this.body = body;//body是一个字符串，返回的都是字符串，告诉浏览器数据用什么格式解析也用字符串传递
    this.state.scope = null;
    this.set("Cache-Control", "private");
    this.set("Content-Type", "application/json");

    //默认是keep-alive,服务器超过一定时间才会关闭Connection，好处是再次请求不需要重新建立连接，坏处是占资源
    //所以只用一次的ajax请求，直接就关，后续还可能多次请求的ajax，就开着
    this.set("Connection", "close");
}

//因为调用的时候没有用xhr，是直接get请求图片的url，所以返回的时候，body的数据直接返回给图片的url
function* renderPicture(Data){
    this.body=Data;
    this.state.scope = null;
    this.set('Content-Type', 'image/svg+xml');
    this.set("Connection", "close");
}

//node端的JSONP设置
function* renderJSONP(JSONPData,callback) {
    var body = yield {};
    // this.body = JSONPData;
    var str="";
    if(callback){
        str=`${callback}(${JSON.stringify(JSONPData)})`;
    }
    this.body = str;
    this.state.scope = null;

    
    this.set("Content-Type", "text/javascript");//jsonp这个必须设置，不然chrome报mime错误
    this.set("Cache-Control", "private");
    this.set("Access-Control-Allow-Origin", "http:localhost:8080/");//跨域就需要设置这个，不然没法传
    // this.set("Access-Control-Allow-Origin", "*");//允许所有的跨域请求，这个明显不合适
    this.set("Connection", "close");
}



function getControllerInstance(controllerName) {
    if (!cacheController[controllerName]) {
        var controllerPath = path.join(path.resolve(__dirname, "../controllers"), controllerName);
        cacheController[controllerName] = require(controllerPath+".js");
    }
    return cacheController[controllerName];
}

//跳转到对应页面controller之前的公共执行函数，可以添加所有页面公共的数据，包括逻辑判断
function* getController(controller, context) {
    
    var arr = controller.split(reg1),
        len = arr.length;
    if (len < 2) {
        context.throw(500, "the controller can't found");
    }
    var actionName = arr[len - 1],
        mActionName = 'm_'+actionName;
    var controllerName = arr.slice(0, len - 1).join("/");
    var ctr = getControllerInstance(controllerName);
    if (!ctr) {
        context.throw(500, "the controller can't found");
    }
    if (!ctr[actionName] && !ctr[mActionName]) {
        context.throw(404, "the action can't found");
    }


    context.state.controller = controllerName;
    context.render = render;
    context.renderJSON = renderJSON;
    context.renderJSONP= renderJSONP;
    context.renderPicture=renderPicture;
    var ua=context.request.accept.headers['user-agent'];
    var isMobile =  /mobile/i.test(ua) && !/iPad/i.test(ua);
    
    var action;
    if (ctr[mActionName] && isMobile){
      action = ctr[mActionName].bind(context);
    } else if(ctr[actionName]){
      action = ctr[actionName].bind(context);
    } else{
      action = ctr[mActionName].bind(context);
    }
    

    if (!(context.state.cache && context.state.cache.enabled)) {
        yield action(context.state.scope);
    }
}


module.exports = {
    router: router,
    get(route, controller) {
        router.get(route, function* (next) {
            yield getController(controller, this);
            yield next;
        });
    },
    post(route, controller) {
        router.post(route, function* (next) {
            yield getController(controller, this);
            yield next;
        });
    },
    del(route, controller) {
        router.delete(route, function* (next) {
            yield getController(controller, this);
            yield next;
        });
    },
    put(route, controller) {
        router.put(route, function* (next) {
            yield getController(controller, this);
            yield next;
        });
    }
};
