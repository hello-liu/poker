var conf = require('../../../conf')

const { Pool } = require('pg')

const pool = new Pool(conf.pg_conf)
//答应日志
exports.info = info => {
    let d = new Date();
    let d_str = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
    console.info( d_str  +'[info] '+ JSON.stringify(info));

}
//打印错误日志
exports.error = error => {
    let d = new Date();
    let d_str = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
    console.error( d_str + '[error] ' + JSON.stringify(error ) );
}
//转字符串
exports.toString = obj => {
    return JSON.stringify(obj);
}
//获取一个pg的链接
exports.getPool = () => {
    return pool
}
//删除数组的节点，返回新数组
const arrayDel = function(arr,n){　
    if(n<0){
        return arr;
    }else{
    　　return arr.slice(0,n).concat(arr.slice(n+1,arr.length));
    }
}
exports.arrayDel = arrayDel

//删除数组的节点们，返回新数组
const arrayDels = (arr,arrDel) =>{　
    var result = arr
    for(var i = 0 ; i < result.length; i++){
        var index = result.indexOf(arrDel[i])
        result = arrayDel(result,index)
    }
    return result
}
exports.arrayDels = arrayDels