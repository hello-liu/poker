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

    //洗牌
    function xipai(){
        poker = poker.shuffle()
        console.log(poker)
    }
        
    xipai();
