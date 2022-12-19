后端涉及的相关知识：https://www.jianshu.com/p/43e73134ec42【用到的插件大全】

node单线程为什么仍然适合高并发io：https://blog.csdn.net/weixin_39914938/article/details/114492053！！！！！！！！！！！！！
	单线程的劣势：CPU密集型任务占用CPU时间长(可通过cluster方式解决)
	无法利用CPU的多核(可通过cluster方式解决)
	单线程抛出异常使得程序停止(可通过try catch方式或自动重启机制解决)



node样本代码：angular中文站，node写的，而且是开源代码，自己去github找
	
	？？？？？？？？？？？多线程【worker_threads模块】，多进程【cluster模块】，cpu内核【到底与线程数相关，还是核进程数相关】，pm2的cluster模式？？？？？？？？？？？？？？

	进程和线程以及CPU多核的关系，这个是核心：https://www.cnblogs.com/valjeanshaw/p/11469514.html
	一旦 JavaScript 操作阻塞了线程，事件循环也会被阻塞，因为是先进性主线程执行操作，执行完以后再把“事件循环”传给libuv的线程池做并发处理，
	进程是程序的一次执行过程，是一个动态概念，是程序在执行过程中分配和管理资源的基本单位
	线程是CPU调度和分派的基本单位，它可与同属一个进程的其他的线程共享进程所拥有的全部资源。
	在操作系统中能同时运行多个进程（程序）；而在同一个进程（程序）中有多个线程同时执行（通过CPU调度，在每个时间片中只有一个线程执行，也就是说如果是单核，虽然有多个线程，其实每个线程只在这个单核cpu上轮询获得一个时间片段，不是并发）
	所以真正让线程并发的，是多核cpu，每个cpu在同一个事件都有自己的线程在运行；系统在运行的时候会为每个进程分配不同的内存空间；而对线程而言，除了CPU外，系统不会为线程分配内存（线程所使用的资源来自其所属进程的资源），线程组之间只能共享资源。如果线程数小于cpu内核数，那么将有多余的内核空闲，所以pm2这个进程管理器，给一个进程设置多个线程，而线程的数量就是cpu内核数，而不是进程数
	？？？？？？？？？？？既然这样，那为什么cluster会按照内核数量来创建进程，然后worker_threads创建多线程？？？？？？？？？？？？？？？

	Pm2开启的是一个node进程的多线程，为什么说node的异步IO比多线程更”有利于高并发“；Node通过事件驱动在单个线程上可以处理大并发的请求；启动多个线程为了充分将CPU资源利用起来，而不是为了解决并发问题。
	node使用的是事件驱动来处理并发，异步来实现并发


	！！！！！！！！！！！！！为什么Node单线程可以实现高并发 start！！！！！！！！！！！！！！！！！
	I/O密集型处理是node的强项，因为node的I/O请求都是异步的（如：sql查询请求、文件流操作操作请求、http请求...）
	异步：发出操作指令，然后就可以去做别的事情了（主线程不需要等待），所有主线程操作完成后，再执行事件轮询分配任务到libuv的线程池并发执行；nodejs底层的libuv是多线程的线程池用来并行io操作
	虽然nodejs的I/O操作开启了多线程，但是所有线程都是基于node服务进程开启的，并不能充分利用cpu资源；pm2进程管理器可以解决这个问题；pm2 是一个带有负载均衡功能的Node应用的进程管理器.

	在过去单CPU时代，单任务在一个时间点只能执行单一程序。之后发展到多任务阶段，计算机能在同一时间点并行执行多任务或多进程。虽然并不是真正意义上的“同一时间点”，而是多个任务或进程共享一个CPU，
	并交由操作系统来完成多任务间对CPU的运行切换，以使得每个任务都有机会获得一定的时间片运行。而现在多核CPU的情况下，同一时间点可以执行多个任务，具体到这个任务在CPU哪个核上运行，这个就跟操作系统和CPU本身的设计相关了
	js不适合CPU密集型计算，例如 for (let i = 0; i < 100000000; i++) {console.log(i); }，这个会占用cpu事件，导致阻塞后面的进程，所以多进程的意义就是，一个cpu被占用了，其他cpu内核还可以正常，主要不是所有内核都被任务占据，就不会阻塞
	所以说，多核以及解决了cpu密集型计算的阻塞问题，node又是IO高并发，完美解决了node无法处理CPU密集型计算的劣势

	进程是“资源分配的最小单位”【这里主要指内存】，线程是 CPU 调度的最小单位；线程分用户线程和内核线程。内核线程再调用的时候可以去不同的核心去操作。所以多线程是可以利用到多核的。
	！！！！！！！！！！！！！为什么Node单线程可以实现高并发 start！！！！！！！！！！！！！！！！！


	node服务端错误监控插件： Fundebug 【貌似可以不用】

	node的性能监控插件： https://www.cnblogs.com/zqzjs/p/6210645.html
							第三方的进程守护框架，pm2 和 forever ，它们都可以实现进程守护，底层也都是通过上面讲的 child_process 模块和 cluster 模块 实现的，这里就不再提它们的原理。
						pm2:pm2是一个带有负载均衡能力的node进程管理工具【包含了进程守护，进程管理器，管理的是多个进程，以及一个进程内的多个线程】：https://blog.csdn.net/syy2668/article/details/109840463 【直接让pm2使用cluster模式启动多进程，不需要修改任何node端代码】
							可以用它来管理你的node进程,并查看node进程的状态，当然也支持性能监控，进程守护，负载均衡等功能;添加 --watch让node出现错误的时候自动重启，同时pm2的log命令可以查看错误
							pm2 log:查看错误日志
							pm2 monitor:查看node要用的进程状态【内存占用等】
							启动的时候用 --watch来让进程出错能自动重启
							超过使用内存上限后自动重启，那么可以加上--max-memory-restart参数
							注意：pm2在docker上运行，命令是 pm2 start app.js --no-daemon // 设置启动方式，以为pm2默认是在后台运行，添加--no-daemon 
							pm2总体作用:错误日志生成，错误自动重启，内存溢出子哦对那个重启，启动后内存占用和cpu占用监控；pm2的fork模式也是多进程，但是还是node自带的cluster模块实现多进程好
							
							pm2 启动模式 fork 和 cluster 的区别：
								fork模式，单实例多进程，常用于多语言混编，比如php、python等，不支持端口复用，需要自己做应用的端口分配和负载均衡的子进程业务代码。
								缺点就是单服务器实例容易由于异常会导致服务器实例崩溃。
								cluster模式，多实例多进程，但是只支持node，端口可以复用，不需要额外的端口配置，0代码实现负载均衡。
								优点就是由于多实例机制，可以保证服务器的容错性，就算出现异常也不会使多个服务器实例同时崩溃。
								共同点，由于都是多进程，都需要消息机制或数据持久化来实现数据共享。

						数据监控： node_exporter+Prometheus+Grafana ；
								1.Prometheus是最流行的性能监控插件【只负责数据采集】；【适合监控docker容器】
								2.node_exporter【对数据进行处理，导出数据，比如cpu，内存，磁盘数据】； 
								3.Grafana【数据的可视化监控平台，基于】【数据源：Graphite，InfluxDB，OpenTSDB，Prometheus，Elasticsearch，CloudWatch和KairosDB等；】

	KOA设计原理和大概使用
	
	git命令
	node的fs【文件操作】和 crypto【hash加密算法】 其他常用的模块！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
	用python写爬虫，爬取网页数据！！！！！！！！！！！！
	node的多线程和多进程如何实现，如何进行压力测试
	多线程：worker_threads 模块；【在js和v8引擎以及libuv中都有涉及】

		worker_threads相对于I/O密集型操作是没有太大的帮助的，因为异步的I/O操作比worker线程更有效率，但对于CPU密集型操作的性能会提升很大。

		为什么要多线程：https://www.cnblogs.com/liuyangofficial/p/7072595.html
						其实就是两点：【理解有问题，node是异步的，比如磁盘IO阻塞会导致CPU阻塞么，不会，是异步的，分配给libuv的线程】
							1.单线程的时候网络的IO，磁盘的IO，数据库的计算，CUP的计算，都在一个线程里面，任何一个计算量过大，都会阻塞线程，导致反应变慢，所以可以把计算量大的放到例外的子线程，
							  做到计算机的cpu，磁盘，网络，数据库计算等并行；但是node因为网络和磁盘，数据库等都是异步IO，所以是放在线程池并行计算的，不会阻塞主线程；
							2.正常的后端，多线程，是因为没有异步，所以磁盘的io和网络的io都不是事件轮询，所以多线程可以充分利用到，一个线程如果在磁盘的IO时间太久，那么它后续的cpu计算就还没执行，cpu就会闲着；
							  那么这个时候进行执行下一个worker，这个worker没有大量的磁盘io计算只是cpu计算，那么这个时候就是当前worker占用cpu，之前的worker占用磁盘io，磁盘和cpu同时各自运行，就没有浪费
							  而node的网络io，磁盘io等都是异步的都是进入libuv的线程池做并发，结果返回主线程，所以本身就是高并发，唯一的缺点就是主线程的cpu计算量太大导致阻塞，所以用cluster来开启多进程；
							  开启多进程，其实就是多线程，因为一个进程至少包含一个线程；这样可以充分利用cpu内核数，也可以排除因为单个主线程的阻塞导致整个系统被阻塞。

						总而言之：
							1.除了磁盘io，cpu，数据库等，还有很多很多资源的计算，用到计算机内不同的器件，多线程可以重复利用到，不会造成资源浪费；
							2.多线程不会因为单个请求的阻塞而导致后面的请求也被阻塞；

		多线程原理和如何实现多线程：
		https://blog.csdn.net/springdou/article/details/107337686
		https://blog.csdn.net/m0_38086372/article/details/106889530

			parent线程创建子线程时的初始化过程：
			1. 通过worker_threads创建一个worker。
			2. 调用c++创建一个C++worker 对象，实际上是个空对象。
			3. 给C++ worker对象创建线程ID。
			4. C++ worker对象创建initialisation message channel，
			5. 一个public message channel 的JS对象被创建，用来父线程和子线程通过postMessage函数互相通信。
			6. 父线程调用C++发送workerData对象到c++ message channel，该对象用来传输给子线程初始化的时候调用。

			子线程的执行过程：
			1. 创建独立的v8 isolate，并且assgin给worker, 这使worker有独立的context。
			2. libuv初始化，这让worker有独立的event loop。【libuv有线程池，池子里全是子线程的任务，任务完成以后会把结果返回给主线程，主线程把workData传入work，】
			3. worker开始真正的执行，event loop开始运行。
			4. worker调用c++，读取主线程发过来的workerData
			5. worker执行js 文件或者code。作为独立线程运行。

	多进程：cluster 模块【可以共享一个公共端口】 ，cluster是经典的主从模型，开启多进程不是为了解决高并发，主要是解决了单进程模式下 Node.js CPU 利用率不足的情况，充分利用多核 CPU 的性能；多核才有多进程
			child_process模块也可以实现多进程


	编译型语言：只须编译一次就可以把源代码编译成机器语言，后面的执行无须重新编译，直接使用之前的编译结果就可以；因此其执行的效率比较高；C、C++
	解释性语言 ：持动态类型，弱类型，在程序运行的时候才进行编译，而编译前需要确定变量的类型，效率比较低，对不同系统平台有较大的兼容性.：Python、JavaScript、Shell、Ruby、MATLAB

	socket 被翻译为“套接字”，它是计算机之间进行通信的一种约定或一种方式。通过 socket 这种约定，一台计算机可以接收其他计算机的数据，也可以向其他计算机发送数据
	socket起源于Unix，而Unix/Linux基本哲学之一就是“一切皆文件”，都可以用“打开open –> 读写write/read –> 关闭close”模式来操作。
	一般情况下，socket是被用来各个层和层之间传输数据用的【比如传输层（tcp）的数据传到应用层（http）】；
	
	//OSI七层模型种，向上层传输交upStream；反之就是Downstream；
	Upstream：从传输层[tcp udp]的 Socket 读取数据传到上层【例如应用层】，即请求数据从下层向上层传输；
	Downstream：反过来向 Socket 写数据，就是从应用层向传输层发送数据，方向由上往下，即向 Socket 写

	SSRF攻击【服务端请求伪造】：https://blog.csdn.net/qq_43378996/article/details/124050308

	!!!!!!!!!!!!!!!!!
	0.	node端各个版本的V8引擎的优化：
				JIT编译器：它是一个可以在运行时优化代码的动态编译器

		node端垃圾回收机制：https://blog.csdn.net/weixin_42317878/article/details/121880028
						   https://www.cnblogs.com/itstone/p/10477250.html
						   1.内存分2块，新生代内存和老生代内存，它们有不同的处理机制
						   2.新生代内存用 Scavenge[ˈskævɪndʒ]，新生代内存是临时分配的内存，存活时间短；一分为二，from区放对象，另一半是空闲区，垃圾回收的时候，把from去的内存检查一遍【标记清楚回收内存】，有用的全移动到空闲区；
						   	原来的from区变空闲区，原来的空闲区变成了对象区；就是对调了；让对象紧挨着，因为内存是连续分配的，零散的内存是内存碎片没法利用，所以用这种移动端的方式，清理除了无用对象，也清理出了内存
						   	Scavenge算法是典型的浪费空间换时间的算法。
						   3.老生代区是常用的变量，如果一个变量经过几轮Scavenge算法后还存在，那它就是常用变量，会被晋升，这个变量就会直接进入“老生代区”，；
						     老生代区的垃圾回收又不太一样，是标记清楚【进来全打标记，再给使用的变量清除标记，那些有标记的就是没用的变量，直接清除】；然后再标记整理【把存活的变量全部往一端靠，解决内存碎片的问题】

						   4.增量标记：js是单线程，垃圾回收的时候占用时间过久就会卡顿【尤其是老生代区的回收，速度慢】，所以本来应该是一次性把所有变量的标记做完【标记清除】，现在是分批标记，就是中间穿插js
						   			  核心还是轮询，标记一部分变量，然后轮循到js执行一段，然后继续执行垃圾回收，等标记完成以后，在执行内存碎片整理【就是移动变量】
		node端的单线程模仿多线程实现原理：事件轮询，先进先出 (FIFO)
		node端的监控
		请求类型：get【查询】，post【修改数据，增，删，改，倾向于增加（一般ajax中也就用post代替了其他put，delete操作）】，put【类似于post，倾向于“改”】，delete[删除操作]，options[预检操作]
		cors跨域：简单请求（simple request）和非简单请求（not-so-simple request）详见：https://www.ruanyifeng.com/blog/2016/04/cors.html

				1.CORS支持所有类型的HTTP请求
				2.IE8+都支持
				3.原理：HTTP头部允许浏览器和服务器相互了解对方，从而决定请求或响应成功与否
				4.后端相关设置header参数：
						Access-Control-Allow-Origin:指定授权访问的域
						Access-Control-Allow-Methods：授权请求的方法（GET, POST, PUT, DELETE，OPTIONS等)
						Access-Control-Allow-Headers：允许跨域请求包含content-type

						Access-Control-Max-Age：设置在n秒不需要再发送“预检”请求【就是prelight请求】，这个是非简请求中设置的，是服务端设置
						Access-Control-Allow-Credentials ：设置允许Cookie，设置“true”
				
				简单请求：
						1.请求方式是head,get，post [基本ajax都满足这个]
						2.http的header不能超出下面的http头：
							Accept ；
							Accept-Language ； 
							Content-Language； 
							Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain
							Last-Event-ID ；
					除了简单请求之外，所有的其他请求都是非简单请求，简单请求和非简单请求的处理效果是不同的

					简单请求如何实现：
						1.简单请求只要在http的header种添加Origin字段【一般的请求都是自动添加origin，不需要自己额外设置header】，例如Origin: http://api.bob.com 【协议域名端口（端口不写就是默认80端口）】
						  后台如果觉得这个域名可以允许跨域，就在返回的http信息种设置“Access-Control-Allow-Origin”对应的域名，例如this.set("Access-Control-Allow-Origin", "http:localhost:8080/")，表示允许http:localhost:8080/跨域
						  接下来前端浏览器获得返回的http请求信息，先查看Access-Control-Allow-Origin头，如果没有的话，就知道出错了，浏览器抛出一个错误，被XMLHttpRequest的onerror回调函数捕获；请求失败；否则就请求成功
						  注意：如果Origin指定的域名在许可范围内，服务器返回的响应，会多出几个头信息字段；
						  			Access-Control-Allow-Origin: http://api.bob.com  ：这个字段是必须的
									Access-Control-Allow-Credentials: true  ：该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true [Credentials:资格，资质]
									Access-Control-Expose-Headers: FooBar
									Content-Type: text/html; charset=utf-8

							上面说到，CORS请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定Access-Control-Allow-Credentials字段。
							服务器端要设置Access-Control-Allow-Credentials: true来统一ajax请求的cookie发送
							！！！！开发者必须在AJAX请求中打开withCredentials属性。  ！！！var xhr = new XMLHttpRequest();;xhr.withCredentials = true;！！！！这样浏览器才会允许把cookie跨域发送出去，
							不设置withCredentials为true的话，就算服务器那边统一接受跨域cookie，浏览器这边也在跨域发送cookie的时候也会拒绝。
							如果要发送Cookie，服务端Access-Control-Allow-Origin就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传

				非简单请求：
					1.除了简单请求以外的请求，例如请求发是put delete；请求的http的header的content-type是“application/json”
					2.非简单请求会有prelight，预检，就是发送ajax请求之前先发送一次http查询请求【请求方法是OPTIONS】，cors非简单请求，浏览器是自动发送预检请求的
						var xhr = new XMLHttpRequest();
						xhr.open('PUT', 'http://api.alice.com/cors', true);
						xhr.setRequestHeader('X-Custom-Header', 'value');
						xhr.send();
					上面这个请求是put，所以发送这个请求之前，浏览器会自动发送prelight请求，预检请求的报文如下：
						OPTIONS /cors HTTP/1.1
						Origin: http://api.bob.com
						Access-Control-Request-Method: PUT
						Access-Control-Request-Headers: X-Custom-Header
						Host: api.alice.com
						Accept-Language: en-US
						Connection: keep-alive   //注意，这个是tcp长连接，就是为了减少频繁的三次握手，因为tcp通道里面接下来还会发送其他http请求，没必要断开后在实施tcp三次握手
						User-Agent: Mozilla/5.0...
						prelight请求的核心是http请求头中的Origin，Access-Control-Request-Method，Access-Control-Request-Headers这三个字段【origin自动添加的，method是写ajax的时候必填的参数，所以只要设置X-Custom-Header即可】
					接下来，服务器收到这个prelight请求，再响应这个请求，返回http给浏览器，浏览器收到响应以后，判断http头上是否有“相关的CORS相关的头信息字段”，如果没有，那就是prelight失败，
					触发一个错误，被XMLHttpRequest对象的onerror回调函数捕获；如果响应的http头上有 Access-Control-Allow-Origin；Access-Control-Allow-Methods；Access-Control-Allow-Headers:之类的字段
					那么就是prelight请求成功，会自动继续发送真正的ajax请求；然后设置
								xhr.open('PUT或其他', 'http://api.alice.com/cors', true);
								xhr.setRequestHeader('X-Custom-Header', 'value');
								xhr.setRequestHeader('Content-type', 'application/json');

	content-type:
			1.不常用 application/xml ， text/xml ，aplication/octet-stream（这是应用程序文件的默认值，很少用）
			2.常用：application/x-www-form-url（get请求使用） ， application/x-www-form-urlencoded （post请求简单的使用）、multipart/form-data（post请求上传数据使用）、text/plain【get和post都是用】，
					application/json（post请求使用）





	爬虫指的是：向网站发起请求，获取资源后分析并提取有用数据的程序，流程如下：模拟浏览器发送请求(获取网页代码)->提取有用的数据->存放于数据库或文件中
	如何反爬虫：
				1.最基础的python爬站点接口或html，请求的时候是没有ua的，所以最最基本的是通过ua来判断最低级的爬虫；
				2.通过爬虫的行为去判断，比如访问时间，访问频率；从而给每一个接口设置同ip+ua的访问频率；
				3.蜜罐技术【诱捕非定向爬虫，但是对定向爬虫却没办法】，设置一个对外快放，但是却永远不会对外展示的连接，就是没有入口的连接【连接名字不能太简单，万一是真的用户自己猜个人中心输入网址，进了蜜罐，那就错杀了】，
				  如果这个没有外链的请求地址，被人请求了，那几本就是爬虫，直接封他的“IP+ua”

	
	
	三种IO多路复用：poll select epoll 【epoll是最新最普遍的多路复用】
	在linux 没有实现epoll事件驱动机制之前，我们一般选择用select或者poll等IO多路复用的方法来实现并发服务程序，epoll是实现高并发的关键，epoll原理如下：https://www.jianshu.com/p/548ef6a267ba
	epoll核心：共享内存【mmap：进程和内核映射到同一个物理地址】，红黑树【红黑树是用来存储这些描述符】，rdlist
	epoll两种模式：水平触发【数据可读时，epoll_wait()将会一直返回就绪事件】，边缘触发【对程序员要求较高：只能获取一次就绪通知，如果没有处理完全部数据，并且再次调用epoll_wait()的时候，它将会阻塞，因为就绪事件已经释放出来了】
	

	！！！！！！！！！！！！最准确的理解！！！！！！！！！！！！！
	！！！！！！！！！！！！最准确的理解！！！！！！！！！！！！！https://zhuanlan.zhihu.com/p/74879045
	Node在两者之间给出了它的解决方案：利用单线程，远离多线程死锁、状态同步等问题；利用异步I/O，让单线程远离阻塞，以好使用CPU。node再应用层是单线程，再libuv是多线程【有线程池，处理异步事件，例如建通的tcp连接，文件异步处理等】
	node单线程模仿多线程的核心，最终的整体流程梳理：
		0.node初始化，开启主线程，node的初始化js执行，知道最终的listen监听端口，如果有异步的文件操作或其他操作，也会添加到Event Queue（事件队列），这些事件在客户端请求的前面，会先轮循到，
			但执不执行，取决于分配给整个事件的线程是否已经完成处理获得事件的结果；
		1.Client 请求到达 node api【一般就是http请求】，该请求被添加到Event Queue（事件队列）。这是因为Node.js 无法同时处理多个请求【一个http请求就是一个线程，因为一个http请求会添加到事件队列，而一个事件最终会在libuv中分配一个线程】。
		2.Event Loop（事件循环） 始终检查 Event Queue 中是否有待处理事件，如果有就从 Event Queue 中从前到后依次取出，然后提供服务。
		3.Event Loop 是单线程非阻塞I/O，它会把请求发送给 C++ Thread Pool(线程池)去处理，底层是基于C++ Libuv 异步I/O模型结构可以支持高并发。
		4.现在 C++ Thread Pool有大量的请求，如数据库请求，文件请求等。
		5.任何线程完成任务时，Callback（回调函数）就会被触发，并将响应发送给 Event Loop。
		6.最终主线程上的 Event Loop（事件循环）在不断的循环中，发现了某个事件已经可执行了，就会执行对应的代码，然后返回给对应的客户端
			事件循环：其实就是主线程上的一个无线的while循环轮询事件列表，事件列表中的每一个事件都会有一个状态，同时每一个事件关联一个libuv中的线程，一旦线程处理完了，就会直接触发回调函数把数据传给对应的事件，同时事件的状态也变差可执行
			          主线程轮询事件列表，发现某个事件已经时可执行状态，就会拿里面对应的数据进行同步执行【整个同步执行的js，一般就是后端最终生成http请求的response头和内容的过程，主要是setheader，body按照template生成字符串，以及一些公共的同步js处理】
		核心：libuv的多线程并发因为在cpu中，cpu时轮着给整个线程执行的，所以不会因为单个线程计算太大导致其他线程被阻塞；但是js主线程不同，它js计算量过大，就会导致cpu被阻塞，而其他http请求的响应都是在node的事件轮询中的；
		      一旦主线程计算量太大，cpu一直计算，导致主线程阻塞，后面的事件轮询也就自然被阻塞了，worker thread模块就是来解决主线程cpu阻塞的问题的。
		      libuv有个线程池，出现异步任务的时候，线程池里面拿出一个线程来执行，执行完成以后，把这个线程归还给线程池
		      应用层js和V8都是单线程，在libuv上才是多线程【每个事件分配一个线程，并发执行，并且主线程轮询事件列表，线程完成操作，就会触发回调函数给这个线程对应的事件，修改事件状态和返回数据；然后事件轮询的时候发现这个事件准备好了，就执行主线程的同步操作，把信息返回给客户端。】


	操作系统的异步IO有哪些：磁盘的读写【其实就是文件的处理，fs模块的异步方法】，DNS的查询，数据库的连接，网络请求的处理（例如客户端的http请求）；【IO设备有cpu，磁盘等，线程就是占用io设备做计算处理，然后返回结果，时并发的】
	事件循环就是主线程重复从消息队列中取消息、执行的过程。
	！！！！！！！！！！！！最准确的理解！！！！！！！！！！！！！
	！！！！！！！！！！！！最准确的理解！！！！！！！！！！！！！
	worker_threads模块；child_process 模块和 cluster 模块；这三个到底时怎么回事？？？？？？？？？？？？？？
	1.cluster 是对process的封装，对Node不能充分利用现在的多核服务器的补强。
	2.worker thread是对Node不擅长处理cpu密集型任务的补强。



	node底层原理：详见https://zhuanlan.zhihu.com/p/375276722：Node.js  v10.5.0 的到来而改变，该版本增加了对多线程的支持
		核心理解：一个cpu内核对应一个进程，一台机器只有一个主进程，同时可以有多个子进程；一个进程里面可以有多个线程，但是只有一个主线程，有若干个子线程
				 node原本时单进程，单线程架构，单进程的原因不能使用cpu多核，单线程导致请求不能并发【用事件轮询模仿多线程】
				 后来Cluster 模块的加入，支持node实现多进程;它是应用层的模块，直接通过require在js中引入，使用方法如下
				 	var cluster=require("cluster");
				 	var http=require("http");
				 	var cpuNum=require("os").cups().length;//通过os模块获取cpu内核数量
				 	if(cluster.isMaster){//主进程
				 		while(cupNum--){
				 			cluser.fork();//创建子进程
				 		}
				 	}else{//子进程的话，直接监听
				 		http.createrServer(function(req,res){
				 			...
				 		}).listen(80)//调用listen函数的时候，子进程会给主进程发送一个消息；主进程就会创建一个socket，绑定地址，并置为监听状态；
				 						当客户端请求过来的时候，主进程负责建立tcp连接，然后通过文件描述传递的方式传递给子进程处理，因为各个进程之间详细是隔离的，这里通过unix域的“件描述传递”来实现信息互通
				 	}
				 	//因为是轮询，所以第一遍值的是按照cpu内核数创建所有子进程，一个内核管理一个进程，



				 多进程模式有“主进程 accept【创建主进程，由主进程统一分配给子进程】”和“共享进程accept【子进程竞争方式获取连接】”两种模式。
				 node的多线程和js的单线程需要做区分，js执行是单线程的，但是在LIBUV上，是多线程处理，也就是js单线程的任务传到LIBUV层，这个时候会进入它的一个主线程
				 主线程会给每个异步任务【也不是件事件列表】分配各自的子线程
				 
		
		1.应用层[js实现]：   即 JavaScript 交互层，常见的就是“自己写的js” + 第三方的Node.js的模块，比如 http，fs等第三方node插件
		
		2.V8引擎层[C++实现]：  负责解析和执行JS； V8 引擎来解析JavaScript 语法，进而和下层 API 交互【node，mongodb，chrome内核都用到了v8】
				引擎优势是，其他引擎都需要把js转化成“字节码”或其他中间语言，他是直接省略这一步，直接转“机器码”
					处理了很多负责的问题例如：
					1.编译优化：JIT
					2.垃圾回收：后端的learning.md有介绍
					3.内存管理：
					注意：在V8引擎层，还会有其他用C++编写的第三方库，这个库可以依赖下面的LIBUV层，也可以不依赖，因为下面的LIBUV层也有和它平级的C语言第三方引用程序

		3.LIBUV层【C语言实现】： 	是跨平台的异步IO库【底层封装】，它封装了各个操作系统的一些 API， 提供网络还有文件进程的这些功能；
								在 JS 里面是没有网络文件这些功能的，在前端时，是由浏览器提供的，而在 Node.js 里，这些功能是由 Libuv 提供的。
								实现了 事件循环、文件操作等，是 Node.js 实现异步的核心 。

								LIBUV有个线程池，它负责异步 I/O 操作，即与系统磁盘和网络的交互

								对于数据的同步，有轮询和观察者模式这2种方法：
									轮询的思想是，监控一个变量，然后每个几秒不断轮询，变量发生改变就触发回调函数来触发响应；
									观察者模式就是观察者先订阅这个对象，对象一旦发生改变会自动调用之前函数来触发响应


		node的V8引擎和java的jmv解释器差别：
			1.JIT即时编译，直接把js代码转AST【抽象语法树】，然后在直接转“本地机器码”【cpu可以识别进行计算】
			  而java在java代码转AST后，还会转“中间码”，多了这个步骤，方便代码优化，但是多了异步执行就慢了。
			  因为是直接把js通过抽象语法树转成“机器码”，直接交给硬件就可以运行了。它不会产生“二进制码”或其他“中间码”



	1.对应框架的选择，比如node后端，选择express大礼包还是koa这种轻量级的框架，框架时对流程的规范和梳理
	2.在框架的基础上，对后端代码结构进行自己的梳理，比如自己写controller，view,model，route四个文件夹，
	  通过route路由，然后在实现后端的mvc模式【model处理数据库相关数据操作，view执行渲染，controller执行业务逻辑并且和view以及model连接通讯】
	3.网站数据安全：xss【跨站脚本攻击】,csrf【跨站请求伪造】，ssrf【服务端请求伪造】,sql注入，重播攻击，ddos，网络劫持，点击劫持，http安全头等，数据加密解密加签解签，https证书[预防dns劫持和http劫持]
	4.统一的数据转化和权限校验（用户登录态和登录验证；操作数据时候的权限校验），缓存机制，数据埋点和错误统计
	  等常用功能
	5.数据库操作：增删改查【CRUD】基本操作；聚合，管道，mapreduce，事务；集群，分片；
	6.高并发的各种问题：数据的脏读，幻读，不可重复读等问题的产生以及如何解决【通过设置事务级别+加锁来实现】
					  但加锁的时候容易死锁，同时加锁的范围和事务级别的高低又会影响高并发性能；

				高并发的核心，就是选择合适的事务隔离级别+加锁，保证数据的“原子性、一致性、隔离性、持久性”的前提下，尽量给事务设置低的隔离级别，尽量缩小锁的范围；并且写代码的时候避免产生死锁【没有事务也可能产生死锁，因为系统会对增删改自动加锁】

				脏读【修改时加排他锁】：一个事务读取了数据库数据并修改，但还没有提交到数据库，这个时候另外一个事务也访问了这个数据，就是脏读
				不可重复读【行级锁】：事务A第一次读取数据a的值为100，此时事务A还没提交；然后事务B在这个期间修改了数据a，改为了200；然后事务A再次读取数据a的时候发现变成了200，就是同一个事务执行，里面多次读取数据，发现数据不一致，就是不可重复读
				幻读【表级锁】：类似不可重复度；不可重复读和幻读的区别是：前者是指读到了已经提交的事务的更改数据（修改或删除），后者是指读到了其他已经提交事务的“新增数据”。

				锁的分类：
					1.线程锁：对于代码块的锁，有的时候线程A执行某个代码块执行到一个异步操作，跳转到其他地方
					         整个时候线程B又执行整个代码块，导致里面的变量改变
					         一般都不会遇到线程锁，因为基本每个任务都是单独的实例，没用到共享变量。
					2.数据库锁：数据库级别锁【数据库锁】，表级别锁【单集合锁】，页级别锁【多文档锁】，行级别锁【单文档锁】


				如何防止死锁：...

				https://www.cnblogs.com/duanxz/p/12697030.html
				mongo从4.0版本开始支持事务，需集群部署，mongodb的事务隔离级别是怎样的我还没去了解；其他数据库都是类似下面的
				事务的隔离级别：【数据库事务有一个默认的隔离级别，sqlServer的事务默认隔离级别是下面的2】
				  				事务的隔离级别越高，并发能力也就越低；保证数据的“原子性、一致性、隔离性、持久性”的前提下，尽量选级别低的隔离级别

			  					1.Read uncommitted 未提交读
			  					2.Read committed  已提交读 
			  					3.Repeatable read  可重复读
			  					4.Serializable 可串行化 ：这个是最高级别，能解决所有问题，但性能很低【读取数据的时候直接锁表，改表的其他所有操作都不能执行】

							  	//不同隔离界下出现“脏读，不可重复读，幻读”的可能性
							  	隔离级别		脏读		不可重复读 	幻读
								未提交读		可能		可能			可能
								已提交读		不可能	可能			可能
								可重复读 	不可能	不可能		可能
								可串行化		不可能	不可能		不可能


				数据加锁，“死锁”，锁的让渡：下面是mongodb的锁的模式
					R ：共享锁(S)：数据可以有时候会自动加共享锁，同时自己也可以手动加
									即一个事务在读取一个数据行的时候，其他事务也可以读，但不能对该数据行进行增删改(因为增删改都是自动加排它锁)。
					W ：排它锁(X)：数据可以有时候会自动加排他锁，同时自己也可以手动加
									即一个事务在读取一个数据行的时候，其他事务不能对该数据行进行增删改，不加锁的查是可以的，加锁的查是不可以的。
					r ：意向共享锁(IS) ：数据库自动执行，不需要人工干预
					w ：意向排它锁(IX)：数据库自动执行，不需要人工干预

					乐观锁和悲观锁的理解【没必要用】：mongodb 没有乐观锁和悲观锁，这些需要自己在代码中实现

				锁的范围：文档【锁一个文档：行锁】，集合【锁整个集合：表锁】，数据库【锁整个数据库】

				事务对某行或者某张表或者整个数据库加锁，就是整个事务对整个资源声明主权，在我占领这个资源的情况下，其他事务都无权对这个资源执行我不允许的操作；
				同一个资源，可以接受多个事务的锁，就是被多个事务占领，但是有的锁是不能重复加的
				比如共享锁，事务A对表施加了共享锁，其他事务也可以添加共享锁，但不能添加排他锁
				如果事务A对表施加了排他锁，那其他任何事务都不能对表施加共享锁或排他锁，不能增删改，但可以查

				mongodb的数据库操作对应的加锁机制：

					操作 数据库级别锁 集合级别锁
					查询(query) r (意向共享锁(IS)) r (意向共享锁(IS))
					插入数据(insert） w (意向排它锁(IX)) w (意向排它锁(IX))
					删除数据(remove) w (意向排它锁(IX)) w (意向排它锁(IX))
					更新数据(update) w (意向排它锁(IX)) w (意向排它锁(IX))
					执行聚合操作(aggregation) r (意向共享锁(IS)) r (意向共享锁(IS))
					创建索引(前台创建Foreground) W (排它锁(X))
					创建索引(后台创建Background) w (意向排它锁(IX)) w (意向排它锁(IX))
					列出集合列表(List collections) r (意向共享锁(IS))
					版本4.0中修改.
					Map-reduce操作 W (排它锁(X) 和R 共享锁(IS) w (意向排它锁(IX)) and r (意向共享锁(IS))


					默认的增删改查操作本身就是原子操作，数据库自动会加锁解锁，不需要开发特地加锁
					最麻烦的是“事务”，事务虽然执行结果具有原子性，但是执行的时候，会出现各种脏读，不可重复度，幻读等问题，需要设定事务的“隔离级别”，并且给事务加尽量小的锁；













幂等 ：在数据不变的情况下，一个操作，无论执行多少次，结果都是一样的；幂等函数就是，任何时候调用，参数不变，结果不变

后台处理数据库业务逻辑：建立链接次数尽量少，多个请求尽量合并成一个请求，因为建立连接是比较费时的，损耗后台服务器，也损耗数据库服务器；
					  所以一个请求能完成的所有数据，就别分多次请求；用户端一个行为，最好是连接一次数据库

//需要一个本地数据库，一个测试数据库，分别用于本地开发和测试环境测试

数据库：mongodb【和redis类似，都是内存型数据库，先把数据放内存，然后再写磁盘里】【主要解决海量数据的访问效率问题，但它比较占资源，文件比较大，磁盘和内存需要较大】
    0.超级好用，易学，两天就看得七七八八了
	1.“nosql类型数据库”中的“文档存储”类型
	2.database【数据库】，collection【集合】，document【文档】，field【数据字段/域】，index【索引】，primary key【主键】
	3.基础：增删改查，
	  索引【提高查找速度】：如何制定高效的索引，是提升性能的核心；https://www.cnblogs.com/yu-hailong/p/7631572.html
	  					0.索引只要创建一遍，就会一直存在于数据库服务器的内存里，数据库更新，索引也会自动更新
	  					1.把集合按照特定field字段分组，其实就是把数据格式按照某些特定的key去排序，创造另一种便于查询和操作的数据格式
	  					2.索引可以看成另一种数据库中的数据，只是这个数据保存在内存中，但是操作数据的时候，索引也必须更新，就当成数据库的一部分
	  					3.索引可制定权重，搜索某个数据的时候，会按照关联索引的权重去查询，因为在内存，所以速度特别快，但是对内存要求高
	  					  
	  					4.如果不用索引，面对大批量的数据排序，数据库服务器会把用的所有数据全部塞到内存里面计算，MongoDB 将会报错 造成内存溢出，导致MongoDB报错 
	  					5.其实每一个集合内的文档，文档的“主键_id”就是它的默认索引，但基本查询不会用到这个字段的查询，索引需要自己创建索引

	  进阶：mapReduce【大批量数据处理工作分解成一个个单元执行，然后再把结果合并】：这个是核心，必须掌握【用js编写，并且基于js v8引擎解析】
	  	    mapReduce：https://www.cnblogs.com/boshen-hzb/p/10431295.html，说得非常好，其他人讲得都是垃圾
	  	    		   使用场景：复杂大型的数据操作，并返回集合数据，如果只是统计综合，平均值之类的，用聚合比较合适，因为较轻量级
	  	    			1.filter筛选，
	  	    			2.根据emit函数里的第一个参数进行分组，对应的值是第二个参数的数组，分成若干组，完成map；
	  	    			3.map产生的组的key就是emit函数里面的key，map组的value【数组】就是emit(key,value)里面的value，会把相同key的所有value集合在一起形成一个数组；
	  	    			最终reduce接收到的数据是[{key:[...values]},{key:[...values]},{key:[...values]}]
	  	    			4.而reduce里面会自动遍历这个数组的所有对象，例如上面的3个对象；
	  	    			  至于对象里面的数据如何处理，就是看reduce函数里面的逻辑了，reduce会默认遍历，然后
	  	    			  再执行reduce函数里面的逻辑，传入的参数是每一个组对象，例如{key:[...values]}
	  	    			  最终产生一个聚合数组，就是把每个组的返回值全push到数组里面
	  	    			

	  	    聚合+管道【一般用户统计平均值，求和等遍历大批量数据求值的操作】
	  	    




	4.高级：复本集（也就是集群）【也是有主库和从库，主库死了，从库自动顶上】，分片【增加服务器，提高数据存储量和计算速度】
		mongodb单个数据库的数据结构：所以mongodb的数据库集合，实际上就是一个JSON对象

			{
				db：{
					//db下一个对象，就是一个“集合”
					"collectionA":[{//一个对象就是一个文档
							_id:ObjectId("456321456321546"),
							name:"jeff",//一个key就是对应的field
							age:24
						},{//一个对象就是一个文档
							_id:ObjectId("456321456321546"),
							name:"jeff",//一个key就是对应的field
							age:24
						}],
					"collectionB":[]
				}
			}





数据库安全：
	1.防止而已大批量查询，数据库内存溢出。
	2.给可能的大批量查询制定索引，提高效率的同时防止内存溢出【索引也不能太多，不然也会造成内存溢出】


















论坛的数据库数据结构：数据库结构设计，很容易关联错误导致数据前后矛盾，毕业设计用到的一个软件可以检测这个问题【实体，主键，外键设置】
					最复杂的功能就是评论嵌套的设计：如何存档数据方便查询

{
	ab：{
		//users,articles,comments是三个集合，一般经常用到MapReduce命令来遍历一个集合，比如用MapReduce遍历users
		users:[{
			//下面是内容
			uid,
			userName,//帐号
			passward,//密码
			phone,
			name,//真实姓名
			age,
			sex,
			favName,//网名|昵称|花名【唯一，大家网名不能相互重复】
			charts:[{type,data}]//data是图标的数据，对数据格式的校验前端完成，后台和数据库都不做处理

			//下面是关联key：关联人，文章，说说|评论
			fans:[uid]//粉丝
			attention:[{uid,attentionLevel}]//关注哪些人
			favComment：[uid]//点赞了哪些评论|说说
			favArticle：[aid]//点赞了哪些文章
			article:[aid,aid....]//文章
			collect:[aid,aid...],//收藏
			comment:[cid]//写了哪些评论|说说
			msgboard:[cid]//留言板，谁给这个人留言了
		}],

		//文章的查询特别多，文章相对来说比“说说"少很多"，且有些字段也不一样，没必要放一个集合，逻辑上也说不通，性能上也不好
		articles:[{//业务逻辑处理的时候，要特别注意是“文章”|“说说”|留言

			//下面是内容
			aid,//唯一id
			time,//时间
			title,//标题
			content,//内容

			//下面是关联key
			tag:["desc1","desc2"....]//标签
			comment:[aid,aid]//评论：只有针对文章的评论，其他都没有
			uid,//谁写的 
			atuid,//作者@谁 
			faver：【uid】//点赞 
			relay:[uid,uid]//转发 
		}]

		//谁在什么时候对谁说了什么话，哪些人支持点赞
		comments:[{//注意，这个不光是相互评论；还有一个是个人主页留言板的第一层评论，

			//下面是内容
			cid,//唯一id
			time,
			content,

			//下面是关联key
			uid,//谁写的
			target:{//针对谁
				uid,//在某人留言板留言
				aid,//在某个文章下留言
				cid,//针对某个评论或说说留言
				noid//不针对任何人，文章，评论|说说；也就是自己发独立的说说
			}
			faver：【uid】//点赞
		}]

	}
}
		




关于前后端数据传输：


Form元素的EncType属性表明提交数据的格式 用Enctype属性指定将数据回发到服务器时浏览器使用的编码类型，默认的缺省值是“application/x-www-form-urlencoded”。


下边是说明：
application/x-www-form-urlencoded：窗体数据被编码为名称/值对。这是标准的编码格式。


multipart/form-data：窗体数据被编码为一条消息，页上的每个控件对应消息中的一个部分。


text/plain：窗体数据以纯文本形式进行编码，其中不含任何控件或格式字符。

补充
form的enctype属性为编码方式，常用有两种：


application/x-www-form-urlencoded和 multipart/form-data，


当action为get时候，浏览器用x-www-form-urlencoded的编码方式把form 数据转换成一个字串（name1=value1& amp;name2=value2...），然后把这个字串append到url后面，用?分割，加载这个新的url。


当action为post时候，浏览器把form数据封装到http body中，然后发送到server。如果没有type=file的控件，用默认的application/x-www-form-urlencoded 就可以了。但是如果有type=file的话，就要用到multipart/form-data了。浏览器会把整个表单以控件为单位分割，并为每个部分加 上 Content-Disposition(form-data或者file),Content-Type(默认为text/plain),name(控件 name)等信息。
其中Content-Type字段的详细是  Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryzAA0Ue6tbq3U3fAq  ；注意这个 boundary：boundary 是分隔符，分隔多个文件、表单项。如果不自己设置，默认由浏览器自动产生

“application/x-www-form-urlencoded”在向服务器发送大量的文本、包含非ASCII字符的文本或二进制数据时这种编码方式效率很低。



    在文件上载时，所使用的编码类型应当是“multipart/form-data”，它既可以发送文本数据，也支持二进制数据上载。

 

    Browser端<form>表单的ENCTYPE属性值为multipart/form-data，它告诉我们传输的数据要用到多媒体传输 协议，由于多媒体传输的都是大量的数据，所以规定上传文件必须是post方法，<input>的type属性必须是file。

    上传数据的类型【例如multipart/form-data; boundary=----WebKitFormBoundaryBjCL9yOqUJg6HYxg】，从this.req.headers["content-type"].split(";")[0]中获取到类型【例如：multipart/form-data类型】
    上传的数据，是从this.req.on("data",function(data){ 处理data数据 })中获取上传数据，然后在this.req.on("end",function(data){ 数据完全接受完成后的业务处理 })





koa中一般最基本的插件：
	koa-router：路由
	koa-static：静态资源服务
	koa-compress:压缩
	koa-helmet: http安全头，例如X-Frame-Options为SAMEORIGIN防止网站被嵌入别的不同域网站的iframe里面等
	koa-bodyParser：把formData数据同步到this.request.body上
	koa-jwt和jsonwebtoken插件:登录态插件，koa里面jwt只设置了加密方式和流程；jsonwebtoken里面
	koa-conditional-get和koa-etag的缓存

	node-rsa：非对称加密；公钥传给前端，前端框架jsencrypt用公钥加密后传回给后台
	crypto[ˈkrɪptəʊ] :hash加密【我选用的机密方式是sha256；常用的hash有md5和SHA256】，不可逆，用于转译敏感数据，比如密码不能明文保存，需要用crypto进行哈希加密在保存到数据库
	xss：防止跨站脚本攻击
	base64url：Base64有三个字符+、/和=，在 URL 里面有特殊含义，所以要被替换掉：=被省略、+替换成-，/替换成_ 。这就是 Base64URL 算法
	ip，uuid/v4


	formidable:图片上传插件，
	svg-captcha：验证码插件，注册时用到验证码



koa相关：
	this.request是context经过封装的请求对象，用起来更直观和简单；this.req是context提供的node.js原生HTTP请求对象







前端数据转化流程+后端如何实现前端的多个ajax分片数据接收：
            1.Blob对象【文件，ele.file就是这个类型，也可以通过new Blob([new Uint8Array(['a','d','s'...])],{type:'数据类型，例如image/png'}) 来删除文件对象的原始数据】；
            2.ArrayBuffer ，对象用来表示通用的、固定长度的原始二进制数据缓冲区，可以在FileReader对象的onload时间中通过this.result获取；通过这个对象，可以获取到创建Blob时所需的Uint8Array数组，
            3.Uint8Array，类型数组，有非常多的类型数组，这些数据类型是构造Blob的前提，所以要像操作文件，必须要获得对应的Uint8Array或其类型数组对象
                Uint8Array([1,3,4]|ArrayBuffer)都可以生成Uint8Array对象，也就是说里面可以传入原始数组，也可以传入ArrayBuffer数据
            4.原始数组[]，这个就是二进制流的最底层，上面第三步中的Uint8Array或其他数组类型，都是接受原始数组的传入，接下来还可以用base64编码和解码；
            5.base64字符串，其实就是字符串，例如图片可以转成base64字符串【浏览器识别】；应用文件【例如php exe后缀的文件】也可以转成base64字符串，只是浏览器不识别而已，但这个数据流就是这个文件。
                其中 btoa (Binary to ASCII)：base64编码 这个函数是没有对+和/符号做兼容处理的，所以最好还是用兼容的js-base包，否则的话，自己还得写字符串处理的兼容问题
                     atob (ASCII to Binary)：base64解码 这个函数是没有对+和/符号做兼容处理的，所以最好还是用兼容的js-base包，否则的话，自己还得写字符串处理的兼容问题
        如何从Blob【就是原始文件ele.file】转成base64字符串，然后进行文件的分割；步骤如下
            var reader = new FileReader();//这是核心,读取操作就是由它完成.
            reader.readAsArrayBuffer(document.getElementById("idname").files[0]);//读取文件的二进制内容【一般读取应用文件】；//reader.readAsDataURL是用来读取图片的base64字符串
            reader.onload = function () {//文件阅读器加载了好了这个文件，就可以通过
                //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可this.result获取arraybuffer对象
                var binary = this.result;//arraybuffer对象（有3种表示方法）
                var arr = new Uint8Array(binary);//提取二进制字节数组，使用Uint8Array表示
                var base64Str = Base64.encode([...arr].join(""),true);//最好别用btoa，用统一的js-base64这个包，能处理特殊符号的问题；
                //把Unit8Array转成原始数组，然后获得原始字符串，然后在把字符串进行base64转码，生成对应的base64字符串,转base64只是为了提高数据传输安全性
                // ajax和form表单请求发送，默认是不会给数据进行base64加密的，需要自己加密

                // ...接下来的业务逻辑处理，如何分割这个“文件流”
                ！！！特别注意的一点，如果base64字符串传给后端，需要把+和/转成-和_,后端再转回来【后端有base64url这个包可以正确处理+和/的问题，就是解码的时候，会先把-和_转成+和/然后再用base64解码；编码是先base64编码，在把+和/转成-和_】
                      前端这边，js-base64是和后端的base64url处理方式类似，会有对+和/的兼容处理，decode解码的时候默认会把-和_转成+和/；但是encode的时候，是否处理+和/，得看第二个参数，Base64.encode("fdsfds",true),表示会把+和/转成-和_
                      前端这边还有一个问题，如果base64不是用于http请求的传输数据，那么就得用原始的base64，比如atob或btoa等，这个是非常严肃的问题，运气好不出bug，如果传输的数据刚好出现先+和/特殊字符，
                      那么首先得判断你用这个base64，是处理本地的原生，还是url传输；如果全部用兼容处理的base64，虽然可以解决url的问题；但是对于本地的业务处理的base64，就可能出错，比如我要把图片转本地base64
                      如果按照url的base64转，那么就会出现图片展示的问题，只能用原始的base64来处理；而且canvas产生的base64，都是原始的base64，这个得做特殊处理，否则就会有各种各样的猜不透的bug
                      比如前端的jsencrpy中用到了base64，是原生的base64，在本地解密是可以的，但是这个数据通过url传递到后台，就会有+和/的传输问题，所以前端在传数据前，必须替换+和/,
                      后端那边用base64url来解码【把-和_转成+和/然后再用base64解码】，然后再node-rsa的私钥去解密
                
            } 

        如何从base64字符串转成对应的Blob文件，然后通过FormData的形式发送ajax请求，来上传文件
            var originStr="kkefsfds";//原始字符串
            var base64=Base64.encode(originStr);//如果直接得到的字符串就是base64字符串，那就没有必要btoa了，因为再执行依次，就编码2次base64了【base64是可以编码解码的，而hash加密"比如md5加密或sha256加密"是不可逆的】
            var originArray=[...base64];
            var unitArr=new Uint8Array(originArray);//注意，这个originArray必须是base64字符串转化而来，否则Uint8Array会识别错误
            var localFile=new Blob([unitArr],{type:"image/png"});//这里是转成png图片格式的Blob对象，还可以是aplication/octet-stream（这是应用程序文件的默认值，很少用）
            var fd = new FormData();
            fd.append('file',localFile, Date.now() + '-user-pic.'+match[1].split("/")[1]);//后缀名和mimetype必须对应
            fd.append('enctype',"multipart/form-data");//表单数据的编码方式，有下面三种【编码格式==content-type】 “Content-Type是指http/https发送信息至服务器时的内容编码类型
                                                       //multipart/form-data才能用于文件上传【可以用文本和二进制方式上传】；
                                                       //application/x-www-form-urlencoded不是不能上传文件，是只能上传文本格式的文件；在发送前编码所有字符（默认）
                                                       //text/plain：空格转换为"+"号，但部队特殊字符编码
                                                       // ajax的默认编码方式也是application/x-www-form-urlencoded；一般都设置成 application/json，也就是content-type设置为application/json
                                // content_type是mimetype的别名；提示Mime错误，就是content-type返回错误；例如abc.xls;而content-type是后端给这个文件设置的编码类型，告诉浏览器应该以什么文件的类型来打开它；只要后端设置正确，就没问题；
                                // 比如服务器那边传送.avi文件，它对应的mimetype是“video/x-msvideo”，也就是给这个response的content-type设置“video/x-msvideo”；如果设置错了，设置成了 text/css；那么浏览器按照css文件格式去解析，就会提示Mime错误

            fd.append('表单自定义key',"自定义value");//自定义数据，模仿表单中上传的key和value
            $.ajax({
                data:fd
                type:"post",
                dataType: 'json',//如果不用dataType，默认传的是form数据，数据只能传一层，多层的数据会按照属性遍历分开传
                url:"",
                cache:false,//不设置缓存
                precessData:false,//data数据无需序列化，必须为false，因为上传的是文件流信息
                contentType:false//表示不设置contentType；前提是ajax得支持这个功能，有的ajax库会有个默认的content-type而且还不能删除这个值，只能覆盖，那就完了，只能修改ajax库
                // contentType:"" 这个contentType千万别传，如果框架的ajax中默认传了，就得注释掉，因为post方式上传FormData类型的数据，他会默认设置成multipart/form-data；boundary.....格式，如果自己设置了，就会报错
            })

        后端传送“文件流”到前端，如果把文件流转换成对应的“应用程序”或者“图片”或excel【默认后端是传base64格式的字符串过来】
            var unitArr=new Uint8Array([...atob(base64Str)]);//base64字符串解码后展开，因为后台那边是把文件流通过base64编码了，所以需要解码
            var file=new Blob([unitArr.buffer],{type:"application/vnd.ms-excel;charset=utf-8"});
            var localUrl=window.URL.createObjectURL(file);//创建资源文件的本地url
            var link = document.createElement("a");
            link.download = "dbfile.xls";//下载的文件名，注意这个后缀要和Blob中的type呼应
            link.href = localUrl;//下载资源文件的url，这里是本地的url
            link.click();//直接触发click去下载资源
            各个文件的mime类型和后缀，详见 http://blog.csdn.net/weixin_43299180/article/details/119818982 ； 
            只要再Blob的type中设置对应的类型+;charset=utf-8，然后a标签的download属性设置对应缀名的文件名即可

        上传进度监控：
            ...
            //xhr.upload有：loadstart【开始上传】 error【出错】 abort【终止】 timeout【超时】 load【上传成功】 loadend【上传停止】等时间
            xhr.upload.addEventListener('progress', e => {
              if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);//上传资源的百分比
              }
            })
            xhr.open('post', 'http://localhost:5000/upload'，true);
            xhr.send(data);

        如何实现大文件分割上传：多个ajax发送给服务器【可以串行发送ajax，也可以并发ajax】，服务器全部接收完成以后资源整合，然后做出反馈；
            var mov = document.getElementById('mov').files[0];//Blob类型文件，就是源文件
            var size=move.size;//文件大小
            var arr=[mov.slice(0,size*0.5),mov.slice(size*0.5)];//Blob这个文件类型支持slice方法进行类似数组的分割;
            var fd1=new FormData();
            fd1.append('file',arr[0]);//后端通过file字段去拿对应的数据，这个名称是可以自定义的
            fd1.append('index',"0");
            fd1.append('enctype',"multipart/form-data");
            var fd2=new FormData();
            fd2.append('file',arr[1]);
            fd1.append('index',"1");
            fd2.append('enctype',"multipart/form-data");
            $.ajax({
                ...
                data:fd1
            })
            $.ajax({
                ...
                data:fd2
            })

            //上面是前端Blob类型的数据分块，下面是后端的接收方法，如何实现“断点续传”【部分包传送失败，如何从接受】还没写
            //思路是：
                1.前端分批发送包，后端接收到包就立马把文件存到静态资源服务器，而不是内存【占用内存不好，而且不同的ajax请求之间，node端触发的是不同的异步事件，数据难以相互通信，那么大文件放cookie或session明显不对】
                2.每个包都是放入静态资源文件夹后【存在相同前缀就覆盖，相同前缀表示同一个分片，每个分片后跟随时间戳，因为有的分片可能是之前的缓存，要保证一次整个包的一轮上传操作内每个包时间戳相同，第二次整体上传各个分片用新的时间戳】，
                  当前分片上传完成后，根据当前分片的时间戳，去静态资源里面寻找相同时间戳的其他分片，总体数量和前端的分片数相同，就表示上传完成，直接把这些分片静态资源整合到一个文件，然后给前端返回上传成功
                3.如果想要断点续传，很简单，哪个分片的ajax请求失败了，就重新自动再发送哪个分片的ajax请求，用相同的时间戳发送，表示这些分片是同一批的；如果连续好几次发送失败【一般不会】；那就重新上传整个文件，然后再重新分片发送
                  这个时候各个分片就有新的时间戳，相当于重新发送；【每次文件上传成功后，需要把所有的分片，以及上次的相同文件名的整个文件都删除】

            this.req.on("data",function(data){ 处理data数据 })中获取上传数据，然后在this.req.on("end",function(data){ 数据完全接受完成后的业务处理 })


        node的tcp连接数量有限，每个客户端的http请求，都是异步的事件，都会生成一个js执行环境，通过v8传到libuv进入事件轮询，从线程池中获得一个线程来执行操作，多线程并发，
        所以各个http请求是相互独立的，tcp通道内有可能是一个http请求，如果是http2那就有多个http请求流的并发，tcp和http请求跟用户是没有对应关系的，一个用户可以有多个http请求并发，也可以是多个tcp请求并发
        服务器是按照http作为最基本的单位，来执行事件的，它到了libuv，就能分配到一个线程，一个http可以看作是一个线程【java上出现一个http请求就开一个线程，node是在libuv层分配一个线程】
        所以不同的http请求之间的数据传递，是比较难的，要么放入用户的服务端cookie，要么放入session，要么放入数据库，这样才能保证同一个用户的数据的独立性；遇到静态资源，就放到该用户id对应的静态资源文件夹下，也能保证数据的独立性

        url中，端口指的是服务器的端口，服务器默认是80端口对外访问，客户端浏览器可以是任何端口去访问服务器的80端口，而tcp四元组是客户端ip，端口，服务器ip 端口；服务器ip和端口基本固定
        所以服务器可以允许的tcp连接==ip数*客户端端口数，基本是无限的，但是linux本身的tcp连接是由上限的
        "TCP/IP" 必须对外提供编程接口，这就是Socket, Socket跟"TCP/IP"并没有必然的联系。Socket编程接口在设计的时候，就希望也能适应其他的网络协议
        socket有几个通用的接口才操作tcpip协议的数据 create，listen，accept，connect，read和write等等；socket是在“应用层和传输层【tcp】之间的一层，用于数据传递
        同一个域名一般在一个tab浏览器上只允许6个tcp连接，因为客户端ip相同，所以一般开启6个端口，建立6个tcp连接去访问；
        ////