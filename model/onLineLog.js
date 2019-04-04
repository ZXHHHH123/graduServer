/*�洢�û����������߼�¼*/
let mongoose = require('../config/util/db'),
  Schema = mongoose.Schema,
  schema = new Schema({
    userId: {type: Schema.Types.ObjectId},   //�û�ΨһID
    socketId: {type: String, default: ''},
    onlineTime: {type: Number, default: 0}, //����ʱ��
    offLineTime: {type: Number, default: 0},//����ʱ��
    url: {type: String, default: ''},
    port: {type: Number, default: 0}
  }, {versionKey: false});
let model = mongoose.model('onLineLog', schema);
module.exports = model;