/**
 * Book   --  2018/7/13
 * （1）用户注册
 * （2）登录
 * （3）短信验证
 * （4）修改密码
 */

let model = require('../model/model');
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
        
    } catch (e) {
        
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
        let nowTime = new Date().getTime();
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
            //let referrerUser = await model.user.findOne({openId:referrerId},{userId:1});
            // let SMSCode = await model.SMS.findOne({phone: phone});
            // console.log('register --222' + JSON.stringify(SMSCode));
            // if(!!SMSCode){
            //     if (SMSCode.verifyState === 0 && SMSCode.verifyCode === data.SMSCode) {
            //         if ((nowTime - SMSCode.codeTime) > 2 * 60 * 60 * 1000) {
            //             ctx.body = {
            //                 code: 302,
            //                 msg: 'SMSCode  is old'
            //             };
            //         } else {
                        let lastUser = await model.user.findOne().sort({openId:-1});
                        let openId = null;
                        if(!!lastUser){
                            openId = lastUser.openId++;  //用户(唯一)标识码，推荐ID
                        }else {
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
                            // SMSCode.verifyState = 1;
                            // await SMSCode.save();
                            //ctx.session.openId = new_user.openId;
                            //ctx.session.userInfo.userId = new_user._id;
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
                // } else {
                //     ctx.body = {
                //         code: 301,
                //         msg: 'SMSCode have used or error'
                //     }
                // }
            // }else {
            //     ctx.body = {
            //         code: 303,
            //         msg: 'this phone SMSCode is no'
            //     }
            // }
        // }
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
                console.log(ctx);
                console.log('~~~~~~~~~~~~~' );
                console.log(ctx.session);
                console.log('login 111' + user._id);
                ctx.session.user=user;
                ctx.session.user.shareMsgId='';  //用于发布朋友圈（上传）时作为判断依据
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







module.exports = {
    openTest,
    register,
    login,
    getVarifyCode,
};