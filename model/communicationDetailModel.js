/**
 * Created by admin-pc on 2019/5/15.
 */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      jobHunterId: {type: String, default: ''},
      recruiterId: {type: String, default: ''},
      jobId: {type: String, default: ''},
      interviewDetail: {},
      curriculumVitaeToEmail: {type: Number, default: 0},//对于招聘者而言，是否向求职者发送了希望对方发送简历的请求
      isSendInterview: {type: Number, default: 0},//对于招聘者而言，是否向求职者发送了面试通知
      isSendCurriculumVitaeToEmail: {type: Number, default: 0}//对于求职者而言，求职者是否已经发送了简历
     
      
    }, {versionKey: false,usePushEach: true});

let model = mongoose.model('communicationDetail', schema);
module.exports = model;