let paramsUtil = require("../lib/util.js");
let Model = require("../models/index.js");//获取公共地址信息（全国的省，市，区）【目前只在node请求省的信息，市和区放在客户端请求】
module.exports = {

    //node端做的事情：1.路由，2.鉴权，3.请求webapi数据保存到html，4.seo相关页面的html得在node端做同构
    react_demo: function* (scope) {
        // paramsUtil.ensureAuthrized(scope, this);//鉴权，是否登录，未登录就跳转到登录页
        // let code = paramsUtil.getUrlParam(scope.url, 'code');//通过url后面的参数，解析成对应的param
        // let cityInfo = yield new model(this).getCityInfo(code);//发送对应的node端请求，获取对应数据
        var cityInfo={};
        scope.outputWindowInfo = paramsUtil.outputWindowInfo({//把最终获取的数据，保存到scope
            'user': scope.userInfo,
            cityInfo
        });

        yield this.render("react_demo");//渲染页面，跳转到views文件去渲染对应页面

    },
    redux_demo: function* (scope) {
        yield this.render("redux_demo");
    },
    home:function*(scope) {
        var isLogin=false;
        debugger
        if(this.jwtVerified==true){
            var {phoneNum , IP , ua}=this.request.jwtData;
            
            model = new Model();
            yield model.getUserInfo.bind(this)({phone:phoneNum},scope);
            var data=scope.mongoData[0]._doc||{};
            isLogin=scope.mongoData.length?true:false;
            var {userName,name,age,phone,sex,categroy,linkUser,linkChart,linkArticle,linkComment}=data;
            scope.outputWindowInfo = paramsUtil.outputWindowInfo(JSON.stringify({
                userName,name,phone,isLogin
            }));//用JSON.stringify转成字符串,这样输入到html页面,前端那边直接就能拿到对象
        }else{
            scope.outputWindowInfo = paramsUtil.outputWindowInfo(JSON.stringify({
                isLogin
            }));
        }
        yield this.render("home");
    }
    
};