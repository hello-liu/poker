var game = require('./game')
var util = require('../moss/util/util')
//所有的连接
var conns = new Map();
var id = 0 ;
//websocket 回调处理方法
exports.deal = function (ws,req) {
    
    ws.id = id++
    conns.set(ws.id,ws)
    util.info('conn:'+ws.id)

    //收到消息事件
    ws.on('message', function incoming(message) {
        game.message(message,ws.id)
    });
    //关闭连接事件
    ws.on('close', function () {
        game.message('{"method":"close","id":"'+this.id+'"}')
        conns.delete(this.id)
        util.info('close:'+this.id)
    });
}

send = function (id,message) {
    conns.get(id).send(message)
}

//给某个人发消息
var sendMsg = function (id,msg){
    send(id,msg);
}

//给本桌的人发消息
var sendMsgAll = function (table,msg){
    var player_up = table.player_up
    var player_down = table.player_down
    var player_left = table.player_left
    var player_right = table.player_right
    if(player_up){
        sendMsg(player_up.wsId, msg)
    }
    if(player_down){
        sendMsg(player_down.wsId, msg)
    }
    if(player_left){
        sendMsg(player_left.wsId, msg)
    }
    if(player_right){
        sendMsg(player_right.wsId, msg)
    }
}


//发送本桌内容给本桌的人
var sendMsgAllTable = function (table){
    sendMsgAll( table, JSON.stringify(table,function(key, val){
        //过滤game属性，防止循环序列化
        if(key == 'game'){
            return null;
        }else{
            return val;
        }
    }));
}

exports.sendMsgAllTable = sendMsgAllTable
exports.sendMsgAll = sendMsgAll
exports.sendMsg = sendMsg
