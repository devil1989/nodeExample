
//用到的公共常用方法
module.exports = {

    //获取对应的host
    getClassjeffreyHost(host) {
        let jeffreyHost = '';
        if (/^local/i.test(host)) {
            //接口发布到哪个分支环境就配成哪个分支环境
            jeffreyHost = '//qa4class.jeffrey.com'; //qaclass.jeffrey.com和qaclass.jeffrey.com指向一样
        } else if (/^qa\d/i.test(host)) {
            let mstrs = host.match(/^qa\d/i),
                qa = 'qa1';

            if (mstrs) {
                qa = mstrs[0];
            }
            // jeffreyHost = `//${qa}class.jeffrey.com`;
            jeffreyHost = '//qa4class.jeffrey.com'; //qaclass.jeffrey.com和qaclass.jeffrey.com指向一样
        } else if (/^qa/i.test(host)) {
            // jeffreyHost = '//qa4class.jeffrey.com';//qaclass.jeffrey.com和qaclass.jeffrey.com指向一样
            jeffreyHost = '//qaclass.jeffrey.com';
        } else if (/^yz/i.test(host)) {
            jeffreyHost = '//yzclass.jeffrey.com';
        } else {
            jeffreyHost = '//class-jeffrey.intra.com';
        }

        return jeffreyHost;
    },

    //获取全站公共的passport的host
    getOnlyPassportHost(host) {
        let passportHost = '';
        if (/^local/i.test(host)) {
            passportHost = 'https://qapass.jeffrey.com';
        } else if (/^qa/i.test(host)) {
            passportHost = 'https://qapass.jeffrey.com';
        } else if (/^yz/i.test(host)) {
            passportHost = 'https://pass.jeffrey.com';
        } else {
            passportHost = 'https://pass.jeffrey.com';
        }

        return passportHost;
    },

    //获取登录页的host
    getOnlyLoginHost(host) {
        let loginHost = '';
        if (/^local/i.test(host)) {
            loginHost = 'https://qalogin.jeffrey.com';
        } else if (/^qa/i.test(host)) {
            loginHost = 'https://qalogin.jeffrey.com';
        } else if (/^yz/i.test(host)) {
            loginHost = 'https://login.jeffrey.com';
        } else {
            loginHost = 'https://login.jeffrey.com';
        }

        return loginHost;
    },

    //获取url侯敏参数
    getUrlParam(url, paramName) {
        let i, ilen, strs, keyName, keyValue,
            params = {};
        if (url.indexOf("?") > -1) {
            let index = url.indexOf("?");
            strs = url.substring(index + 1);
            strs = strs.split("&");
            ilen = strs.length;
            for (i = 0; i < ilen; i++) {
                let indexEqual = strs[i].indexOf('=');
                keyName = strs[i].substring(0, indexEqual);
                keyValue = strs[i].substring(indexEqual + 1);
                if (keyName === "callback") keyValue = decodeURIComponent(keyValue);
                params[keyName] = keyValue;
            }
        }
        return params[paramName];
    },

    //未登录重定向
    ensureAuthrized(scope, cxt) {

        if (!scope.userInfo) {
            cxt.redirect(`/promotion/account/login?returnurl=${encodeURIComponent(scope.url)}`);
        }
    },


    //封装从api获取的数据，在views中把他放入对应的html文件中去
    outputWindowInfo(obj) {
        
        //nunjucks也设置的autoescape为true也是防xss攻击，但可以通过模板的| safe来取消部分字段的autoescape，还是可以插入富文本
        //但是nunjucks防止富文本输出会降低后端输出内容的自由度，所以最好还是对要输出的字段做encodeURIComponent或其他转译方法的处理

        var transStr=encodeURIComponent(JSON.stringify(obj));//防止xss攻击
        return `<script>window.INIT_DATA='${transStr}';</script>` 
    },


    //所有页面的初始化数据输出函数
    outPutPublicInfo(obj){
        var transStr=encodeURIComponent(JSON.stringify(obj));
        return `<script> window.PUBLIC_INIT_DATA = '${transStr}'; </script>`
    },

    deepColne(obj){
        
    }


}

// fs.exists:是否存在
// fs.stat：检测是文件还是目录(目录 文件是否存在)

// fs.mkdir：创建目录 （创建之前先判断是否存在）

// fs.writeFile：写入文件(文件不存在就创建,但不能创建目录)

// fs.appendFile：写入追加文件

// fs.readFile：读取文件

// fs.readdir：读取目录

// fs.rename：重命名

// fs.rmdir：删除目录

// fs.unlink：删除文件