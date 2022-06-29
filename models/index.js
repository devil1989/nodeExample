const BaseModel = require('./baseModel');
const mongoose=require("mongoose");//基于"mongodb"的封装，使用更加方便

class KidsClassService extends BaseModel{

    constructor(self) {
        super();
        this.ctx = self;
    }

    * getCityInfo() {
        let url = '/v1/query';
        let param={
            'url': url,
            'method': 'post',
            'form':{"level": 2 }
        };
        let province = yield this.fnClassJeffrey(param);//不能添加http协议头
        return province.data;
    }

    * getUserInfo(opts,scope) {
        let db=mongoose.connect("mongodb://localhost:27017/local");
        yield db.then(function(data) {
            let userModel=BaseModel.UserSchema;
            return userModel.find(opts);
        },function(err){
            console.log(err);
        }).then(function(data) {
            if(data.length){
                scope.mongoData=data;
            }
        },function(err) {
            console.log(err);
        });
    }

    


    * registUser(scope,opts) {
        let that=this;
        let db= mongoose.connect('mongodb://localhost:27017/local');//返回promise
        yield db.then(function(data) {
            let queryArray= [{phone:opts.phone},{userName:opts.userName}]; //或条件，属性要分开写
            let userModel=BaseModel.UserSchema;
            return userModel.find({
                $or:queryArray
            });

            // 每个then里面的第一个function返回promise对象，实现链式调用
        },function(err){
            console.log(err);
        }).then(function(data) {
            if(!data.length){//save效率低，最号用于修改，别用于插入数据
                return new BaseModel.UserSchema(Object.assign({},BaseModel.defaultUser,opts)).save();//是个promise
            }else{
                scope.mongoData=data;
                scope.status=false;
            }
        },function(err) {
            scope.status=false;
            console.log(err);
        }).then(function(rst) {

            if(!scope.mongoData){
                scope.mongoData=rst;
                scope.status=true;
            }
        },function(err) {
            scope.status=false;
        })
    }
}


module.exports = KidsClassService
