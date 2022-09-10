//初始化的时候，如何在docker中创建mongo的管理员
1.docker exec -it gp-database mongo admin //数据库用户创建相关案例，在docker中进入容器后，执行下面命令可以创建对应的数据库管理帐号 
2.db.auth("jeffreychen","out103496") //[这个帐号密码是在yml文件中设置的auth帐号密码，需要db.auth()登录，才能添加管理员]
3.db.createUser({//创建超级管理员：clusterAdmin是超级管理员角色，readAnyDatabase是访问出了config和local数据库以外的所数据库的角色
    user: 'jeffreyadmin',
    pwd: 'out103496Z',
    roles: [{
        role: 'clusterAdmin',
        db: 'admin'
    },{
        role: 'readAnyDatabase',//出了local和config仓库，对其他任何仓库都有查看的权限【没有修改其他仓库的权限】
        db: 'admin'
    },{
        role : 'readWrite',
        db : 'config'
    },{
        role : 'readWrite',
        db : 'local'
    }]
})

//注意，创建gpclubs下的管理员，必须要切到gpclubs下，否则这个帐号对gpclubs就是无效的；还有一点就是，use gpclubs切换到gpclubs，如果没有auth登录，还是无法创建，
//必须在admin仓库下用db.auth("jeffreychen","out103496")验证，然后再use gpclubs 进入gpclubs 仓库，然后再创建这个仓库的管理员
use gpclubs 

db.createUser({
    user: 'gp',
    pwd: 'Z103496out',
    roles: [{
        role: 'readWrite',
        db: 'gpclubs'
    }]
})