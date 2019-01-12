let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
        userId: {type: Schema.Types.ObjectId},/*接收者id*/
        sendUserId: {type: Schema.Types.ObjectId}, /*发送者id*/
        sendTime: {type: Number, default: 0},
        userName: {type: String, default: ''},/*发送者名字*/
        image: {type: String, default: ''},/*发送者头像*/
        isSystemMsg: {type: Number, default: 0},/*是否为系统消息*/
        type: {type: String, default: ''},/*消息类型 私聊or群聊 拓展功能*/
        msgClass: {type: String, default: ''},        /*消息类型 chat、redPoint、pushMessage等*/
        content: {
            message: {type: String, default: ''},
            image: {type: String, default: ''}
        }
        /*消息内容*/
    }, {versionKey: false});
let model = mongoose.model('offLineMsg', schema);
module.exports = model;