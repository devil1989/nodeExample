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


get("/recommend/react_demo", "recommend.react_demo");
get("/recommend/redux_demo", "recommend.redux_demo");
get("/recommend/home", "recommend.home");
// get("/ajax/login", "ajax.login");
post("/ajax/reigst_user", "ajax.reigst_user");
get("/ajax/jsonp", "ajax.jsonp");

get("/ajax/captcha", "ajax.captcha");


// router.get('/api/getCaptcha', function(req, res, next) {

//  return api.getCaptcha(req, res, next);

// })