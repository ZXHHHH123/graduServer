/**
 * Created by admin-pc on 2019/5/20.
 */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      userId: {type: 'String', default: ''},
      jobId: {type: 'String', default: ''},
      complainAccount: {type: 'String', default: ''},
      complainImage: [],
      nickName: {type: 'String', default: ''},
      image: {type: 'String', default: ''},
      companyName:  {type: 'String', default: ''},
      companyCode:  {type: 'String', default: ''},
      isExamine: {type: Number, default: 0}, //是否已审核，0为未审核， 1 为审核通过，已删除该职位，二为审核未通过
    }, {versionKey: false, usePushEach: true});


let model = mongoose.model('complain', schema);
module.exports = model;