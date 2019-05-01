/**
 * Book    2019/01/08     用户信息
 * @type {*|mongoose|Mongoose}
 */

let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      /*基本信息 每个人都需要*/
      nickName: {type: String, default: ''},    //用户昵称
      phone: {type: String, default: ''},       //用户手机号
      pwd: {type: String, default: ''},         //用户密码
      email: {type: String, default: ''},       //用户邮件地址
      address: {type: String, default: ''},     //用户所属地区
      gender: {type: Number, default: 0},         //用户性别  0  --  为女； 1 -- 为男
      city: {type: String, default: ''},           //用户所在城市
      province: {type: String, default: ''},      //用户所在省
      IDCard: {type: String, default: ''},          //公民身份证号
      image: {type: String, default: ''},     //头像
      industry: {type: String, default: ''},    //用户从事行业
      introduction: {type: String, default: ''},      //自我介绍
      birthday: {type: String, default: ''},           //生日
      joinWorkTime: {type: String, default: ''},           //开始工作时间
      personAccount: {type: String, default: ''},           //个人优势描述
      // isWorker: {type: Number, default: 0},     //0代表是工作者，1代表公司
      
      
      /*求职者信息*/
      workExperience: [],                         //用户工作经历，包括用户曾经供职的地区、单位、职务、岗位、工作内容
      educationBackground: [],                     //曾经就读的学校名称、专业、在校时间。
      job: {type: String, default: ''},             //具体职业
      isWorking: {type: Number, default: 0},     //0代表未就业，1代表已就业
      collectJob: [],                           //用户收藏的公司岗位
      
      
      /*公司信息*/
      isCompany: {type: Number, default: 0}, //是否为公司
      unit: {type: String, default: ''},           //所在单位名称
      companyCode: {type: String, default: ''}, //公司机构码
      place: {type: 'String', default: ''},
      creditFrontSide: {type: 'String', default: ''},
      creditReverseSide: {type: 'String', default: ''},
      userCreditCode: {type: 'String', default: ''},
      userEmail: {type: 'String', default: ''},
    }, {versionKey: false, usePushEach: true});

let model = mongoose.model('user', schema);
module.exports = model;