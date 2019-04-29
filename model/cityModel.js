/**
 * Created by admin-pc on 2019/4/28.
 */
let mongoose = require('../config/util/db'),
    Schema = mongoose.Schema,
    schema = new Schema({
      cityLabel: {type: String, default: ''},
      cityValue: {type: String, default: ''},
      jobId: {type: String, default: ''},
    }, {versionKey: false, usePushEach: true});


let model = mongoose.model('city', schema);
module.exports = model;
