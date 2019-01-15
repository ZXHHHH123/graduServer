/**
 * Book    2019/01/15     公司信息
 * @type {*|mongoose|Mongoose}
 */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
       name: {type: String, default: ''},
       companyId: {type: String, default: ''},
       hrArray: [{
           name: {type: String, default: ''},
           gender: {type: String, default: '男'},
           _id: {type: String, default: ''},
       }],
       publishJobArray: [{
           type: {type: Number, default: 0},
           job: {type: String, default: ''},
           require: {type: String, default: ''},
           upMoney: {type: Number, default: 0},
           floorMoney: {type: Number, default: 0},
           publisher: {type: String, default: ''},
       }]
    }, {versionKey: false, usePushEach: true});


let model = mongoose.model('company', schema);
module.exports = model;
