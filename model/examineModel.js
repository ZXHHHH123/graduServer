/**
 * Created by admin-pc on 2019/5/19.
 */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      userId: {type: 'String', default: ''},
      image: {type: 'String', default: ''},
      creditFrontSide: {type: 'String', default: ''},
      creditReverseSide: {type: 'String', default: ''},
      userCreditCode: {type: 'String', default: ''},
      unit: {type: 'String', default: ''},
      companyCode: {type: 'String', default: ''},
      nickName: {type: 'String', default: ''},
      place: {type: 'String', default: ''},
      userEmail: {type: 'String', default: ''},
      examineStatus: {type: Number, default: 0} // 审核状态，0未审核、1已通过审核、2未通过审核
    }, {versionKey: false, usePushEach: true});


let model = mongoose.model('examine', schema);
module.exports = model;