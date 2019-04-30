/**
 * Book    2019/01/15     公司信息
 * @type {*|mongoose|Mongoose}
 */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      companyName: {type: String, default: ''},
      companyCode: {type: String, default: ''},
      hrArray: [{
        hrId: {type: String, default: ''},
        name: {type: String, default: ''},
        gender: {type: String, default: '男'},
      }],
      publishJobIdArray: [{
        jobId: {type: String, default: ''},
        publisherId: {type: String, default: ''},
        isDelete: {type: Number, default: 0}
      }]
      // publishJobArray: [{
      //   jobLabel: {type: String, default: ''},
      //   jobValue: {type: String, default: ''},
      //   jobAccount: {type: String, default: ''},
      //   jobAddress: {type: String, default: ''},
      //   experienceRequire: {type: String, default: ''},
      //   studyRequire: {type: String, default: ''},
      //   upMoney: {type: String, default: 0},
      //   floorMoney: {type: String, default: 0},
      //   publisher: {type: String, default: ''},
      //   publisherId: {type: String, default: ''},
      //   publishTime: {type: Number, default: 0},
      // }]
    }, {versionKey: false, usePushEach: true});


let model = mongoose.model('company', schema);
module.exports = model;
