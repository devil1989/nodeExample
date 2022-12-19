"use strict";(self.webpackChunk=self.webpackChunk||[]).push([["components_article-edit_index_js-components_article-list_index_js-components_login_index_js-n-37d91a","components_article-edit_index_js"],{76112:(t,e,i)=>{i.r(e),i.d(e,{default:()=>k});var a=i(4769),n=(i(27471),i(23938),i(98010),i(63238),i(5769),i(56446),i(17460),i(14078),i(95374),i(55849),i(17740)),o=i(24204),r=i(60330),l=i(53940),s=(i(36480),i(42301),i(59810)),c=i.n(s),d=i(390),u=i(54922),m=i.n(u);i(89790),i(9983),i(2413),c().register("modules/imageDrop",d.c),c().register("modules/imageResize",m()),n.default.use(o.Z),r.Z.config({duration:1}),n.default.prototype.$notification=r.Z;var g=window.Util,p=g.Cookies,h=g.Base64,f=g.BaseModel,b=(g.Xss,g.util),v=void 0===b?{}:b,w=window.Util.util,y=(w.getEncryptData,w.getPersonalXssRule,window.Util.validate),q=(y.isTel,y.isUserName),F=(y.isPassward,v.toast);const k={data:function(){return{content:"",editorOption:{placeholder:"请输入内容,  点右上角可关闭文章",modules:{toolbar:[["bold","italic","underline","strike"],["clean"],["blockquote","code-block"],[{header:1},{header:2}],[{list:"ordered"},{list:"bullet"}],[{indent:"-1"},{indent:"+1"}],[{align:[]}],[{size:["small",!1,"large","huge"]}],[{color:[]},{background:[]}],["image"]],imageDrop:!0,imageResize:{displayStyles:{backgroundColor:"black",border:"none",color:"white"},modules:["Resize","DisplaySize","Toolbar"]}},theme:"snow"}}},mounted:function(){},computed:{articleForm:function(){return this.$store.getters.articleForm}},methods:{showTagInput:function(t){this.$store.commit("updateTags",{inputVisible:!0}),n.default.nextTick((function(){t.target.parentNode.querySelector("input").focus()}))},tagContentInputChange:function(t){this.$store.commit("updateTags",{curtentValue:t.target.value})},addTagWrapper:function(t){t.target.blur()},addTag:function(t){var e=this.articleForm.data.tag.curtentValue,i=this.articleForm.data.tag.tagList;e&&-1===i.indexOf(e)&&(i=[].concat((0,a.Z)(i),[e]),this.$store.commit("updateTags",{tagList:i,curtentValue:"",inputVisible:!1}))},delTag:function(t){var e=this.articleForm.data.tag.tagList;if(e&&e.length){var i=e.filter((function(e){return e!==t}));this.$store.commit("updateTags",{tagList:i})}},changTitle:function(t){var e=t.target.value,i=q(e)?"":"error",a=""==e?"请输入标题":""!=i?"只支持中英文和数字，不支持空格等其他特殊字符，长度必须小于17":"";return this.$store.commit("setArticleFormTitle",{val:e,status:i,helpInfo:a}),{val:e,status:i,helpInfo:a}},validateArticleContent:function(){var t,e,i;return t=window.Util.htmlDecode(document.querySelector(".ql-editor").innerHTML),t=window.Util.pXss.process(t),window.ErrorTags&&window.ErrorTags.length&&(e="error",i=this.getWarnInfo(window.ErrorTags)),this.$store.commit("setArticleFormContent",{val:t,status:e,helpInfo:i}),{val:t,status:e,helpInfo:i}},tabNext:function(t){window.quill.focus()},getWarnInfo:function(t){var e="";return(t=(0,a.Z)(new Set(t))).forEach((function(t){e+="<".concat(t,">;")})),window.ErrorTags=[],"文章中不能包含".concat(e,"这类html标签，请删除")},submitArticel:function(){this.articleForm.data.title.val;var t,e=this.changTitle({target:{value:this.articleForm.data.title.val}}),i=this.validateArticleContent(),a=(i.val,i.status),n=(i.helpInfo,{}),o=this;if("error"!==e.status&&"error"!==a){if(this.uglyAllImage(),!(n=this.getParam()).id)return void F.bind(this)("提交失败","请登陆后再提交");t=new f({type:"post",url:"/create_article",data:n}),this.switchSubmitState("submiting"),t.promise.then((function(t){t.state?(F.bind(o)(t.msg),o.clearArticleForm(),o.articleForm.visible=!1,o.$attrs.callback()):F.bind(o)("提交失败",t.msg),o.switchSubmitState("submited")}),(function(t){F.bind(o)("提交失败",t.msg),o.switchSubmitState("submited")}))}},switchSubmitState:function(t){if("submiting"==t){var e=!0,i="提交中...";this.$store.commit("setArticleFormSubmitState",{disableBtn:e,submitText:i})}else{e=!1,i="提交";this.$store.commit("setArticleFormSubmitState",{disableBtn:e,submitText:i})}},clearArticleForm:function(){this.content="";this.$store.commit("setArticleFormContent",{val:"",status:"",helpInfo:""}),this.$store.commit("setArticleFormTitle",{val:"",status:"",helpInfo:""})},getParam:function(){return{title:this.articleForm.data.title.val,content:window.Util.htmlDecode(document.querySelector(".article-editor-wrapper .ql-editor").innerHTML),id:h.decode(p.get("u")||""),tags:this.articleForm.data.tag?this.articleForm.data.tag.tagList:[]}},uglyAllImage:function(){var t=this,e=document.querySelectorAll(".ql-container img");e.length&&e.forEach((function(e){t.uglyImage(e)}))},uglyImage:function(t){t.src;var e=t.width,i=t.height,a=1,n=document.createElement("canvas"),o=n.getContext("2d");n.height=i,n.width=e,o.clearRect(0,0,e,i),o.drawImage(t,0,0,e,i);for(var r=n.toDataURL("image/jpeg",a),l=0;r.length>122880;)a-=r.length>614400?.45:.02,r=n.toDataURL("image/jpeg",a),console.log(++l);t.src=r},closeArticleDrawer:function(){this.articleForm.visible=!1},onEditorBlur:function(t){},onEditorFocus:function(t){},onEditorReady:function(t){window.quill=t},onEditorChange:function(t){t.quill;var e=t.html;t.text;this.content=e}},components:{"quill-editor":l.quillEditor},template:i(87272).Z}},50342:(t,e,i)=>{i.r(e),i.d(e,{default:()=>p});i(95374),i(63238),i(55849);var a=i(17740),n=i(24204),o=i(75745),r=i(60330);i(89790),i(4948),i(9983),i(87573),a.default.use(n.Z),a.default.use(o.ZP),r.Z.config({duration:1}),a.default.prototype.$notification=r.Z;var l=window.Util,s=l.Cookies,c=(l.Base64,l.BaseModel,l.util),d=window.Util.util,u=(d.getEncryptData,d.getPersonalXssRule,window.Util.validate),m=(u.isTel,u.isUserName,u.isPassward,c.toast),g={data:function(){return{pageName:this.$attrs.pageName}},mounted:function(){},computed:{personalArticle:function(){return this.$store.getters.personalArticle},userInfo:function(){return this.$store.getters.userInfo},activeKey:function(){return this.$store.getters.activeKey}},methods:{showArticleDisplayDrawer:function(t){var e=s.get("u"),i=c.closest(t.target,"data-key-id");if(i){var a=i.getAttribute("data-key-id"),n=this.personalArticle.data||[];n.forEach((function(t){t.id==a&&(t.showLoading=!0)})),this.$store.dispatch("getPersonalArticleInfo",{visible:!0,isLoaded:!0,id:a,uid:e,callback:function(){n.forEach((function(t){t.id==a&&(t.showLoading=!1)}))}})}},removeCollection:function(t){if(this.userInfo.isLogin&&this.userInfo.isSelf){var e=window.Util,i=e.Cookies,a=(e.Base64,e.BaseModel),n=(e.sXss,i.get("u")),o=new a({type:"post",url:"/add_article_collect",data:{articleId:t.target.getAttribute("data-key"),uid:n,isAdd:!1}}),r=this;o.promise.then((function(t){t.data&&t.state?r.$attrs.callback&&(m.bind(r)(t.msg||"取消收藏成功"),r.$attrs.callback()):m.bind(r)(t.msg)}),(function(t){m.bind(r)(t.msg)}))}}},template:i(78738).Z};const p=g},22152:(t,e,i)=>{i.r(e),i.d(e,{default:()=>f});var a=i(17740),n=i(24204),o=i(75745),r=i(60330);i(89790),i(4948),i(9983),i(45538),a.default.use(n.Z),a.default.use(o.ZP),r.Z.config({duration:1}),a.default.prototype.$notification=r.Z;var l=window.Util,s=(l.Cookies,l.Base64,l.BaseModel),c=l.util,d=(void 0===c?{}:c).toast,u=window.Util.util,m=u.getEncryptData,g=(u.getPersonalXssRule,window.Util.validate),p=g.isTel,h=(g.isUserName,g.isPassward);const f={data:function(){return{loginFormElement:this.$form.createForm(this,{name:"loginForm"})}},computed:{loginForm:function(){return this.$store.getters.loginForm}},methods:{changeLoginPhoneNum:function(t){var e=t.target.value,i=p(e)?"":"error",a=""==e?"请输入手机号":""==i?"":"请输入正确的手机号";this.$store.commit("setLoginFormPhone",{val:e,status:i,helpInfo:a})},changeLoginPasswardNum:function(t){var e=t.target.value,i=h(e)?"":"error",a=""==e?"请输入密码":""==i?"":"只支持英文字母和数字，不支持空格等其他特殊字符，长度必须小于17";this.$store.commit("setLoginFormPassward",{val:e,status:i,helpInfo:a})},switchLoginSubmitState:function(t){if("submiting"==t){var e=!0,i="登录中...";this.$store.commit("setLoginFormSubmitState",{disableBtn:e,submitText:i})}else{e=!1,i="登录";this.$store.commit("setLoginFormSubmitState",{disableBtn:e,submitText:i})}},submitLogin:function(t){this.$refs.submitbtn.$el.click()},login:function(t){var e=this,i=this.loginForm.data.phone.val,a=this.loginForm.data.passward.val;if(p(i)&&h(a)){var n=m({phoneNum:i}),o=new s({type:"post",url:"/dynomic_code",data:n});this.switchLoginSubmitState("submiting"),o.promise.then((function(t){if(t.state){var e=t.data.timeStamp,n=m({phoneNum:i,passward:a,timeStamp:e});return new s({type:"post",url:"/login",data:n}).promise}return{notGettedDynomicCode:!0,msg:t.msg}}),(function(t){return{notGettedDynomicCode:!0,msg:t.msg}})).then((function(t){t.notGettedDynomicCode?e.errorInfo(t):t.state?(d.bind(e)("登录成功",'欢迎："'.concat(t.data.userName||t.data.phone,'" 用户')),e.$attrs.callback(t)):e.errorInfo(t),e.switchLoginSubmitState("submited")}),(function(t){e.errorInfo(t),e.switchLoginSubmitState("submited")}))}else this.changeLoginPhoneNum({target:{value:this.loginForm.data.phone.val}}),this.changeLoginPasswardNum({target:{value:this.loginForm.data.passward.val}})},errorInfo:function(t){d.bind(this)("登录失败",t.msg)},closeLoginDrawer:function(){this.loginForm.visible=!1}},template:i(49055).Z}},87272:(t,e,i)=>{i.d(e,{Z:()=>a});const a='<a-drawer class="article-editor-wrapper" title="给文章添加标签，更容易进入热搜哦" :placement="\'bottom\'" :height="\'80%\'" :width="720" :visible="articleForm.visible" :body-style="{ paddingBottom: \'80px\' }" @close="closeArticleDrawer"> <a-form-item class="form-item-inner" label="" :validate-status="articleForm.data.title.status" :help="articleForm.data.title.helpInfo"> <div @keydown.prevent.tab="tabNext"> <a-input :value="articleForm.data.title.val" @change="changTitle" placeholder="请输入标题"/> </div> </a-form-item> <a-form-item class="form-item-inner" label="" :validate-status="articleForm.data.content.status" :help="articleForm.data.content.helpInfo"> <quill-editor :content="content" :options="editorOption" @change="onEditorChange($event)" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)"></quill-editor> </a-form-item> <div class="article-display-tag"> <span class="personal-tag" v-for="(tag,index) in articleForm.data.tag.tagList"> {{ (tag.length>20)?(tag.slice(0, 20)+\'...\'):tag}} <span class="tag-close" @click="() => delTag(tag)">×</span> </span> <a-input type="text" size="small" :style="{ width: \'78px\',display:articleForm.data.tag.inputVisible?\'inline\':\'none\' }" :value="articleForm.data.tag.curtentValue" @change="tagContentInputChange" @blur="addTag" @keyup.enter="addTagWrapper"/> <span @click="showTagInput" class="left addTagBtn" :style="{display:articleForm.data.tag.inputVisible?\'none\':\'inline\'}">+ 添加标签</span> </div> <div :style="{\r\n          position: \'absolute\',\r\n          right: 0,\r\n          bottom: 20,\r\n          width: \'100%\',\r\n          padding: \'10px 24px\',\r\n          background: \'#fff\',\r\n          textAlign: \'right\',\r\n          zIndex: 1,\r\n        }"> <a-button :style="{ marginRight: \'8px\' }" @click="closeArticleDrawer" :size="\'large\'"> 取消 </a-button> <a-button type="primary" @click="submitArticel" :size="\'large\'"> 提交 </a-button> </div> </a-drawer>'},78738:(t,e,i)=>{i.d(e,{Z:()=>a});const a='<ul class="list-item-wrapper" @click="showArticleDisplayDrawer"> <li class="list-item" v-if="personalArticle.data.length" v-for="item in personalArticle.data" :data-key-id="item.id"> <div class="list-item-mask" v-if="item.showLoading?true:false"></div> <div class="right list-item-right" v-if="activeKey.val==\'fav\'&&userInfo.isLogin&&userInfo.isSelf"> <a-button :data-key="item.id" class="attemtion-active" type="primary" @click.stop="removeCollection"> 取消收藏 </a-button> </div> <div class="list-item-inner"> <div class="list-content"> <h4 class="list-content-desc-wrapper"> <span class="list-content-desc">{{item.title}}</span> <span class="list-content-date">{{item.time}}</span> </h4> <p>{{item.content}}<span>...</span> </p> </div> <ul class="list-extra"> <li><span class="list-extra-inner">点赞 ：</span><span>{{item.extraInfo.fav?item.extraInfo.fav.length:0}}</span></li> <li><span class="list-extra-inner">收藏 ：</span><span>{{item.extraInfo.collect?item.extraInfo.collect.length:0}}</span></li> <li><span class="list-extra-inner">评论 ：</span><span>{{item.extraInfo.comment?item.extraInfo.comment.length:0}}</span></li> <li><span class="list-extra-inner">转发 ：</span><span>{{item.extraInfo.relay?item.extraInfo.relay.length:0}}</span></li> </ul> </div> </li> </ul>'},49055:(t,e,i)=>{i.d(e,{Z:()=>a});const a=' <a-drawer title="登录" :width="720" :visible="loginForm.visible" :body-style="{ paddingBottom: \'80px\' }" @close="closeLoginDrawer"> <a-form :form="loginFormElement" layout="vertical" hide-required-mark> <div class="form-item-wrapper"> <a-form-item class="form-item-inner" label="帐号" :validate-status="loginForm.data.phone.status" :help="loginForm.data.phone.helpInfo"> <a-input :value="loginForm.data.phone.val" @change="changeLoginPhoneNum" placeholder="请输入手机号"/> </a-form-item> <a-form-item class="form-item-inner" label="密码" :validate-status="loginForm.data.passward.status" :help="loginForm.data.passward.helpInfo"> <a-input-password :value="loginForm.data.passward.val" @change="changeLoginPasswardNum" @keyup.enter="submitLogin" placeholder="请输入密码"/> </a-form-item> </div> </a-form> <div class="right"> <a-button :style="{ marginRight: \'8px\' }" :disabled="loginForm.data.submitState.disableBtn" @click="closeLoginDrawer"> 取消 </a-button> <a-button :ref="\'submitbtn\'" type="primary" :disabled="loginForm.data.submitState.disableBtn" @click="login"> {{loginForm.data.submitState.submitText}} </a-button> </div> </a-drawer> '},2413:(t,e,i)=>{i.r(e),i.d(e,{default:()=>a});const a={"article-editor-wrapper":"article-editor-wrapper","ql-editor":"ql-editor","ql-container":"ql-container","quill-editor":"quill-editor","ql-toolbar":"ql-toolbar","ql-formats":"ql-formats","ql-image":"ql-image","ql-clean":"ql-clean","ql-background":"ql-background","ql-picker":"ql-picker","ql-color-picker":"ql-color-picker","ql-color":"ql-color","ql-align":"ql-align","ql-icon-picker":"ql-icon-picker","ql-size":"ql-size","ql-direction":"ql-direction","ql-indent":"ql-indent","ql-list":"ql-list","ql-header":"ql-header","ql-code-block":"ql-code-block","ql-blockquote":"ql-blockquote","ql-strike":"ql-strike","ql-underline":"ql-underline","ql-italic":"ql-italic","ql-bold":"ql-bold","ant-drawer-wrapper-body":"ant-drawer-wrapper-body","article-display-tag":"article-display-tag","tag-close":"tag-close",addTagBtn:"addTagBtn","personal-tag":"personal-tag"}},87573:(t,e,i)=>{i.r(e),i.d(e,{default:()=>a});const a={"list-item-wrapper":"list-item-wrapper","list-item":"list-item","list-item-mask":"list-item-mask","list-item-right":"list-item-right","list-item-inner":"list-item-inner","list-content":"list-content","list-content-desc":"list-content-desc","list-content-date":"list-content-date","list-content-desc-wrapper":"list-content-desc-wrapper","list-extra":"list-extra","ant-tabs-tabpane-active":"ant-tabs-tabpane-active","person-article-loading":"person-article-loading"}},45538:(t,e,i)=>{i.r(e),i.d(e,{default:()=>a});const a={}}}]);