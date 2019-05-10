/**
 * Created by admin-pc on 2019/4/28.
 */
/*工作表---主要是以该工作的value值作为id，没发布一个职位都会新建一个job*/
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      jobLabel: {type: String, default: ''},
      jobValue: {type: String, default: ''},
      
      
      jobAccount: {type: String, default: ''},
      jobAddress: {type: String, default: ''},
      experienceRequire: {type: String, default: ''},
      studyRequire: {type: String, default: ''},
      upMoney: {type: String, default: 0},
      floorMoney: {type: String, default: 0},
      chooseCity: {type: String, default: 0},
      chooseCityValue: {type: String, default: 0},
      publisher: {type: String, default: ''},
      publisherImg: {type: String, default: ''},
      publisherPlace: {type: String, default: ''},
      publisherId: {type: String, default: ''},
      publishTime: {type: Number, default: 0},
      companyCode: {type: String, default: ''},
      companyName: {type: String, default: ''},
      companyLogo: {type: String, default: ''},
      companyPeopleNum: {type: String, default: ''},
      companyIndustry: [],
  
      isDelete: {type: Number, default: 0},
      isBelisted: {type: Number, default: 0},
      companyAddress: {type: String, default: ''},
    }, {versionKey: false, usePushEach: true});


let model = mongoose.model('jobType', schema);
module.exports = model;
