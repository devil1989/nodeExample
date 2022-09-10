//关于服务器安全的若干问题：
  // 1.外部上传的资源文件夹，需要设置它的权限，也就是它里面的文件，没有执行权限，这个涉及操作系统的文件权限设置，这样就算木马被上传到了服务器，也没法执行从而控制服务器
  // 不过虽然服务器安全，但是用户却不安全，用户打开html，加载伪装成图片的木马文件，就容易被黑，所以服务端如何防止木马文件伪装成图片上传，就比较重要


// 最终的安全方案：
//  1.用https，至少在传输这一层数据相对安全，站点防伪造【别人输入这个网址，必须返回自己的站点】
//    因为ssl证书是和域名或者ip绑定在一起的，对方访问这个域名，就必须返回你这个站点，否则就提示危险
//    https传输的时候的数据加密+防篡改，域名访问站点时候的站点校验【是否是真的站点】
//  2.普通功能的登录态，用jwt验证操作；koa-jwt
    // 3.
    //   防止服务器重播攻击：上次用户用这个数据请求成功，黑客用相同的数据向服务器发起请求，窃取登录态权限
    //     重要功能的登录态操作，在jwt的基础上，做session表验证，第一次登录成功后
    //     用户数据库表中生成一个（动态id+签名）【理解为重要数据的独立新jwt的token】，然后返回给客户端用户，
    //     下次客户端必须带这个新数据的token，校验是否被篡改，然后获取里面的动态id
    //     跟用户数据库的动态id做对比，对的上就算可以访问私密数据，返回数据的同是生成新动态id
    //     新动态id保存到数据库，同时也返回给客户端，下次就得用这个动态id，也就是私密数据请求
    //     token是一次性的，防止重播攻击；因为私密数据操作不多，所以可用这种方式访问数据库，
    //     如果用户普通jwt这个token失效或者请求私密数据的时候这个私密数据token失效；
    //     都要让用户重新登录，私密数据token时间设置最好要比普通token长，这样能保证普通登录态
    //     的情况下，私密数据也能正常操作,不然的话，普通数据操作好好的没让重新登录，一操作私密数据
    //     直接跳出了登录态需要重新登录，就让用户很疑惑。

    //   客户端重播攻击：用户登录或者私密数据操作成功后，服务器返回最新的登录态数据
    //                               如果返回期间，数据被截获【虽然是加签的，不能伪造和篡改】，
    //                               用户用这个原样的数据放到自己的浏览器，比如用户A登陆后
    //                               服务端返回的加密数据被截取，然后黑客自己再用个人帐号登录
    //                               返回数据的地方打断点，把截取的数据放入，cookie和其他都原样
    //                               覆盖掉自己的信息；这个就是客户端重播攻击，
    //   客户端重播如何防御【是黑客服务器分会给用户的有效数据，导入到自己设备内，模仿用户登录】：
    //                     客户端请求html页面的时候，服务端给到动态公钥;
    //                     客户端每次发起请求的时候，带上公钥加密的"时间戳+ua"；
    //                     服务端返回的时候，给"时间戳+ua"加签，防止客户端接收前被篡改或伪造；
    //                     客户端接受后，验签保证数据没被篡改，然后把本地的加密"时间戳+ua"
    //                     和服务端返回的数据做对比，如果相同，那就是没受到客户端重播攻击；
    //                     因为客户端重播攻击，其他数据全部一样，但是黑客本地的localstorage内
    //                     的动态“时间戳+ua”，和客户端那边的“时间戳+ua”，肯定不同；黑客要通过，
    //                     必须把本地的“时间戳+ua”在加密之后，后客户端的加密“时间戳+ua”一样；
    //                     但而js中的验证逻辑代码，黑客是无法改的，js代码里获取ua
    //                     和本地localstorge中的时间戳，合并一起加密，和客户端返回的做对比；
    //                     黑客虽然知道加密的公钥，但无法根据这个推导出对面的加密数据的原型；
    //                     所以也就无法知道对面的时间戳和ua；
    //                     只要数据没对上，就是客户端重播，直接清空用户的登录态，让他重新登录


      

//  4.用户登录用动态码技术，两次ajax请求，第一获取动态码，返回客户端后，
//    第二次自动带上用户的请求数据+动态码；客户端校验用户数据+动态码，然后确认通过
//    下次用户登录，老数据肯定不能用了，因为动态码变了，而且融合在请求数据里面，无法伪造
//       用户登录也可以用依次ajax请求，中间加入时间戳；报错到用户表中；
//       下次再登录也是把最新时间戳带进去，和用户表的时间戳做对比，如果一样，那就是伪造的
//       因为每次登录的时间戳都不一样，这样有一点不安全，因为如果黑客拿到加密的数据，稍微改了下
//       结果刚好导致解密出来的时候用户名和密码没变，只是时间戳变了，就会误导导致登陆成功
//       2 次ajax的的验证码要求一样，就没法伪造通过。
        // 2 次ajax其实是防止重播攻击的简化板，因为用户名和密码是用户输入的，黑客不知道，
        // 所以时间戳就算被黑客截取了，也无法加密成一个能通过用户名和密码验证的相同加密包
        // 黑客的重放攻击都是基于登录态token，所以防止登录态token被重放攻击
        // 就等于防住了所有的重放攻击。


// 关于token的安全问题：如果token不加密，别人知道了你的token内容【黑客自己注册，然后解码看内容】
// 就获得了token内的所有信息，然后，它自己按照这个转换过程写一个伪造的token，
// 但是token的加签是后端的私钥加签的，所以即使伪造内容，但无法把另一个伪造加签，所以伪造失败
// 同样，因为私密加签，所以篡改也会失败；所以jwt是防伪造和篡改的。但因为不是加密，所以不放私密数据
/*那么jwt唯一的漏洞：jwt的重放攻击【所有数据都一样再请求一遍，https无法组织重放攻击，
                    因为它们不需要加密解密，或者篡改数据，只要原封不动再请求一遍，就进入登录态了*/
// 因为信息被截取的时候，header中包含了所有请求信息，唯一的ip验证因为黑客在同网段攻击，所以ip也一致
// 这个怎么防？因为很多黑客都是局域网内黑别人帐号，局域网对外都是同一个固定ip



/*xss，csrf，sql注入，网络劫持，点击劫持，控制台注入代码，smurf攻击，重定向攻击，
  上传文件攻击：最危险的，而且也很难防，我这边只有图片上传，把图片转base64【限制大小】
               这样就可以解决文件上传攻击了
  ddos攻击:最怕的就是这个，这个非常复杂，也很难防御，需要负载均衡和各种设置，暂时不做

网络劫持：你的页面，在返回给用户的时候，页面内容被修改后返回给用户，或者直接把模仿站点返回给用户
         手段非常多，通过https可以防网络劫持
点击劫持：用户看到的并非真正的信息，html被修改你点击的是另外的区域，所以执行的也是另外的操作
         这种都是发生在垃圾网站或者钓鱼网站；如果自己的网站被黑客嵌入了iframe
         然后这个iframe又诱导用户执行危险的数据操作，用户以为只是点击了简单的操作，
         其实是点击在危险的iframe上，导致执行危险的数据操作。
         http头的X-Frame-Options 是为了预防自己的站点被嵌入别人的站点的iframe造成数据泄露，
         同时别人站点内在用html层悟道用户执行非正常操作，别人站点嵌入自己页面是不做防御的
         试想下，别人都能在你页面嵌入iframe了，为什么不嵌入script，不是更简单粗暴么
         所以X-Frame-Options是为了让自己的页面不被嵌套在别人的站点内，导致自己站点的数据泄露：
          DENY：不准嵌入iframe
          SAMEORIGIN：frame页面的地址只能为同源域名下的页面
          ALLOW-FROM：允许所有iframe

smurf攻击：冒充target ip 广播icmp回显请求，target会收到大量icmp回显回复，从而忙于处理icmp而拒绝服务。
          如何防御：使主机或路由器不响应ICMP请求或广播，或使路由器不转发目的是广播地址的数据包

ICMP重定向攻击：重定向：若路由器收到一个数据报，并发现该数据报存在一个比自己更好的下一跳路由，就会向主机发送重定向报文，让其更新转发表。
                重定向只支持对单个目标主机的重定向，所以不会改变路由表，但可以改变route cache， netstate -rn --cache
                如何防御：使用防火墙过滤icmp或手动关闭icmp redirect

csrf【跨站请求伪造】:用户登录站点后，不小心进入其他钓鱼网站，点击钓鱼网站的链接【链接跳转用户登录的站点并执行相应操作】
     所以csrf攻击基本就是通过浏览器url的get请求来实现的，带上的是用户当前登录态的cookie；
     基本上就是等于误导用户通过url来执行请求，url中不能执行里面的js【其次url的正常get请求不能有敏感数据】
     还有csfr的post攻击，如果钓鱼网站上面填写一个form表单，action地址是你的的路过站点的地址
     那他就可以伪造post，输入任何参数，同时cookie服务端获取请求，会拿用户登录过的站点产生的cookie
     所以这个时候，给登陆过的站点的cookie设置cookie的samSite属性，防止其他页面发起对应服务端请求的时候，
     浏览器自动带上哪个服务器网站需要的cookie【这样做是为了方便用户跨站请求后跳转，到原来的站点时仍然保持登录态】
     因为这个功能在正常网站之间功能跳转时很常见的

    cookie攻击核心： cookie 最初被设计成了允许在第三方网站发起的请求中携带，CSRF 攻击就是利用了 cookie 的这一“弱点”
                    也就是第三方网站发起post请求【action设置为用户登陆过的站点】，cookie也会被带上,
                    
                    浏览器层防御：面对cookie的samSite属性【服务端设置cookie的这个属性，告诉客户端这个cookie是samSite还是Lax】，防御这个的：
                      Strick：预防钓鱼站点直接用表单post【在其他站点发送post请求】【post的action指向被攻击站点】
                              预防钓鱼站点内植入url+参数的请求跳转到被攻击站点
                      Lax：只预防钓鱼站点直接用表单post【在其他站点发送post请求】【post的action指向被攻击站点】
                           不预防钓鱼站点内植入url+参数的请求跳转到被攻击站点
                           如果url预防了，那么任何第三方站点跳转本站，都没有cookie信息发送到服务端，也就没有登录态
                           这个就很不方便，Lax基本是统配；
                      不设置：不对samSite设置的话，外部站点用url+参数跳转攻击肯定是没法防御
                              就连最危险的外部站点上post请求调教给目标站点，都没法防御，因为cookie会自动带过去
                    
                    服务器层面防御：因为有的浏览器不支持samSite属性，所以通过referer判断请求来自哪里，是很有必要的
                                  也就是最最核心的数据操作，需要在服务器端添加一道referer判断的防御。
                                  涉及安全的请求都要用post；
                                  最最重要的一点，url带参数的请求，绝对不能涉及重要的数据操作！！！！
                                  因为samSite设置为lax下，其他页面跳转url到自己站点发起请求
                                  cookie是会带给服务器的，所以如果url上可以设置参数来进行重要的数据操作
                                  那么钓鱼站点只要在自己站内植入对应操作的url链接诱导有户点击即可


    如何防御：【这个csrf是可以利用token登录态的】
        通过 referer、token 或者 验证码 来检测用户提交。
        尽量不要在页面的链接中暴露用户隐私信息。
        对于用户修改删除等操作或其他重要操作，使用post 操作 
        避免全站通用的cookie，严格设置cookie的域。     
        通过referer识别，request.getHeader("Referer");

    最终防御策略：1.所有登录态的数据操作，都通过header的authorization来验证登录态，绕过cookie
                 2.页面的url请求，不能操作数据，不能展示核心私密数据【
                    钓鱼网站给url让用户点击，如果操作数据，就不安全
                    核心私募数据虽然有了3这个步骤的保护，但是最好还是别展示
                 】
                 3.header设置X-Frame-Options为SAMEORIGIN，iframe中只能嵌入同源站点
                   就可以防止网页在 iframe 中显示
        

Http Heads攻击：就是url参数里面包含js脚本，如果用这个url重定向，就会执行js脚本改变，再http
请求头中插入脚本【encode也没用】

xss攻击主要是集中在服务端的模板输出html环节+前端js对用户自定义信息的输出：
服务端那边html输出，注意不要把用户自定义信息通过html代码输出，用户数据用encodeURIComponent或其他转化
最重要的是前端这边的数据输出，不管是ajax传过来的，还是服务端html里面传过来的转译数据，
最终都会成为前端数据，而这个前端数据如何放到html，成了xss的关键：
  核心就一点：不要根据数据来凭借html字符串，然后把它设置到元素的innerHTML里面，这样是富文本输入，容易受到xss攻击
             需要保证每一个数据字段，都设置到html元素的属性【包括input的value和textarea的value属性】或者text节点文本
             如果用 Vue/React 技术栈，并且不使用 v-html/dangerouslySetInnerHTML 功能，就在前端 render 阶段避免 innerHTML、outerHTML 的 XSS 隐患。

整体的 XSS 防范是非常复杂和繁琐的，我们不仅需要在全部需要转义的位置，对数据进行对应的转义。而且要防止多余和错误的转义，避免正常的用户输入出现乱码。
具体如下：
    利用模板引擎 开启模板引擎自带的 HTML 转义功能。例如： 在 ejs 中，尽量使用 <%= data %> 而不是 <%- data %>； 在 doT.js 中，尽量使用 {{! data } 而不是 {{= data }； 在 FreeMarker 中，确保引擎版本高于 2.3.24，并且选择正确的 freemarker.core.OutputFormat。
    避免内联事件 尽量不要使用 onLoad="onload('{{data}}')"、onClick="go('{{action}}')" 这种拼接内联事件的写法。在 JavaScript 中通过 .addEventlistener() 事件绑定会更安全。
    避免拼接 HTML 前端采用拼接 HTML 的方法比较危险，如果框架允许，使用 createElement、setAttribute之类的方法实现。或者采用比较成熟的渲染框架，如 Vue/React 等。
    时刻保持警惕 在插入位置为 DOM 属性、链接等位置时，要打起精神，严加防范。
    增加攻击难度，降低攻击后果 通过 CSP、输入长度配置、接口安全措施等方法，增加攻击的难度，降低攻击的后果。
    主动检测和发现 可使用 XSS 攻击字符串和自动扫描工具寻找潜在的 XSS 漏洞。

xss【跨站脚本攻击】防范从3方面：
              1.数据录入方面：前端过滤没啥用，可以随意伪造请求，
                需要后端对提交的数据根据不同业务类型进行格式的确认，不如电话号码，那就不能带字母
              2.数据推送方面：这个就是核心了，用户提交的数据，在不同的场景需要进行不同的转译
                转译既要保证不被xss攻击，又要保证用户能看到正常的信息而非乱码，这个就很麻烦
                用node的xss插件，自定义设置白名单，特定标签对应的特定属性可以通过，其他都转码
              3.页面url上的漏洞，比如有些逻辑通过url参数来实现，黑客通过url后面添加脚本，
                最终导致js获取url参数的时候使用了url上面的脚本代码，黑客用你的站点url后面添加脚本
                去发给用户来获取用户信息
              4.css属性里面的expression中可以传入js代码，老的浏览器甚至连标签的style中都可以使用expression


*/            



/*desc:所有安全相关的代码，全部放这里，供其他页面或公共调用
  1.添加动态验证码【时间戳】和验证，
  2.图片动态码验证【前端已经验证了，后端不验证，反正不是什么重要功能，防止机器刷而已】
  3.手机验证码封装，手机短线验证，
  4.登录态权限封装和验证，
  5.数据私钥解密，传送数据加签
  6.防机器人刷后端接口等
  7.防xss注入；【前端把用户提交的详细，提交后台之前统一encode或下载展示用户信息的时候也encode转译】
  8.用户提交的数据：是否会利用sql或者mongodb的语言漏洞，获取不该获取的数据库数据信息！！！！
*/


/*
安全unfinish：服务端重播攻击，客户端重播攻击 xss，csrf，sql注入，上传文件，ddos主要是这几个
  2.修改密码，或者其他修改重要数据的时候，用双token机制，防止重播攻击
  4.图片不上传，插入图片转base64【限制大小】
  5.sql注入防御
  6.ddos防御制作最基本的【粗略做一下即可，毕竟负载均衡没法做】
*/


// 重播攻击、回放攻击：他的原理就是把之前窃听到的数据原封不动的重新发送给接收方。
//                   HTTPS并不能防止这种攻击，虽然传输的数据是经过加密的，
//                   窃听者无法得到数据的准确定义，但是可以从请求的接收方地址分析出这些数据的作用。
//                   比如用户登录请求时攻击者虽然无法窃听密码，
//                   但是却可以截取加密后的口令然后将其重放，从而利用这种方式进行有效的攻击。


const jsonwebtoken = require('jsonwebtoken');
const config = require("../../config");
const NodeRSA = require('node-rsa');
const base64url = require('base64url');
const xss = require("xss");//核心就是把<和>分别转成"&lt;"和"&gt;",
const ip = require('ip');
const uuid = require('uuid/v4');
const util=require("../util.js");
const crypto= require("crypto");

// 数据字段解析：
  // context:{
  //   app:koa框架实例，里面放许多注册组件等统一信息，//单例，不是每个页面都有，是通用的：比如加密的密钥
  //   request ：{//koa封装req产生的“每个页面的请求信息接口”
  //     body：前端传过来的数据
  //     //页面的url相关参数和url请求方式
  //     //下面这些信息可以在request中的相同字段中获取，
  //     header:页面请求的header
  //     host，href，origin，path，protocol，query，search，method：页面请求url相关信息和请求方式
  //     ...
  //   },
  //   response：{//koa封装res产生的“每个页面的返回信息接口”
  //     body：前端传过来的数据
  //     ...
  //   },
  //   res和req是node原生的“请求和返回信息接口”,
  //   state:{ //用户保存全局变量
  //     jwtOriginalError:{jwt原始验证信息}
  //     scope:每个页面后端产生的数据，每个页面都不同，比如鉴权，是否登录状态，用户私密信息等
  //   }，

  //   // //下面这些信息可以在request中的相同字段中获取，这里直接弃用
  //   // header:页面请求的header
  //   // host，href，origin，path，protocol，query，search，method：页面请求url相关信息和请求方式
  // }


//个人xss攻击自定义防范，制定白名单，只允许某些标签的特定属性；
//这个只针对富文本编辑器的内容；因为它里面有html标签，其他任何地方的用户内容输入
//都采用默认的xss防御策列:用xss.whiteList可以查看，
function getPersonalXssRule() {

  //href,src,属性以及form表单的action，都可以输入javascript:URL;
  //只要是能放url的地方，就可以放js执行xss攻击；
  //某些可以放js的标签，比如script标签里，可以执行xss攻击，包括eval函数
  //style里面可以放各种url，所以可以进行xss攻击，需要对style做特殊处理
  // 在 style 属性和标签中，包含类似 background-image:url("javascript:…"); 的代码（新版本浏览器已经可以防范）。
  // 在 style 属性和标签中，包含类似 expression(…) 的 CSS 表达式代码（新版本浏览器已经可以防范）。
  // style中只要出现expression，javascript；直接把style清空
  //新版本浏览器已经没有style植入expression，javascript的翻新了，但老浏览器还有
  var opts={
    whiteList: {//这些特定样式相关标签的样式相关属性全部搞下来，其他全过滤
      div: ["class", "style", "id"],
      p: ["class", "style", "id"],
      h1: ["class", "style", "id"],
      h2: ["class", "style", "id"],
      h3: ["class", "style", "id"],
      h4: ["class", "style", "id"],
      h5: ["class", "style", "id"],
      blockquote: ["class", "style", "id",'cite'],
      strong: ["class", "style", "id"],
      em: ["class", "style", "id"],
      span: ["class", "style", "id"],
      s: ["class", "style", "id"],
      ul: ["class", "style", "id"],
      ol: ["class", "style", "id"],
      li: ["class", "style", "id"],
      table: ["class", "style", "id",'width', 'border', 'align', 'valign'],
      colgroup: ["class", "style", "id",'align', 'valign', 'span', 'width'],
      col: ["class", "style", "id",'align', 'valign', 'span', 'width'],
      tbody: ["class", "style", "id",'align', 'valign'],
      tfoot: ["class", "style", "id",'align', 'valign'],
      tr: ["class", "style", "id",'rowspan', 'align', 'valign'],
      thead:["class", "style", "id",'align', 'valign'],
      th: ["class", "style", "id",'width', 'rowspan', 'colspan', 'align', 'valign'],
      td: ["class", "style", "id",'width', 'rowspan', 'colspan', 'align', 'valign']
    },

    //标签的style中出现javascript或者expression，就把style属性删除
    //这个在前端做防御吧，后端开销太大
    onTagAttr:function(tag, name, value, isWhiteAttr) {
      if(name=="style"&&/(javascript)|(expression)/.test(value)){
        return "";
      }
    }
  }
  var personalXss=new xss.FilterXSS(opts);
  return personalXss;
}

//前后端加密的密钥初始化；
function initEncrypt(app){
  
    var key = new NodeRSA({ b: 1024 });//公钥长度
    key.setOptions({ encryptionScheme: 'pkcs1' });//指定加密格式：因为jsencrypt使用这个格式加密的
    var publicKeyStr = key.exportKey('pkcs8-public');//制定输出格式：公钥字符串
    var privateKeyStr = key.exportKey('pkcs8-private');//制定输出格式：私钥字符串
    var publicKey = new NodeRSA(publicKeyStr);//用公钥字符串创建公钥
    var privateKey = new NodeRSA(privateKeyStr);
    publicKey.setOptions({ encryptionScheme: 'pkcs1' });//指定加密格式：因为jsencrypt使用这个格式加密的
    privateKey.setOptions({ encryptionScheme: 'pkcs1' });//指定加密格式：因为jsencrypt使用这个格式加密的
    app.encryptKey={publicKeyStr,privateKeyStr,publicKey,privateKey,key };
}



//验证jwt的登录态：可以通过cookie验证，也可以通过header的authorization字段验证；
//cookie验证的坏处是，csrf攻击可能包含cookie导致通过，这个可以通过浏览器的cookie的samsite设置拦截一大部分
//还有一部分可以通过referer来拦截；
//用header的authorization字段验证，那前端ajax请求需要设置authorization的值为token，
// 也就是前端要拿到token，这样就存在了token被js获取的风险【需要藏好】
//但referer在站外毕竟还可以伪造，但站外获取站内的token就不可能，
//最终策列：用header的authorization字段验证；所有ajax请求带上authorization字段
//站外的csrf攻击不可能，只能是url跳转攻击，这个只要自己做好url请求的过滤即可，
//url请求不能操作数据，也不能展示敏感数据

// jwt安全性增强方法：
//   缩短 token 有效时间
//   使用安全系数高的加密算法
//   token 不要放在 Cookie 中，有 CSRF 风险
//   使用 HTTPS 加密协议
//   对标准字段 iss、sub、aud、nbf、exp 进行校验
//   使用成熟的开源库，不要手贱造轮子
//   特殊场景下可以把用户的 UA、IP 放进 payload 进行校验(不推荐)
function verifyJwt(context,callback){
  let secret=config.auth.secret;
  let token=context.cookies.get("token");
  let userId=context.cookies.get("u");
  //加签和解签的secret必须是同一个,不然在回调函数中提示err,出现解签失败
    jsonwebtoken.verify(token, secret, function(err, decoded) {
      // decoded是解签后获得的字段，里面包含个人自定义字段，同时可能出现下面的默认字段
      // iss (issuer)：签发人
    // exp (expiration time)：过期时间
    // sub (subject)：主题
    // aud (audience)：受众
    // nbf (Not Before)：生效时间
    // iat (Issued At)：签发时间
    // jti (JWT ID)：编号
        if (err) {
          context.state.scope.isLogin=false;
            /*
              err = {
                name: 'TokenExpiredError',
                message: 'jwt expired',
                expiredAt: 1408621000
              }
            */
        }else{
          context.state.scope.isLogin=true;
          if(!userId){//如果token没有过期，但是uid的cookie过期了，就重新添加uid的cookie
            context.cookies.set("u",base64url.encode(decoded.id),{
                // domain: 'localhost', // 设置 cookie 的域
                // path: '/', // 设置 cookie 的路径
                maxAge: 3 * 60 * 60 * 1000, // cookie 的有效时间 ms
                // expires: new Date('2021-12-30'), // cookie 的失效日期，如果设置了 maxAge，expires 将没有作用
                httpOnly: false, // 是否要设置 httpOnly
                overwrite: true, // 是否要覆盖已有的 cookie 设置
                sameSite:"Lax"
            });
          }
          context.state.scope.jwtData=decoded;//把token内数据放到request的jwtData自定义字段里面
        }
    });
}

//加密数据的xss防护在对应ajax接口controller中调用xssEncode，其他都在auth中统一调用
function xssEncode(obj,isPersonal){//set 和 map数据类型的取值方法都不一样，不处理前端传入的map数据
  if(typeof obj =="object"){
    var psXss=getPersonalXssRule();
    let reg=/(object Object)|(object Array)/;//map数据不处理
    obj=/(object Set)/.test(Object.prototype.toString.call(obj))?[...obj]:obj;//set转array
    let keys=Object.keys(obj);
    for (var key of keys){
      if(typeof obj[key] == "string" ){//'[object Object]' | '[object Array]' | '[object Set]' |'[object Map]'
        obj[key]=isPersonal?psXss.process(obj[key]):xss(obj[key]);
      }else if(reg.test(Object.prototype.toString.call(obj[key]))){
        obj[key]=xssEncode(obj[key]);
      }
    }
  }
  return obj;
}


//设置通用cookie
function initCookie(context){
  let {publicKeyStr}=context.app.encryptKey;
  
  //这个压根没用到
  context.request.body.id=context.request.body.id|| context.cookies.get("u");//如果前端没有把用户的id传过来，就直接通过cookie来获取id；
  context.cookies.set("timeStamp",base64url.encode(""+Date.now()),Object.assign({},config.session,{sameSite:"",httpOnly:false}));
  context.cookies.set("publicKey",base64url.encode(publicKeyStr),Object.assign({},config.session,{sameSite:"",httpOnly:false}));
} 


//设置通用的http header；
function initPublicHeader(context){
  //给页面添加一个x-server-id的标签，让服务端知道是哪个服务器ip地址产生的页面
  context.set("X-Server-ID", context.state.scope.serverId);

  //给header添加<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  // Edge 模式告诉 IE 以最高级模式渲染文档，也就是任何 IE 版本都以当前版本所支持的最高级标准模式渲染
  // chrome=1,等于强制 IE 使用 Chrome Frame 渲染【如果有的话】
  //所以下面这一句是2者结合，是最佳的兼容模式
  context.set("X-UA-Compatible", "IE=edge,chrome=1");
  context.set('X-Powered-By', 'Node');
}


/***************************客户端过来的数据，统一做数据解密或转化 start*********************************/

// 解密公钥加密的数据【非对称加密】
function declassifyData(context){
  let body=context.request.body;
  body.originData=body.data;
  let privateKey=context.app.encryptKey.privateKey;//解密的私钥在服务器初始化的时候挂在app上

  //原始的base64在网络传输的时候，+和/字符替换又是会出问题，所以前端自定义转码，后端再相同方式解码
  let str=body.data;
  str=str.replace(/\-/g,"+").replace(/\_/g,"/");
  let encryptedData=privateKey.decrypt(str,"utf8");
  body.data=encryptedData;
  body.data=body.data?JSON.parse(body.data):body.data;
}

/*这两个函数还没验证过*/
function encrypt(context,keyStr,data){
  var {publicKeyStr,privateKeyStr,publicKey,privateKey,key }=context.app.encryptKey;
  var newPublicKey=key.importKey(keyStr||publicKeyStr, 'pkcs8');
  newPublicKey.setOptions({ encryptionScheme: 'pkcs1' });
  return newPublicKey.encrypt(data,'base64');
}
function decrypt(context,keyStr,data){
  var {publicKeyStr,privateKeyStr,publicKey,privateKey,key }=context.app.encryptKey;
  var newPrivateKey=key.importKey(keyStr||publicKeyStr, 'pkcs8');
  newPrivateKey.setOptions({ encryptionScheme: 'pkcs1' });
  return newPrivateKey.decrypt(str,"utf8");
}
/*这两个函数还没验证过*/

//解密base64
function decodeBase64(context){
  let body=context.request.body;
  body.data=base64url.decode(body.data);
  body.data=body.data?JSON.parse(body.data):body.data;
}

//SHA256单向加密，不可逆，不能解密：用于密码加密后存储到数据库，这样数据库泄露，别人也无法知道密码
function hash(data,secret) {
  let sha=crypto.createHmac('SHA256',secret);//sha256是单向加密，不可以，最安全的单向加密
  return sha.update(data).digest("hex");
}

//前端数据post的传输类型：{type:"",data:{}};如果没有type，后端默认不做解密或者转化，直接拿来用
function transDataMapping(context,type){
  var mapping={
    "base64":decodeBase64,
    "encrypted":declassifyData
  };
  if(mapping[type]){
    mapping[type](context);
  }
}

//转化数据：把前端传过来的非对称加密数据，或者base64编码数据解码，并且给解码后的数据做xss防御
function transData(context){
  let body=context.request.body;
  //非get请求需要解密+xss过滤
  if(context.method.toLowerCase()!="get"){
    if(body&&body.encodeType){
      if(body.data){
        let arr=body.encodeType.split("|").reverse();
        for (var item of arr){
          transDataMapping(context,item.trim());
        }
        context.request.body=xssEncode(context.request.body);
      }
      //把处理好的数据直接覆盖到body上，方便后面获取
      context.request.body=context.request.body.data;
    }else{
      if(body){//body直接传参数过来，没有包装成{data:{},encodeType:""}这种类型
        context.request.body=xssEncode(context.request.body);
      }
    }
  }else{//get请求需要通过数据转化+xss过滤【前端传入id=fdsfsfs&name=obj】如果值是obj，前端需要JSON.stringify处理
    var str=(context.request.querystring||"").replace(/\#[\d\D]*/,"");
    var transObj={};
    var data=str.split("&")[0].split("=");
    //前后端沟通好用?json=fdafdasa格式传输;不允许其他任何格式：所以data[1]肯定是想要的参数对象
    if(data&&data.length==2&&data[0].toLowerCase()=="json"){

      //前端序列化的时候，会自动encodeURIComponent，且encondeURIComponent以后，还会把代表空格的'%20'替换成+；为了让服务端正确识别
      //服务端需要在decodeURIComponent以后，再把+替换回空格：这个非常重要【只有get请求才需要】，post请求不需要
      transObj=JSON.parse(decodeURIComponent(data[1].replace(/\+/g,"%20")));
    }else{//url?value的格式，目前只有跳转别人的个人中心才用到，暂时简单处理
      var tempArr=str.split("&")||[];
      tempArr.forEach(function(item) {//默认前端都已经把value转了base64+encodeURIComponent
        var innerTemp=item?item.split("="):[];
        transObj[innerTemp[0]]=innerTemp[1]||null;
      });
    }
    context.request.body=xssEncode(transObj);
  }

  //get请求暂时不做任何处理，因为get本来就不安全，而且是用于无关紧要的功能

}

/***************************客户端过来的数据，统一做数据解密或转化 end*********************************/



//添加token：包含用户的手机，ip，ua以及用户的uid
function addToken ({phoneNum , IP , ua, id }) {

  let secret=config.auth.secret;// iss、sub、aud、nbf需要补上
  const token = jsonwebtoken.sign({phoneNum , IP , ua , id },secret , { expiresIn: '24h' }); // token 有效期为3小时
  //cookie中有csrf风险，而且不能跨域，但是可以防xss攻击；csrf风险可以通过设置cookie的samsite为lax，以及服务端判断referer来鉴定

  // this.set("Authorization", "Bearer "+token);
  this.cookies.set("token",token,{
      // domain: 'localhost', // 设置 cookie 的域
      // path: '/', // 设置 cookie 的路径
      maxAge: 3 * 60 * 60 * 1000, // cookie 的有效时间 ms
      // expires: new Date('2021-12-30'), // cookie 的失效日期，如果设置了 maxAge，expires 将没有作用
      httpOnly: true, // 是否要设置 httpOnly
      overwrite: true, // 是否要覆盖已有的 cookie 设置
      sameSite:"Lax"
  });
  this.cookies.set("u",base64url.encode(id),{
      // domain: 'localhost', // 设置 cookie 的域
      // path: '/', // 设置 cookie 的路径
      maxAge: 3 * 60 * 60 * 1000, // cookie 的有效时间 ms
      // expires: new Date('2021-12-30'), // cookie 的失效日期，如果设置了 maxAge，expires 将没有作用
      httpOnly: false, // 是否要设置 httpOnly
      overwrite: true, // 是否要覆盖已有的 cookie 设置
      sameSite:"Lax"
  });
}


//中间件初始化
function init(app){
  //return函数外面是服务器初始化的时候配置app的数据
  var serverId = config.host || ip.toLong(ip.address()) & 255;

  initEncrypt(app);//非页面的自定义数据，全部挂到公共app上以免服务端资源浪费
  


    //return函数内部，是每次页面和ajax请求获取对应的数据，在页面路由之前，可以拿到所有的数据，包括对应页面返回的数据
    return function (context, next) {
      //添加scope到state，后续页面的私有数据全部放这里
      context.state.scope = {
          //页面请求的唯一id
          requestId: uuid().replace(/-/g, ""),
          serverId:serverId,

          //所有页面都需要输出内容的函数，用在views的common文件中对公共内容的html输出
          outPutPublicInfo:util.outPutPublicInfo({initData:""})//暂时没有，后续业务添加
      };

      initPublicHeader(context);
      initCookie(context);

      transData(context);
      verifyJwt(context);

      return next()
    };
}


module.exports = {
  init,
  addToken,
  xssEncode,
  initEncrypt,
  verifyJwt,
  encrypt,
  decrypt,
  hash
}


//  //这个后续有空做
//  5.所有的html，ajax请求，用通过ip+ua来设置防刷机策列，防止黑客用海量请求来“集中攻击服务器”
//    5.0 缓存机制预防第一波恶意
//    5.1 重要接口单独设置阈值
//    5.2 每个用户一天内设置一个uuid，根据uuid设置，每1分,10 分，1 小时 阈值
//    5.2 相同ip+ua设置单位时间内阈值：【如果】

//  6.浏览器缓存机制需要详细阅读，理解后再设置


// 数据处理相关：
//  1.encode，decode，base64：客户端字符转义，不然放在浏览器url里面太显眼了，这个是最基本的字符串转译
//  2.字符串加签【hash加签等，防止篡改（一份加签，一份不加签，最后比对一部分加签后是否和另一个加签的一样）】：
//        MD5【不管字符串多长，都能缩小成固定长度，确保唯一性，但是无法还原，所以常用在签名】
//                 HMAC SHA256：典型的签名算法。
//  3.字符串加密和解密：对称加密【只有一个密钥】和非对称加密【公私钥】


// Base64有三个字符+、/和=，在 URL 里面有特殊含义，所以要被替换掉：=被省略、+替换成-，/替换成_ 。这就是 Base64URL 算法

/*
数据安全考虑点【HTTPS对下面安全都有特定的处理】：
  1.加密：防止数据被读取
  2.数据一致性：防止数据被篡改，用非对称加密中的密钥加签和解签【发送2分报文，一份用私钥加签，黑客只要篡改数据，解签对比就对不上】
    2.1最初级的是请求报文数据被篡改，站点内部请求，这个还可以用服务端加签来修补漏洞
    2.2最难的是整个站点被篡改，用户输入百度，返回的是谷歌的页面，这个只能用https才能预防
       https是给站点证书，请求站点的时候，会请求站点证书验证站点，客户端接受返回信息都验证证书
       在浏览器客户端层面进行了站点的真伪验证。
  3.身份认证：保证用户访问的是安全的有证书的网站；否则就提示站点不安全。

  https能保证浏览器数据加密后传出，到服务器那边接收，以及服务器那边传出，到浏览器客户端接受；之间的安全
  但是客户端被黑，没执行https的加密，或者记录用户输入的数据，这个不属于站点安全范畴
  站点页面被植入站外js，在站点内部出现的问题，包括客户端请求在https之前被截获，这个都是站点的安全问题

  jwt是在https上才能使用的技术，否则被拦截获取就毫无安全性可言。
  https是无法防范相同报文的请求伪造的，在相同的ip下，用相同的https报文请求；
  https是可以拦截的，只是它加密，加签，同时验证网站证书，但不能防止数据被拦截
  所以登陆验证需要客户端动态id，保证请求数据被拦截下次也无效



移动端不能用ip验证：因为如果手机断开wifi，用4G或者转到5G信号，ip都会变，ip不能作为判断登录态的一个参数



截取报文，然后同ip发送截取报文，模仿用户登录【虽然不知道报文内容，但是只要这个报文时用于登录或者登录态验证的，内容一样就可能鉴权通过】
  3.1：客户端向服务端发送请求的时候截取，然后在同一ip用相同报文请求服务器
  3.2：服务器向客户端发送登录态验证auth的时候，截取auth，然后在相同ip用这个auth请求服务器
  3.3：最最厉害的攻击：服务端向客户端发送auth的时候截取，然后打开网站，用自己真实帐号登录
       同样也会返回服务端的auth，在返回的地方打断点，然后用之前截取的auth来覆盖自己的auth
       接下来不管前端逻辑再怎么变，都是基于服务端auth的处理，然后赶在用户没有重新发送请求，
       auth还没有失效的情况下，向服务端发送请求，这样服务端那边刷新了auth并返回给你最新的auth，
       原来真实的用户再向服务端发送auth请求，会auth验证失败，需要用户重新登录，黑客这边
       则获取了持续化登录态的auth权限，只要用户那边没有再登录把黑客的auth权限挤下来，
       黑客就可以持续登录态操作
  3.4：http和https区别，https是如何保证报文安全方式截获的【本地js发送进入http|https通道之后的安全】
       如果站点被js注入，那么http和https也没用，因为再发送报文之前，数据就被截获了
       如果浏览器层面被黑客攻击，在浏览器加密https之前数据就被黑客截取，那https也没啥用：
       https主要是站点提供一个证书和密钥给浏览器，浏览器验证没问题后就在用户和服务器之间搭建一个
       私密的会话通道，内容全是加密的，所以在浏览器加密https之前，和服务器获取https报文解密之后，
       这个范围之外的安全不在https安全防范之内，
  3.5：页面的html请求在返回的时候，被代理服务器截获，然后修改里面的js链接，误导用户操作输入用户名和密码
     这样就可以获取用户资料。   




hash加密：常用的hash有md5和SHA256，主要功能类似数据的加签，主要用于鉴定数据是否被篡改的问题；md5不太安全


https:用到SSL证书，加密版的至少2千以上一年，同时https请求速度比http慢，
    因为http只要tcp三次握手，3个包；https需要12个包，多了9个包，用于数据加密等一些列操作
    详细流程见finalProject中的https请求流程图
    其实它为了兼容所有客户端浏览器和服务器之间的统一通讯，多执行了几次密钥传递的请求
    我自己的网站用模仿https的验证流程，站点前端页面和服务器之间通信自己加密和签名验证；
    只要用户输入网址请求的是

    https其实就是在http和tcp建立链接之间，加入了传输层安全性(TLS)或安全套接字层(SSL)
    tls其实就是ssl的加强版，加强了ssl然后把ssl改名tls，有的用tls，有的用ssl
    TLS 的密码套件比较规范，基本格式就是密钥交换算法 - 签名算法 - 对称加密算法 - 摘要算法
    例如 ECDHE-ECDSA-AES256-GCM-SHA384，就是钥交换算法用ECDHE，签名算法用ECDSA....

程序员网站： stackoverflow



 用于登录态检验和用户注册登录
 用户注册：userName和passward，手机号,在后端产生一个唯一的uid；

      验证码短信发送的具体流程如下：
        1.用户在线填写手机号码，
        2.申请获取验证码网站、APP按照规则生成验证码
        3.APP将用户的手机号码和短信内容有短信平台提交到运营商通道
        4.通过运营商的发送规则评估
        5.运营商将指定内容发至指定手机号码
        6.用户收到短信，并在APP填写验证码，完成验证。



      svg-captcha的node插件用于图片验证码技术：
              注册和登录都需要用到验证码技术，防止机器人恶意刷机注册
              虽然要有手机号才能注册成功，但是机器人而已刷，每次都失败
              就非常占服务器资源。

  



      
      用户主流的交互流程：
            1.用户昵称具有唯一性，如果用户注册时没有填写，后台给用户默认用户名就是它的id，后期用户可修改用户名；
              用户名确保唯一性，同时昵称修改后其他粉丝仍然关注列表里仍然是你
            2.建站初期，用户名不容易冲突，可以放在非必填里面，人数上万以后，昵称就隐藏，防止注册反复冲突
      
      代码回滚和数据库回滚：
          1.代码库【前端和服务端都一样】被删了，怎么办：【每次发布，本地master和服务端都有代码，多人开发就更加安全，所以git不存在代码被删问题】
          2.数据库被删，怎么办？数据库实时备份，同时运行4个数据库，一个保持最新备份，一旦主库被删或出问题，立马自动切换到备用数据库
            数据库是网站和公司的核心资产，数据库没了，等于啥都没了，所以需要至少2个数据库【物理分开，2个地址】，否则一旦出现灾难，数据库就全没了
          3.一个主库，1个替补库，替补2，一个备份库；主库出问题，替补库顶上，瞬间接盘，如果替补库在主库没有修复的时间内也出问题，
            替补2顶上，作为临时主库，同时替补1和备份库都要实时跟随替补2，为什么需要一个备份库，因为替补1出问题，替补2 顶上的时候，
            替补1跟随替补2需要一定的部署时间，这个时候如果替补2再出问题，那就没问知道最新的数据库了，所以备份库这个时候用于记录最新数据库
            等替补2出问题了，备份库都用上了，基本替补1也就完成了跟随最新库的操作；持续吃恩替就是在3个非主库之间来回替换，主库交给程序员查询解决问题
        




      
      登录流程：【客户端信息无法篡改或伪造登录】
            注意1.这个是最核心的，因为走登录接口，如果黑客走登录接口的时候，截取了用户上次登录时用到的所有相同的cookie和ajax数据，能否被黑登录】【cookie设置httpOnly，secure，sameSite】
            注意2.如何防止机器狂刷登录【限制登录次数，同时用图片验证区分人机，或最直接地用短线验证码】

            0.点击登录，服务端添加动态码到cookie里面返还给客户端
            1.ajax请求带上服务端发过来的“cookie中的动态id”，再进行加密；服务器验证客户端ajax中的动态码信息和服务器动态码一致，才能通过,再验证登录【每次发送的动态id都不一样】
            2.这样的话，对方只有知道用户名，密码，动态id三个，才能用前端的公钥加密，否则就无法生成带有有效登录信息的auth，
              而动态码，是每次点击请求的时候，从服务器临时产生并传送给客户端的动态码，没有长时间有效性，每次点击都设定一个新的值


            3.这个方法的核心原理：服务端只通过客户端的数据进行登录验证的话，如果之前登录验证通过，那这次只要客户端发送到服务端的
              数据和之前的登录请求保持完全一样【cookie，ajax请求和请求头，请求地址，ip等】，就可以通过，因为服务端完全依赖客户端数据
              所以再次登录肯定是通过的 ，如果不通过，那原来的用户也没法登录；所以服务端那边需要保存鉴别的动态码
              每次请求到服务端，要校验上次客户端请求时服务端发给它的动态码，每次都不一样，所以哪怕黑客截取了上次的
              数据，但这次动态码不一样，就通不过。这个方法的缺点是要执行两次ajax，保持最新且有效的动态码，动态码如果
              是用户首次请求页面的时候获取的，服务器就要建立很长时间的长链接来维持这个动态码在服务器上的生命周期
              就很耗费服务器资源，其次，如果用户长时间不用这个动态码，后端的动态码会失效，这样用户一段时间后点击登录，
              就没法正常登录了。虽然使用两次ajax，但用户的感觉还是点击一次，中间通过ajax嵌套，实现3次握手【两次ajax请求】
              第一次握手是告诉服务端，我要登录了，准备好动态码，然后服务器就准备了临时动态码
              第二次握手是服务器告诉客户端，下次你登录的时候，要用这个动态id，服务器把动态码传给客户端
              第三次握手是客户端把账号密码以及动态码打成一个值，让黑客无法伪造信息，因为就算知道动态码，但不知道帐号和密码
              所以最终打成的那个值，肯定是本次登录唯一的，下次在用这个值就作废了，因为动态码失效了，
              因为下次点击登录，又是重新开始，重启获取动态码，动态码的有效性只是在本地登录，本次登录验证失败
              用户再点击登录，又是3次握手，又是新的动态码，上次截获的信息毫无用处；
              这种登陆验证，黑客只能通过获取用户的帐号和密码这个源头，才能正常登录；获取加密的帐号和密码都不行
              因为加密的帐号和密码是和动态码绑在一起的，无法单独提取出加密的用户名和密码；
              如果非常熟悉网站的js逻辑，在js执行到ajax请求加密发送之前截取到用户的帐号和密码；
              也就是在js代码流程中截取，那只有2中方法，一种是黑客完全控制了用户的客户端，能随意在某个地方停止截取
              另一个是黑掉网站，然后在对应的js发送ajax之前插入自己的js代码，保存用户数据并发送；
              也就是黑掉网站自己本身的js链接并伪造类似代码的js链接返还给客户端；这种都是js源头级别的风险
              是最危险的，黑客能通过黑网站来实现js替换【这个网站端要做好防护】，另一个就最麻烦了
              就是网站本身就没有危险，数据也是正确的，但是网站传资源给客户的时候，中间被其他服务器拦截
              拦截后篡改js【复制原来的js，然后找出登录或者其他重要的相关功能的代码，修改好】，每次黑客服务器
              只需要把篡改好的js链接【逻辑和原来js差不多，只修改部分】，代替成原来的js链接
              因为script标签本身就跨域的原因，浏览器本身就没有好的屏蔽方案，总不能把所有外站js禁用吧。
              面对中间的服务器拦截修改数据【ajax，html和html里面的js链接】，这里要防很难？？？？？？



      
      //session表作为一个集合，存储在数据库里面，并且需要创建session集合中对应的索引，因为登录态验证非常频繁
      登录态流程【核心时ip无法伪造】： 
            1.用户登陆后，服务端会用“uuid+用户名”生成一个唯一的key，把用户的ip，ua，userName， passward 合并生成一个auth;这样就在session中创建了键值对【键值对放数据库，以为分布式服务器的缘故，放单个服务器没有，无法总到统一验证】
              然后把那个唯一和用户匹配的key保存到cookie中返还给客户端
            2.用户刷新页面执行ajax请求客户端的时候，客户端拿到之前的cookie，获取cookie的值，也就是之前session的键值对的key，
            3.服务端用这个key，去数据库中寻找session的键值对的key，如果匹配上；同时客户端的ip和ua+解析cookie获得的用户名和数据库中的key对应的ip和ua,用户名都对上了
              那就可以确定是同一个人，鉴权通过；

            


      注册流程：【和登录的逻辑一样】
            0.后端发送动态id都用户端，注册时候，用户吗和密码之间添加动态id，然后加密发送给服务器【传送无法解密，也无法篡改，一篡改就变成无效信息，都断无法解码了出正确的格式】
            1.进入对应的api，获取用户基本信息，用户名，密码，动态id【时间戳，这个相当于签名】必须有，直接走登录的数据库流程
            2.返回ajax的注册成功信息给客户端，同时包含最新的动态id，注册就结束了

      
      ！！！！！上面三个只是解决了客户端发送信息给服务端的验证问题，但是如果服务端把数据传给客户端，中间被截获并且修改数据，比如服务端给客户端的数据是一个手机5000，中间数据传到客服端之前价格被改成了5块
      验签：用户接受数据以后，被这个5块诱导去下单了，用户本地执行还有所有的全线，那么就被误导执行交易，所以客户端这边，需要拿一个签名，来验证服务端数据没有被篡改；
      验证签名的方式很简单，服务端准备2份相同的数据，给一份数据用私钥加签名【只有私钥能加签】，客户端受到信息后，对加签的那个字段的信息解签，然后和另一份数据对比，一样的话，就是数据没有篡改；
      只要不一样，那就是篡改了，客户端就知道了


      
      
      页面初始化流程：首次登录，ajax获取所有用户相关数据，然后相关个人数据的模块异步异步刷新。
               后续刷新【不重要的本地缓存数据，不强求ajax】，服务端返回初始html，前端根据auth，执行初始化ajax请求，返回初始页面数据异步渲染

      退出登录流程：1.点击推出登录，删本地auth，然后走空数据页面的render：所以得分2个初始化

      
 */

