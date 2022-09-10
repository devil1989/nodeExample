#这个是 Node后端站点：前端站点有自己的仓库，前后端独立，每次发布都是把前端站点仓库的压缩代码拷贝到本仓库的static文件家内，然后和node站点一起发布,后续可以考虑单独搞一个单独的静态资源服务器，目前没必要


项目发布原理：
	1.如果static项目的dll文件内的框架有变动，需要npm run dll-prod
	2.static项目执行npm run prod
	3.把static项目下的dist文件夹内的所有文件，拷贝到node项目下的static文件夹里面的latest里面，同时再创建一个当日发布的文件加，比如2022-08-21文件夹，
	  latest里面表示最新的静态文件，也是线上的文件，2022-08-21文件夹是发布的版本的拷贝，用于记录发布的历史版本，如果线上出问题，就回滚到之前的日期的文件夹【只需要修改config文件加内的prod的staticServer即可】
	  只需要修改config.js文件中的prod.staticPath，重置前端静态文件的路径，就可以实现前端静态资源的回滚【js,css,html等所有前端静态资源】
	4.在node项目执行npm run prod,就启动了node服务，在服务器启动node，就等于发布了整个站点，因为前后端代码都在一个站点里面。
	5.昨晚上面的3步，然后把第四步node启动+mongo数据库启动，都封装到docker里面，实现容器部署，这样就很轻松地实现了整个webapp的容器化部署发布，方便在各个服务器之间实现迁移
	  docker容器化的好处是，容器里面包含了node版本，mongo版本等所有需要的环境基础，0成本迁移服务器，迁移的时候只需要考虑服务器的操作系统是否和docker兼容即可，docker在所有服务器下的命令都一样，一次部署，随意迁移

本地发布流程【模仿线上】：
	1.如果static项目的dll文件内的框架有变动，需要npm run dll-prod
	2.static项目执行npm run prod
	3.把static项目下的dist文件夹内的所有文件，拷贝到node项目下的static文件夹里面的latest里面，同时再创建一个当日发布的文件加，比如2022-08-21文件夹，
	4.本地启动都开docker，删除所有容器，删除node项目所对应的镜像【数据库镜像gp-database和数据库管理镜像mongo-express不需要删除】
	5.到node项目下，执行docker-compose up -d执行镜像构建和容器生成【一键完成】，然后在localhost/recommend/home下就可以访问了【目前数据库访问出错，因为线上的数据库帐号密码和本地的数据库帐号密码不一样】
	  所以需要在本地构建一个yz环境，模仿线上，yz环境的数据库帐号和密码也必须正确，不然就会访问出错

上线发布流程：
	1.如果static项目的dll文件内的框架有变动，需要npm run dll-prod
	2.static项目执行npm run prod
	3.把static项目下的dist文件夹内的所有文件，拷贝到node项目下的static文件夹里面的latest里面，同时再创建一个当日发布的文件加，比如2022-08-21文件夹，
	4.打开putty.exe,选择VCN over SSH，点击load，加载出远程服务器地址43.143.25.248和远程端口22，点击连接【需要输入ssh连接远程服务器的帐号和密码，这样就建立了ssh连接】

	//下面是命令行的发布流程
	5.进入koa-node目录，git pull 拉最新代码
	6.sudo docker-compose build web :该操作把服务器git上的最新代码部署到最新的镜像并自动创建gp-web的docker容器；因为数据库和mongo-express没有修改，所以不需要用docker-compose pulll来拉区最新的镜像
	7.执行docker-compose up -d：根据现有的镜像，创建或更新容器

	//下面是linux界面的发布流程
	5.打开VCN-VIEW软件，用这个软件实现服务器远程登录控制，因为putty软件已经设置了来拦截，所以VCN-VIEW的请求会通过putty软件的ssh加密通道来登录，保证了远程登录的安全
	6.接下来，就是服务器的发布流程了，之前1-3是本地代码更新，4-5是连接服务器，这一步就是在服务器上发布了，先在服务器拉最新的git代码
	7.网站第一次发布，执行docker-compose up -d即可【先进入koa-node目录下，执行sudo su root获得root权限，不然执行目录可能被拒绝】：腾讯那边可以设置自动执行的命令，把这三个命令统一放到一键执行的命令里面：
	  如果不是第一次发布，那么先执行docker-compose build web来获取最新的web镜像，然后再执行docker-compose up -d
		
	  //相关命令
		docker-compose down :删除所有容器
		docker-compose pull ：更新镜像内容  ：如果遇到通过dockerfile构建的镜像，需要自己docker-compose buld service名称来手动执行构建镜像【根据yml的对应service的名称下的内容来构建】
		docker-compose up -d:根据镜像创建容器，第一次启动还会自动构建镜像，然后再根据镜像创建容器


难点：dev出错调试很容易，难的是dev正确，qa和yz环境下出错，因为qa和yz都在docker下运行，这样去调试显然不适合，需要在本地模仿qa和yz的开发环境来调试
	1.先确定前端静态资源已经正确发布，很多时候是静态资源压根没发上去，或者服务器缓存，反正就是静态资源不对
	2.如果静态资源正常发布了，接下来从node，前端，数据库3个方向排查
	3.运行npm run debugyz:先仿造可调式的node端的yz环境，排查node端是否有问题；
	4.一般如果是前端的问题，直接对比request和respose基本就可以得出结论，如果还是没法找出错误按照下面步骤执行
		用fiddler拦截js，把压缩的js换成dev的js，如果dev环境的js没问题但压缩的文件出问题，就检查压缩文件是否是新的代码，或者压缩过程中代码被压缩坏了
    不用fiddler，也可以暂时修改前端打包，把压缩改成未压缩，然后调试





//开发的时候特别要注意，在npm run debug-node的调试环境下，任何非node端请求的相关js文件，
  修改都无法同步到调试环境，需要重启node才能获得最新代码；

node启动命令：npm start
node调试命令：npm run debug-node  【前提是chorme下的node调试环境已经配置好】
node 服务器重新启动调试命令：npm run debugs  【前提是chorme下的node调试环境已经配置好】
	调试流程：
	1.执行上面的npm run debug-node或者npm run debugs
	2.在chrome中输入地址  chrome://inspect/#devices
	3.点击浏览器页面内部的Devices下的Remote Target下面的inspect，就自动进入node调试界面

npm run debug-node和npm run debugs区别：
	npm run debug-node用于服务端请求相关的node端js代码的调试
	npm run debugs用于服务端的初始化相关的node端js代码的调试
	npm run debug-node是用于服务端node请求的调试，也就是node端的node页面或ajax相关的js有修改
	可以用这个命令调试，这个命令启动之后，按照上面的调试流程到第三步点击inspect，等于调试环境启动成功
	接下来修改node端的页面请求和ajax请求相关js，然后只要在前端刷新页面或者请求ajax
	就会执行最新的后端代码，非常方便，但是涉及到node服务端初始化的相关js，就无法在这里调试
	因为这个调试命令只是和node服务请求相关，不涉及node服务器的初始化的相关代码；
	
	而npm run debugs，是弥补上面的调试的缺陷，如果调试的代码涉及到node端启动的js代码，
	如果用npm run debug-node来调试，那每次修改node端启动的代码，首先要停止当前的node服务
	然后再重新执行上面的“调试流程1，2，3”步，才能看到最新的node端启动代码，而过用npm run debugs
	那么每次修改node端的启动代码，只要点击“调试流程”中的第三步的inspect，就进入了最新代码的调试环节
	但npm run debugs的坏处在于，它调试服务端的node请求【非node端启动】的js代码比较费劲，
	就是每次修改代码，都要点击inspect，然后执行完node初始化js后，再刷新页面，接下来才能执行正常的页面内部的node请求调试。


npm run debug-node执行以后，关于页面请求和ajax请求的后端代码修改，是可以直接同步的，很方便调试
                  但是服务器启动的代码无法重新调试，因为浏览器只能是关于node端的请求代码，而非node端启动代码


如何在docker容器里面执行调试node：！！！
1.在yml文件里面对应构建node项目用到的docker文件里面，添加调试命令，例如把dockerfile文件的最后一行CMD ["npm", "run", "prod"] 改为CMD ["npm", "run", "debugyz"]，debugyz就是那个调试命令
2.在package.json文件里面设置调试命令debugyz，具体如下"debugyz": "NODE_ENV='yz' nodemon --inspect-brk=0.0.0.0 app.js", 和本地node调试基本没啥变化，只是inspect-brk后面添加了=0.0.0.0而已
3.因为要调试docker，所以在yml文件的ports下面需要额外添加一个端口用于调试，比如本来- 80:10129用于端口映射，那么在下面再随意添加一个端口，比如- 9229:9229 ，这个9229端口就专门用于调试
4.最关键的一部来了，因为第2步中添加了0.0.0.0监控，docker的端口也添加了9229，所以再浏览器的chrome://inspect/#devices页面里面，需要给Discover network targets添加以一个0.0.0.0:9229的监控
  这样一来，docker容器运行，chorme的inspect插件就可以通过0.0.0.0:9229来监控node，调试方法还是和本地调试一样
      





服务器启动流程：
		1.执行app.js,使用koa框架创建app
		2.进入middleware的index.js,注册所有中间件：用app.use注册中间件
		3.使用http或https的createServer方法，传入koa框架产生的那个app.callback()，并添加监听:例如http.createServer(app.callback()).listen(端口,服务器地址);

客户端请求node服务器的流程：比如浏览器输入http://localhost:10129/recommend/home请求，传送到node端服务器，就会执行下面的大概流程
		1.根据middleware的index.js里面的中间件的注册顺序，依次执行每一个中间件，最后肯定会执行到router这个路由中间件
		2.跳转到路由中间件router>index.js从function* getController这个函数开始，执行路由的划分，跳转到对应的controlls文件夹下的js文件
		3.执行controlls下的对应js文件里面和页面名称对应的js函数【例如home】，js函数里面会调用render函数
		4.这个render函数其实也是在router文件夹下的index.js里面定义的【包括其他ajax的render，jsonp的render等，我把这些render函数都写在这里】
		5.render函数里面用到了“co-views”这个模板渲染引擎，放入对应的参数，就能去找views文件夹下对应的页面的html
		6.到这里基本流程都结束了，总体流程是依次执行中间件，执行到路由中间件的时候，执行个人设置的mvc，就是从路由跳转到controller，controll中写业务逻辑和对model的调用
		  获取到页面所有需要的数据后，controller再用render函数来跳转到view来编译html模板，最后把生成的文件或数据发送给客户端浏览器




关于dev,qa,yz,prod的环境部署问题：
1.所有环境相关的变量，都统一放在config.js文件里面，不要东一块西一块导致修改环境的时候出bug
2.qa,yz,环境都是用docker发布和访问，所以必须有各自对应的dockerfile；本地执行npm run qa|yz|prod访问的是，node虽然启动了，但是对应的数据库环境是docker环境，所以本地执行npm run prod|yz|qa毫无意义
  反而容易把docker环境的dockerfile里面执行的npm run prod|yz|qa 搞混，本地调试qa，yz环境，不是本地执行npm run qa|yz ;而是创建docker容器，在本地从dock容器访问【最好是有qa和yz服务器，通过服务器访问】
3.如果所有的静态资源都是在同一个服务器，那么qa和yz的静态资源就没必要添加host前缀，直接可以用相对地址，这样保证了除了数据库数据，其他qa,yz,prod的所有数据都是一样的



		  


直接参考项目根目录下的Dockerfile。



nodemom：用于后端系统重启，但如果后端系统崩溃了，那就需要另一个软件让nodemon自动重启，这个软件就是forever，这样才会有安全稳定可访问的线上环境，即使站点崩溃了，也可以马上重启
         nodemon.json文件中设置相关项，手动重启是rs；只要修改的node端的文件，nodemon都会自动刷新，然后用户刷新页面，就是最新的文件了。
         所以在nodemon执行的环境下，任何修改都等于实时发布，修改完，用户就能获取最新的业务代码，但后端不能随意修改，还是要走一个正常的测试发布流程，最后把所有文件批量覆盖线上的文件
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
2.用户发送url请求：routes/index.js > controllers > views :最终返回用户数据
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




服务端压缩：gzip，需要在html的header设置服务端输出的压缩类型，这样浏览器会获取到资源就能识别
