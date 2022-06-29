# Node 后端模版说明


直接参考项目根目录下的Dockerfile。



nodemom：用于后端系统重启，但如果后端系统崩溃了，那就需要另一个软件让nodemon自动重启，这个软件就是forever，这样才会有安全稳定可访问的线上环境，即使站点崩溃了，也可以马上重启
         nodemon.json文件中设置相关项，手动重启是rs；只要修改的node端的文件，nodemon都会自动刷新，然后用户刷新以下页面，就是最新的文件了。
         所以在nodemon执行的环境下，任何修改都等于实时发布，修改完，用户就能获取最新的业务代码，打后端不能随意修改，还是要走一个正常的测试发布流程，最后把所有文件批量覆盖线上的文件
         这样就做到了瞬间发布大批功能。

         nodemon修改后自动重启，重启的只是服务器，html不会刷新，所以html的刷新，需要自己手动；



//文件目录结构说明
.cert:站点安全证书
.dockerignore ： 后端站点构建镜像的时候，有些文件不需要打在镜像里面，在这里设置哪些不需要打进去的文件
.gitignore:git提交忽略的文件
Dockerfile : dockerfike快速创建自定义的Docker镜像 ：https://blog.csdn.net/mozf881/article/details/55798811
nodemon.js:nodemon本地调试配置
package.json:项目文件
webpack-assets.json：static站点和node站点的静态文件匹配（prod环境才用到，dev环境不用）
errorPages:公共错误页面
node_modules:node插件集合
log：日志
config.js:node站点资源配置文件！！
models：node请求的model ！！
views：node返回用的html文件 ！！
app.js:node执行命令入口文件！！
controllers：mvc的controller！！
lib：公用文件 ！！
	middleware文件夹：node中间件
	app.js:中间件入口
	util.js:站点通用js






//启动流程和用户请求流程
1.本地启动：app.js > lib(中间件加载：包括路由，鉴权，渲染模板等) 
2.用户发送url请求：router.js > controllers > views :最终返回用户数据
主要关注!！的文件夹即可





！！！！！！！！环境安装！！！！！！！
chrome下node调试环境配置要求：使用方法见https://github.com/node-inspector/node-inspector

1.chrome版本要55+

2.node版本要7+：别用7以下的版本，会出各种问题，因为下载的node-inspector是最新的版本，和老版本的node结合使用，将是灾难；要么用老版本的node-inspector和node@6.10.0
	           而且老版本的命令和新版本也不一样，要区分

3.安装用：npm install -g node-inspector

4.如果还不行，就是缺少软件包，全局安装 node-gyp和node-pre-gyp

5.如果还不行，去https://dotnet.microsoft.com/download/visual-studio-sdks这个地址下载安装包4.6.2 ，然后再npm install --global --production windows-build-tools@4.0.0

6.最后，一定要注意，使用的命令必须是node  --inspect-brk app.js【app.js是启动文件名，和package.json同目录下】
  node-debug；node --debug等已经被废弃了，一旦使用就会报错，怎么解决都解决不了的




！！！！！！！！！！调试！！！！！！！！！！！！！！！
1.node --inspect-brk app.js  【会出现监控地址和端口，例如127.0.0.1:8080，看cmd框中的内容即可】
2.打开chrome://inspect/#devices，设置configure，添加刚才cmd中出现的地址，例如（127.0.0.1:8080），后面的uuid不用拷贝进去
3.点击下面出现的inspect，就会自动到debugger的地方【有的时候不灵，多试几遍】

//如何调试node页面
1. 同上面一摸一样，先调试app.js,执行完app.js,这个时候服务器已经启动了
2.前在对应的js处打断点即可，刷新对应的node页面，例如刷新，http://localhost:10129/recommend/list；就自动会进入node页面的后端执行流程，就能执行到断点处


3.node端开发，遇到出错，复杂的问题，用inspect调试；如果页面没有错误，只是业务上想看一些后端的数据，可以在nodmon启动后，直接在后端代码处添加console.log(数据)，就可以直接在命令行出现；如果用inspect调试，那么打console.log会直接报错

4.后端如何调试：
				1.如果不需要在浏览器中调试，启动npm start 后，直接在页面里面打console.log(),命令行出现最新的打印内容
	            2.如果需要在浏览器中调试单次调试，用npm run debug-node:打开调试界面输入地址，点击inspect，
	             执行服务器初始化，然后再刷新html页面，就会进入正常的服务器页面请求流程的调试，经过所有middlle，
	             包括rout流程；
	            3.	如果需要热替换调试，就执行npm run debugs,修改后端代码，然后不需要重启node，直接点击inspect，
	            	就进入了服务器初始化的node流程，再点刷新页面或者点击页面的功能，就会自动进入最新代码的node端请求流程











//通用后端功能：
1. 路由 :koa-router
2. body解析:koa-bodyparser
3. http头相关安全防范：koa-helmet
4. 缓存：koa-conditional-get加koa-etag
5. 静态资源服务器【如果前后端分离，就可以不用，静态资源单独单间一个站点，启动独立静态资源服务器，而不是用koa-static在node端并行搞一个静态资源服务器】：koa-static
6. 发布版本管理插件，用于发布的静态资源文件管理，去缓存：自己写逻辑
7. 登录，验权：自己写逻辑
8. 错误日志管理：自己写逻辑，也可以找通用的错误日志管理插件
9. 数据埋点：自己写，用于统计用户数据和行为习惯，以便于网站的优化





1.npm start ,查看代码是否报错；
2.用chrome调试app.js，看代码是否有遗漏，整个流程是否跑通【如何调试本地Nodejs.txt文件】
3.npm start ,启动访问对应的浏览器地址，例如http://localhost:10129/recomment/index，查看页面的网络反馈，只要存在html文件，那就是node端的路由时没问题，正常访问到了那个页面
	3.1那接下来就是再那个页面对应的controller中打debugger，调试页面的代码逻辑问题

4.如果访问页面网络反馈的时404，啥都没有，这个时最难办的，错误可能时url不对；更糟糕的可能时app.js文件中执行的流程有疏漏，
  但不管怎么样，只要host和端口没错，浏览器中输入任意地址，例如http://localhost:10129/recommend/list
 都会经过如下流程：【所以首先看是否使用了rout中间件，没用的话，压根就没路由，没法执行到controller，反馈肯定是404】
		1.middleware插件之前注册过，所以每个middleware插件都会执行：这个是核心，网站的页面渲染，缓存，保护，所有的业务和安全，全在这个里面执行
		2.如果middleware插件中用了route插件，就实现了路由功能，不管输入的网址对不对，都会执行如下流程
			1. *controller函数
			2. 对应的controller函数【一般这个函数里肯定会有render的调用】
			3. 因为上一步调用了render，所以会进入*render
			4. *render里面调用了view，view里面执行具体的页面内容设置，包括body，请求头，等信息


			




完整的流程如下：
	首先初始化的时候require了route.js,执行了里面的router文件夹里面的index.js,因为route.js对所有的页面都执行了一边请求，所以每个页面都执行到了router里面的index.js文件里面的getController之前【有个yield】;下一次客户端请求，就会根据路由，继续执行里面对应的controller【每个页面的controller平时都处于监听状态，只要由请求发过来，就继续执行】，
	最后再controller里面执行业务逻辑，执行render，这个render是router文件夹下index.js里面的render，
	而这个render又用到了lib下的views.js




