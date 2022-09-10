// module.exports = [

// //demo
// {
//     match: "/recommend/list",
//     controller: "recommend.list"
// },{
//     match: "/recommend/index",
//     controller: "recommend.index"
// }

// ]

var router = require("./index"),
    get = router.get,
    post = router.post,
    put = router.put;



get("/recommend/error_page", "recommend.error_page");
get("/recommend/react_demo", "recommend.react_demo");
get("/recommend/redux_demo", "recommend.redux_demo");
get("/recommend/home", "recommend.home");
get("/index", "recommend.home");
get("/", "recommend.home");
get("/recommend/personal", "recommend.personal");

get("/ajax/logout", "ajax.logout");
get("/ajax/search", "ajax.search");
get("/ajax/user_info", "ajax.user_info");
get("/ajax/person_collection_list", "ajax.person_collection_list");
get("/ajax/person_attention_list", "ajax.person_attention_list");
get("/ajax/person_fans_list", "ajax.person_fans_list");
get("/ajax/person_article_list", "ajax.person_article_list");
get("/ajax/article_info", "ajax.article_info");
get("/ajax/article_tag_info", "ajax.article_tag_info");
get("/ajax/jsonp", "ajax.jsonp");//没用到，可以关闭





// post("/ajax/add_article_tag", "ajax.add_article_tag");//添加或删除文章的标签
post("/ajax/modify_pwd", "ajax.modify_pwd");//修改密码
post("/ajax/update_user_info", "ajax.update_user_info");
post("/ajax/add_article_collect", "ajax.add_article_collect");//文章收藏或取消
post("/ajax/add_article_fav", "ajax.add_article_fav");//文章点赞或取消
post("/ajax/add_user_attention", "ajax.add_user_attention");//关注用户或取消
post("/ajax/add_comment_fav", "ajax.add_comment_fav");//给评论点赞或取消
post("/ajax/add_article_comment", "ajax.add_article_comment");//添加评论
post("/ajax/login", "ajax.login");//登录数据是非对称加密的
post("/ajax/reigst_user", "ajax.reigst_user");//注册数据是非对称加密的
get("/ajax/captcha", "ajax.captcha");//动态图片验证码，注册登录要用
post("/ajax/dynomic_code", "ajax.dynomic_code");//登陆时候的动态码，登录保密的关键
post("/ajax/create_article", "ajax.create_article");//创建文章
post("/ajax/upload", "ajax.upload");//上传图片




// router.get('/api/getCaptcha', function(req, res, next) {

//  return api.getCaptcha(req, res, next);

// })