let mongoose=require("mongoose");//require("mongodb")

var Schema = mongoose.Schema;

//最主要的功能尽量能快速1次或2次查询找到，非主要功能尽量碎片化【多集合】，以保证可拓展性
//主要功能：人，文章，文章评论|说说|留言|回复评论，图标的增删改查
//数据库最好的逻辑：修改一个实体，这个实体的所有外键关联它的所有信息，只根据外键就可以同步所有，不然东改西改逻辑容易乱！！

// 所有的操作，都是先获取当前操作实体的id，然后通过它的所有外键，去同步信息：

/*
 所有的操作，都是以实体为中心，用外键关联来同步到其他实体；这样只要关注1件事情，实体改变，关联实体内信息是否全部同步到位
 用一个实体作为 
*/

// ！！！删除操作是最麻烦的，因为实体之间有链接，如果删一个，另外的链接如何关联处理，跟着删肯定不行！！！！
// 删除操作，人不能删，其他实体删除，只打一个disable标签，数据仍然存在，遇到disable实体就做特殊展示，包括关联外键的特殊展示



// 1.文章： 文章分可修改和不可修改2个类型
//         增：文章集合内插入；uid和atuid【同步人的信息】；
//         删：文章集合内删除；然后看其他表的关联项里是否涉及到这个数据，有的话就要关联
//         改：文章集合内修改;然后看其他表的关联项里是否涉及到这个数据，有的话就要关联
//         查：文章集合通过id|其他外键|标签，找文章；然后根据文章id，关联所有外键【文章下评论串联需要前端自己串】
// 2.评论：评论不可修改
//         增:评论类型中插入评论；link>targetId,link>originId,uid,atuid关联同步信息【人和文章的同步，自身同步】
//         删：~
//         查和改：都不做

// 3.用户：不可删，但可禁用，分权限等级【关联文章操作权限，文章上热搜权限 等各种权限，预留接口】
//         增：添加用户，默认引导界面添加“外键”关联
//         删：不需要做，没见过那个网站还能删自己帐号的
//         改：实体内容+关联外键【一大堆】
//         查：通过id或者其他属性，查找某个人；然后根据文章id，关联所有外键【文章下评论串联需要前端自己串】

// 4.图表：增删改查都是通过先操作图表，然后根据里面的外键，来同步关联实体


// schema里面的属性和字段，数据库是会校验的，C++语言级别的校验，
// 但是用户基数过大，那么大量的增|改操作，以为数据的校验导致性能出问题

/*
关键的核心
    1.每次操作实体，首先修改实体本身，然后列出和自己有关联的其他所有表，看其他表的关联项中是否要更新
    2.实体与实体之间，一般只要单向关联即可，这样完全可以做到功能的需要；
      单向关联的好处是，操作实体，不需要修改其他关联表；以操作最频繁的表为主，也就是
      在操作最频繁的那个表中添加关联key，可以减少常用功能对应的操作次数
    3.表和表之间做了双向关联，有点是查询方便，一张表包括了所有基本信息；
      但缺点也很明显，操作一张表的实体，还需要同步到关联表，而且这个是原子操作
      也就是必须通过事务来实现双向关联的表
*/


/*mongodb默认值设置注意事项：
    1.设置了default,就不需要设置required了，因为不管有没有传，因为没传就用default，所以就不存在需要不需要，肯定有值
    2.如果设置了required，但是没有设置default，也没有传入，那么数据库就会校验报错
    3.对象里面属性的默认值试了一下，设置是没有效果的，传入就会覆盖；不传入的话数据库也不会自动创建默认值
    4.表内的unique:true的字段不要轻易删，不然后续添加的会一直报之前删除的哪个键重复，因为每次插入都是空，空值相同
      解决办法个人猜测时更新”集合“；
    5.如果一个字段设置了unique，那他肯定是require
    6.default的意思是，这个key的数值不放在表里，如果有人请求这个字段，那就从获取默认字段还给他
      默认字段的货期是动态的，比如设置默认字段值是Date.now()，那么以后每次获取，都是再获取的时候
      执行Date.now()，然后返回这个值，所以这个压根就不是不变的默认值，所以设置默认值
      别用动态的js计算，里面有变量的话，每次都不一样

      deafult值是不能用于find条件查找的，所以要设置条件查找的默认值，还是得用Object.assign(default对象)
*/


/*----------------------------------------user start-------------------------------------------------------*/
//mongodb支持populate填充设置多表嵌套关联，mongoose用populate实现，前提是表中设置ref
//涉及到改数据库，还是算了，其实；性能上还是$lookup比较好，但是只能双表关联
var userSchema=new Schema({//用系统自己产生的id，保证唯一性，返回数据的时候带上id
    timeStamp:{//时间动态码，每次用户登录，先获取动态码，然后返回管客户端，再次ajax请求
               //通过用户名+密码+动态码校验，正确后就设置最新动态码，修改完后然后执行登录态记录
        type:Number
    },
    time:{
        type:Number
    },
    passward:{
        type:String,
        required:true//require为true的数据，在传入数据库的时候必须要有，如果没有，就会报错
    },
    userName:{//用户名|网名|昵称|花名【唯一，大家网名不能相互重复】：注册时可以不填写，后续添加：因为名称唯一性容易重复导致用户体验下降
        type:String,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    name:{//真实姓名
        type:String,
        default:""
    },
    age:{
        type:String,
        default:""
    },
    sex:{
        type:String,
        default:""
    },

    userPic:{
        type:String,
        default:"/upload/default.png"//用户没有头像就用默认图片做头像
    },

    level:{//个人的等级，等级越高，主页展示得越考前：这个等级通过文章的linkUser和linkComment综合评分，得到一个等级
        type:Number,
        default:1
    },

    categroy:{//用户的不同种类，区分不同的权限，后续再设置,默认权限1，正常用户
        // type:[Schema.Types.Integer],
        type:String,
        default:"1"
    },
    
    
    //关联的所有用户
    linkUser:{
        type:Object,
        properties:{
            fans:{//粉丝  不需要，fans和attention只需要一个，不需要双向关联
                type:Array//uid
            },
            attention:{//关注哪些人
                type:Array//uid
            },
            blackList:{//黑名单
                type:Array//uid
            },
            specialAttention:{//特别关注
                type:Array//uid
            }
        }
    }
});

/*----------------------------------------user end-------------------------------------------------------*/






/*----------------------------------------article start-------------------------------------------------------*/

//文章【不包含说说，评论，留言板留言等，只是文章】
var articleSchema=new Schema({
    time:{//文章写的时间
        type:Number,
        required:true
    },
    title:{//标题
        type:String,
        required:true
    },
    content:{//内容
        type:String,
        required:true
    },
    tag:{//标签
        type:Array
    },

    //默认不鉴权，所以筛选条件中不需要添加accessViewUser|accessCommentUser
    //一旦用户开启鉴权，需要给accessViewUser|accessCommentUser设置all或者特定的人
    //这样下次访问这篇文章，遇到needAccess为true，才能通过accessViewUser|accessCommentUser
    //数组内对应的值来判断是否能让用户访问
    needAccess:{//true表示需要鉴权才能查看，这个参数查询的时候要带过来；
        type:Boolean
    },
    categroy:{//文章的类型，类型1表示默认文章，无类型；2表示技术分享；3每日复盘；4表示热点讨论
        type:String,
        default:"1"
    },

    level:{//文章的等级，等级越高，主页展示得越考前：这个等级通过文章的linkUser和linkComment综合评分，得到一个等级
        type:Number,
        default:1
    },

    //--------------------------下面是关联数据----------------------------------

    
    linkUser:{
        type:Object,
        required:true,
        properties:{
            uid:{//去关联用户表：谁写的 
                type:mongoose.Types.ObjectId,//mongodb的compass中查看
                required:true
            },

            accessViewUser:{//数组中出现"all"，表示所有都可以查看，
                type:Array
            },
            accessCommentUser:{//数组中出现"all"，表示所有都可以查看，
                type:Array
            },
            fav:{//点赞 ：uid
                type:Array
            },
            collect:{//收藏 ：uid
                type:Array
            },
            relay:{//转发 ：uid
                type:Array
            },
            comment:{//评论的人：uid
                type:Array
            },
            atList:{//评论的@相关人员，atId主动at的人；atedId是被at的人
                type:Array//{atId,atedId,atType：2表示文章的at，4表示评论的at}
            }
        }
    }

});




/*----------------------------------------article end-------------------------------------------------------*/







/*----------------------------------------comment start-------------------------------------------------------*/


/*短文：因为这个量非常大，所以需要单独拎出来，不能和文章放在一个集合里面
    1.“个人说说”：没针对谁，自己发的说说，
    2.“文章评论：针对文章的第一层留言，人与人之间回复不算”，
    3.“留言板留言：针对某个人，是某人留言板下的1级留言，”，
    4.“评论回复”：就是2级+的评论【上面123都是1级评论】
    5.“图表留言”：针对图表的第一层留言
 
 注意：
     1.这个表的linkOther必须建立索引，查询非常多，量也大，所以需要的索引的内存也很大
     如果有1亿的数据，索引内存大小是： 2^32 = 4G；【每个用户平均万级别数据条数；1亿用户】
     所以万亿级别的表就是极限了【到时候看下建立索引需要多大内存】
     2.人物，文章，图表的删除操作逻辑都不复杂，也好操作；
        但评论的增加和删除，必须有一个复杂，另外一个才好操作；
        新增较多删除少，所以新增做简单，删除做复杂；
        方案1：删除的时候，评论下面所有的评论，要一级一级关联【前端做关联：列出所有下级评论id】；
             最后统一发达数据库做批量删除；这样的话，别人下面的评论不明所以就不见了
             体验不好
        方案2：单独删除当前评论，级联下面所有的评论【前端做关联：列出所有下级评论id】，
               统一给下面所有的评论的linkOther添加属性isDelete，告诉它父节点被删除；
               同时数据库每隔一段时间执行删除linkOther.isDelete是true的comment文档
*/
var commentSchema=new Schema({//自动产生的id为cid，就是评论id
    time:{//文章写的时间
        type:Number
    },
    content:{//内容
        type:String,
        required:true
    },

    level:{//评论等级，等级越高，文章内展示得越靠前：这个等级通过linkUser和linkOther综合评分，得到一个等级
        type:Number,
        default:1
    },

    //--------------------------下面是关联数据----------------------------------

    linkUser:{
        type:Object,
        required:true,
        properties:{
            uid:{//谁写的 
                type:mongoose.Types.ObjectId,//mongodb的compass中查看
                required:true
            },
            fav:{//点赞 ：uid
                type:Array
            },
            collect:{//收藏 ：uid
                type:Array
            },
            relay:{//转发 ：uid
                type:Array
            },
            comment:{//评论的人：uid
                type:Array
            },
            atList:{//评论的@相关人员，atId主动at的人的id；atedId是被at的人的id:atId和上面的uid一样，就是作者主动at别人
                type:Array//{atId,atedId,atType：2表示文章的at，4表示评论的at}
            }
        }
    },

    //链接的父元素节点：一条评论只会有一个外部关联项，也就是只有一个category类型
    // 通过linkOrigin，前端就可以串联出某篇文章下的所有评论数据和关系
    // 前端需要通过遍历树操作，才能把所有评论串起来，前端逻辑比较复杂，但为了数据库的简化+可拓展性，是值得的
    // linkOther改名为linkParent比较恰当，但业务写好了没法改了
    linkOther:{//
        type:Object,
        required:true,
        properties:{
            category:{
            //这条评论自己的类别:[1,2,3,4,5:详细介绍见下面]【注意这个和linkOrigin要区分】
            // 这里的category是评论自身的属性，不是它的关联节点的属性；
            // 没有必要知道关联节点的属性
                type:String,
                required:true
            },
            targetId:{//被回复方【article|comment】的id：针对的哪个目标的“回复|评论”
                // 如果category是1类型，targetId就是自己个人的uid；【放自己说说列表】
                // 如果category是2类型，targetId就是aid，放到对应文章下面
                // 如果category是3类型，targedid就是其他人的uid【放对方留言板1级留言】
                // 如果category是4类型，targedid就是cid，放到其他评论的下面
                // 如果category是5类型，targedid就是chartId，放到对应图表下面
                type:mongoose.Types.ObjectId,//mongodb的compass中查看
                required:true
            },
            targetUserId:{//被回复方的用户Id
                type:mongoose.Types.ObjectId,
                required:true
            }
        }
    },

    //这条评论的源头是哪里：他和linkOther的category字段意义不同，别混淆
    //这个字段是为了方便数据的查找，找到源头就可以找出所有下面的评论，接下来由前端去串联
    //如果没有这个字段，那么评论就要在后台一级一级地串联，非常耗费性能。
    linkOrigin:{//
        type:Object,
        required:true,
        properties:{
            category:{//这条评论的源头的类型:[1,2,3,4,5:详细介绍见下面]
                type:String,
                required:true
            },
            targetId:{//属于的那个源头的id
                // 如果category是1类型，targetId就是cid，源头是个人的说说
                // 如果category是2类型，targetId就是aid，源头是文章
                // 如果category是3类型，targedid就是uid，源头是别人的留言板
                // 如果category是5类型，targedid就是chartId，源头是图表
                type:mongoose.Types.ObjectId,//mongodb的compass中查看
                required:true
            }
        }
    }

});


/*----------------------------------------comment end-------------------------------------------------------*/



/*----------------------------------------tag start-------------------------------------------------------*/

//标签系统:追踪文章类型，当前热搜【热度，和持续时间】
var tagSchema=new Schema({
    startTime:{//标签新建的时间
        type:Number,
        required:true
    },
    latestTime:{//标签最新被别人添加的时间
        type:Number,
        required:true
    },
    content:{//内容
        type:String,
        required:true
    },

    categroy:{//文章的类型，类型1表示默认文章，无类型；2表示技术分享；3每日复盘；4表示热点讨论
        type:String,
        default:"1"
    },

    level:{//标签等级，等级越高，各种业务展示的优先级越高
        type:Number,
        default:1
    },

    //--------------------------下面是关联数据----------------------------------

    
    linkArticle:{//cid
        type:Array
    },
    linkUser:{//uid
        type:Array
    },

});

/*----------------------------------------tag end-------------------------------------------------------*/




/*----------------------------------------chart start-------------------------------------------------------*/

//图表：结构和文章基本一样，只是标题非必须
var chartSchema=new Schema({
    time:{//时间
        type:Number
    },
    title:{//图标可以没有标题，也可以有
        type:String,
        default:""
    },
    content:{//图表数据内容，转成字符串
        type:String,
        required:true
    },
    tag:{//标签
        type:Array
    },
    categroy:{//文章的类型，类型1表示默认图表【以后可增加各种类型图表】
        type:String,
        default:"1"
    },

    level:{//图表的推送等级，等级越高，展示得越靠前：这个等级通过图表的linkUser和linkComment综合评分，得到一个等级
        type:String,
        default:"1"
    },

    //--------------------------下面是关联数据----------------------------------
    linkUser:{
        type:Object,
        required:true,
        properties:{
            uid:{//去关联用户表：谁写的 
                type:mongoose.Types.ObjectId,//mongodb的compass中查看
                required:true
            },
            fav:{//点赞 ：uid
                type:Array
            },
            collect:{//收藏 ：uid
                type:Array
            },
            relay:{//转发 ：uid
                type:Array
            },
            comment:{//评论的人：uid
                type:Array
            },
            atList:{//评论的@相关人员，atId主动at的人；atedId是被at的人
                type:Array//{atId,atedId,atType：2表示文章的at，4表示评论的at,5表示图表的at}
            }
        }
    }
});


/*----------------------------------------char end-------------------------------------------------------*/



/*----------------------------------------热度评分表 不做了，没必要做那么好，又不是靠这个赚钱，只是练习而已 start-------------------------------------------------------*/

//热门推荐系统：产生热门作者和热门文章
//每次点击的时候，都需要操作修改统计表，所以不能放在主表，以免操作过于频繁
//每次热度值变化，任何点赞，评论，转发，收藏，点击文章，都会涉及文章热度变化，都要查询表
// 所以必须独立出来，否则对内容表的操作太频繁，容易卡死

// var hotArticleSchema=new Schema({
//     aid:"文章id",
//     uid:"作者id",
//     uv:[{uid:"",pv:[time,time,...]},{uid:"",pv:[time,time,...]}],
//     fav:[{uid:"",time:""},{uid:"",time:""}],
//     collect:[{uid:"",time:""},{uid:"",time:""}],
//     comment:[{uid:"",list:[{cid,time}]},{uid:"",list:[{cid,time}]}],
//     cotalHot:"总体热度",
//     curHot:"当前热度"//设置最近的某段时间内的累计热度
// });


// //用户推荐较少，所以依赖于其他表的搜索，内部不添加实体信息；热度逻辑在返回客户端信息后再计算统计
// var hotUserSchema=new Schema({//计算总分需要查hotArticleSchema表【获取文章评分】+user表【获取粉丝评分】
//     uid:"用户id",
//     totalHot:100,//总体热度【粉丝权重可设置】：粉丝+所有文章评分累计
//     curHot:10//最近热度【时间宽度可设置】：最近一段时间粉丝增量+最近一段时间文章评分累计
// });

/*----------------------------------------热度评分表 end-------------------------------------------------------*/




//必须的不传会报错，非必须的都给默认值，这样创建的时候就比较方便，用不到defaultUser，因为数据库里设置了
let defaultUser={//用系统自己产生的id，保证唯一性，返回数据的时候带上id
    timeStamp:Date.now(),
    time:Date.now()//注册时间
    // passward:"",//必须前端传入
    // userName:"",//必须前端传入
    // phone:"",//必须前端传入
    
    // //关联的所有用户
    // linkUser:{
    //     fans:[],
    //     attention:[],
    //     blackList:[],
    //     specialAttention:[]
    // }
}


//新建文章的默认蓝本
var defaultArticle={//这个是服务器启动时间，不是实时的时间
    time:Date.now()
    // title:"",//必须前端传入
    // content:"",//必须前端传入
    // tag:[],
    // linkUser:{
    //     uid:"",//必须后端传入
    //     fav:[],
    //     collect:[],
    //     relay:[],
    //     comment:[],
    //     atList:[]
    // }
};


var defaultComment={
    time:Date.now()
    // time:Date.now(),
    // content:"",//必须前端传入
    // linkUser:{
    //     uid:""//必须前端传入
    // },
    // linkOther:{
    //     category:0,//必须前端传入
    //     targetId:""//必须前端传入
    // }
    // linkOrigin:{
    //     category:0,//必须前端传入
    //     targetId:""//必须前端传入
    // }
};


//新建图表的时候用到
var defaultChart={
    time:Date.now()
    // time:Date.now(),
    // title:"",
    // content:"",//必须前端传入
    // tag:[],
    // linkUser:{
    //     uid:"",//必须前端传入
    //     fav:[],
    //     collect:[],
    //     relay:[],
    //     comment:[],
    //     atList:[]
    // }
};

var defaultTag={
    startTime:Date.now(),
    latestTime:Date.now()
    // time:Date.now(),
    // title:"",
    // content:"",//必须前端传入
    // tag:[],
    // linkUser:{
    //     uid:"",//必须前端传入
    //     fav:[],
    //     collect:[],
    //     relay:[],
    //     comment:[],
    //     atList:[]
    // }
};



userSchema = mongoose.model('User',userSchema ); 
articleSchema = mongoose.model('Article',articleSchema ); 
commentSchema = mongoose.model('Comment',commentSchema ); 
chartSchema = mongoose.model('Chart',chartSchema ); 
tagSchema = mongoose.model('Tag',tagSchema ); 

module.exports= {tagSchema,userSchema,articleSchema,commentSchema,chartSchema,defaultUser,defaultArticle,defaultComment,defaultChart,defaultTag};










    //关联的所有图表：chart实体中有了，这里没必要做反向关联
    // linkChart:{
    //     type:Object,
    //     properties:{
    //         content:{//自己有哪些图表
    //             type:Array//图标的chartid的列表
    //         },
    //         fav:{//点赞的图表
    //             type:Array
    //         },
    //         collect:{//收藏的图表
    //             type:Array
    //         },
    //         relay:{//转发的图表
    //             type:Array
    //         },
    //         atList:{
    //             type:Array//自己at别人的图表【文章可以是别人的，也可以是自己的】
    //             // 数组内是对象，别人at我的信息是否已读用isRead，
    //             // 用于用户登录的时候或实时提醒用户浏览“未读信息”
    //             // {atType：2表示文章的at，4表示评论的at，atId：内容对应的id,isRead：是否已读}
    //         },
    //         atedList:{
    //             type:Array//别人at自己的图表【文章可以是别人的，也可以是自己的】
    //         }
    //     }
    // },

    //关联的所有文章：article实体中有了，这里没必要做反向关联
    // linkArticle:{
    //     type:Object,
    //     properties:{
    //         content:{ //自己的文章
    //             type:Array//aid
    //         },
    //         fav:{
    //             type:Array
    //         },
    //         collect:{
    //             type:Array
    //         },
    //         relay:{
    //             type:Array
    //         },
    //         atList:{
    //             type:Array
    //         },
    //         atedList:{
    //             type:Array
    //         }
    //     }
    // },

    //关联的所有评论：comment实体中有了，这里没必要做反向关联
    // linkComment:{
    //     type:Object,
    //     properties:{
    //         content:{//自己写的所有“文章评论|回复评论|说说|留言板评论”
    //             type:Array//cid
    //         },
    //         fav:{//我收藏点赞的所有评论
    //             type:Array
    //         },
    //         collect:{
    //             type:Array
    //         },
    //         relay:{
    //             type:Array
    //         },
    //         atList:{
    //             type:Array
    //         },
    //         atedList:{
    //             type:Array
    //         },
    //         msgboard:{//留言板，谁给我留言了
    //             type:Array//cid
    //         }
    //     }
    // }












        // //关联评论：没必要做反向关联，评论里面已经包含对应关联文章的id
    // linkComment:{
    //     type:Array//[{type:2|4,contentId:aid|cid}],type=2表示文章的1级评论，type=4表示评论回复
    // }









        //关联评论：图表下的所有评论：没必要反向关联，comment中已经有关联项了
    // linkComment:{
    //     type:Array//[{type:2|4,contentId:aid|cid}],type=5表示图表的1级评论，type=4表示评论回复
    // }
