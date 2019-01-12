let ioSvc = require('../socket/ioHelper').ioSvc;
let system = require('../config/system/systemConf');
let model = require('../model/model');
let utils = require('../config/util/utils');
let msgType = require('../socket/messageTpye').messageType;
let messageClass = require('../socket/messageTpye').messageClass;
let msgHelper = require('../socket/msgHelper');

async function sendMsg (ctx, next) {
    try {
        if(ctx.session.user) {
            console.log('当前用户session存在');
        }
        let user = ctx.session.user;
        if(!user) {
            ctx.body = {
                code: 401,
                msg: '当前用户未登录'
            };
            //todo // return;
        }
        /*todo 生产模式下要删掉这一段 现在这样写主要是为了能够在极客api上直接有效的调用该接口*/
        if(!user) {
            user = { nickName: 'zchuhyy',
                phone: '13755038432',
                pwd: '111111',
                email: '',
                address: '',
                gender: 0,
                city: '',
                province: '',
                IDCard: '',
                image: '',
                industry: '',
                introduction: '',
                birthday: '',
                isWorker: 0,
                workExperience: [],
                educationBackground: [],
                job: '',
                isWorking: 0,
                unit: '',
                _id: '5c3569a5e3e63b091841b89d' }
        }

        let userInfo = await model.user.findOne({_id: user._id});
        console.log(userInfo._id);
        console.log(userInfo.nickName);
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


module.exports = {
    sendMsg
};

