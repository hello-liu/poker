
var conns = require('../conns')

function Game_1v1(table) {
    this.table = table

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
    var poker = ['11','12','13','14','15','16','17','18','19','1B','1J','1Q','1K',
        '21','22','33','34','25','26','27','28','29','2B','2J','2Q','2K',
        '31','32','33','34','35','36','37','38','39','3B','3J','3Q','3K',
        '41','42','43','44','45','46','47','48','49','4B','4J','4Q','4K'];


    //开始游戏
    this.start = function(){
        this.xipai()
        this.fapai()
    }
    //洗牌
    this.xipai = function(){
        poker = poker.shuffle()
    }
    //发牌
    this.fapai = function(){
        var player_up = table.player_up
        var player_down = table.player_down
        player_up.pokers = poker.splice(0,12)
        player_down.pokers = poker.splice(12,12)

        //设置一个人为开始人

        //将信息发给玩家
        conns.sendMsgAllTable(table)
    }
    //叫分
    this.jiaofen = function(){
        
    }
    //不叫分
    this.bujiaofen = function(){
        
    }
    //选主
    this.xuanzhu = function(){
        
    }
    //扣牌
    this.koupai = function(){
        
    }
    //出牌
    this.chupai = function(){
        
    }
    //结算
    this.jiesaun = function(){
        
    }
}

exports.Game_1v1 = Game_1v1