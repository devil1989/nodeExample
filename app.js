const config = require("./config")
const http = require("http")
const https = require("https")
const fs = require("fs")
const Koa = require("koa")
const middleware = require("./lib/middleware")
const app = new Koa()
const path = require("path");
require("./router/mapping.js");//引入路由，给每一个路由路径的页面设置回调函数，初始化路由


/*这个里面用app.use来录入路由中间件，启动路由，这样每次访问页面，
都会经过路由，因为每次请求，都会把所有录入的中间件执行一遍*/
middleware(app);

app.on("error", (err, ctx) => {
    if (ctx && !ctx.headerSent && ctx.status < 500) {//ctx.headerSent:检查 response header 是否已经发送，用于在发生错误时检查客户端是否被通知。
        console.log("ctx")
        // console.log(ctx)
        console.log(err)
        ctx.status = 500;
    }
    if (ctx && ctx.log && ctx.log.error) {
        if (!ctx.state.logged) {
            ctx.log.error(err.stack);
        }
    }
});



const {
    PORT,
    HTTPS_PORT,
    HOST_ADDRESS
} = config
const host = app.callback()

http.createServer(host).listen(PORT, HOST_ADDRESS);
console.log(`app start at: http://${HOST_ADDRESS}:${PORT}`);

if (config.enableHTTPS) {
    const httpsOptions = {
        key: fs.readFileSync('cert/server.key'),
        cert: fs.readFileSync('cert/server.crt')
    }
    https.createServer(httpsOptions, host).listen(HTTPS_PORT, HOST_ADDRESS);
    console.log(`app start https at: https://${HOST_ADDRESS}:${HTTPS_PORT}`);
}