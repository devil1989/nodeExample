
const KidsClassService=require("../models/index.js");//获取公共地址信息（全国的省，市，区）【目前只在node请求省的信息，市和区放在客户端请求】
const paramsUtil = require("../lib/util.js");
const config = require("../config");
const svgCaptcha = require('svg-captcha');
const uuid = require('uuid/v4'); //不会重复，业内通用
const requestIp = require('request-ip');
const jsonwebtoken = require('jsonwebtoken');
const auth=require("../lib/middleware/auth.js");



module.exports = {

    //node端做的事情：1.路由，2.鉴权，3.请求webapi数据保存到html，4.seo相关页面的html得在node端做同构
    reigst_user: function *(scope) {//this.header中有请求头的所有数据
        var IP = requestIp.getClientIp(this.req);
        var ua = this.header["user-agent"];
        var data=auth.getEncryptedData(this);//获取注册用户的解密数据
        var {phoneNum,passward,nickName} = JSON.parse(data);
        var tgObj={};
        // let timeStamp=scope.request.cookie.get("authKey");
        if(nickName&&nickName.trim()){
            tgObj={passward:passward,phone:phoneNum,userName:nickName};
        }else{
            tgObj={passward:passward,phone:phoneNum,userName:uuid()};
        }
        
        var JSONData,repeatObj={},msg="";

        model = new KidsClassService();

        yield model.registUser(scope,tgObj);

        // scope.mongoData的数据结构[{"_doc":{phone,userName....}}，...]数组，
        // 或者{"_doc":{phone,userName....}单一对象
        if(scope.status){//注册成功
            var {_id,phone,userName}=scope.mongoData._doc;

            JSONData= {status:200,msg:"注册成功",data:{_id,phone,userName},state:1};

            //设置jwt的token，
            auth.addToken.bind(this)({phoneNum , IP , ua });

        }else{//注册失败
            if(scope.mongoData){//因为手机号或者昵称重复
                var isNickNameRepeat=scope.mongoData.some(function(item) {
                    return item._doc.userName==nickName
                });
                var isPhoneRepeat=scope.mongoData.some(function(item) {
                    return item._doc.phone==phoneNum
                });
                msg="注册失败";
                repeatObj={phone:(isPhoneRepeat?1:0),userName:(isNickNameRepeat?1:0)};
                repeatObj.userNameMsg=isNickNameRepeat?"昵称已被别人注册，不能重复;":"";
                repeatObj.phoneMsg=isPhoneRepeat?"该手机号已经被注册过，不能重复":"";
                JSONData= {status:200,msg:msg,data:repeatObj,state:0};
            }else{//其他数据库错误
                JSONData= {status:500,msg:"服务器未知错误",data:"",state:0};
            }
        }

        
        

        // this.json(JSONData);
        //通过renderJSON插件已经把这个方法挂载到context上了
        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    jsonp: function *(scope) {
        console.log("_________________jsonp__________________")
        let JSONPData= {status:200,mes:"JSONP成功",data:{}};
        let url=this.request.url;
        let arr = url.match(/callback=([\w]{1,})/);
        let callback=arr.length>1?arr[1]:"";

        yield this.renderJSONP(JSONPData,callback);
    },

    //svg图片验证码的ajax请求，图片中直接请求这个ajax地址，就可以返回对应的图片数据
    captcha: function *(scope) {
        console.log("_________________captcha__________________");
        var captcha = svgCaptcha.create({
            inverse: false,// 翻转颜色 
            fontSize: 36,// 字体大小 
            noise: 2,// 噪声线条数 
            width: 80,// 宽度 
            height: 30,// 高度 

        });
        this.cookies.set("captcha",captcha.text.toLowerCase(),Object.assign({},config.session,{sameSite:"",httpOnly:false}));
        let data=String(captcha.data);
        yield this.renderPicture(data);
    }


};