let model = require('../model/model');
let redisUtil = require('../config/util/redisUtil');

function addMsg(uid, data) {
    try {
        for(let i of uid) {
            console.log('~~~~~~~~~~~~~~~~~~' + redisUtil.AsyncGet(i));
            if(redisUtil.AsyncGet(i)) {
                /*user online*/
                model.msgLog.create({
                    userId: i,
                    sendUserId: data.sendUserId,
                    userName: data.userName,
                    image: data.image,
                    isSystemMsg: data.isSystemMsg,  //是否为系统消息
                    sendTime: data.sendTime,
                    type: data.type,
                    msgClass: data.msgClass,
                    content: {
                        message: data.content.message,//内容
                        image: data.content.image,//图片
                    }
                })
            }else {
                /*user offline*/
                model.offLineMsg.create({
                    userId: i,
                    sendUserId: data.sendUserId,
                    userName: data.userName,
                    image: data.image,
                    isSystemMsg: data.isSystemMsg,  //是否为系统消息
                    sendTime: data.sendTime,
                    type: data.type,
                    msgClass: data.msgClass,
                    content: {
                        message: data.content.message,//内容
                        image: data.content.image,//图片
                    }
                })
            }
        }

    }catch (e) {
        console.log('addMsg-----------' + e);
    }
}

function addOffLinePushMsg(uid, data) {
    try {
        for(let i of uid) {
            if(!redisUtil.AsyncGet(i)) {
                /*用户不在线*/
                console.log('用户不在线');
                model.offLineMsg.create({
                    userId: i,
                    sendUserId: data.sendUserId,
                    userName: data.userName,
                    image: data.image,
                    isSystemMsg: data.isSystemMsg,  //是否为系统消息
                    sendTime: data.sendTime,
                    type: data.type,
                    msgClass: data.msgClass,
                    content: {
                        message: data.content.message,//内容
                        image: data.content.image,//图片
                    }
                })
            }
        }
    }catch (e) {
        console.log('addOffLinePushMsg------------' + e);
    }
}
module.exports = {
    addMsg,
    addOffLinePushMsg
}