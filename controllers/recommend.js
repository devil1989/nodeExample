/*
 @desc:所有html页面请求
 */

let paramsUtil = require("../lib/util.js");
let Model = require("../models/index.js");//获取公共地址信息（全国的省，市，区）【目前只在node请求省的信息，市和区放在客户端请求】
const base64url = require('base64url');

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

    //scope挂在context.state下面，这里的this就是context，，所以this.state.scope=参数scope
    home:function*(scope) {
        var isLogin=false;
        if(scope.isLogin){
            var {phoneNum , IP , ua}=scope.jwtData;
            var data;
            
            model = new Model();

            yield model.getUserInfo.bind(this)({phone:phoneNum},scope);
            data=scope.errorMsg?{}:(scope.mongoData[0]||{});
            isLogin=(scope.mongoData&&scope.mongoData.length)?true:false;
            var {userName,name,age,phone,sex,categroy,userPic,linkUser,linkChart,linkArticle,linkComment}=data;
            scope.outputWindowInfo = paramsUtil.outputWindowInfo({//这个是页面登录态传送给前端的数据,不用再ajax获取
                userName,name,phone,isLogin,linkUser,userPic
            });//用JSON.stringify转成字符串,这样输入到html页面,前端那边直接就能拿到对象

            //xss攻击案例：
            // scope.outputWindowInfo = paramsUtil.outputWindowInfo('</script><script>alert(0);</script><script>');
        }else{
            scope.outputWindowInfo = paramsUtil.outputWindowInfo({
                isLogin
            });
        }

        //max-age=24*3600[1天缓存],no-cache无缓存
        yield this.render("home",{cache:"private"});//防止自己页面在未登录状态下跳转到其他页面登录，然后再点击返回，如果设置缓存的华，返回的页面会出现登录按钮，html没必要缓存
    },

    //个人中心
    personal:function*(scope) {
        var isLogin=false;
        var isSelf=false;
        var uid=this.request.body?this.request.body.id:null;
        var data,errorData="出错啦";
        uid=uid?base64url.decode(decodeURIComponent(uid)):null;
        if(scope.isLogin&&!uid){//登录且url后面没有id后缀，就是/recommend/personal这种url，说明isSelf是自己
            var {phoneNum , IP , ua,id}=scope.jwtData;
            isSelf=((uid==id)||!uid)?true:false;
            
            model = new Model();
            yield model.getUserInfo.bind(this)({phone:phoneNum},scope);
            data=scope.mongoData?(scope.mongoData[0]||null):null;
            isLogin=scope.mongoData.length?true:false;
            if(data){
                var {userName,name,age,phone,sex,categroy,linkUser,userPic,_id}=data;
                scope.outputWindowInfo = paramsUtil.outputWindowInfo({//这个是页面登录态传送给前端的数据,不用再ajax获取
                    userName,name,age,phone,sex,categroy,linkUser,userPic,isLogin,isSelf,_id
                });//用JSON.stringify转成字符串,这样输入到html页面,前端那边直接就能拿到对象
            }else{
                scope.outputWindowInfo = paramsUtil.outputWindowInfo({
                    errorData
                });
            }
        }else{
            if(uid){//查看别人的个人中心
                if(scope.isLogin&&(scope.jwtData.id==uid)){
                    isSelf=true;
                }
                model = new Model();
                yield model.getUserInfo.bind(this)({_id:uid},scope);
                data=scope.mongoData?(scope.mongoData[0]||null):null;
                isLogin=scope.isLogin
                if(data){
                    var {userName,name,age,phone,sex,categroy,linkUser,userPic,_id}=data;
                    scope.outputWindowInfo = paramsUtil.outputWindowInfo({//这个是页面登录态传送给前端的数据,不用再ajax获取
                        userName,name,phone,sex,linkUser,userPic,isLogin,isSelf,_id
                    });//用JSON.stringify转成字符串,这样输入到html页面,前端那边直接就能拿到对象
                }else{
                    scope.outputWindowInfo = paramsUtil.outputWindowInfo({
                        errorData
                    });
                }
                    
            }else{//没有uid，说明是进自己的个人中心，但虽然没有登录，isSelf仍然是true
                isSelf=true;
                scope.outputWindowInfo = paramsUtil.outputWindowInfo({
                    isLogin,isSelf
                });

            }
        }
        
        //个人中心缓存策略位nocache，html不缓存
        yield this.render("personal",{cache:"private"});//前端遇到errorData，直接重定向到error页面
    },
    error_page:function*(scope) {
        var errorData="出错啦";
        scope.outputWindowInfo = paramsUtil.outputWindowInfo({
            errorData
        });
        yield this.render("error_page");
    }
    
};