/*存储用户的上线离线记录*/
let mongoose = require('../config/util/db'),
  Schema = mongoose.Schema,
  schema = new Schema({
    userId: {type: Schema.Types.ObjectId},   //用户唯一ID
    socketId: {type: String, default: ''},
    onlineTime: {type: Number, default: 0}, //上线时间
    offLineTime: {type: Number, default: 0},//下线时间
    url: {type: String, default: ''},
    port: {type: Number, default: 0}
  }, {versionKey: false});
let model = mongoose.model('onLineLog', schema);
module.exports = model;