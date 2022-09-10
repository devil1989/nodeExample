// config文件的原则是，把所有环境相关和全局用到的静态数据，放到里面，主要是为了配置不同环境的切换
//目前只有dev环境和yz环境以及prod，qa没用到，因为个人站点不需要，yz模仿线上测试，yz环境的所有node配置和线上都相同，只有数据库是yz的数据库；如果走正常的公司发布，那还需要给yz设置特定的静态资源的url
// 但目前yz环境是再本地开发地址下检测，所以yz要和prod保持所有的数据都相同，只有数据库不同
var env = process.env,pkg = require("./package.json");
var NODE_ENV = env.NODE_ENV || 'prod',path = require("path");

var combine={
	dev:{
	    enableHTTPS: false,//是否启用https
	    logFilePath: './log/main.log',//设置日志存储路径
	    staticPath: "/static/latest",//这个是静态资源的重置路径，dev环境用不到，dev下放这个变量只是为了防止js报错
	    staticServer: "//localhost:8080"//dev环境静态资源服务器
	},
	qa:{
		staticPath: "/static/latest",//这个是静态资源的重置路径
	    staticServer: "//qares.jeffrey.cn"
	},
	yz:{
		staticPath: "/static/latest",//这个是静态资源的重置路径
	    staticServer: ""
	},
	prod:{
		staticPath: "/static/latest",//这个是静态资源的重置路径,通过修改这个，修改这里可以实现线上的前端代码的回滚，在staticResourceMappingPath变量和middleware的index中都有用到
		staticServer: ""//因为静态资源和node在同一个服务器，所以用相对路径，不需要重新设置,staticServer用于html文件里面的静态资源的mapping替换时候的前缀
	}
}

var config={
    "PORT": env.PORT || "10129",//应用的HTTP服务端口
    "HTTPS_PORT": env.HTTPS_PORT || "4124",//应用的HTTPS服务端口
    "HOST_ADDRESS": env.HOST_ADDRESS || (NODE_ENV=="dev"?"localhost":"0.0.0.0"),//服务器机器名,dock下不能用localhost，要用0.0.0.0表示服务器，否则会导致浏览其无法访问docker中的node程序
    "NODE_ENV": NODE_ENV,//当前的环境，分为 dev qa yz prod(production)
    enableHTTPS: false,//是否启用https
    enableHTMLCompress: env.ENABLE_HTTP_COMPRESS || true,//是否启用压缩的HTTP内容。 采用html-minifier组件进行压缩
    warning: {//设置API的报警阀值为200ms， 意思是当调用API获取数据的时候，超出了200ms，则会写入warning日志
        api: 200
    },
    logFilePath: '/home/logs/' + pkg.name + '/logstash/logstash.log',//设置日志存储路径
    staticResourceMappingPath: env.STATIC_RESOURCE_MAPPING_PATH || path.resolve(__dirname, "."+combine.prod.staticPath+"/assets-mapping.json"),//设置静态资源映射文件的路径。
    host: env.HOST,//环境的host
    apiServer: '',//node端请求java的api基础地址，在proxy中用到，用于处理跨域问题
    auth: {
        key: "",//服务端动态码，给未登录游客的，
        secret: "jeffreychen",//jwt的密钥,用于token数据的加签和解签,jwt不是加密,所以不能放私密数据；
        deviceId: "",
        shaKey:"jeffrey"//sha256加密的key，不允许修改，一旦修改，数据库的密码就会全部对不上号，其实也没必要修改，sha256加密是不可逆的，就算别人知道了这个key，也没用
    },

    /*
    desc：数据库连接和超时设置
	    local数据库，从名字可以看出，它只会在本地存储数据，即local数据库里的内容不会同步到副本集里其他节点上去；目前local数据库主要存储副本集的配置信息、oplog信息，这些信息是每个Mongod进程独有的，不需要同步到副本集种其他节点。
		在使用MongoDB时，重要的数据千万不要存储在local数据库中，否则当一个节点故障时，存储在local里的数据就会丢失。

		集群只有一台数据库服务器的时候，那一台会自动变成secondary[次要]，没有primary服务器，无法解决数据请求
		集群有超2台数据库服务器，就会自动选一台作为iprimary，任何一台坏了，其他的自动接替primary角色
		任意一台数据改变，其他数据库服务器都会自动同步
		mongodb的数据库连接URI规则：mongodb://[username:password@]host1[:port1][,...hostN[:portN]]][/[database][?options]]
		retryWrites=false必须设置，否则数据写入会失败;
		replicaSet=mySet表示集群uri，mySet是集群的名称，可以在集群中执行rs.status()查看集群详细信息
	*/
    db:{
    	dev:{
    		dbURI:"mongodb://127.0.0.1:27017,127.0.0.1:27001,127.0.0.1:27002/gpclubs?retryWrites=false&replicaSet=mySet",
    		timeout:3000
    	},
    	qa:{
    		dbURI:"mongodb://0.0.0.0:27017,0.0.0.0:27001,0.0.0.0:27002/gpclubs?retryWrites=false&replicaSet=mySet",
    		timeout:3000
    	},
    	yz:{
    		dbURI:"mongodb://gpyz:123456@database:27017/gpclubs?retryWrites=false",
    		timeout:3000
    	},
    	prod:{//生产环境连接的是docker，docker默认访问网址是0.0.0.0，这样才能和docker外面的数据库通信
    		// dbURI:"mongodb://gp:Z103496out@192.168.101.10:27017/gpclubs?retryWrites=false",//因为docker容器中我用了bridge的网络模式，每个容器都有一个ip，需要通过ip访问【前提是ip要设置静态ip】
    		// dbURI:"mongodb://127.0.0.1:27017/gpclubs?compressors=disabled&gssapiServiceName=mongodb",


    		dbURI:"mongodb://gp:Z103496out@database:27017/gpclubs?retryWrites=false",//因为docker容器中我用了bridge的网络模式，每个容器都有一个ip，需要通过ip访问,但ip是动态的，所以改用yml中的services的名称来访问database
    		// dbURI:"mongodb://gpyz:123456@database:27017/gpclubs?retryWrites=false",
    		timeout:3000
    	}
    },


    session: {//服务端发送html给客户端的时候，将session的key和对应的value保存在cookie中一起发出
		key: 'sessionId', //cookie key (default is koa:sess)，
	  	maxAge: 86400000, // cookie的过期时间 maxAge in ms (default is 1 days)
	  	overwrite: true, //是否可以overwrite    (默认default true)
	  	autoCommit: true, // (boolean) automatically commit headers (default true) 
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

module.exports = Object.assign({}, config, combine[NODE_ENV]);