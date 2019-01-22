let model = require('../model/model');
let utils = require('../config/util/utils');
let redisUtil = require('../config/util/redisUtil');
async function recruitjob (ctx, next) {
    try {
        console.log('start----------recruitjob');
        let data = ctx.request.body;
        let sign = ctx.request.header.authorization;
        sign = sign.substring(7);
        console.log(sign);
        let {companyCode, type, job, require, upMoney, floorMoney} = data;
        let userId = await redisUtil.AsyncGet(sign);
        console.log('从redis中通过sign获得的userid值为' + userId);
        let user = await model.user.findOne({_id: userId});
        if(!user) {
            ctx.body = {
                code: 401,
                msg: '无当前用户'
            }
            return;
        }
        console.log(typeof user.isCompany);
        if(!user.isCompany) {
            ctx.body = {
                code: 404,
                msg: '当前身份不能发布职位，iscompany===0'
            }
            return;
        }
        if(type && job && require && upMoney, floorMoney && companyCode) {
            let company = await model.company.findOne({companyCode});
            //公司是肯定存在的，因为在注册的时候就创建了对应的公司
            if(!!company) {
                //数据库存在当前companyId的公司，所以不用新建公司item；
                console.log('存在公司');
                company = await model.company.findOneAndUpdate({companyCode}, {
                    $push: {
                        publishJobArray: {
                            type,
                            job,
                            require,
                            upMoney,
                            floorMoney,
                            publisher: user.nickName,
                            publisherId: user._id,
                            publishTime: +new Date()
                        }
                    }
                }, {new: true});
                ctx.body = {
                    code: 200,
                    msg: '发布成功',
                    data: company
                }
            }else {
                //不存在，需要新建
                console.log('不存在公司');
                ctx.body = {
                    code: 400,
                    msg: 'logic error'
                //    创建用户的时候就注册了公司，这里是不会走到的，如果走到这里，逻辑出错
                }
            }
        }else {
            ctx.body = {
                code: 400,
                msg: '发布失败,请详细填写相关信息'
            }
        }

    }catch (e) {
        console.log('recruitjob---------' + e);
        ctx.body = {
            code: 400
        }
    }
}

module.exports = {
    recruitjob
}