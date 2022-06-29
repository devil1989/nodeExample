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
//         删：文章集合内删除；根据里面所有外键来同步信息【这个最复杂，所以淘股吧没做】
//         改：文章集合内修改，根据文章的id；修改文章content和title和tag，时间自动更新；
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








/*mongodb默认值设置注意事项：
    1.设置了default,就不需要设置required了，因为不管有没有传，因为没传就用default，所以就不存在需要不需要，肯定有值
    2.如果设置了required，但是没有设置default，也没有传入，那么数据库就会校验报错
    3.对象里面属性的默认值试了一下，设置是没有效果的，传入就会覆盖；不传入的话数据库也不会自动创建默认值
    4.表内的unique:true的字段不要轻易删，不然后续添加的会一直报之前删除的哪个键重复，因为每次插入都是空，空值相同
      解决办法个人猜测时更新”集合“；
    5.如果一个字段设置了unique，那他肯定是require
*/


/*----------------------------------------user start-------------------------------------------------------*/

var userSchema=new Schema({//用系统自己产生的id，保证唯一性，返回数据的时候带上id
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

    categroy:{//用户的不同种类，区分不同的权限，后续再设置,默认权限1，正常用户
        // type:[Schema.Types.Integer],
        type:String,
        default:"1"
    },
    
    
    //关联的所有用户
    linkUser:{
        type:Object,
        properties:{
            fans:{//粉丝
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
    },

    //关联的所有图表
    linkChart:{
        type:Object,
        properties:{
            content:{//自己有哪些图表
                type:Array//图标的chartid的列表
            },
            fav:{//点赞的图表
                type:Array
            },
            collect:{//收藏的图表
                type:Array
            },
            relay:{//转发的图表
                type:Array
            },
            atList:{
                type:Array//自己at别人的图表【文章可以是别人的，也可以是自己的】
            },
            atedList:{
                type:Array//别人at自己的图表【文章可以是别人的，也可以是自己的】
            }
        }
    },

    //关联的所有文章
    linkArticle:{
        type:Object,
        properties:{
            content:{ //自己的文章
                type:Array//aid
            },
            fav:{
                type:Array
            },
            collect:{
                type:Array
            },
            relay:{
                type:Array
            },
            atList:{
                type:Array
            },
            atedList:{
                type:Array
            }
        }
    },

    //关联的所有评论
    linkComment:{
        type:Object,
        properties:{
            content:{//自己写的文章评论|回复评论|说说|留言板评论
                type:Array//cid
            },
            fav:{
                type:Array
            },
            collect:{
                type:Array
            },
            relay:{
                type:Array
            },
            atList:{
                type:Array
            },
            atedList:{
                type:Array
            },
            msgboard:{//留言板，谁给这个人留言了
                type:Array//cid
            }
        }
    }
});


//必须的不传会报错，非必须的都给默认值，这样创建的时候就比较方便，用不到defaultUser，因为数据库里设置了
let defaultUser={//用系统自己产生的id，保证唯一性，返回数据的时候带上id
    // passward:"",//必须前端传入
    // userName:"",//必须前端传入
    // phone:"",//必须前端传入
    
    // //关联的所有用户
    // linkUser:{
    //     fans:[],
    //     attention:[],
    //     blackList:[],
    //     specialAttention:[]
    // },

    // //关联的所有图表
    // linkChart:{
    //     content:[],
    //     fav:[],
    //     collect:[],
    //     relay:[],
    //     atList:[],
    //     atedList:[]
    // },

    // //关联的所有文章
    // linkArticle:{
    //     content:[],
    //     fav:[],
    //     collect:[],
    //     relay:[],
    //     atList:[],
    //     atedList:[],
    //     msgboard:[]
    // },

    // //关联的所有评论
    // linkComment:{
    //     content:[],
    //     fav:[],
    //     collect:[],
    //     relay:[],
    //     atList:[],
    //     atedList:[],
    //     msgboard:[]
    // }
}

/*----------------------------------------user end-------------------------------------------------------*/







/*----------------------------------------article start-------------------------------------------------------*/

//文章【不包含说说，评论，留言板留言等，只是文章】
var articleSchema=new Schema({
    time:{//文章写的时间
        type:Number,
        default:Date.now()
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

    categroy:{//文章的类型，类型1表示默认文章，无类型；2表示技术分享；3每日复盘；4表示热点讨论
        type:String,
        default:"1"
    },

    level:{//文章的等级，等级越高，主页展示得越考前：这个等级通过文章的linkUser和linkComment综合评分，得到一个等级
        type:String,
        default:"1"
    },

    //--------------------------下面是关联数据----------------------------------

    
    linkUser:{
        type:Object,
        required:true,
        properties:{
            uid:{//去关联用户表：谁写的 
                type:String,
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
                type:Array//{atId,atedId,atType：2表示文章的at，4表示评论的at}
            }
        }
    },

    //关联评论：文章下的所有评论
    linkComment:{
        type:Array//[{type:2|4,contentId:aid|cid}],type=2表示文章的1级评论，type=4表示评论回复
    }
});


//新建文章的默认蓝本
var defaultArticle={
    // time:Date.now(),
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
    // },
    // linkComment:[]
};

/*----------------------------------------article end-------------------------------------------------------*/







/*----------------------------------------comment start-------------------------------------------------------*/


/*短文：因为这个量非常大，所以需要单独拎出来，不能和文章放在一个集合里面
    1.“个人说说”：没针对谁，自己发的说说，
    2.“文章评论：针对文章的第一层留言，人与人之间回复不算”，
    3.“留言板留言：针对某个人，是某人留言板下的1级留言，”，
    4.“评论回复”：就是2级+的评论【上面123都是1级评论】
    5.“图表留言”：针对图表的第一层留言
*/
//评论的下一级以及更深层的回复数据，全部统一保存在文章里面，文章作为容器，这个关联为主  
//评论的关联用户里面的数字信息没有默认[],因为评论太多了，好多评论都无回复，给每个评论的属性都默认添加数组太浪费
var commentSchema=new Schema({//自动产生的id为cid，就是评论id
    time:{//文章写的时间
        type:Number,
        default:Date.now()
    },
    content:{//内容
        type:String,
        required:true
    },

    level:{//评论等级，等级越高，文章内展示得越靠前：这个等级通过linkUser和linkOther综合评分，得到一个等级
        type:String,
        default:"1"
    },

    //--------------------------下面是关联数据----------------------------------

    linkUser:{
        type:Object,
        required:true,
        properties:{
            uid:{//谁写的 
                type:String,
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
            atList:{//评论的@相关人员，atId主动at的人；atedId是被at的人:atId和上面的uid一样，就是作者主动at别人
                type:Array//{atId,atedId,atType：2表示文章的at，4表示评论的at}
            }
        }
    },

    //除了人以外的其他外部关联
    // 通过“文章集合下的linkComment+评论集合下的linkOther，linkUser”，前端就可以串联出某篇文章下的所有评论数据和关系
    // 前端需要通过遍历树操作，才能把所有评论串起来，前端逻辑比较复杂，但为了数据库的简化+可拓展性，是值得的
    linkOther:{//
        type:Object,
        required:true,
        properties:{
            category:{//类别:[1,2,3,4,5:详细介绍见下面]
                type:String,
                required:true
            },
            targetId:{//针对的哪个目标的“回复|评论”
                // 如果category是1类型，targetId就是自己个人的uid；【放自己说说列表】
                // 如果category是2类型，targetId就是aid，放到对应文章下面
                // 如果category是3类型，targedid就是其他人的uid【放对方留言板1级留言】
                // 如果category是4类型，targedid就是cid，放到其他评论的下面
                // 如果category是5类型，targedid就是chartId，放到对应图表下面
                type:String,
                required:true
            }
        }
    }

});


var defaultComment={
    // time:Date.now(),
    // content:"",//必须前端传入
    // linkUser:{
    //     uid:""//必须前端传入
    // },
    // linkOther:{
    //     category:0,//必须前端传入
    //     targetId:""//必须前端传入
    // }
};

/*----------------------------------------comment end-------------------------------------------------------*/










/*----------------------------------------chart start-------------------------------------------------------*/

//图表：结构和文章基本一样，只是标题非必须
var chartSchema=new Schema({
    time:{//时间
        type:Number,
        default:Date.now()
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
                type:String,
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
    },

    //关联评论：图表下的所有评论
    linkComment:{
        type:Array//[{type:2|4,contentId:aid|cid}],type=5表示图表的1级评论，type=4表示评论回复
    }

});

//新建图表的时候用到
var defaultChart={
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
    // },
    // linkComment:[]
};

/*----------------------------------------char end-------------------------------------------------------*/





userSchema = mongoose.model('User',userSchema ); 
articleSchema = mongoose.model('Article',articleSchema ); 
commentSchema = mongoose.model('Comment',commentSchema ); 
chartSchema = mongoose.model('Chart',chartSchema ); 

module.exports= {userSchema,articleSchema,commentSchema,chartSchema,defaultUser,defaultArticle,defaultComment,defaultChart};
