//mongoose是基于mongodb基础上的封装
const sch=  require('./schema.js');
const hostUtil = require("../lib/util.js");

var {userSchema,articleSchema,commentSchema,chartSchema,defaultUser,defaultArticle,defaultComment,defaultChart}= sch;

class BaseModel{

    constructor(opts) {
        this.opts = opts;
    }

    //通过代理去获取中台的数据，这里已经不用了
    * fnClassJeffrey(param, origin) {

        //添加origin，为了让node支持自定义域名，一般不需要，但是测试环境下，后端接口还没开发完成，只能调用公共那边接口的时候，就需要这个参数
        let classJeffrey = origin || hostUtil.getClassJeffreyHost(this.ctx.request.header.host);

        if (param.url) {
            param.url = `${classJeffrey}${param.url}`;
        } else {
            param = { url: `${classJeffrey}${param}` };
        }

        return yield this.ctx.proxy(param);
    }

}

//静态属性
BaseModel.UserSchema=userSchema;
BaseModel.ArticleSchema=articleSchema;
BaseModel.CommentSchema=commentSchema;
BaseModel.ChartSchema=chartSchema;
BaseModel.defaultUser=defaultUser;
BaseModel.defaultArticle=defaultArticle;
BaseModel.defaultComment=defaultComment;
BaseModel.defaultChart=defaultChart;

module.exports = BaseModel;
