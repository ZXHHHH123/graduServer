let model = require('../model/model');
let redisUtil = require('../config/util/redisUtil');

function addMsg() {
    console.log('向数据库添加消息记录');
}
module.exports = {
    addMsg
}