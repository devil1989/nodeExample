/*
 @desc:个人中心的model，请求个人中心相关数据
 */

const BaseModel = require('./baseModel');
const auth=require("../lib/middleware/auth.js");
const mongoose=require("mongoose");
const util=require("../lib/util.js");
const Transaction = require("mongoose-transactions");
const transaction = new Transaction();
let session = null;
let config=require("../config.js");
let envObj=config.db[config.NODE_ENV];
let {dbURI,timeout}=envObj;
let timeOut={
    serverSelectionTimeoutMS: timeout//数据库连接超时设置，5000ms
};

/*@desc：
    articleRecommend：默认推荐文章的评论数
    userRecommend：默认推荐的用户的粉丝数
    article：搜索关键词时，如果文章评论数超对应的值，就在里面搜索是否包含关键词，其他都不搜索，基数太大，需要筛选出热门的再去搜索
    comment：搜索关键词时，如果评论的回复数超对应的值，就在里面搜索是否包含关键词，其他都不搜索，基数太大，需要筛选出热门的再去搜索
*/
const hotDefine={article:20,comment:2,articleRecommend:1,userRecommend:1};

class KidsClassService extends BaseModel{

    constructor(self) {
        super();
        this.ctx = self;
    }


    //修改密码：通过原密码来修改密码
    * changePassward({oldPwd,newPwd,id},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var uid=id?mongoose.Types.ObjectId(id):id;
            // var obj={
            //     linkUser:{
            //         uid:uid//关联用户的id
            //     }
            // };
            var match={//上面的对象内嵌套对象，是全匹配的意思，只要某一个属性，得用这种方式
                _id:uid,
                passward:auth.hash(oldPwd,config.auth.shaKey)
            };

            let userModel=BaseModel.UserSchema;
            return userModel.findOneAndUpdate(match,{$set:{passward:auth.hash(newPwd,config.auth.shaKey)}},{new:true});
        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(data){
                scope.status=true;
                scope.mongoData=data;
            }else{
                scope.status=false;
                scope.errorMsg="原密码错误，修改密码失败";
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库未知错误";
        });
    }

    //获取个人文章内容：个人登录下才会调用，因为自己的文章，所以不用鉴权
    * getUserArticleList(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var uid=opts.id?mongoose.Types.ObjectId(opts.id):opts.id;
            // var obj={
            //     linkUser:{
            //         uid:uid//关联用户的id
            //     }
            // };
            var obj={//上面的对象内嵌套对象，是全匹配的意思，只要某一个属性，得用这种方式
                "linkUser.uid":uid
            };

            let articleModel=BaseModel.ArticleSchema;
            return articleModel.find(obj);
        },function(err){
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(data.length){
                scope.mongoData=data;
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
        });
    }

    
    //个人收藏：搜索太麻烦了，需要遍历所有文章，不过查看收藏的操作不频繁，所以暂时不优化了
    * getUserCollectionList(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var uid=opts.id?mongoose.Types.ObjectId(opts.id):opts.id;
            var match={$match:{
                "linkUser.collect":{
                    $elemMatch:{$eq:uid}
                }
            }};

            let articleModel=BaseModel.ArticleSchema;
            return articleModel.aggregate([match,{
                $project:{
                    time:1,
                    title:1,
                    content:1,
                    tag:1,
                    linkUser:1,
                    linkComment:1,
                    categroy:1,
                    level:1
                }
            }]);
        },function(err){
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(data.length){
                scope.mongoData=data;
            }
            scope.status=true;
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
        });
    }

    * getUserFansList({id},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var uid=id?mongoose.Types.ObjectId(id):id;
            let userModel=BaseModel.UserSchema;
            let match={//上面的对象内嵌套对象，是全匹配的意思，只要某一个属性，得用这种方式
                $match:{"_id":uid}
            };
            let lookup={
                $lookup:{
                    from: "users",//需要连接的表名
                    localField: "linkUser.fans",//本表[articles表]需要关联的字段
                    foreignField: "_id",//被连接表需要关联的字段
                    as: "personInfo"//查询出的结果集别名
                }
            };

            return userModel.aggregate([match,lookup,{
                $project:{
                    personInfo:1
                }
            }]);
        },function(err){
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(data.length){
                scope.mongoData=data;
            }
            scope.status=true;
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
        });
    }

    * getUserAttentionList({id},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var uid=id?mongoose.Types.ObjectId(id):id;
            let userModel=BaseModel.UserSchema;
            let match={//上面的对象内嵌套对象，是全匹配的意思，只要某一个属性，得用这种方式
                $match:{"_id":uid}
            };
            let lookup={
                $lookup:{
                    from: "users",//需要连接的表名
                    localField: "linkUser.attention",//本表[articles表]需要关联的字段
                    foreignField: "_id",//被连接表需要关联的字段
                    as: "personInfo"//查询出的结果集别名
                }
            };

            return userModel.aggregate([match,lookup,{
                $project:{
                    personInfo:1
                }
            }]);
        },function(err){
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(data.length){
                scope.mongoData=data;
            }
            scope.status=true;
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
        });
    }


    //修改用户信息
    * setUserInfo(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var uid=opts._id?mongoose.Types.ObjectId(opts._id):_id;
            let userModel=BaseModel.UserSchema;
            delete opts._id;
            return userModel.findOneAndUpdate({_id:uid},{$set:opts},{new:true});
        },function(err){
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(data){
                scope.mongoData=data;
            }else{
                scope.mongoData=null;
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
        });
    }

    

}


module.exports = KidsClassService
