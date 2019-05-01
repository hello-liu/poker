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
        try{
            game.message(message,ws.id)
        }catch(e){
            console.log(e.stack)
        }
    });
    //关闭连接事件
    ws.on('close', function () {
        conns.delete(this.id)
        game.message('{"method":"close"}',this.id)
        util.info('close:'+this.id)
    });
}

send = function (id,message) {
    ws = conns.get(id)
    if(ws.readyState == 1){
        ws.send(message)
    }
}

//给某个人发消息
var sendMsg = function (id,msg){
    send(id,msg);
}

//给所有人发消息，发到大厅
var sendMsgAll = function (players, msg){
    for(value of conns){
        var wsId = value[0]
        if(players.get(wsId)){
            //在座位上的玩家不发大厅消息
        }else{
            //大厅的人发消息
            ws = value[1]
            if(ws.readyState == 1){
                ws.send(msg)
            }
        }
    }
}

//给本桌的人发消息，发到游戏桌面
var sendMsgTable = function (table,msg){
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
    console.log(table)
    sendMsgTable( table, util.fmt_table(table) );
}

exports.sendMsgAllTable = sendMsgAllTable
exports.sendMsgAll = sendMsgAll
exports.sendMsg = sendMsg
