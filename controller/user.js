/**
 * Book   --  2018/7/13
 * （1）用户注册
 * （2）登录
 * （3）短信验证
 * （4）修改密码
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


const InitialCode = 1000;


async function openTest(ctx, next) {
  console.log('~~~~~~');
  console.log('openTest---111' + JSON.stringify(ctx));
  console.log('openTest---222--session' + JSON.stringify(ctx.session));
  console.log('openTest---222--body' + JSON.stringify(ctx.request.body));
  let data = ctx.request.body;
  let user = await model.user.findOne({phone: data.phone});
  ctx.body = {
    code: 200,
    msg: "接入成功",
    data: user
  }
};


/*获取短信验证码*/
async function getVarifyCode(ctx, next) {
  try {
    console.log('--getVerifyCode-111-用户获取短信验证--ctx' + JSON.stringify(ctx));
    console.log(ctx.request.body);
    let phone = ctx.request.body.phone;
    // let accessKeyId = config.accessKeyId;
    // let secretAccessKey = config.secretAccessKey;
    let verifyCode = utils.getCode();  //生成六位数的验证码
    console.log('随机生成的验证码' + verifyCode);
    let smsItem = await model.SMS.findOne({phone});
    // console.log('smsItem' + JSON.stringify(smsItem));
    if (!!smsItem) {
      smsItem.verifyCode = verifyCode;
      smsItem.createTime = new Date().getTime();
      smsItem.codeStatus = 0;
    } else {
      smsItem = await model.SMS.create({phone, verifyCode, codeStatus: 0, createTime: +new Date()})
    }
    
    // 实例化QcloudSms
    let qcloudsms = QcloudSms(smsConfig.appid, smsConfig.appkey);
    var ssender = qcloudsms.SmsSingleSender();
    var params = [verifyCode, smsConfig.loseEfficacy];
    ctx.body = await utils.sendSMS(phone, ssender, params, smsItem);
    
    
  } catch (e) {
    console.log('-getVerifyCode-err' + e);
  }
}

/**
 * 用户注册
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
async function register(ctx, next) {
  try {
    let data = ctx.request.body;
    let phone = data.phone;
    let nowTime = +new Date();
    // console.log('register --111' + phone);
    // console.log('ctx:' + JSON.stringify(ctx));
    // console.log(JSON.stringify(data));
    let user = await model.user.findOne({phone: phone}, {userId: 1});
    console.log(user);
    if (!!user) {
      ctx.body = {
        code: 300,
        msg: 'phone have register'
      };
    } else {
      let SMSCode = await model.SMS.findOne({phone: phone});
      console.log('register --222' + JSON.stringify(SMSCode));
      if (!!SMSCode) {
        if (SMSCode.codeStatus === 0 && data.SMSCode === SMSCode.verifyCode) {
          if ((nowTime - SMSCode.createTime) > smsConfig.dbloseEfficacy) {
            ctx.body = {
              code: 302,
              msg: 'SMSCode is old'
            }
          } else {
            let lastUser = await model.user.findOne().sort({openId: -1});
            console.log('lastuser' + JSON.stringify(lastUser));
            let openId = null;
            if (!!lastUser) {
              openId = lastUser.openId++;  //用户(唯一)标识码，推荐ID
            } else {
              openId = InitialCode;
            }
            //创建一个用户
            let new_user = await model.user.create({
              openId: openId,
              phone: phone,
              pwd: data.pwd,
              nickName: data.nickName,
              email: data.email,
              address: data.address,
              industry: data.industry,
              gender: data.gender,
              city: data.city,
              province: data.province,
              image: '',
              IDCard: data.IDCard,
              unit: data.unit,
              job: data.job,
              workExperience: data.workExperience,
              educationBackground: data.educationBackground,
              introduction: data.introduction,
              birthday: data.birthday,
              isWorking: data.isWorking,
              isCompany: data.isCompany,
              companyCode: data.companyCode,
            });
            if (!!new_user) {
              SMSCode.codeStatus = 1;
              await SMSCode.save();
              if (data.isCompany === 0) {
                //求职者
                ctx.body = {
                  code: 200,
                  msg: 'user  register success'
                };
              } else {
                //发布职位者
                console.log('发布职位者');
                let userItem = await model.user.findOne({phone: data.phone});
                console.log(123);
                console.log(userItem);
                let companyItem = await model.company.findOne({companyCode: data.companyCode});
                console.log(456);
                if (!!companyItem) {
                  //    存在当前公司，向公司的hrArray添加当前hr，
                  console.log('存在当前公司');
                  await model.company.findOneAndUpdate({companyCode: data.companyCode}, {
                    $push: {
                      hrArray: {
                        name: userItem.nickName,
                        gender: userItem.gender,
                        hrId: userItem._id
                      }
                    }
                  });
                  
                  
                } else {
                  console.log('初次进入添加公司');
                  model.company.create({
                    name: data.unit,
                    companyCode: data.companyCode,
                    hrArray: [{
                      name: userItem.nickName,
                      gender: userItem.gender,
                      hrId: userItem._id,
                    }]
                  });
                }
                ctx.body = {
                  code: 200,
                  msg: 'user  register success'
                };
              }
              
              
            } else {
              ctx.body = {
                code: 400,
                msg: 'user  register fail'
              }
            }
          }
        } else {
          ctx.body = {
            code: 301,
            msg: 'SMSCode have used or error'
          }
        }
      } else {
        ctx.body = {
          code: 303,
          msg: 'this phone SMSCode is no'
        }
      }
    }
  } catch (err) {
    console.log('err :' + err);
  }
}

/**
 * 直接手机号+密码验证登录
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
async function login(ctx, next) {
  try {
    let data = ctx.request.body;
    let phone = data.phone;
    let pwd = data.pwd;
    //判断用户是否已经登录
    
    let user = await model.user.findOne({phone: phone});
    if (!!user) {
      console.log(123);
      if (pwd === user.pwd) {
        /*session的操作待删除*/
        // ctx.session.user = user;
        // exp: Math.floor(Date.now() / 1000) + (60 * 60)
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
        ctx.body = {
          code: 200,
          msg: 'user login success',
          data: user,
          sign: token,
        }
      } else {
        ctx.body = {
          code: 401,
          msg: 'pwd is error',
        }
      }
    } else {
      ctx.body = {
        code: 400,
        msg: 'phone is error or phone no register'
      }
    }
  } catch (err) {
    console.log('err :' + err);
  }
};


/*
 * 修改账号密码
 * */

async function updatePwd(ctx, next) {
  try {
    let body = ctx.request.body;
    console.log(body);
    let {phone, pwd, SMSCode} = body;
    let SMSItem = await model.SMS.findOne({phone});
    console.log(SMSItem.verifyCode);
    let nowTime = +new Date();
    if (!!SMSItem) {
      if (SMSItem.codeStatus === 0 && SMSItem.verifyCode === SMSCode) {
        if (nowTime - SMSItem.createTime > smsConfig.dbloseEfficacy) {
          ctx.body = {
            code: 301,
            msg: 'smscode is old'
          };
          console.log('after ctx can console this parse???????????????');
        } else {
          SMSItem.codeStatus = 1;
          await SMSItem.save();
          let user = await model.user.findOneAndUpdate({phone: phone}, {$set: {pwd: pwd}});
          // let user = await model.user.findOneAndUpdate({phone}, {$set: {pwd: pwd}});
          if (!!user) {
            ctx.body = {
              code: 200,
              msg: 'update success'
            }
          } else {
            ctx.body = {
              code: 400,
              msg: 'update pwd fail or phone is no register'
            }
          }
        }
      } else {
        ctx.body = {
          code: 302,
          msg: 'smscode is lose efficacy or smscode is error'
        }
      }
    } else {
      ctx.body = {
        code: 303,
        msg: 'no this phone smscode'
      }
    }
  } catch (e) {
    console.log('updataPwd--------err' + e);
  }
}

/*用户基本信息*/
async function userInfo(ctx, next) {
  try{
    let user = await utils.getUser(ctx);
    ctx.body = {
      code: 200,
      msg: '成功获得用户信息',
      user
    }
  }catch (e){
    console.log('userInfo--------err' + e);
  }
  
  
}
/*
 * 填写用户转换身份为boss所填的的boss信息
 * */
async function submitBossInfImg(ctx, next) {
  try {
    let sign = ctx.request.header.authorization;
    sign = sign.substring(7);
    let userId = await redisUtil.AsyncGet(sign);
    let user = await model.user.findOne({_id: userId});
    let {imageFile, creditFrontSideFile, creditReverseSideFile, nickName, place, userEmail, userCreditCode} = ctx.request.files;
    console.log('imageFile==========');

    let imgPath = imageFile.path;
    let qiniu = await upToQiniu(imgPath);
    let imageUrl = qiniuConf.qiniuApi + qiniu.key;
    // console.log('imageUrl =====' + imageUrl);
    let creditFrontSideFilePath = creditFrontSideFile.path;
    qiniu = await upToQiniu(creditFrontSideFilePath);
    let creditFrontSideFileUrl = qiniuConf.qiniuApi + qiniu.key;
    // console.log('creditFrontSideFileUrl========' + creditFrontSideFileUrl);
    
    let creditReverseSideFilePath = creditReverseSideFile.path;
    qiniu = await upToQiniu(creditReverseSideFilePath);
    let creditReverseSideFileUrl = qiniuConf.qiniuApi + qiniu.key;
    // console.log('creditReverseSideFileUrl======' + creditReverseSideFileUrl);
    
    
    user.image = imageUrl;
    user.creditFrontSide = creditFrontSideFileUrl;
    user.creditReverseSide = creditReverseSideFileUrl;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '上传成功',
      imageUrl,
    };
    
  } catch (e) {
    console.log('submitBossInfo--------err' + e);
  }
}
async function submitBossInfoBasic(ctx, next) {
  try{
    let data = ctx.request.body;
    console.log('submitBossInfBasic---------------');
    console.log(data);
    let user = await utils.getUser(ctx);
    user.nickName = data.nickName;
    user.place = data.place;
    user.userCreditCode = data.userCreditCode;
    user.userEmail = data.userEmail;
    await user.save();
    ctx.body = {
      code: 200,
      msg: 'basic info ok',
    }
  }catch(e){
    console.log('submitBossInfBasic--------err' + e);
  }
}

function upToQiniu(filePath, key) {
  const accessKey = qiniuConf.accessKey // 你的七牛的accessKey
  const secretKey = qiniuConf.secretKey // 你的七牛的secretKey
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  
  // const options = {
  //   scope: qiniuConf.scope // 你的七牛存储对象
  // }
  var options = {
    scope: 'zchuhyy',
  };
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)
  
  const config = new qiniu.conf.Config()
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z0
  const localFile = filePath
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  // 文件上传
  return new Promise((resolved, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr)
      }
      if (respInfo.statusCode == 200) {
        resolved(respBody)
      } else {
        resolved(respBody)
      }
    })
  })
  
}

module.exports = {
  openTest,
  register,
  login,
  getVarifyCode,
  updatePwd,
  userInfo,
  submitBossInfImg,
  submitBossInfoBasic,
};