// 程序入口
var express = require('express')
var conf = require('./conf')
//文件上传配置
var bodyParser = require('body-parser');
var multer  = require('multer');
var controller = require('./src/moss/controller/controller')
var util = require('./src/moss/util/util')

//ws
const WebSocket = require('ws');//引入模块
var socketDeal = require('./src/socket/conns')


var app = express()
app.use(bodyParser.json() );
// app.use(bodyParser.json({extended:true}));
// app.use(bodyParser.json());
// app.use(multer({ dest: conf.file_path }).array('file'));

//启动http服务
app.get('/api', function (req, res) {
    var query = req.query
    controller.api(req, res, query)
})

app.post('/api', function (req, res) {
    var body = req.body;
    controller.api(req, res, body)
})

var server = app.listen(conf.http_port, function () {
  var host = server.address().address
  var port = server.address().port
  util.info(`http server start at : http//${host}:${port}`)
})


//启动ws（WebSocket）服务
//创建一个WebSocketServer的实例，监听端口
const wss = new WebSocket.Server({ port: conf.socket_port });
util.info(`WebSocket server start at : ${conf.socket_port}`)

//连接后用socket里面的方法来处理各种
wss.on('connection', socketDeal.deal);
