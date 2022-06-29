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

        return `<script>
        window.INIT_DATA = ${obj} ;
        </script>`
    },

    //所有页面的初始化数据输出函数
    outPutPublicInfo(obj){
        return `<script>
        window.INIT_DATA = ${obj} ;
        </script>`
    },

    deepColne(obj){
        
    },
}