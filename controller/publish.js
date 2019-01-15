let model = require('../model/model');
let utils = require('../config/util/utils');
async function recruitjob (ctx, next) {
    try {
        console.log('start----------recruitjob');
        console.log(ctx.request.body);
        let data = ctx.request.body;
        let {_id, companyId, type, job, require, upMoney, floorMoney} = data;
        let user = await model.user.findOne({_id});
        console.log(user);
        if(!user) {
            ctx.body = {
                code: 401,
                msg: '无当前用户'
            }
        }
        console.log(typeof user.isCompany);
        if(!user.isCompany) {
            ctx.body = {
                code: 404,
                msg: '当前身份不能发布职位，iscompany===0'
            }
            return;
        }
        if(type && job && require && upMoney, floorMoney && companyId) {
            let company = await model.company.findOne({companyId});
            if(!!company) {
                //数据库存在当前companyId的公司，所以不用新建公司item；
                console.log('存在公司')


            }else {
                //不存在，需要新建
                console.log('不存在公司')
            }








            ctx.body = {
                code: 200,
                msg: '发布成功'
            }
        }else {
            ctx.body = {
                code: 400,
                msg: '发布失败,请详细填写相关信息'
            }
        }

    }catch (e) {
        console.log('recruitjob---------' + e);
    }
}

module.exports = {
    recruitjob
}