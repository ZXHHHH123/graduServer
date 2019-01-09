/*
* io基本监听
* */
let redisUtil = require('../config/util/redisUtil');
// let ioSvc = require('./ioHelper').ioSvc;
let model = require('../model/model');
let dev = require('../config/development');

class test {
    constructor(io) {
        this.io = io;
    }

    isServer() {
        let io = this.io;
        console.log('==============启动socket.io成功==============');
        redisUtil.Set('online_count', 0, null, (err, res) => {
            if (err) {
                console.log(err + '初始化redis失败')
            }
        });
        io.on('connection', (socket) => {
            console.log('socketio有新的连接');
            console.log(socket.id);
            socket.on('login', async (uid) => {
                console.log('进来socket.io的uid是=========' + uid);
                this.showOnlineNum(true);
                if (!!uid) {
                    console.log(typeof uid + "---" + uid)
                    console.log(uid + '连接socket成功' + socket.id);
                    redisUtil.Set(uid, socket.id, null, (err, res) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                    redisUtil.Set(socket.id, uid, null, (err, res) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                } else {
                    console.log("socket--->uid:" + uid)
                }
            });
            socket.on('disconnect', () => {
                this.showOnlineNum(false);
                console.log('disconnect' + socket.id);
                redisUtil.Get(socket.id, (err, uid) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log(uid + "断开" + socket.id);
                    if (uid) {
                        redisUtil.Del(uid, (err, res) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    }
                    redisUtil.Del(socket.id, (err, res) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                });
            })
        })
    };

    showOnlineNum(isConnect) {
        redisUtil.Get('online_count', (err, val) => {
            if (err) {
                console.log(err);
            }
            if (!val) {
                val = 0;
            }
            try {
                if (typeof val !== "number") {
                    val = parseInt(val);
                    if (isConnect) {
                        val++;
                    } else {
                        val--;
                        if (val < 0) {
                            val = 0;
                        }
                    }
                    console.log('当前在线人数====' + val);
                    redisUtil.Set('online_count', val, null, (err, res) => {
                        if (err) {
                            console.log(err + 'set online_count')
                        }
                    })

                }
            } catch (e) {

            }
        })
    }
}


function ioServer(io) {
    let _this = this;
    console.log('==============启动socket.io成功==============');
    redisUtil.Set('online_count', 0, null, (err, res) => {
        if (err) {
            console.log(err + '初始化redis失败')
        }
    });
    io.on('connection', (socket) => {
        console.log('socketio有新的连接');

        socket.on('login', (uid) => {
            console.log('进来socket.io的uid是=========' + uid);
            _this.showOnlineNum(true);
        })
    })


    this.showOnlineNum = function (isConnect) {
        //获取在线的人数
        redisUtil.Get('online_count', (err, val) => {
            if (err) {
                console.log(err);
            }
            if (!val) {
                val = 0;
            }
            try {
                if (typeof val !== "number") {
                    val = parseInt(val);
                    if (isConnect) {
                        val++;
                    } else {
                        val--;
                        if (val < 0) {
                            val = 0;
                        }
                    }
                    console.log('当前在线人数====' + val);
                    redisUtil.Set('online_count', val, null, (err, res) => {
                        if (err) {
                            console.log(err + 'set online_count')
                        }
                    })

                }
            } catch (e) {

            }
        })
    }
}

module.exports = {
    ioServer,
    test
};