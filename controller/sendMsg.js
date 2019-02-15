let ioSvc = require('../socket/ioHelper').ioSvc;
let system = require('../config/system/systemConf');
let model = require('../model/model');
let utils = require('../config/util/utils');
let msgType = require('../socket/messageTpye').messageType;
let messageClass = require('../socket/messageTpye').messageClass;
let msgHelper = require('../socket/msgHelper');
let redisUtil = require('../config/util/redisUtil');


async function sendMsg (ctx, next) {
    try {
        console.log('发消息所传的token============' + ctx.request.headers.authorization);
        let token = ctx.request.headers.authorization;
        token = token.substr(7);
        let userId = await redisUtil.AsyncGet(token);
        if(!userId) {
            ctx.body = {
                code: 401,
                msg: '当前用户未登录'
            };
            return;
        }
        let userInfo = await model.user.findOne({_id: userId});
        let type = msgType.private;
        let msgClass = messageClass.message;
        let {uid, content} = ctx.request.body;
        let {image, nickName} = userInfo;
        let data = {
            image,
            nickName,
            sendUserId: userInfo._id,
            content,
            sendTime: +new Date(),
            msgClass,
            type,
            isSystemMsg: 0,
        };
        /*
           如果需要发送pushMessage（系统推送）则会在相应的发送系统消息的代码中改变data.msgClass的类型，现在这只是测试相应的接口
           用于测试pushMessage接口 加上 data.msgClass = 'pushMessage';
        * */
        send([uid], data);
        await redOffLineMsg(uid);
        ctx.body = {
            code: 200,
            msg: '发送成功'
        }
    }catch (e) {

    }
}


/*发送消息*/
function send(uid, data) {
    console.log('进入send方法');
    console.log(uid + '~~~~~~~~~~' + JSON.stringify(data));
    try{
        switch (data.type) {
            case msgType.private:
                switch (data.msgClass) {
                    /*发送聊天消息*/
                    case messageClass.message:
                        ioSvc.serverToPrivateMsg(uid, data);
                        msgHelper.addMsg(uid, data);
                        break;
                    /*发送推送消息*/
                    case messageClass.pushMessage:
                        ioSvc.serverToPushMessage(uid, data);
                        msgHelper.addOffLinePushMsg(uid, data);
                        break;
                }
        }



    }catch (e) {

    }




}

/*查询离线消息*/
async function redOffLineMsg(userId) {
    let userAllOfflineMsg = await model.offLineMsg.find({userId: userId});
    console.log(userAllOfflineMsg);
}


module.exports = {
    sendMsg,
    redOffLineMsg
};

