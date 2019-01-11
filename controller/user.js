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
        console.log('smsItem' + JSON.stringify(smsItem));
        if (!!smsItem) {
            smsItem.verifyCode = verifyCode;
            smsItem.createTime = new Date().getTime();
            smsItem.codeStatus = 0;
        } else {
            await model.SMS.create({phone, verifyCode, codeStatus: 0})
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
        console.log('register --111' + phone);
        console.log('ctx:' + JSON.stringify(ctx));
        console.log(JSON.stringify(data));
        let user = await model.user.findOne({phone: phone}, {userId: 1});
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
                            isWorker: data.isWorker,
                        });
                        if (!!new_user) {
                            SMSCode.codeStatus = 1;
                            await SMSCode.save();
                            ctx.body = {
                                code: 200,
                                msg: 'user  register success'
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
        console.log('ctx:' + JSON.stringify(data));
        let phone = data.phone;
        let pwd = data.pwd;
        //判断用户是否已经登录

        let user = await model.user.findOne({phone: phone});
        if (!!user) {
            if (pwd === user.pwd) {
                ctx.session.user = user;
                ctx.body = {
                    code: 200,
                    msg: 'user login success',
                    data: user
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
        if(!!SMSItem) {
            if(SMSItem.codeStatus === 0 && SMSItem.verifyCode === SMSCode) {
                if(nowTime - SMSItem.createTime > smsConfig.dbloseEfficacy) {
                    ctx.body = {
                        code: 301,
                        msg: 'smscode is old'
                    };
                    console.log('after ctx can console this parse???????????????');
                }else {
                    SMSItem.codeStatus = 1;
                    await SMSItem.save();
                    let user = await model.user.findOneAndUpdate({phone: phone}, {$set: {pwd: pwd}});
                    // let user = await model.user.findOneAndUpdate({phone}, {$set: {pwd: pwd}});
                    if(!!user) {
                        ctx.body = {
                            code: 200,
                            msg: 'update success'
                        }
                    }else {
                        ctx.body = {
                            code: 400,
                            msg: 'update pwd fail or phone is no register'
                        }
                    }
                }
            }else {
                ctx.body = {
                    code: 302,
                    msg: 'smscode is lose efficacy or smscode is error'
                }
            }
        }else {
            ctx.body = {
                code: 301,
                msg: 'no this phone smscode'
            }
        }
    }catch(e) {
        console.log('updataPwd--------err' + e);
    }
}

module.exports = {
    openTest,
    register,
    login,
    getVarifyCode,
    updatePwd,
};