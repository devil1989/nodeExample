
/*该插件不修改情况下，只支持静态的
    role：{//role对象结构如下，表示该用户扮演了哪些角色，但是这个插件的role角色，通过userId来匹配models中的role文件的roleConfig中的信息，暂时只能在node端静态写死
        admin:true,
        test:true
    }

}*/
const Role = require("../../models/role");
module.exports = () => {
    return (context, next) => {
        var state = context.state
        if (state.user && state.user.userId) {
            return Role.getRole(state.user.userId).then((role) => {
                state.role = role
                // todo if you want to check role right for pages, here can check the url, and role.
                return next()
            })
        } else {
            return next()
        }
    }
}