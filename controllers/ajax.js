
const KidsClassService=require("../models/index.js");//获取公共地址信息（全国的省，市，区）【目前只在node请求省的信息，市和区放在客户端请求】
const paramsUtil = require("../lib/util.js");
const config = require("../config");
const svgCaptcha = require('svg-captcha');
const uuid = require('uuid/v4'); //不会重复，业内通用
const requestIp = require('request-ip');
const jsonwebtoken = require('jsonwebtoken');
const auth=require("../lib/middleware/auth.js");
let Model = require("../models/index.js");
let pModel = require("../models/personal.js");
const base64url = require('base64url');
const formidable = require('formidable');//图片上传插件
const fs = require("fs");
const path = require("path");
const utilJs= require("../lib/util.js");

/*后台权限验证：
    1.是否登录：登录态验证
    2.是否是私人资料：验证修改的资料在登录态用户的名下
    3.数据是否有独立的权限系统：某些数据设置独立的可访问白名单，名单之外的任何人都无法访问这个数据【作者除外】*/
module.exports = {

    //添加文章的标签或删除标签：这个有个概念特别重要，需要验证后台登录态的uid和前端传过来的资源的id关联
    //以确保被操做的数据是“当前登录态的用户”的私人资料，只验证一个登录态，那我知道了别人文章的id，
    // 然后直接操作别人的文章下的内容或标签，就越权了。
    // add_article_tag:function *(scope) {
    //     if(scope.isLogin){
    //         var uid=scope.jwtData.id;//后端登录态的下的用户的uid
    //         var model = new Model();
    //         var {articleId,isAdd,inputValue,tagId=null}= this.request.body;
    //         var JSONData={};
    //         yield model.verifyArticleRight.bind(this)({uid,articleId} ,scope);
    //         if(scope.status&&scope.mongoData&&scope.mongoData.length){
    //             yield model.setArticleTag.bind(this)({articleId,isAdd,inputValue,tagId} ,scope);

    //             if(scope.status&&scope.mongoData){
    //                 JSONData = {data:"",state:1,status:200,msg:""};
    //             }else{
    //                 JSONData = {data:"",state:0,status:200,msg:"操作标签失败"};
    //             }
    //         }else{
    //             JSONData = {data:"",state:0,status:200,msg:"您没有操作权限"};
    //         }
                
    //     }else{
    //         JSONData = {data:"",state:0,status:200,msg:"请先登录"};
    //     }

    //     yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    // },

    //修改密码
    modify_pwd:function *(scope) {
        var model = new pModel();
        var {oldPwd,newPwd,id}= this.request.body;
        id=id?base64url.decode(decodeURIComponent(id)):null;
        var JSONData={};
        var isSelf=(id==scope.jwtData.id)?true:false;
        var IP = requestIp.getClientIp(this.req);
        var ua = this.header["user-agent"];
        var phoneNum;
        if(scope.isLogin&&isSelf){
            yield model.changePassward.bind(this)({oldPwd,newPwd,id} ,scope);

            if(scope.status){
                JSONData = {data:"",state:1,status:200,msg:"修改密码成功"};
                phoneNum=scope.mongoData?scope.mongoData.phone:"";
                auth.addToken.bind(this)({phoneNum , IP , ua , id});//更新token
            }else{
                JSONData = {data:"",state:0,status:200,msg:scope.errorMsg};
            }
        }else{
            JSONData = {data:"",state:0,status:200,msg:"修改失败，请重新登录再修改密码"};
        }
            
            
        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    article_tag_info:function *(scope) {
        // var uid=scope.jwtData.id;//后端登录态的下的用户的uid
        var model = new Model();
        var {articleId}= this.request.body;
        var JSONData={};
        var rstArr=[];
        yield model.getArticleTag.bind(this)({articleId} ,scope);
        if(scope.status&&scope.mongoData){
            (scope.mongoData||[]).forEach(function({_id,content}) {
                rstArr.push({_id,content});
            })
            JSONData = {data:{tags:rstArr},state:1,status:200,msg:""};
        }else{
            JSONData = {data:"",state:0,status:200,msg:scope.errorMsg||"获取标签失败"};
        }
            
        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //收藏或取消收藏文章
    add_article_collect:function *(scope) {
        if(scope.isLogin){
            var model = new Model();
            var {articleId,uid,isAdd} = this.request.body;
            uid=uid?base64url.decode(decodeURIComponent(uid)):null;
            var JSONData={};
            yield model.setArticleCollect.bind(this)({articleId,uid,isAdd} ,scope);

            if(scope.status&&scope.mongoData){
                var {collect}=scope.mongoData.linkUser;
                JSONData = {data:{collect},state:1,status:200,msg:""};
            }else{
                JSONData = {data:"",state:0,status:200,msg:scope.errorMsg||"收藏文章失败"};
            }
        }else{
            JSONData = {data:"",state:0,status:200,msg:"请先登录"};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //添加文章点赞或取消点赞
    add_article_fav:function *(scope) {
        if(scope.isLogin){
            var model = new Model();
            var {articleId,uid,isAdd} = this.request.body;
            uid=uid?base64url.decode(decodeURIComponent(uid)):null;
            var JSONData={};
            yield model.setArticleFav.bind(this)({articleId,uid,isAdd} ,scope);

            if(scope.status&&scope.mongoData){
                var {fav}=scope.mongoData.linkUser;
                JSONData = {data:{fav},state:1,status:200,msg:""};
            }else{
                JSONData = {data:"",state:0,status:200,msg:scope.errorMsg||"点赞失败"};
            }
        }else{
            JSONData = {data:"",state:0,status:200,msg:"请先登录"};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //关注某人
    add_user_attention:function *(scope) {

        if(scope.isLogin){
            var model = new Model();
            var {authorId,uid,isAdd} = this.request.body;
            uid=uid?base64url.decode(decodeURIComponent(uid)):null;
            var JSONData={};
            yield model.setUserAttention.bind(this)({authorId,uid,isAdd} ,scope);
            if(scope.status&&scope.mongoData){
                var {linkUser}=scope.mongoData;
                JSONData = {data:{linkUser},state:1,status:200,msg:""};
            }else{
                JSONData = {data:{},state:0,status:200,msg:scope.errorMsg||"关注失败"};
            }
        }else{
            JSONData= {status:200,msg:"请先登录",data:{},state:0};
        }


           

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },
    
    //搜索
    search:function *(scope) {
        var model = new Model();
        var {uid,searchInfo} = this.request.body;
        uid=uid?base64url.decode(decodeURIComponent(uid)):null;
        var JSONData={},rstArr=[];
        var {type,val}=searchInfo;
        var rstData={};
        yield model.searchInfoList.bind(this)({uid,searchInfo} ,scope);

        if(scope.status&&scope.mongoData&&scope.mongoData.length){
            rstArr=scope.mongoData;
            if(type=="user"){
                rstData={user:rstArr};
            }else if(type=="article"){
                rstData={article:rstArr[0],articleInTags:rstArr[1]};
            }else if(type=="all"){
                rstData={user:rstArr[0],article:rstArr[1],articleInTags:rstArr[2]};
            }
            JSONData = {data:rstData,state:1,status:200,msg:""};
        }else{
            JSONData = {data:[],state:0,status:200,msg:scope.errorMsg||"没查到相关人或相关信息"};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //评论点赞
    add_comment_fav:function *(scope) {
        if(scope.isLogin){
            var model = new Model();
            var {cid,uid,isAdd} = this.request.body;
            uid=uid?base64url.decode(decodeURIComponent(uid)):null;
            var JSONData={};
            yield model.setCommentFav.bind(this)({cid,uid,isAdd} ,scope);

            if(scope.status&&scope.mongoData){
                var _id=scope.mongoData._id;
                var {fav}=scope.mongoData.linkUser;
                JSONData = {data:{fav,_id},state:1,status:200,msg:""};
            }else{
                JSONData = {data:[],state:0,status:200,msg:scope.errorMsg||"点赞失败"};
            }
        }else{
            JSONData = {data:[],state:0,status:200,msg:"请先登录"};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },


    //单独文章查询：有个权限设置linkUser.accessViewUser可查看人员；
    // linkUser.accessCommentUser：可评论人员
    //如果没有uid且isLogin为false，那就是未登录，就不需要做uid的逻辑
    article_info:function *(scope) {
        var model = new Model();
        var {id,uid,needAccess=false} = this.request.body;
        uid=uid?base64url.decode(decodeURIComponent(uid)):null;
        var JSONData={};
        yield model.getArticleListById.bind(this)({id,uid,needAccess} ,scope);
        var articleData=scope.mongoData?scope.mongoData[0]:null;
        scope.mongoData=null;

        if(articleData){
            var {_id,time,title,content,tag,linkUser,linkComment,category,level,personInfo}=articleData;
            var commentList=[];
            //寻找这个和这个文章id关联，且categroy为2的comment
            yield model.getCommentListByOrigin.bind(this)({_id:_id,category:"2"} ,scope);
            if(scope.mongoData){//存在关联comment
                commentList=scope.mongoData;
            }
            id=_id.toString();

            /*
            commentList中每一条，都包含repliedUserInfo：结构如下
            {   id:1,
                time:1,
                content:1,
                level:1,
                linkUser:1,
                linkOther:1,
                linkOrigin:1,
                personInfo:1,
                repliedUserInfo:1
            }
            */
            JSONData = {data:{id,time,title,content,tag,linkUser,linkComment,category,level,personInfo,commentList},state:1,status:200,msg:""};
            
        }else{
            JSONData = {data:null,state:1,status:200,msg:scope.errorMsg||"未找对应文章"};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },


    //添加文章评论
    add_article_comment:function *(scope) {
        if(scope.isLogin){
            var model = new Model();
            var {uid,content,linkOrigin,linkOther} = this.request.body;//category,targetId,origin
            uid=uid?base64url.decode(decodeURIComponent(uid)):"";
            var JSONData={};

            yield model.addComment.bind(this)({uid,content,linkOrigin,linkOther} ,scope);
            
            if(scope.mongoData&&scope.mongoData.length){
                var data=scope.mongoData;
                var rstArr=[];
                data.forEach(function(item,idx) {
                    var {_id,time,content,level,linkUser,linkOther,linkOrigin,personInfo,repliedUserInfo}=item;
                    var id=_id;
                    //ObjectId在传给前端之前会自动调用toString()转成字符串
                    rstArr.push({id,time,content,level,linkUser,linkOther,linkOrigin,personInfo,repliedUserInfo});
                });
                JSONData = {data:rstArr,state:1,status:200,msg:""};
            }else{
                JSONData = {data:"",state:0,status:200,msg:scope.errorMsg||"评论失败"};
            }
        }else{
            JSONData = {data:"",state:0,status:200,msg:"请先登录再评论"};
        }
        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //个人文章list请求
    person_article_list:function *(scope) {
        var model = new Model();
        var {id,isPassVerify=0} = this.request.body;
        id=base64url.decode(decodeURIComponent(id));
        var JSONData={};
        if(scope.isLogin||isPassVerify){//isPassVerify字段表示不需要鉴权，直接通过；因为在别人的个人中心查看对方文章的时候，是不需要验证登录态的
            yield model.getUserArticleList.bind(this)({id} ,scope);
            if(scope.mongoData&&scope.mongoData.length){
                var data=scope.mongoData;
                var rstArr=[];
                data.forEach(function(item,idx) {
                    var {id,time,title,content,tag,linkUser,linkComment,categroy,level}=item;
                    rstArr.push({id,time,title,content,tag,linkUser,linkComment,categroy,level});
                });

                JSONData = {data:rstArr,state:1,status:200,msg:""};
            }else{
                JSONData = {data:[],state:1,status:200,msg:scope.errorMsg||"未找到您的文章"};
            }
        }else{
            JSONData= {status:200,msg:"请先登录",data:[],state:0};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //个人收藏文章列表
    person_collection_list:function *(scope) {
        var model = new pModel();
        var {id} = this.request.body;
        var uid=scope.jwtData.id;
        id=base64url.decode(decodeURIComponent(id));
        var JSONData={};
        if(id==uid){
            if(scope.isLogin){
                yield model.getUserCollectionList.bind(this)({id} ,scope);
                if(scope.mongoData&&scope.mongoData.length){
                    rstArr=scope.mongoData;
                    JSONData = {data:rstArr,state:1,status:200,msg:rstArr.length?"":"您还没收藏过文章"};
                }else{
                    JSONData = {data:[],state:1,status:200,msg:scope.errorMsg||"未找到您的文章"};
                }
            }else{
                JSONData= {status:200,msg:"请先登录",data:[],state:0};
            }
        }else{//这里做权限处理，收藏列表是否设置个人隐私权限，后续在做，设置字段
            JSONData= {status:200,msg:"该用户关闭了他收藏文章的展示",data:[],state:0};
        }
        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //用户粉丝列表
    person_fans_list:function *(scope) {
        var model = new pModel();
        var {id,isPassVerify=0} = this.request.body;
        id=base64url.decode(decodeURIComponent(id));
        var JSONData={};
        var isSelf;
        if(scope.isLogin||isPassVerify){
            var uid=scope.jwtData?scope.jwtData.id:null;//如果请求的是别人页面，用id，如果请求的是自己的页面，用scope.jwtData.id

            //如果传过来的id是自己的id，就是查看自己的信息，
            //如果是是别人的id，就是查看别人的信息；如果是查看别人的信息，得有权限筛选
            isSelf=(uid==id)?true:false;
            yield model.getUserFansList.bind(this)({id} ,scope);

            if(scope.mongoData&&scope.mongoData&&scope.mongoData.length){
                var data=scope.mongoData[0].personInfo;
                var rstArr=[];
                data&&data.forEach(function(item,idx) {
                    var {_id,userName,name,phone,userPic,linkUser,time}=item;
                    if(isSelf){
                        rstArr.push({_id,userName,name,phone,userPic,linkUser,time});
                    }else{
                        rstArr.push({_id,userName,name,phone,userPic,linkUser,time});
                    }
                });
                JSONData = {data:rstArr,state:1,status:200,msg:""};
            }else{
                JSONData = {data:[],state:1,status:200,msg:scope.errorMsg||"您还没有粉丝"};
            }
        }else{
            JSONData= {status:200,msg:"请先登录",data:[],state:0};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //关注列表
    person_attention_list:function *(scope) {
        var model = new pModel();
        var {id,isPassVerify=0} = this.request.body;
        id=base64url.decode(decodeURIComponent(id));
        var JSONData={};
        var isSelf;
        if(scope.isLogin||isPassVerify){
            var uid=scope.jwtData?scope.jwtData.id:null;//后端登录态的下的用户的uid

            //如果传过来的id是自己的id，就是查看自己的信息，
            //如果是是别人的id，就是查看别人的信息；如果是查看别人的信息，得有权限筛选
            isSelf=(uid==id)?true:false;
            yield model.getUserAttentionList.bind(this)({id} ,scope);

            if(scope.mongoData&&scope.mongoData&&scope.mongoData.length){
                var data=scope.mongoData[0].personInfo;
                var rstArr=[];
                data&&data.forEach(function(item,idx) {
                    var {_id,userName,name,phone,userPic,linkUser,time}=item;
                    if(isSelf){
                        rstArr.push({_id,userName,name,phone,userPic,linkUser,time});
                    }else{
                        rstArr.push({_id,userName,name,phone,userPic,linkUser,time});
                    }
                });
                JSONData = {data:rstArr,state:1,status:200,msg:""};
            }else{
                JSONData = {data:[],state:1,status:200,msg:scope.errorMsg||"您还没有关注别人"};
            }
        }else{
            JSONData= {status:200,msg:"请先登录",data:[],state:0};
        }

        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    //node端做的事情：1.路由，2.鉴权，3.请求webapi数据保存到html，4.seo相关页面的html得在node端做同构
    reigst_user: function *(scope) {//this.header中有请求头的所有数据
        var IP = requestIp.getClientIp(this.req);
        var ua = this.header["user-agent"];
        var {phoneNum,passward,nickName} = this.request.body;
        var tgObj={};
        if(nickName&&nickName.trim()){
            tgObj={passward:passward,phone:phoneNum,userName:nickName};
        }else{
            tgObj={passward:passward,phone:phoneNum,userName:uuid()};
        }
        
        tgObj=auth.xssEncode(tgObj);//防止xss攻击，把对应数据中的危险标签转译掉，服务端加密数据的防御
                              //服务端未加密数据，直接在页面通用路径上用auth.xssEncode防御过了

        var JSONData,repeatObj={},msg="";

        model = new KidsClassService();

        yield model.registUser(tgObj,scope);

        // scope.mongoData的数据结构[{id,_id,phone,userName,.......}，...]数组，
        // 或者{id,_id,phone,userName....}单一对象,所以要注意逻辑区分
        //其中id是字符串，_id是symbol对象，是数据库内真正的主键，所以查找的时候
        if(scope.status){//注册成功
            var {id,phone,userName,userPic}=scope.mongoData;

            JSONData= {status:200,msg:"注册成功",data:{id,phone,userName,userPic},state:1};

            //设置jwt的token，
            auth.addToken.bind(this)({phoneNum , IP , ua , id});
 
        }else{//注册失败
            if(scope.mongoData){//因为手机号或者昵称重复
                var isNickNameRepeat=scope.mongoData.some(function(item) {
                    return item.userName==nickName
                });
                var isPhoneRepeat=scope.mongoData.some(function(item) {
                    return item.phone==phoneNum
                });
                msg=scope.errorMsg;
                repeatObj={phone:(isPhoneRepeat?1:0),userName:(isNickNameRepeat?1:0)};
                repeatObj.userNameMsg=isNickNameRepeat?"昵称已被别人注册，不能重复;":"";
                repeatObj.phoneMsg=isPhoneRepeat?"该手机号已经被注册过，不能重复":"";
                JSONData= {status:200,msg:msg,data:repeatObj,state:0};
            }else{//其他数据库错误
                JSONData= {status:500,msg:scope.errorMsg,data:"",state:0};
            }
        }


        // this.json(JSONData);
        //通过renderJSON插件已经把这个方法挂载到context上了
        yield this.renderJSON(JSONData);//响应ajax请求，就是把数据放到response.body上
    },

    login: function *(scope) {
        var model = new Model();
        var {phoneNum,passward,nickName,timeStamp} = this.request.body;

        yield model.checkUserInfo.bind(this)({phone:phoneNum,passward,timeStamp} ,scope);
        if(scope.mongoData&&scope.mongoData.length){
            var data=scope.mongoData[0]||{};
            var {userName,name,phone,id,userPic,linkUser}=data;
            var IP = requestIp.getClientIp(this.req);
            var ua = this.header["user-agent"];
            var isLogin=true;

            //设置jwt的token，
            auth.addToken.bind(this)({phoneNum , IP , ua ,id });
            yield this.renderJSON({data:{userName,name,phone,isLogin,userPic,linkUser},state:1,status:200,msg:"登录成功"});
        }else{
            yield this.renderJSON({data:{},state:1,status:501,msg:scope.errorMsg});
        }
            
    },

    logout: function *(scope) {
        var model = new Model();
        var {id} = this.request.body;
        scope.isLogin=false;
        this.cookies.set("u","",{maxAge:0});
        this.cookies.set("token","",{maxAge:0});
        yield this.renderJSON({data:{isLogin:scope.isLogin},state:1,status:200,msg:scope.errorMsg});
            
    },

    create_article: function *(scope) {
        var model = new Model();
        var {title,content,id,tags} = this.request.body;

        if(scope.isLogin){//token验证通过
            yield model.addArticle.bind(this)({title,content,id,tags}  ,scope);
            if(scope.mongoData){
                var uid=id;//用户id保存到uid里面，后面用到的id是文章的id
                var data=scope.mongoData||{};
                var {time,title,content,id}=data;
                var isLogin=true;
                var tagsBackData=scope.tagsData||[];
                if(scope.needTagsStatus&&scope.tagsStatus||scope.tagsStatus==false){//标签请求也成功
                    yield this.renderJSON({data:{time,title,content,id,uid,isLogin,tags:tagsBackData},state:1,status:200,msg:"提交成功"});
                }else{//标签请求失败
                    yield this.renderJSON({data:{time,title,content,id,uid,isLogin,tags:tagsBackData},state:2,status:200,msg:"文章提交成功，但文章标签添加失败"});
                }
            }else{
                yield this.renderJSON({data:{},state:1,status:501,msg:scope.errorMsg||"提交失败"});
            }
        }else{
            yield this.renderJSON({data:{isLogin:false},state:0,status:200,msg:"登陆状态过期，请重新登录"});
        }
        
    },

    //获取个人信息
    user_info:function *(scope) {
        var model = new Model();
        var {id} = this.request.body;
        id=base64url.decode(decodeURIComponent(id));
        var JSONData={};
        var isSelf=(scope.jwtData&&(id==scope.jwtData.id))?true:false;
        var JSONData={};
        if(scope.isLogin){
            if(isSelf){
                yield model.getUserInfo.bind(this)({_id:id},scope);
                if(scope.mongoData&&scope.mongoData.length){
                    var data=scope.mongoData[0]||{};
                    var {_id,userName,name,phone,sex,age,userPic,linkUser,time,categroy}=data;
                    var isLogin=scope.isLogin;
                    JSONData={data:{_id,userName,name,phone,sex,age,userPic,categroy,linkUser,time,isLogin},state:1,status:200,msg:""}
                }else{
                    JSONData={data:null,state:1,status:501,msg:scope.errorMsg||"未获取到用户信息"}
                }
            }else{
                JSONData={data:null,state:0,status:200,msg:"不能获取他人的信息"}
            }
        }else{
            JSONData={data:null,state:0,status:200,msg:"请登录,如找不到右上角的登录按钮，请刷新页面"}
        }
        yield this.renderJSON(JSONData);//ajax请求都不用缓存
    },

    //更新个人信息
    update_user_info:function *(scope) {
        var model = new pModel();
        var {id,age,sex,phone,name,userName} = this.request.body;
        id=id?base64url.decode(decodeURIComponent(id)):null;
        var JSONData={};
        var isSelf=(id==scope.jwtData.id)?true:false;
        if(scope.isLogin){
            if(isSelf){
                var tempObj={_id:id};
                if(age){
                    tempObj.age=age;
                }
                if(sex){
                    tempObj.sex=sex;
                }
                if(phone){
                    tempObj.phone=phone;
                }
                if(name){
                    tempObj.name=name;
                }
                if(userName){
                    tempObj.userName=userName;
                }
                yield model.setUserInfo.bind(this)(tempObj,scope);

                if(scope.mongoData){
                    var data=scope.mongoData||{};
                    var {_id,userName,name,age,sex,phone,userPic,linkUser,time}=data;
                    JSONData={data:{_id,userName,name,age,sex,phone,userPic,linkUser,time},state:1,status:200,msg:""}
                }else{
                    JSONData={data:null,state:1,status:501,msg:scope.errorMsg||"更新失败，未查找到用户"}
                }
            }else{
                JSONData={data:null,state:0,status:200,msg:"不能获取他人的信息"}
            }
        }else{
            JSONData={data:null,state:0,status:200,msg:"请登录,如找不到右上角的登录按钮，请刷新页面"}
        }
        yield this.renderJSON(JSONData);
    },

    //登录用的动态码，双ajax来防止登录的重播攻击中的动态码ajax环节
    dynomic_code: function *(scope) {
        var model = new Model();
        var {phoneNum} = this.request.body;
        yield model.getUserInfo.bind(this)({phone:phoneNum},scope);

        if(scope.mongoData&&scope.mongoData.length){
            var data=scope.mongoData[0]||{};
            var {timeStamp}=data;

            yield this.renderJSON({data:{timeStamp},state:1,status:200,msg:"动态码获取成功"});
        }else{
            yield this.renderJSON({data:{},state:1,status:501,msg:scope.errorMsg||"登录失败"});
        }
            
    },

    //请求方式：get
    jsonp: function *(scope) {
        let JSONPData= {status:200,msg:"JSONP成功",data:{}};
        let url=this.request.url;
        let arr = url.match(/callback=([\w]{1,})/);
        let callback=arr.length>1?arr[1]:"";

        yield this.renderJSONP(JSONPData,callback);
    },

    //svg图片验证码的ajax请求，图片中直接请求这个ajax地址，就可以返回对应的图片数据
    //请求方式：get
    captcha: function *(scope) {
        var captcha = svgCaptcha.create({
            inverse: false,// 翻转颜色 
            fontSize: 36,// 字体大小 
            noise: 2,// 噪声线条数 
            width: 80,// 宽度 
            height: 30// 高度 
        });
        this.cookies.set("captcha",base64url.encode(captcha.text.toLowerCase()),Object.assign({},config.session,{sameSite:"",httpOnly:false}));
        let data=String(captcha.data);
        yield this.renderPicture(data);
    },

    //文件上传：黑名单【文件名包含特殊字符】+白名单验证【文件扩展名+MIME类型】；目录验证【不能用客户端变量设置目录路径，因为上传变量容易作弊；修改文件名和文件路径，不用前端传的变量】；检测文件内容[不用做，文件后缀名修改，就无法执行]；size限制
    //包含木马的图片文件下载后，还需要在客户端用对应js执行解析，否则图片里面有木马，也没法执行
    //详见：https://www.cnblogs.com/bmjoker/p/8970006.html
    //上传过程肯定是不会执行脚本的，所以只要把上传目录的权限拿掉，同时不用前端变量来设置保存路径，统一保存到那个没有权限的文件夹，这样服务端安全就可以保证，但是客户端那边下载文件就无法保证安全了，很麻烦
    // 漏洞的核心原因就是：文件的后缀名可以随意改，无法真正通过后缀去区分，文件内容检测首先是太麻烦，其次就是木马内容千变万化根本无法过滤干净
    // 最牛的木马植入：首先拿一张正常图片，然后植入木马，然后用00方式截断上传，比如文件名称为1.php.0x00.jpg，服务端获取到它是jpg类型文件，图片内容也是正常图片【其实里面植入了木马】，
                      /*很多服务器有截断漏洞，遇到到0x00，直接会忽略后面的字段【包括0X00】，所以获取文件的时候，文件名自动变成了1.php，是可执行文件，这一步，直接用截断绕过后缀检测，植入图片绕过图片内容检测
                      然后就是通过文件名的设置，把文件放到具有执行权限且浏览器可访问的文件夹下，那么接下来就可以通过访问浏览器来访问服务端，访问服务端的时候就触发服务端的那个植入的可执行文件，最终黑掉服务器。
                      “0x00” 和 “%00”最终都是同一个原理，都代表着 chr(0) ，即空字符*/
    
    upload: function *(scope) {
        var isOverSize=true,msg="",isInWhiteList=false,isInBlackList=true;
        var uid=scope.jwtData.id;//后端登录态的下的用户的uid
        var pic,ext,match;
        var ctx=this;
        var regExp=/[\d\D]*\.([\w]{3,4})/g;
        var promise,JSONData,state;
        const whiteList=[["image/png","png"],["image/jpg","jpg"],["image/gif","gif"],["image/jpeg","jpeg"]];
        const blackList=[".php",".jsp",".net",".asp",".aspx",".js","eval(","0x00","%00"];
        const maxSize=512000;
        var dirPath="../static/upload/"+uid;
        var transPath=path.join(__dirname,dirPath);
        var rstFileName="";
        var isExist=fs.existsSync(transPath);
        if(!isExist){
            fs.mkdirSync(transPath,"0644");//0777是读写和执行权限

            // 0755->即用户具有读/写/执行权限，组用户和其它用户具有读写权限；
            // 0644->即用户具有读写权限，组用户和其它用户具有只读权限；
            // 0666->即用户，组用户和其它用户具有读写权限；
            // 0777->即用户，组用户和其它用户具有读/写/执行权限；
        }
        // else{
        //     // var tempPath=path.join(__dirname,dirPath+"/user_image.jpeg");
        //     // if(fs.existsSync(tempPath)){
        //     //     fs.rmSync(tempPath);
        //     // }
        // }

        //uploadDir是相对于文件更目录的，目录千万别写错了
        const form = formidable({uploadDir:"./static/upload/"+uid, keepExtensions: true,maxFileSize: maxSize,filter:function({originalFilename,mimetype,size}) {
            match=regExp.exec(originalFilename);
            ext=(match&&match.length==2)?match[1]:null;

            isInWhiteList=ext&&whiteList.some(function(item) {
                return (item[0]==mimetype)&&(item[1]==ext)
            });
            isInBlackList=ext&&blackList.some(function(item) {
                return originalFilename.indexOf(item)!==-1
            });

            if(isInWhiteList&&!isInBlackList){
                msg=""
            }else{
                if(!isInWhiteList){
                    msg="只能上传'png,jpg,gif,jpeg'类型的图片";
                }
                if(isInBlackList){
                    msg="图片名称中不能包含.php .jsp .asp .aspx .js 0x00 %00 eval(之类的字符";
                }
            }
            if(msg){
                return false;
            }else{
                return true;
            }
        },filename:function({originalFilename,mimetype,size}){
            ext=(match&&match.length==2)?match[1]:null;
            rstFileName=Date.now()+"user_image."+ext;
            return rstFileName
        }});//放到用户个人资料静态文件夹下

        //解析form，把图片存放到uploadDir文件夹
        var promise=new Promise(function(resolve,reject) {
            form.parse(ctx.req,function(err,fields,files) {
                if(err){
                    reject(err);
                }else{
                    var regp=/default\.png/g;
                    var tempOriginPicPath=path.join(__dirname,"../static"+fields.originImagUrl);
                    if(fs.existsSync(tempOriginPicPath)&&!regp.test(tempOriginPicPath)){
                        fs.rm(tempOriginPicPath,{force:true},function(err){});
                    }
                    resolve(fields,files)
                }
            });
            return
        })
        yield promise.then(function(fields,files) {
        },function(err) {
            msg="图片解析失败"
        });

        var model = new pModel();
        var tempPicPath=`/upload/${uid}/${rstFileName}`;
        yield model.setUserInfo.bind(this)({_id:uid,userPic:tempPicPath},scope);

        if(scope.mongoData){
            
            var {userPic}=scope.mongoData||{};
            if(userPic){
                msg="";
                state=1;
            }else{
                msg="图片上传失败"
                state=0;
            }
        }else{
            state=0;
            msg="图片上传失败";
        }
        
        JSONData={data:{userPic},state:state,status:200,msg:msg};
        yield this.renderJSON(JSONData);
        
    }

};