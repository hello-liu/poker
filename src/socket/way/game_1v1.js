
var conns = require('../conns')
var util = require('../../moss/util/util')


function Game_1v1(table) {
    this.table = table

    //玩家初始牌数
    const pokerCount = 12;
    //底牌数字
    const pokerCountDi = 4;

    //随机打乱函数
    Array.prototype.shuffle = function() {
        let m = this.length, i;
        while (m) {
            i = (Math.random() * m--) >>> 0;
            [this[m], this[i]] = [this[i], this[m]]
        }
        return this;
    }
    //扑克牌
    var poker = [102,103,104,105,106,107,108,109,110,111,112,113,114,
        202,203,204,205,206,207,208,209,210,211,212,213,214,
        302,303,304,305,306,307,308,309,310,311,312,313,314,
        402,403,404,405,406,407,408,409,410,411,412,413,414];


    //开始游戏
    this.start = function(){
        this.huanzhuang()
        this.xipai()
        this.fapai()
    }
    //换庄
    this.huanzhuang = function(){
        var zhuang = table.zhuang
        if(zhuang == 'up'){
            table.zhuang = 'down'
        }else if(zhuang == 'down'){
            table.zhuang = 'up'
        }
    }
    //洗牌
    this.xipai = function(){
        poker = poker.shuffle()
    }
    //发牌
    this.fapai = function(){
        var player_up = table.player_up
        var player_down = table.player_down
        player_up.pokers = poker.splice(0,pokerCount)
        player_down.pokers = poker.splice(pokerCount,pokerCount)

        player_up.pokers = player_up.pokers.sort()
        player_down.pokers = player_down.pokers.sort()

        //将状态设置为叫分
        table.statu = 'call'
        //设置当前操作人为庄
        table.currentplayer = table.zhuang
        //当前分值为 20
        table.currentCall = 1
        //庄闲得分
        table.majorfen = 0
        table.xianfen = 0

        table.currentMajor = 0
        table.currentMajorPlayer = null
        //当前每个人叫的都是 1分
        player_up.currentCall = 1
        player_down.currentCall = 1

        //叫分的人 
        table.currentCallPlayer = null

        //将信息发给玩家
        conns.sendMsgAllTable(table)
    }
    //叫分 {"method":"call","roomId":1,"sit":"up","playerId":1,"call":30}
    this.jiaofen = function(msg){
        var sit = msg.sit
        var call = msg.call
        //判断叫分的是否是当前操作人，且当前桌面状态为叫分
        if(sit == table.currentplayer && table.statu == 'call' ){
            var player_up = table.player_up
            var player_down = table.player_down
            if(call == 0 ){                
                //叫 0 分 即不叫分
                //设置玩家叫的分
                table['player_'+sit].currentCall = call
                //如果2个人都没叫分，重新开始
                if(player_up.currentCall == 0 && player_down.currentCall == 0){
                    this.start()
                    return 
                }

            }else{
                if(call%5 !=0 || call<table.currentCall || call>100){
                    //不是5的倍数，小于当前叫的分，大于100 均为无效的叫分
                    return
                }
                //必须大于上一个人叫的分
                if(table.currentCall >= call ){
                    return
                }
                //有效叫分
                table.currentCall = call
                //设置玩家叫的分
                table['player_'+sit].currentCall = call
            }
            // 如果叫 100 或者 另外一个人已经表示不叫分
            if(table.currentCall == 100 || ( (player_up.currentCall==0 || player_down.currentCall==0) && table.currentCall !=1 ) ){
                //设置当前桌面状态为选主
                table.statu = 'major'
                //设置选主的人
                if(call == 0 ){
                    //不叫的时候，上一个叫的人选主
                    table.currentplayer = table.currentCallPlayer
                }else{
                    //否则当前玩家选注
                }
            }else{
                //h换下一个人继续叫分
                var currentplayer = table.currentplayer
                //记录上一个叫分的人
                table.currentCallPlayer = currentplayer
                if(currentplayer == 'up'){
                    table.currentplayer = 'down'
                }else if(currentplayer == 'down'){
                    table.currentplayer = 'up'
                }
            }
        }else{
            //叫分不不是当前叫分人
            return
        }
        //将信息发给玩家
        conns.sendMsgAllTable(table)
    }
    //选主 {"method":"major","roomId":1,"sit":"up","playerId":1,"major":200}
    // 100 200 300 400
    this.xuanzhu = function(msg){
        var sit = msg.sit
        var major = msg.major
        //操作人和桌面状态判断
        if(sit == table.currentplayer && table.statu == 'major' ){
            //设置桌面的主花色
            table.currentMajor = major
            //设置选主的玩家
            table.currentMajorPlayer = sit
            //将底牌发给叫分人
            table['player_'+sit].pokers = table['player_'+sit].pokers.concat( poker.splice(pokerCount*2,pokerCountDi) )
            //设置当前状态为扣牌
            table.statu = 'holding'
        }else{
            //无效信息
            return
        }
        //将信息发给玩家
        conns.sendMsgAllTable(table)
    }
    //扣牌 {"method":"holding","roomId":1,"sit":"up","playerId":1,"holding":[111,111,111,111]}
    this.koupai = function(msg){
        var sit = msg.sit
        var holding = msg.holding
        //操作人和桌面状态判断
        if(sit == table.currentplayer && table.statu == 'holding' ){
            //删除扣牌玩家的扣牌
            var player = table["player_"+sit]
            player.pokers = util.arrayDels(player.pokers, holding)
            player.pokers = player.pokers.sort()
            //设置当前状态为出牌
            table.statu = 'play'
        }else{
            //无效信息
            return
        }
        //将信息发给玩家
        conns.sendMsgAllTable(table)
    }
    //出牌 {"method":"play","roomId":1,"sit":"up","playerId":1,"play":111}
    this.chupai = function(msg){
        var sit = msg.sit
        var play = msg.play
        //操作人和桌面状态判断
        if(sit == table.currentplayer && table.statu == 'play' ){
            //此处需要做出牌验证，确保出的是正常的牌并且符合游戏规则


            //删除出牌者出的牌
            var player = table["player_"+sit]
            //根据index删除节点
            player.pokers = util.arrayDel(player.pokers, player.pokers.indexOf(play) )
            //设置当前玩家出的牌
            player.currentplay = play

            var player_up = table.player_up
            var player_down = table.player_down
            //如果所有玩家均出牌了，则计算de分
            if(player_up.currentplay && player_down.currentplay){
                //计算de分

                // 主 > 第一出牌花色 > 其他花色
                //获取第一出牌花色
                var diyihua = 0;
                if(sit == 'up'){
                    diyihua = player_down.currentplay - player_down.currentplay%100
                }else if(sit == 'down'){

                }
                //玩家出的牌
                var player_up_play = player_up.currentplay
                var player_down_play = player_down.currentplay
                //当前牌面的分值
                var fen = 0
                if(player_up_play%5 == 0){
                    fen += player_up_play%100
                }else if(player_up_play%100 == 14){
                    //A 10 分
                    fen += 10
                }

                if(player_down_play%5 == 0){
                    fen += player_down_play%100
                }else if(player_down_play%100 == 14){
                    //A 10 分
                    fen += 10
                }

                //第一花色的牌 *10 , 主花色 *100
                var zhuhua = table.currentMajor
                if(zhuhua < player_up_play && player_up_play < zhuhua+20){
                    //up 出的主
                    player_up_play = player_up_play * 100
                }else if( diyihua < player_up_play && player_up_play < diyihua+20){
                    //up 牌的颜色是第一花色
                    player_up_play = player_up_play * 10
                }

                if(zhuhua < player_down_play && player_down_play < zhuhua+20){
                    //down 出的主
                    player_down_play = player_down_play * 100
                }else if( diyihua < player_down_play && player_down_play < diyihua+20){
                    //down 牌的颜色是第一花色
                    player_down_play = player_down_play * 10
                }

                // 比较牌的大小
                if(player_up_play > player_down_play){
                    // up 大 ，下轮up 出牌
                    table.currentplayer = 'up'
                    if(table.currentMajorPlayer == 'up'){
                        //up 选的主，则庄得分
                        table.majorfen += fen
                    }else{
                        //down 选的主，则闲得分
                        table.xianfen += fen
                    }
                }else{
                    // down 大 ，下轮down 出牌
                    table.currentplayer = 'down'
                    if(table.currentMajorPlayer == 'down'){
                        //down 选的主，则庄得分
                        table.majorfen += fen
                    }else{
                        //up 选的主，则闲得分
                        table.xianfen += fen
                    }
                }

                if(table.currentCall == table.majorfen ){
                    // 庄胜利
                    // 设置每个人是否胜利
                    if(table.zhuang == 'up'){
                        player_up.win = 'win'
                        player_down.win = 'lose'
                    }else{
                        player_up.win = 'lose'
                        player_down.win = 'win'
                    }
                    //修改当前桌面状态为结算中
                    table.statu = 'clear'
                    //设置每个人的状态为 未准备
                    player_up.statu = 'noReay'
                    player_down.statu = 'noReay'

                    //调用一下结算，用于计算和保存成绩
                    this.jiesuan()

                }

                player_up.currentplay = 0
                player_down.currentplay = 0
                
            }else{
                //下一个人出牌
                var currentplayer = table.currentplayer
                if(currentplayer == 'up'){
                    table.currentplayer = 'down'
                }else if(currentplayer == 'down'){
                    table.currentplayer = 'up'
                }
            }
        }else{
            //无效信息
            return
        }
        //将信息发给玩家
        conns.sendMsgAllTable(table)
    }
    //强退,则输 
    this.qiangtui = function(msg){
        var sit = msg.sit
        var player_up = table.player_up
        var player_down = table.player_down
        if(sit == 'up'){
                player_up.win = 'lose'
                player_down.win = 'win'
        }else{
                player_up.win = 'win'
                player_down.win = 'lose'
        }
        //修改当前桌面状态为结算中
        table.statu = 'clear'
        //设置每个人的状态为 未准备
        player_up.statu = 'noReay'
        player_down.statu = 'noReay'
        
        //调用一下结算，用于计算和保存成绩
        this.jiesuan()
    }
    //结算
    this.jiesuan = function(){
        util.info('计算成绩')
    }
    
    
}

exports.Game_1v1 = Game_1v1