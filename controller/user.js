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
                    companyName: data.unit,
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
 * 修改账号手机号码
 * */
async function updatePhone(ctx, next) {
  try {
    let body = ctx.request.body;
    let nowTime = +new Date();
    let {phone, smsCode} = body;
    let user = await utils.getUser(ctx);
    //找到手机号码所对应的验证码
    let SMSCode = await model.SMS.findOne({phone: phone});
    console.log('register --222' + JSON.stringify(SMSCode));
    if (!!SMSCode) {
      if (SMSCode.codeStatus === 0 && smsCode === SMSCode.verifyCode) {
        if ((nowTime - SMSCode.createTime) > smsConfig.dbloseEfficacy) {
          ctx.body = {
            code: 302,
            msg: 'SMSCode is old'
          }
        } else {
          SMSCode.codeStatus = 1;
          await SMSCode.save();
          user.phone = phone;
          await user.save();
          ctx.body = {
            code: 200,
            msg: '更改手机号码成功'
          }
        }
      }
    } else {
      ctx.body = {
        code: 303,
        msg: 'this phone SMSCode is no'
      }
    }
  } catch (e) {
    console.log('updatePhone----------err' + e)
  }
}

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

async function personSettingFixPhone(ctx, next) {
  try {
    let body = ctx.request.body;
    console.log(body);
    let {pwd} = body;
    let user = await utils.getUser(ctx);
    user.pwd = pwd;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '更改密码成功'
    }
  } catch (err) {
    console.log('personSettingFixPhone----------报错' + err)
  }
}

/*用户基本信息*/
async function userInfo(ctx, next) {
  try {
    let user = await utils.getUser(ctx);
    let allPublishJobType = {}; //招聘者所发布的职位中所有的职位类型
    if (user.isCompany == 1) {
      let companyCode = user.companyCode;
      
      
      let companyPublishJob = (await model.company.findOne({companyCode})).publishJobIdArray;
      console.log(user._id);
      let presentHrPublishJob = companyPublishJob.filter((item, index) => {
        return item.publisherId == user._id && item.isDelete !== 1;
      });
      if (presentHrPublishJob.length === 0) {
        ctx.body = {
          code: 200,
          msg: '成功获得用户信息',
          data: {
            user,
            allPublishJobType
          }
        }
      } else {
        ctx.body = await new Promise((resolve, reject) => {
          
          let typeNum = 0;
          presentHrPublishJob.forEach(async (item, index, presentHrPublishJob) => {
            let jobDetail = await model.jobType.findOne({_id: item.jobId});
            if (!allPublishJobType[jobDetail.jobLabel]) {
              allPublishJobType[jobDetail.jobLabel] = {
                key: jobDetail.jobValue, label: jobDetail.jobLabel, value: typeNum
              };
              typeNum++;
            }
            
            if (index === presentHrPublishJob.length - 1) {
              let data = {
                user,
                allPublishJobType
              };
              resolve({
                code: 200,
                msg: '搜索成功',
                data
              })
            }
          })
        });
      }
    } else {
      let data = {
        user,
        allPublishJobType
      };
      ctx.body = {
        code: 200,
        msg: '成功获得用户信息',
        data
      }
    }
    
  } catch (e) {
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
    let examineItem = await model.examine.findOne({userId: user._id});
    if (examineItem) {
      examineItem.image = imageUrl;
      examineItem.creditFrontSide = creditFrontSideFileUrl;
      examineItem.creditReverseSide = creditReverseSideFileUrl;
      await examineItem.save();
      ctx.body = {
        code: 200,
        msg: '保存成功'
      }
    } else {
      await model.examine.create({
        image: imageUrl,
        creditFrontSide,
        creditReverseSide,
      });
      ctx.body = {
        code: 200,
        msg: '保存成功'
      }
    }
    
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


// async function submitBossInfImg(ctx, next) {
//   try {
//     let sign = ctx.request.header.authorization;
//     sign = sign.substring(7);
//     let userId = await redisUtil.AsyncGet(sign);
//     let user = await model.user.findOne({_id: userId});
//     let {imageFile, creditFrontSideFile, creditReverseSideFile, nickName, place, userEmail, userCreditCode} = ctx.request.files;
//     console.log('imageFile==========');
//
//     let imgPath = imageFile.path;
//     let qiniu = await upToQiniu(imgPath);
//     let imageUrl = qiniuConf.qiniuApi + qiniu.key;
//     // console.log('imageUrl =====' + imageUrl);
//     let creditFrontSideFilePath = creditFrontSideFile.path;
//     qiniu = await upToQiniu(creditFrontSideFilePath);
//     let creditFrontSideFileUrl = qiniuConf.qiniuApi + qiniu.key;
//     // console.log('creditFrontSideFileUrl========' + creditFrontSideFileUrl);
//
//     let creditReverseSideFilePath = creditReverseSideFile.path;
//     qiniu = await upToQiniu(creditReverseSideFilePath);
//     let creditReverseSideFileUrl = qiniuConf.qiniuApi + qiniu.key;
//     // console.log('creditReverseSideFileUrl======' + creditReverseSideFileUrl);
//
//
//     user.image = imageUrl;
//     user.creditFrontSide = creditFrontSideFileUrl;
//     user.creditReverseSide = creditReverseSideFileUrl;
//     await user.save();
//     ctx.body = {
//       code: 200,
//       msg: '上传成功',
//       imageUrl,
//     };
//
//   } catch (e) {
//     console.log('submitBossInfo--------err' + e);
//   }
// }

async function submitBossInfoBasic(ctx, next) {
  try {
    let data = ctx.request.body;
    console.log('submitBossInfBasic---------------');
    let user = await utils.getUser(ctx);
    console.log(user._id);
    
    console.log(data);
    let examineItem = await model.examine.findOne({userId: user._id});
    if (examineItem) {
      examineItem.unit = data.unit;
      examineItem.nickName = data.nickName;
      examineItem.place = data.place;
      examineItem.userCreditCode = data.userCreditCode;
      examineItem.userEmail = data.userEmail;
      examineItem.companyCode = data.companyCode;
      await examineItem.save();
      ctx.body = {
        code: 200,
        msg: '保存成功'
      }
    } else {
      await model.examine.create({
        userId: user._id,
        unit: data.unit,
        nickName: data.nickName,
        place: data.place,
        userCreditCode: data.userCreditCode,
        userEmail: data.userEmail,
        companyCode: data.companyCode,
      });
      ctx.body = {
        code: 200,
        msg: '保存成功'
      }
    }
    
    
    await user.save();
    ctx.body = {
      code: 200,
      msg: 'basic info ok',
    }
  } catch (e) {
    console.log('submitBossInfBasic--------err' + e);
  }
}

// async function submitBossInfoBasic(ctx, next) {
//   try{
//     let data = ctx.request.body;
//     console.log('submitBossInfBasic---------------');
//     let user = await utils.getUser(ctx);
//     user.unit = data.unit;
//     user.nickName = data.nickName;
//     user.place = data.place;
//     user.userCreditCode = data.userCreditCode;
//     user.userEmail = data.userEmail;
//     user.companyCode = data.companyCode;
//     let companyCode = data.companyCode;
//     /*判断该公司是否已经创建过，如果没有则添加该公司*/
//     let company = await model.company.findOne({companyCode});
//     if(!company) {
//       console.log('不存在公司');
//       let new_company = await model.company.create({
//         companyName: data.unit,
//         companyCode: data.companyCode,
//         hrArray: [{
//           hrId: user._id,
//           name: user.nickName,
//           gender: user.gender,
//         }]
//       });
//     }
//
//     await user.save();
//     ctx.body = {
//       code: 200,
//       msg: 'basic info ok',
//     }
//   }catch(e){
//     console.log('submitBossInfBasic--------err' + e);
//   }
// }

/*更新头像*/
async function submitTitImg(ctx, next) {
  try {
    console.log('submittitimg');
    console.log(ctx.request.files);
    let {titImgFile} = ctx.request.files;
    let user = await utils.getUser(ctx);
    let imgPath = titImgFile.path;
    let qiniu = await upToQiniu(imgPath);
    let imageUrl = qiniuConf.qiniuApi + qiniu.key;
    user.image = imageUrl;
    await user.save();
    ctx.body = {
      code: 200,
      msg: '更新头像成功',
      data: imageUrl
    }
    
    
  } catch (err) {
    console.log('submitTitImg==============' + err)
  }
};

async function submitUserBasicInfo(ctx, body) {
  try {
    let data = ctx.request.body;
    let user = await utils.getUser(ctx);
    let {nickName, gender, studyBackground, joinWorkTime, birthTime, personAccount} = data;
    console.log(nickName, gender, joinWorkTime, birthTime, personAccount);
    if (nickName) {
      user.nickName = nickName;
    }
    if (gender) {
      user.gender = gender;
    }
    if (studyBackground) {
      user.studyBackground = studyBackground;
    }
    if (joinWorkTime) {
      user.joinWorkTime = joinWorkTime;
    }
    if (birthTime) {
      user.birthday = birthTime;
    }
    if (personAccount) {
      user.personAccount = personAccount;
    }
    await user.save();
    ctx.body = {
      code: 200,
      msg: '更新基本信息成功'
    }
  } catch (err) {
    console.log('submitUserBasicInfo============' + err);
  }
}

async function changeJobHunter(ctx, body) {
  try {
    let user = await utils.getUser(ctx);
    let data = ctx.request.body;
    let {isChangeBoss} = data;
    if(isChangeBoss) {
      user.isCompany = 1;
    }else {
      user.isCompany = 0;
    }
    await user.save();
    ctx.body = {
      code: 200,
      msg: '转换身份成功'
    }
  }catch (err) {
    console.log('changeJobHunter==========' + err);
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
  personSettingFixPhone,
  updatePhone,
  userInfo,
  submitBossInfImg,
  submitBossInfoBasic,
  submitTitImg,
  submitUserBasicInfo,
changeJobHunter
};