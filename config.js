var env = process.env,pkg = require("./package.json");
var NODE_ENV = env.NODE_ENV || 'prod',path = require("path");

var config={
    "PORT": env.PORT || "10129",//应用的HTTP服务端口
    "HTTPS_PORT": env.HTTPS_PORT || "4124",//应用的HTTPS服务端口
    "HOST_ADDRESS": env.HOST_ADDRESS || "localhost" ||"0.0.0.0",//服务器机器名
    "NODE_ENV": NODE_ENV,//当前的环境，分为 dev qa yz prod(production)
    enableHTTPS: false,//是否启用https
    enableHTMLCompress: env.ENABLE_HTTP_COMPRESS || true,//是否启用压缩的HTTP内容。 采用html-minifier组件进行压缩
    warning: {//设置API的报警阀值为200ms， 意思是当调用API获取数据的时候，超出了200ms，则会写入warning日志
        api: 200
    },
    logFilePath: '/home/logs/' + pkg.name + '/logstash/logstash.log',//设置日志存储路径
    staticResourceMappingPath: env.STATIC_RESOURCE_MAPPING_PATH || path.resolve(__dirname, "./assets-mapping.json"),//设置静态资源映射文件的路径。
    host: env.HOST,//环境的host
    apiServer: '',//node端请求java的api基础地址，在proxy中用到，用于处理跨域问题
    auth: {
        key: "",//服务端动态码，给未登录游客的，
        secret: "jeffreychen",//jwt的密钥,用于token数据的加签和解签,jwt不是加密,所以不能放私密数据
        deviceId: ""
    },
    session: {//服务端发送html给客户端的时候，将session的key和对应的value保存在cookie中一起发出
		key: 'sessionId', //cookie key (default is koa:sess)，
	  	maxAge: 86400000, // cookie的过期时间 maxAge in ms (default is 1 days)
	  	overwrite: true, //是否可以overwrite    (默认default true)
	  	autoCommit: true, /** (boolean) automatically commit headers (default true) */
	  	httpOnly: false, //cookie是否只有服务器端可以访问 httpOnly or not (default true)；客户端js无法访问
	  	signed: false, //签名默认true : 这个是天坑，设置signed: true后，它就会寻找req.secret(一个秘钥字符串)，进行加密 allen返回浏览器；，最后导致cookie代码中的keys报错
	  	              //解决办法：需要在middleware的index.js中，设置app.keys = ['密钥'];跳过cookie中的密钥相关逻辑
	  	rolling: false, //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
	  	renew: false, //(boolean) renew session when session is nearly expired,
	  	// secure: true,//只有https请求才能访问获取这个cookie，如果时http就无法访问这个cookie

	  	// 设置了Strict或Lax以后，基本就杜绝了 CSRF 攻击。当然，前提是用户浏览器支持 SameSite 属性。
	  	sameSite: "Lax"//Strict：防止CSRF 攻击，完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie，但用户体验不好。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie
	  	               //strict的话，从本地的a链接跳转到其他站点，这个站点用户本来就已经登陆过了，从你这边跳过去，还得重新登录;但cookie有多个，有的可以带有的可不带，登录的cookie必须用Strict

						// Lax：则稍稍放宽，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。
	}
}

var combine={
	dev:{
	    enableHTTPS: false,//是否启用https
	    logFilePath: './log/main.log',//设置日志存储路径
	    staticServer: "//localhost:8080"//dev环境静态资源服务器
	},
	qa:{
	    staticServer: "//qares.jeffrey.cn"
	},
	yz:{
	    staticServer: "//yzres.jeffrey.cn"
	},
	prod:{
		staticServer: "//res.jeffrey.cn"
	}

}

module.exports = Object.assign({}, config, combine[NODE_ENV]);