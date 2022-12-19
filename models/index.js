/*
 @desc:首页的所有model请求，从数据库获取数据
 */

const BaseModel = require('./baseModel');
const auth=require("../lib/middleware/auth.js");
const mongoose=require("mongoose");//基于"mongodb"的封装，使用更加方便
const util=require("../lib/util.js");
// const affair=require("./affair.js");
const Transaction = require("mongoose-transactions");
const transaction = new Transaction();
let session = null;
let config=require("../config.js");
let envObj=config.db[config.NODE_ENV];
let {dbURI,timeout}=envObj;
let timeOut={
    serverSelectionTimeoutMS: timeout//数据库连接超时设置，5000ms
};

//自定义，支持 findAndModify


/*@desc：
    articleRecommend：默认推荐文章的评论数
    userRecommend：默认推荐的用户的粉丝数
    article：搜索关键词时，如果文章评论数超对应的值，就在里面搜索是否包含关键词，其他都不搜索，基数太大，需要筛选出热门的再去搜索
    comment：搜索关键词时，如果评论的回复数超对应的值，就在里面搜索是否包含关键词，其他都不搜索，基数太大，需要筛选出热门的再去搜索
*/
const hotDefine={article:0,comment:2,articleRecommend:1,userRecommend:1};


//字符串转ObjectId: mongoose.Types.ObjectId(id);
//ObjectId转字符串:mongoose.Types.ObjectId(id).toString()
//mongodb数据库返回的id，默认就是_id的字符串，就是默认调用id=mongoose.Types.ObjectId(_id).toString()


//用JSON.parse(mongodb的_id);得到一个24位的字符串id：时间戳【8位】 机器id【6位】 进程id【4位】 计数器【6位】
//mongodb返回的数据结构中_id就是唯一的id，而id就是_id的字符串格式，所以只需要用ObjectID(data._id)反序列化即可
//用ObjectID(序列化的字符串)：来实时ObjectId的反序列化
//一般的序列化和反序列化，只要用js自带的JSON.stringify和JSON.parse即可


//link相关字段下的很很多id，都需要用mongoose.Types.ObjectId转成ObjectId
//为了关联表级联的时候通过id来级联

class KidsClassService extends BaseModel{

    constructor(self) {
        super();
        this.ctx = self;
    }


    //搜索热门文章【综合推荐】：地下评论数超某个值，以这个位筛选条件，然后排序，
    //优质复盘和优质技术贴，是在综合推荐的基础上，找出满足对于tag标签|关键词的文章
    * getHotArticle({articleId},scope) {
        // let db=mongoose.connect(dbURI,timeOut);
        // yield db.then(function(data) {
        //     articleId=articleId?mongoose.Types.ObjectId(articleId):articleId;
        //     //如果linkArticle数组里面的元素是对象，那么得用{$elemMatch:{key:value}}的格式，key表示对象里面需要满足条件的key；value就是key对应的value
        //     //使用promise，无法筛选字段，所以["_id","content"]或"_id ["_id","content"]"或{_id:1,content:1}都无法过滤字段
        //     return BaseModel.TagSchema.find({linkArticle:{$elemMatch:{$eq:articleId}}},["_id","content"]);
            
        // },function(err){
        //     scope.mongoData=null;
        //     scope.status=false;
        // }).then(function(data) {
        //     scope.mongoData=data;
        //     scope.status=true;
        // },function(err) {
        //     scope.mongoData=null;
        //     scope.status=false;
        // })
    }


    * getArticleTag({articleId},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            articleId=articleId?mongoose.Types.ObjectId(articleId):articleId;
            //使用promise，无法筛选字段，所以["_id","content"]或"_id ["_id","content"]"或{_id:1,content:1}都无法过滤字段

            //如果linkArticle数组里面的元素是对象，那么得用{$elemMatch:{key:value}}的格式，key表示对象里面需要满足条件的key；value就是key对应的value
            return BaseModel.TagSchema.find({linkArticle:{$elemMatch:{$eq:articleId}}},["_id","content"]);
            
        },function(err){
            scope.errorMsg="数据库连接出错";
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(scope.errorMsg){return}
            scope.mongoData=data;
            scope.status=true;
        },function(err) {
            scope.errorMsg="获取标签出错";
            scope.mongoData=null;
            scope.status=false;
        })
    }

    

    
    //校验登录态用户是否有操作文章的权限【修改文章内容，标签，删除文章下的其他人的评论，删除文章等操作之前，需要校验】
    * verifyArticleRight({uid,articleId},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            uid=uid?mongoose.Types.ObjectId(uid):uid;
            articleId=articleId?mongoose.Types.ObjectId(articleId):articleId;
            // {$push:{"linkUser.fav":uid}}表示向 linkUser.fav字段的数组中添加uid，如果是$addToSet表示添加唯一值
            //new设置为true,数据库更新后会返回最新的值
            //updateOne不会默认返回更新数据或元数据，要用 findOneAndUpdate 才能返回更新数据或原数据
            return BaseModel.ArticleSchema.find({_id:articleId,"linkUser.uid":uid});
            
            // mongoose提供的findOneAndUpdate，默认返回原始的数据，需要将new属性设置为true，返回更新后的数据
            // mongoose中没有findAndModify方法.
        },function(err){
            scope.errorMsg="数据库连接出错";
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(scope.errorMsg){return}
            scope.mongoData=data;
            scope.status=true;
        },function(err) {
            scope.errorMsg="查询文章内容出错";
            scope.mongoData=null;
            scope.status=false;
        })
    }

    
    //收藏文章或取消收藏
    * setArticleCollect({articleId,uid,isAdd},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            uid=uid?mongoose.Types.ObjectId(uid):uid;
            articleId=articleId?mongoose.Types.ObjectId(articleId):articleId;
            // {$push:{"linkUser.fav":uid}}表示向 linkUser.fav字段的数组中添加uid，如果是$addToSet表示添加唯一值
            //new设置为true,数据库更新后会返回最新的值
            //updateOne不会默认返回更新数据或元数据，要用 findOneAndUpdate 才能返回更新数据或原数据
            if(isAdd){
                return BaseModel.ArticleSchema.findOneAndUpdate({_id:articleId},{$addToSet:{"linkUser.collect":uid}},{new:true});    
            }else{
                return BaseModel.ArticleSchema.findOneAndUpdate({_id:articleId},{$pull:{"linkUser.collect":uid}},{new:true});
            }
            
            // mongoose提供的findOneAndUpdate、findAndModify的两个方法，默认返回原始的数据，需要将new属性设置为true，返回更新后的数据
        },function(err){
            scope.errorMsg="数据库连接出错";
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(scope.errorMsg){return}
            scope.mongoData=data;
            scope.status=true;
        },function(err) {
            scope.errorMsg="收藏或取消收藏出错";
            scope.mongoData=null;
            scope.status=false;
        })
    }
    

    //添加文章点赞或取消
    * setArticleFav({articleId,uid,isAdd},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            uid=uid?mongoose.Types.ObjectId(uid):uid;
            articleId=articleId?mongoose.Types.ObjectId(articleId):articleId;
            // {$push:{"linkUser.fav":uid}}表示向 linkUser.fav字段的数组中添加uid，如果是$addToSet表示添加唯一值
            //new设置为true,数据库更新后会返回最新的值
            //updateOne不会默认返回更新数据或元数据，要用 findOneAndUpdate 才能返回更新数据或原数据
            if(isAdd){
                return BaseModel.ArticleSchema.findOneAndUpdate({_id:articleId},{$addToSet:{"linkUser.fav":uid}},{new:true});    
            }else{
                return BaseModel.ArticleSchema.findOneAndUpdate({_id:articleId},{$pull:{"linkUser.fav":uid}},{new:true});
            }
            
            // mongoose提供的findOneAndUpdate、findAndModify的两个方法，默认返回原始的数据，需要将new属性设置为true，返回更新后的数据
        },function(err){
            scope.errorMsg="数据库连接出错";
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(scope.errorMsg){return}
            scope.mongoData=data;
            scope.status=true;
        },function(err) {
            scope.errorMsg="点赞或取消点赞出错";
            scope.mongoData=null;
            scope.status=false;
        })
    }

    //关注某人
    * setUserAttention({authorId,uid,isAdd},scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(() => mongoose.startSession()).then(function(_session ) {
            session=_session;
            uid=uid?mongoose.Types.ObjectId(uid):uid;//主动关注的那个人
            authorId=authorId?mongoose.Types.ObjectId(authorId):authorId;//被关注的那个人

            session.startTransaction();
            scope.tempParam={uid,authorId,isAdd};


            if(scope.tempParam.isAdd){
                return BaseModel.UserSchema.findOneAndUpdate({_id:scope.tempParam.authorId},{$addToSet:{"linkUser.fans":scope.tempParam.uid}},{new:true,session:session});    
            }else{
                return BaseModel.UserSchema.findOneAndUpdate({_id:scope.tempParam.authorId},{$pull:{"linkUser.fans":scope.tempParam.uid}},{new:true,session:session});
            }
            
            
            // mongoose提供的findOneAndUpdate、findAndModify的两个方法，默认返回原始的数据，需要将new属性设置为true，返回更新后的数据
        },function(err){
            scope.errorMsg="数据库连接出错";
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(scope.errorMsg){return}
            scope.transStatus="success";
            if(scope.tempParam.isAdd){
                return BaseModel.UserSchema.findOneAndUpdate({_id:scope.tempParam.uid},{$addToSet:{"linkUser.attention":scope.tempParam.authorId}},{new:true,session:session});    
            }else{
                return BaseModel.UserSchema.findOneAndUpdate({_id:scope.tempParam.uid},{$pull:{"linkUser.attention":scope.tempParam.authorId}},{new:true,session:session});
            }
        },function(err) {
            scope.transStatus="error";
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(scope.transStatus=="success"){
                scope.transStatus="success";
                scope.mongoData=data;
                scope.status=true;
                return session.commitTransaction();    
            }else{
                scope.mongoData=null;
                scope.status=false;
                scope.transStatus="error";
                return session.abortTransaction();
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.transStatus="error";
            scope.errorMsg="关注失败";
            return session.abortTransaction();
        }).then(function(data) {
            return session.endSession();
        });
    }

    static getSearchFilter(val){
        var regExpVal,tagFilter,userFilter,commentFilter,articleFilter;
        var dynomicCommentKey=`linkUser.comment.${hotDefine.comment}`;//评论的回复数量超 hotDefine.comment
        var dynomicArticleKey=`linkUser.comment.${hotDefine.article}`;//文章评论数超 hotDefine.article

        regExpVal=new RegExp(`.*${val}.*`,"gi");
        tagFilter = {content:{$regex: regExpVal}};//标签中是否包含搜索词
        userFilter=[{userName:{$regex: regExpVal}}] ;//作者名称包含搜索词
        // userFilter=[{userName:{$regex: regExpVal}},{phone:{$regex: regExpVal}}] ;//作者名称或者手机号码中包含搜索词
        commentFilter={
            // "linkUser.comment":{$exists:1}
        };//评论的回复数量超一定值【评论比较热门】，就搜索该评论内容中是否包含搜索关键词

        //设置评论数一定的值，才能允许搜索文章内容，否则查询消耗太大
        //这里有一个搜索的bug，因为文章content保存的时候带入了html标签，所以查某些特殊字母是不准的
        //因为标签里面就有这些字母，所以需要前端做进一步的精确筛选，把标签删除后再匹配
        commentFilter[dynomicCommentKey]={$exists:1};
        commentFilter["content"]={$regex:regExpVal};
        

        //文章的评论数量超一定值【评论比较热门】，就搜索该评论内容中是否包含搜索关键词
        articleFilter=[{
            title:{$regex: regExpVal}
        },{
            // "linkUser.comment":{$exists:1}
            // "content":{$regex: regExpVal}
        }];
        articleFilter[1][dynomicArticleKey]={$exists:1};//设置评论数一定的值的文章，才能允许搜索它的内容，否则查询消耗太大
        articleFilter[1]["content"]={$regex:regExpVal};

        return {tagFilter,userFilter,commentFilter,articleFilter};
    }

    //搜寻后续要加权限验证和黑名单功能unfinish
    * searchInfoList(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var {searchInfo}=opts;
            var uid=opts.uid?mongoose.Types.ObjectId(opts.uid):opts.uid;
            var {type,val}=searchInfo;
            var dynomicRecommendUserKey=`linkUser.fans.${hotDefine.userRecommend}`;//文章评论数超 hotDefine.article
            var dynomicRecommendArticleKey=`linkUser.comment.${hotDefine.articleRecommend}`;//文章评论数超 hotDefine.articleRecommend
            var userFilter=[],commentFilter=[],articleFilter=[],valArr=[];
            var userFilterArr=[],commentFilterArr=[],articleFilterArr=[],tagFilterArr=[];
            var initFilter=KidsClassService.getSearchFilter(val);
            var tempFilter,tagFilter;//tagFilter千万别设置位数组，因为后面是通过if(tagFilter)来判断的，设置位数组会出错


            if(val.trim()){

                //整体搜索
                tagFilterArr.push(initFilter.tagFilter);
                commentFilterArr.push(initFilter.commentFilter);
                userFilterArr=userFilterArr.concat(initFilter.userFilter);
                articleFilterArr=articleFilter.concat(initFilter.articleFilter);

                //如果中间又空格，再分别搜索
                valArr=val.trim().split(" ").filter(function(item) {return (item||"").trim()});
                if(valArr.length>1){
                    valArr.forEach(function(item) {
                        tempFilter=KidsClassService.getSearchFilter(item.trim());
                        userFilterArr=userFilterArr.concat(tempFilter.userFilter);
                        articleFilterArr=articleFilterArr.concat(tempFilter.articleFilter);
                        commentFilterArr=commentFilterArr.concat(tempFilter.commentFilter);
                        tagFilterArr=tagFilterArr.concat(tempFilter.tagFilter);
                    });
                }

                //获得最终的搜索条件
                userFilter={$or:userFilterArr};
                articleFilter={$or:articleFilterArr};
                commentFilter={$or:commentFilterArr};
                tagFilter={$or:tagFilterArr};
                

                        
            }else{//查询内容为空，就返回推荐文章和推荐作者
                // userFilter={"linkUser.fans":{$exists:1}};
                userFilter={};
                userFilter[dynomicRecommendUserKey]={$exists:1};
                // articleFilter={"linkUser.comment":{$exists:1}};
                articleFilter={};
                articleFilter[dynomicRecommendArticleKey]={$exists:1};
            }


                
            if(type=="all"){

                    // BaseModel.CommentSchema.aggregate([{
                    //     $match:commentFilter
                    // },{
                    //     $lookup:{
                    //         from: "users",//需要连接的表名
                    //         localField: "linkUser.uid",//本表[articles表]需要关联的字段
                    //         foreignField: "_id",//被连接表需要关联的字段
                    //         as: "personInfo"//查询出的结果集别名
                    //     }
                    // },{
                    //     $project:{
                    //         time:1,
                    //         content:1,
                    //         personInfo:1
                    //     }
                    // }]),

                var allArr=[
                    BaseModel.UserSchema.aggregate([{
                        $match:userFilter
                    },{
                        $sort:{level:-1}
                    },{
                        $project:{
                            userName:1,
                            phone:1,
                            userPic:1,
                            linkUser:1
                        }
                    }]),
                    BaseModel.ArticleSchema.aggregate([{
                        $match:articleFilter
                    },{
                        $sort:{level:-1}
                    },{
                        $lookup:{
                            from: "users",//需要连接的表名
                            localField: "linkUser.uid",//本表[articles表]需要关联的字段
                            foreignField: "_id",//被连接表需要关联的字段
                            as: "personInfo"//查询出的结果集别名
                        }
                    },{
                        $project:{
                            time:1,
                            title:1,
                            content:1,
                            personInfo:1,
                            linkUser:1
                        }
                    }])
                ];
                if(tagFilter){
                    allArr.push(BaseModel.TagSchema.aggregate([{
                            $match:tagFilter
                        },{
                            $lookup:{
                                from: "articles",//需要连接的表名
                                localField: "linkArticle",//如果是数组，表示里面的每一项和foreignField的key关联
                                foreignField: "_id",//被连接表需要关联的字段
                                as: "articleInfo"//查询出的结果集别名
                            }
                        },{
                            $project:{
                                content:1,
                                linkUser:1,
                                articleInfo:1
                            }
                        }])
                    );
                }
                return Promise.all(allArr);
            }else if(type=="user"){
                return BaseModel.UserSchema.aggregate([{
                    $match:userFilter
                },{
                    $sort:{level:-1}
                },{
                    $project:{
                        userName:1,
                        phone:1,
                        userPic:1,
                        linkUser:1
                    }
                }]);
            }else if(type=="comment"){//查询回复超10个的评论
                //linkUser.comment存在且长度大于10【linkUser.comment.10表示linkUser.comment[10],如果它存在，那么长度肯定大于10】
                return BaseModel.CommentSchema.aggregate([{
                    $match:commentFilter
                },{
                    $lookup:{
                        from: "users",//需要连接的表名
                        localField: "linkUser.uid",//本表[articles表]需要关联的字段
                        foreignField: "_id",//被连接表需要关联的字段
                        as: "personInfo"//查询出的结果集别名
                    }
                },{
                    $project:{
                        time:1,
                        content:1,
                        personInfo:1,
                        linkUser:1
                    }
                }]);


            }else{//如果传的类型不对，按照文章查询：article
                //标题包含查询字符，或者评论超20的文章的内容中包含这个字符
                var allArr=[
                    BaseModel.ArticleSchema.aggregate([{
                        $match:articleFilter
                    },{
                        $lookup:{
                            from: "users",//需要连接的表名
                            localField: "linkUser.uid",//本表[articles表]需要关联的字段
                            foreignField: "_id",//被连接表需要关联的字段
                            as: "personInfo"//查询出的结果集别名
                        }
                    },{
                        $project:{
                            time:1,
                            title:1,
                            content:1,
                            personInfo:1,
                            linkUser:1
                        }
                    }])
                ];
                if(tagFilter){
                    allArr.push(
                        BaseModel.TagSchema.aggregate([{
                            $match:tagFilter
                        },{
                            $lookup:{
                                from: "articles",//需要连接的表名
                                localField: "linkArticle",//如果是数组，表示里面的每一项和foreignField的key关联
                                foreignField: "_id",//被连接表需要关联的字段
                                as: "articleInfo"//查询出的结果集别名
                            }
                        },{
                        //     $unwind : "$linkArticle"
                        // },{
                            $project:{
                                content:1,
                                linkUser:1,
                                articleInfo:1
                            }
                        }])
                    );
                }

                return Promise.all(allArr);
            }

        },function(err){
            scope.errorMsg="数据库连接出错";
            scope.mongoData=null;
            scope.status=false;
        }).then(function(data) {
            if(scope.errorMsg){return}
            scope.mongoData=data;
            scope.status=true;
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
        })
    }
    
    //添加评论点赞
    * setCommentFav(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var uid=opts.uid?mongoose.Types.ObjectId(opts.uid):opts.uid;
            var cid=opts.cid?mongoose.Types.ObjectId(opts.cid):opts.cid;
            var isAdd=opts.isAdd;
            // {$push:{"linkUser.fav":uid}}表示向 linkUser.fav字段的数组中添加uid，如果是$addToSet表示添加唯一值
            //new设置为true,数据库更新后会返回最新的值
            //updateOne不会默认返回更新数据或元数据，要用 findOneAndUpdate 才能返回更新数据或原数据
            if(isAdd){
                return BaseModel.CommentSchema.findOneAndUpdate({_id:cid},{$addToSet:{"linkUser.fav":uid}},{new:true});    
            }else{
                return BaseModel.CommentSchema.findOneAndUpdate({_id:cid},{$pull:{"linkUser.fav":uid}},{new:true});
            }
            
            // mongoose提供的findOneAndUpdate、findAndModify的两个方法，默认返回原始的数据，需要将new属性设置为true，返回更新后的数据
        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return}
            scope.mongoData=data;
            scope.status=true;
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="添加评论点赞出错";
        })
    }

    //通过Origin的category和targetId来寻找关联评论
    //例如传入{category:"2",targetId:文章id}；就可以查询和这个文章下的所有评论
    // 具体如何关联，schema.js中看commentSchema的linkOrigin字段的内部解释
    * getCommentListByOrigin(opts,scope) {
        let that=this;
        let db= mongoose.connect(dbURI,timeOut);//返回promise
        yield db.then(function(data) {
            var {_id,category}=opts;

            //添加用户级联
            var filter=[{
                $match:{"linkOrigin.targetId":_id}
            },{
                //含义：对上面match出的每条文档，去关联users表，
                //关联条件是match的文档中linkUser.uid和users表中的_id相同，让文档合并
                // 合并文档以CommentSchema的机构为基础，增加personInfo字段来放关联文档内容
                $lookup:{
                    from: "users",//需要连接的表名
                    localField: "linkUser.uid",//本表[articles表]需要关联的字段
                    foreignField: "_id",//被连接表需要关联的字段
                    as: "personInfo"//查询出的结果集别名
                }
            },{
                //级联被回复的评论的作者信息
                $lookup:{
                    from: "users",//需要连接的表名
                    localField: "linkOther.targetUserId",//本表[articles表]需要关联的字段
                    foreignField: "_id",//被连接表需要关联的字段
                    as: "repliedUserInfo"//查询出的结果集别名
                }
            },{
                //这里只是举例，其实没必要，每个字段都会用到
                $project:{//_id是默认自带的，所以不需要添加到里面，其他都需要添加
                    id:1,
                    time:1,
                    content:1,
                    level:1,
                    linkUser:1,
                    linkOther:1,
                    linkOrigin:1,
                    personInfo:1,
                    repliedUserInfo:1
                }
            }];


            //用管道和级联 $lookup，实现筛选+多表合并
            return BaseModel.CommentSchema.aggregate(filter);


            // 每个then里面的第一个function返回promise对象，实现链式调用
        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return}
            if(data){//索取所有关联到该文章下的评论列表[每条评论级联了对应的评论者信息]
                scope.mongoData=data;
                scope.status=true;  
            }else{
                scope.mongoData=null;
                scope.status=false;  
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="获取评论信息出错";
        })
    }



        
    //添加评论【category的类型不同，评论的类型也不同】
    // 需要同步到其他表，是事务，具有原子性，mongoose的事务插件是mongoose-transactions
    //如果category=="2",添加的是文章的评论，同时也产生了点赞者和文章的关联，
    // 需要给对应的文章的lingUser.comment添加信息
    * addComment(opts,scope) {//管道操作只用于查询数据和查询结果数据的修改，不涉及数据库修改
        debugger
        let that=this;
        let db= mongoose.connect(dbURI,timeOut);//返回promise
        yield db.then(() => mongoose.startSession()).then(function(_session ) {//category,targetId,origin
            debugger
            //自己的查询参数和业务逻辑处理
            var {uid,content,linkOther,level="1",linkOrigin}=opts;
            linkOther.targetId=linkOther.targetId?mongoose.Types.ObjectId(linkOther.targetId):linkOther.targetId;
            linkOther.targetUserId=linkOther.targetUserId?mongoose.Types.ObjectId(linkOther.targetUserId):linkOther.targetUserId;
            linkOrigin.targetId=linkOrigin.targetId?mongoose.Types.ObjectId(linkOrigin.targetId):linkOrigin.targetId;
            uid=uid?mongoose.Types.ObjectId(uid):uid;
            var originParam={
                time:+new Date(),
                content:content,
                level:level,
                linkUser:{
                    uid:uid//关联用户的id
                },
                linkOther,
                linkOrigin
            };
            var commentParam=Object.assign({},BaseModel.defaultComment,originParam);
            var articleParam=[{//找到_id为linkOther.targetId的文章，添加评论者id
                    _id:linkOther.targetId
                },{
                    $push:{"linkUser.comment":uid}
                }];
            //因为article和comment的表设计的时候雷同，所以它们的参数一样，但还是得分开写
            var linkCommentParam=[{_id:linkOther.targetId},{$push:{"linkUser.comment":uid}}]
            scope.tempParam={originParam,articleParam,linkCommentParam,commentParam};


            //使用说明：https://mongoosejs.com/docs/transactions.html
            session = _session;
            session.startTransaction();//开启
            //session.abortTransaction() 中断
            // session.commitTransaction()提交事务：一旦提交，事务就同步到数据库了
            // session.endSession() 停止
            //传入sesstion，是为了让在接下来的请求中，可以查到你对数据库的临时操作
            //否则的话你插入对数据库的操作都在事务的临时列表中，无法从数据库查到
            //只有commitTransaction以后，你的所有的操作，才会更新到数据库
            return BaseModel.CommentSchema.create([commentParam],{session});
            // new BaseModel.UserSchema({}).save()和BaseModel.UserSchema.create([{}])
            //创建的时候session传入方式和查询不同
            // BaseModel.CommentSchema.create([{ name: 'Test' }], { session: session });
            // return BaseModel.CommentSchema.findOne({ name: 'foo' }).session(session);


        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {//
            if(scope.errorMsg){return }
            scope.transStatus="transCommentSuccess";
            var originParam=scope.tempParam.originParam
            if(originParam.linkOther.category=="2"){//给对应文章添加评论人关联
                return BaseModel.ArticleSchema.findOneAndUpdate(scope.tempParam.articleParam[0],scope.tempParam.articleParam[1],{session:session,new:true});    
            }else if(originParam.linkOther.category=="4"){//给对应评论添加评论人关联
                return BaseModel.CommentSchema.findOneAndUpdate(scope.tempParam.linkCommentParam[0],scope.tempParam.linkCommentParam[1],{session:session,new:true});    
            }
            
            // return BaseModel.ArticleSchema.aggregate().session(session);
        },function(err) {
            scope.errorMsg="获取文章或评论信息出错";
            // 出错就终止事务
            scope.transStatus="transCommentError";
            return session.abortTransaction();
        }).then(function(data) {
            if(scope.transStatus!="transCommentError"){
                return session.commitTransaction();
            }else{
                return session.abortTransaction();
            }
            
        },function(err) {
            scope.transStatus="transArticleError";
            return session.abortTransaction();
        }).then((data) => {
            // if(data.ok!="1"){
            //     //事务失败的埋点
            // }
            scope.transStatus="transactionSuccess";
            return session.endSession();
        },function(err) {
            scope.transStatus="transactionFail";
            return session.endSession();
        }).then(function(data) {
            if(scope.transStatus=="transactionSuccess"){//事务成功
                var {targetId}=scope.tempParam.originParam.linkOrigin;
                // 如果category是1类型，targetId就是cid，源头是个人的说说
                // 如果category是2类型，targetId就是aid，源头是文章
                // 如果category是3类型，targedid就是uid，源头是别人的留言板
                // 如果category是5类型，targedid就是chartId，源头是图表

                //用管道和级联 $lookup，实现筛选+多表合并
                return BaseModel.CommentSchema.aggregate([{
                    // $match:{"linkOrigin":{targetId:targetId} 这样写是错误的，是全匹配的意思
                        $match:{"linkOrigin.targetId":targetId}//指向这篇文章的所有评论
                    
                    },{
                        //含义：对上面match出的每条文档，去关联users表，
                        //关联条件是match的文档中linkUser.uid和users表中的_id相同，让文档合并
                        // 合并文档以CommentSchema的机构为基础，增加personInfo字段来放关联文档内容
                        $lookup:{
                            from: "users",//需要连接的表名
                            localField: "linkUser.uid",//本表[articles表]需要关联的字段
                            foreignField: "_id",//被连接表需要关联的字段
                            as: "personInfo"//查询出的结果集别名
                        }
                    },{
                //级联被回复的评论的作者信息
                        $lookup:{
                            from: "users",//需要连接的表名
                            localField: "linkOther.targetUserId",//本表[articles表]需要关联的字段
                            foreignField: "_id",//被连接表需要关联的字段
                            as: "repliedUserInfo"//查询出的结果集别名
                        }
                    },{
                        //这里只是举例，其实没必要，每个字段都会用到
                        $project:{//_id是默认自带的，所以不需要添加到里面，其他都需要添加
                            id:1,
                            time:1,
                            content:1,
                            level:1,
                            linkUser:1,
                            linkOther:1,
                            linkOrigin:1,
                            personInfo:1,
                            repliedUserInfo:1
                        }
                    }
                ]);
                    
            }else{
                scope.mongoData=null;
                scope.status=false;
            }

        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="添加评论出错";
        }).then(function(data) {
            if(scope.errorMsg){return }
            if(data&&data.length){//索取所有关联到该文章下的评论列表[每条评论级联了对应的评论者信息]
                scope.mongoData=data;
                scope.status=true;  
            }else{
                scope.mongoData=null;
                scope.status=false;  
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
        })
    }




    //获取文章列表，登录不登陆无关紧要，关键看文章对那些人有“查看权限和评论权限”
    //{$exits:true},注意，这个只能是判断文档的第一级字段，不能判断内部的字段
    * getArticleListById(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            var{id,uid,needAccess}=opts;
            var idObj=(id&&id[0])?mongoose.Types.ObjectId(id[0]):id[0];
            var filter=null;
            uid=uid?mongoose.Types.ObjectId(uid):uid;//uid不存在的话，用mongoose.Types.ObjectId会报错，导致无法返回数据，最后导致前端获取不到数据，产生js错误
            if(needAccess){//鉴权功能有待验证，功能开没开发
                var filter1={
                    _id:idObj,
                    linkUser:{//accessViewUser数组中存在all或uid的数据
                        accessViewUser:{$elemMatch:{$in:['all',uid]}}
                    }
                    // accessViewUser::筛选出accessViewUser数组中包含all的数据
                };
                var filter2={
                    _id:idObj,
                    linkUser:{
                        uid:uid
                    }
                }
                var rstFilter={$or:[filter1,filter2]}
            }else{
                var filter1={
                    _id:idObj
                };
                var rstFilter=filter1;
            }
                
            let articleModel=BaseModel.ArticleSchema;

            filter=[{
                $match:rstFilter
            
            },{
                //含义：对上面match出的每条文档，去关联users表，
                //关联条件是match的文档中linkUser.uid和users表中的_id相同，让文档合并
                // 合并文档以CommentSchema的机构为基础，增加personInfo字段来放关联文档内容
                $lookup:{//获取文章作者的信息
                    from: "users",//需要连接的表名
                    localField: "linkUser.uid",//本表[articles表]需要关联的字段
                    foreignField: "_id",//被连接表需要关联的字段
                    as: "personInfo"//查询出的结果集别名
                }
            }];

            return articleModel.aggregate(filter);



        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return }
            if(data.length){
                scope.mongoData=data;
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="获取文章列表出错";
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
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return }
            if(data.length){
                scope.mongoData=data;
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="获取文章内容出错";
        });
    }


    * getUserInfo(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            let userModel=BaseModel.UserSchema;
            return userModel.find(opts);
        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return }
            if(data&&data.length){
                scope.mongoData=data;
            }else{
                scope.mongoData=null;
                scope.errorMsg="帐号或密码错误";
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="获取用户信息出错";
        });
    }



    * checkUserInfo(opts,scope) {
        let db=mongoose.connect(dbURI,timeOut);
        yield db.then(function(data) {
            let userModel=BaseModel.UserSchema;
            opts.passward=auth.hash(opts.passward,config.auth.shaKey);//对密码用sha256不可逆算法加密
            return userModel.find(opts);
        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return }
            if(data&&data.length){
                scope.mongoData=data;
            }else{
                scope.errorMsg="账户名或密码错误";
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="获取用户信息出错";
        });
    }

    


    * registUser(opts,scope) {
        let that=this;
        let db= mongoose.connect(dbURI,timeOut);//返回promise
        yield db.then(function(data) {
            let queryArray= [{phone:opts.phone},{userName:opts.userName}]; //或条件，属性要分开写
            let userModel=BaseModel.UserSchema;
            return userModel.find({
                $or:queryArray
            });

            // 每个then里面的第一个function返回promise对象，实现链式调用
        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return }

            if(!data.length){//save效率低，最号用于修改，别用于插入数据
                opts.passward=auth.hash(opts.passward,config.auth.shaKey);//对密码用sha256不可逆算法加密
                return new BaseModel.UserSchema(Object.assign({},BaseModel.defaultUser,opts)).save();//是个promise
            }else{
                scope.mongoData=data;
                scope.status=false;
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="注册条件查询出错";
        }).then(function(data) {
            if(scope.errorMsg){return }
            if(!scope.mongoData){
                
                scope.mongoData=data;
                scope.status=true;
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="注册失败";
        })
    }



    * addArticle(opts,scope) {
        let that=this;
        let db= mongoose.connect(dbURI,timeOut);//返回promise
        yield db.then(function(data) {
            var uid=opts.id?mongoose.Types.ObjectId(opts.id):opts.id;
            var {tags=[]}=opts;
            var obj={
                title:opts.title,
                content:opts.content,
                linkUser:{
                    uid:uid//关联用户的id
                }
            };
            scope.tempParam={tags,uid};
            return new BaseModel.ArticleSchema(Object.assign({},BaseModel.defaultArticle,{time:Date.now()},obj)).save();//是个promise

            // 每个then里面的第一个function返回promise对象，实现链式调用
        },function(err){
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="数据库连接出错";
        }).then(function(data) {
            if(scope.errorMsg){return;}
            if(!data.length){//save效率低，最号用于修改，别用于插入数据
                scope.mongoData=data;
                scope.status=true;
                scope.tempParam.articleId=data._id;
                // scope.tempParam.tags
                if(scope.tempParam.tags.length){
                    scope.needTagsStatus=true;
                    scope.tagsStatus=false;
                    return BaseModel.TagSchema.find({content:{$in:scope.tempParam.tags}});//or和in别搞错
                }

            }else{
                scope.mongoData=null;
                scope.status=false;
            }
        },function(err) {
            scope.mongoData=null;
            scope.status=false;
            scope.errorMsg="文章更新出错";
        }).then(function(data) {
            if(scope.errorMsg){return;}
            scope.existsTags=[];//标签已经存在，只需要插入articleId的tags
            var needBeCreatedTags=scope.tempParam.tags;
            if(data&&data.length){//有的标签已存在，需要重新梳理需要新建的标签
                needBeCreatedTags=scope.tempParam.tags.filter(function(item,idx) {
                    var tempObj=null;
                    var isExist = (data||[]).some(function(subItem) {
                        if(subItem.content==item){
                            tempObj=subItem;
                        }
                        return subItem.content==item
                    });
                    isExist&&scope.existsTags.push(tempObj);
                    return !isExist
                });
            }
            
            var addTagsOptions=[];
            var updateTagsOptions=[];
            needBeCreatedTags.forEach(function(item) {
                addTagsOptions.push(Object.assign({},BaseModel.defaultTag,{"content":item,linkArticle:[scope.tempParam.articleId]}));
            });
            scope.existsTags.forEach(function(item) {
                updateTagsOptions.push({id:item._id});//别用id，id是字符串，_id才是正确的key
            });
            var tm=db.tags;

            // BaseModel.TagSchema.db.collections.tags.findAndModify
            return Promise.all([//BaseModel.TagSchema.db是原生db
                BaseModel.TagSchema.updateMany({$or:updateTagsOptions},{$addToSet:{"linkArticle":scope.tempParam.articleId}},{new:true}),
                BaseModel.TagSchema.create([...addTagsOptions])//{new:true}
            ]);
            //updateMany不能返回更新后的最新数据，mongoose也没有类似mongodb的findAndModify方法，算了，搞了半天找不到解决方案
            // 直接多查一次得了
        },function(err) {
            scope.tagsStatus=false;
            scope.tagsData=null;
            scope.errorMsg="标签查找出错";
        }).then(function(data=[]) {
            if(scope.errorMsg){return;}
            scope.tagsStatus=true;
            scope.tagsData = data;
            
        },function(err) {
            scope.errorMsg="标签更新或创建出错";
            scope.tagsStatus=false;
            scope.tagsData=null;
        })
    }
}


module.exports = KidsClassService
