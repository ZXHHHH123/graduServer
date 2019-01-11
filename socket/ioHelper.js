let redisUtil = require('../config/util/redisUtil');
let ioSvc = {};
ioSvc.io = null;

ioSvc.setInstance = function (io) {
    this.io = io;
};
ioSvc.getInstance = function () {
    return this.io;
};
ioSvc.serverBroadcastMsg = function (data) {
    console.log('发送广播消息');
    this.io.sockets.emit('message', data)
};
ioSvc.serverToPrivateMsg = function(uid, data) {
    try {
        console.log('iohelper-----------' + uid);
        redisUtil.Get(uid, (err, sid) => {
            if(sid) {
                this.io.to(sid).emit('message', data);
                console.log('socket.io 发送成功');
            }else {
                console.log('无sid');
            }
        })

    }catch (e) {

    }
}

module.exports = {
    ioSvc
}