var util = require('../util/util')
var user_service = require('../service/user_service')

//统一处理方法
exports.api = function(req, res, body){
    // util.info(body)

    var method = body.method
    var token = body.token

    //鉴权

    // 分发处理
    switch(method){
        //用户
        case 'user.add': user_service.add(req, res, body) ; break
        case 'user.del': user_service.del(req, res, body) ; break

        //其他
        default: res.end(`{"code":"error","msg":"方法不存在"}`)
    }
}