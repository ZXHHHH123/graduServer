/*smsmodel
* 腾讯云短信存储
* */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
        phone: {type: String, default: ''},
        verifyCode: {type: String, default: ''},
        createTime: {type: String, default: ''},
        codeStatus: {type: Number, default: 0},

    }, {versionKey: false,usePushEach: true});

let model = mongoose.model('SMSCode', schema);
module.exports = model;