/**
 * Created by admin-pc on 2019/5/19.
 */

let model = require('../model/model');
let smsConfig = require('../config/smsConfig');
let utils = require('../config/util/utils');
let QcloudSms = require("qcloudsms_js");
let jsonwebtoken = require('jsonwebtoken');
let redisUtil = require('../config/util/redisUtil');
let systemConf = require('./../config/system/systemConf');
let qiniuConf = require('./../config/qiniuConfig.json');
const koaBody = require('koa-body')({
  multipart: true,  // 允许上传多个文件
});
const qiniu = require('qiniu')
let multer = require('multer');
let path = require("path");
let fs = require("fs");


/*管理员登录*/
async function login(ctx, body) {
  try {
    let data = ctx.request.body;
    let {phone, pwd} = data;
    let user = await model.user.findOne({
      phone: phone,
      pwd: pwd
    });
    let token = jsonwebtoken.sign({
      data: user,
      exp: Math.floor(Date.now() / 1000) + systemConf.expire
    }, systemConf.secret);
    
    console.log(user._id);
    redisUtil.Set(token, user._id.toString(), systemConf.expire, (err, res) => {
      if (err) {
        console.log(res);
      } else {
        console.log('设置成功');
      }
    });
    
    if (user.isAdmin === 1) {
      ctx.body = {
        code: 200,
        msg: '登录成功',
        data: user,
        sign: token,
      }
    } else {
      ctx.body = {
        code: 201,
        msg: '无当前权限'
      }
    }
  } catch (err) {
    console.log('admin-login===========' + err);
  }
}


/*待审核转换为招聘者项目*/
async function earnWillExamine(ctx, body) {
  try {
    let willExamineArr = await model.examine.find({
      examineStatus: 0,
    });
    ctx.body = {
      code: 200,
      msg: '获取待审核数据成功',
      data: willExamineArr
    }
  } catch (err) {
    console.log('earnWillExamine========' + err);
  }
}


/*已审核的转换为招聘者项目*/
async function earnHadExamine(ctx, body) {
  try {
    let hadExamine = await model.examine.find({
      examineStatus: {$ne: 0},
    });
    ctx.body = {
      code: 200,
      msg: '获取已审核数据成功',
      data: hadExamine
    }
  } catch (err) {
    console.log('earnHadExamine========' + err);
  }
}

/*审核*/
async function examineItem(ctx, body) {
  try {
    let data = ctx.request.body;
    let {isAccess, userId} = data;
   
    if (isAccess == 1) {
      let examineUser = await model.user.findOne({_id: userId});
      let examineItem = await model.examine.findOne({userId});
      let {image, creditFrontSide, creditReverseSide, userCreditCode, unit, companyCode, nickName, place, userEmail} = examineItem;
      examineUser.image = image;
      examineUser.creditFrontSide = creditFrontSide;
      examineUser.creditReverseSide = creditReverseSide;
      examineUser.unit = unit;
      examineUser.nickName = nickName;
      examineUser.place = place;
      examineUser.userCreditCode = userCreditCode;
      examineUser.userEmail = userEmail;
      examineUser.companyCode = companyCode;
      examineUser.isCompany = 1;
      /*判断该公司是否已经创建过，如果没有则添加该公司*/
      let company = await model.company.findOne({companyCode});
      if (!company) {
        console.log('不存在公司');
        let new_company = await model.company.create({
          companyName: examineUser.unit,
          companyCode: examineUser.companyCode,
          hrArray: [{
            hrId: examineUser._id,
            name: examineUser.nickName,
            gender: examineUser.gender,
          }]
        });
      }
      await examineUser.save();
      examineItem.examineStatus = 1;
      await examineItem.save();
      ctx.body = {
        code: 200,
        msg: '已通过',
      }
    }else if(isAccess == 0) {
      console.log(userId);
      let examineItem = await model.examine.findOne({userId});
      console.log('examineItem');
      console.log(examineItem);
      examineItem.examineStatus = 2;
      await examineItem.save();
      ctx.body = {
        code: 200,
        msg: '未通过',
      }
    }
    
  } catch (err) {
    console.log('examineItem========' + err);
  }
}


async function earnWillComplain(ctx, body) {
  try{
    let willComplainData = await model.complain.find({
      isExamine: 0
    });
    ctx.body = {
      code: 200,
      msg: '获取信息成功',
      data: willComplainData,
    }
  }catch (err) {
    console.log('earnWillComplain===========' + err);
  }
}

async function earnHadComplain(ctx, body) {
  try{
    let hadComplainData = await model.complain.find({
      isExamine: {$ne: 0}
    });
    ctx.body = {
      code: 200,
      msg: '获取信息成功',
      data: hadComplainData,
    }
  }catch (err) {
    console.log('earnHadComplain===========' + err);
  }
}

async function examineComplain(ctx, body) {
  try{
    let data = ctx.request.body;
    console.log(data);
    let {complainId, isAccess} = data;
    let presentComplainItem = await model.complain.findOne({_id: complainId});
    console.log(presentComplainItem);
    if(isAccess == 1) {
      presentComplainItem.isExamine = 1;
      await presentComplainItem.save();
      let jobId = presentComplainItem.jobId;
      let companyCode = presentComplainItem.companyCode;
      await model.jobType.findOneAndUpdate({_id: jobId}, {
        $set: {
          isDelete: 1
        }
      });
      await model.city.findOneAndUpdate({jobId: jobId}, {
        $set: {
          isDelete: 1
        }
      });
      let company = await model.company.findOne({companyCode});
      console.log(company);
      let companyPublishJobIdArray = company.publishJobIdArray;
      companyPublishJobIdArray.forEach((item, index) => {
        if (item.jobId == jobId) {
          item.isDelete = 1;
          company.publishJobIdArray = companyPublishJobIdArray;
          company.save();
        }
      });
      ctx.body = {
        code: 200,
        msg: '投诉审核通过、删除相关职位'
      }
  
  
  
    }else if(isAccess == 0) {
      presentComplainItem.isExamine = 2;
      await presentComplainItem.save();
      ctx.body = {
        code: 200,
        msg: '投诉审核未通过、未删除相关职位'
      }
    }
  }catch (err) {
    console.log('examineComplain===========' + err);
  }
}


module.exports = {
  login,
  earnWillExamine,
  earnHadExamine,
  examineItem,
  
  earnWillComplain,
  earnHadComplain,
  examineComplain,
};