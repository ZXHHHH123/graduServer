/**
 * Book    2019/01/15     公司信息
 * @type {*|mongoose|Mongoose}
 */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      companyName: {type: String, default: ''},
      companyCode: {type: String, default: ''},
      companyAddress: {type: String, default: ''},
      companyStar: {type: String, default: ''},
      isBelisted: {type: Number, default: 0},
      companyPeopleNum: {type: String, default: ''},
      companyIndustry: [],
      companyWorkTimeValue: {type: String, default: ''},
      companyAccount: {type: String, default: ''},//公司介绍
      companyWebsite: {type: String, default: ''},
      companyEmail: {type: String, default: ''},
      companyWelfare: [],
      companyHolidaySystem: {type: String, default: ''},
      companyProduct: [{
        productImg: {type: String, default: ''},
        productName: {type: String, default: ''},
        productAccount: {type: String, default: ''},
      }],
      leaderArray: [{
        leaderName: {type: String, default: ''},
        leaderPlace: {type: String, default: ''},
        leaderImg: {type: String, default: ''},
        leaderAccount: {type: String, default: ''},
      }],
      hrArray: [{
        hrId: {type: String, default: ''},
        name: {type: String, default: ''},
        gender: {type: String, default: '男'},
      }],
      publishJobIdArray: [{
        jobId: {type: String, default: ''},
        publisherId: {type: String, default: ''},
        isDelete: {type: Number, default: 0},
        jobLabel: {type: String, default: ''},
        upMoney: {type: String, default: 0},
        floorMoney: {type: String, default: 0},
        publisher: {type: String, default: ''},
        publisherImg: {type: String, default: ''},
        publisherPlace: {type: String, default: ''},
        experienceRequire: {type: String, default: ''},
        studyRequire: {type: String, default: ''},
        chooseCity: {type: String, default: 0},
        companyEmail: {type: String, default: ''},
      }],
  
      companyLogo: {type: String, default: ''},
      companyImage: [],
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
