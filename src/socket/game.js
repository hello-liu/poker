var conns = require('./conns')
var {Game_1v1} = require('./way/game_1v1')

//桌子
var tables = new Map();

//所有的连接
var player = new Map();
//websocket 回调处理方法
exports.message = function (msg, wsId ) {
    var msgJson = JSON.parse(msg)
    var method = msgJson.method
    switch(method){
        case 'in':
            //加入房间
            in1(msgJson,wsId)
            break;
        case 'out':
            //退出房间
            out1(msgJson,wsId)
            break;
        case 'ready':
            //准备
            ready(msgJson,wsId)
            break;
        case 'noReady':
            //取消准备
            noReady(msgJson,wsId)
            break;
        case 'call':
            //叫分
        case 'noCall':
            //不叫分
            break;
        case 'major':
            //选主
            break;
        case 'holding':
            //扣牌
            break;
        case 'play':
            //出牌
            break;
        case 'ping':
            //ping
            break; 
        case 'iam':
            //我是
            break;
        case 'chat':
            //聊天
            break;
        default :
            //不认识的消息
    }
}

//加入房间处理 
var in1_p1 = {"method":"in","roomId":1,"sit":"up","type":"1v1","playerId":1,"playerName":"张三"}
var in1_p2 = {"method":"in","roomId":1,"sit":"down","type":"1v1","playerId":1,"playerName":"李四"}
var in1_p3 = {"method":"in","roomId":1,"sit":"left","type":"1v1","playerId":1,"playerName":"王二"}
var in1_p4 = {"method":"in","roomId":1,"sit":"right","type":"1v1","playerId":1,"playerName":"麻子"}

function in1(msg,wsId){
    var roomId = msg.roomId
    var type = msg.type//房间游戏类型
    var sit = msg.sit//要加入的座位
    var playerId = msg.playerId//房间游戏类型
    var playerName = msg.playerName//房间游戏类型
    var table = tables.get(roomId)

    //判断sit
    if(sit == 'up' || sit == 'down' ){

    }else if(sit == 'left' || sit == 'right' ){
        if(type = '1v1'){
            conns.sendMsg(wsId,'{"code":"error","msg":"座位无效！"}')
            return 
        }
    }else{
        //座位无效
        conns.sendMsg(wsId,'{"code":"error","msg":"座位无效！"}')
        return
    }

    if(table){
        //房间存在
        var player = table["player_"+sit]
        if(player){
            //已经有人
            //提示已经有人
            conns.sendMsg(wsId,'{"code":"error","msg":"已经有人！"}')
            return
        }else{
            //把人加入房间
            player = {id:playerId,name:playerName,statu:'noReay',wsId:wsId}
            table["player_"+sit] = player
        }
        

    }else{
        //房间不存
        //创建房间
        table = {id:roomId,type:type}
        //创建用户
        var player = {id:playerId,name:playerName,statu:'noReay',wsId:wsId}
        table["player_"+sit] = player
        tables.set(table.id,table)
    }
    //发送本房间状态给所有人
    conns.sendMsgAllTable(table)
}

//退出房间
var out1_p = {"method":"out","roomId":1,"sit":"up","playerId":1}

function out1(msg,wsId){
    var roomId = msg.roomId
    var sit = msg.sit//要加入的座位
    var playerId = msg.playerId//房间游戏类型
    var table = tables.get(roomId)

    var player = table["player_"+sit]

    //是否是这个座位的这个人
    if(player.id == playerId){
        table["player_"+sit] = null
    }else{
        return
    }
    
    //发送本房间状态给所有人
    conns.sendMsgAllTable(table)
}

//准备
var ready_p = {"method":"ready","roomId":1,"sit":"up","playerId":1}

function ready(msg,wsId){
    var roomId = msg.roomId
    var sit = msg.sit//要加入的座位
    var playerId = msg.playerId//房间游戏类型
    var table = tables.get(roomId)

    var player = table["player_"+sit]

    //是否是这个座位的这个人
    if(player.id == playerId){
        player.statu = 'ready'
    }else{
        return
    }

    //如果是所有人都准备好了就可以开始游戏了
    //准备的人数 
    var readyCount = 0;
    var player_up = table.player_up
    var player_down = table.player_down
    var player_left = table.player_left
    var player_right = table.player_right
    if(player_up && player_up.statu == 'ready'){
        readyCount ++
    }
    if(player_down && player_down.statu == 'ready'){
        readyCount ++
    }
    if(player_left && player_left.statu == 'ready'){
        readyCount ++
    }
    if(player_right && player_right.statu == 'ready'){
        readyCount ++
    }

    if(table.type = '1v1' && readyCount==2){
        //开始游戏
        table.game = new Game_1v1(table)
        table.game.start()
        return 
    }
    
    //发送本房间状态给所有人
    conns.sendMsgAllTable(table)
}

//取消准备
var ready_p = {"method":"noReady","roomId":1,"sit":"up","playerId":1}

function noReady(msg,wsId){
    var roomId = msg.roomId
    var sit = msg.sit//要加入的座位
    var playerId = msg.playerId//房间游戏类型
    var table = tables.get(roomId)

    var player = table["player_"+sit]

    //是否是这个座位的这个人
    if(player.id == playerId){
        player.statu = 'noReady'
    }else{
        return
    }
    
    //发送本房间状态给所有人
    conns.sendMsgAllTable(table)
}

