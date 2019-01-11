let smsConfig = require('../smsConfig');

class utils {

    static getCode() {
        let array = [];
        let no = [];
        let range = function () {
            array = [0, 1, 2, 3, 4, 5];//6位随机数
            return array;
        };
        let randoms = range().map(function () {
            no = Math.floor(Math.random() * 10);
            return no;
        });
        // let randoms = [0, 0, 0, 0, 0, 0, 0, 0]==>[1, 0, 0, 0, 0, 0, 0, 0]
        if (randoms[0] === 0) {
            randoms[0] = randoms[5];
        }
        if (randoms[0] === 0) {
            randoms[0] = randoms[4];
        }
        if (randoms[0] === 0) {
            randoms[0] = randoms[3];
        }
        if (randoms[0] === 0) {
            randoms[0] = randoms[2];
        }
        if (randoms[0] === 0) {
            randoms[0] = randoms[1];
        }
        if (randoms[0] === 0) {
            randoms[0] = 1;
        }
        return randoms.join('');
    };

    static sendSMS(phone, ssender, params, smsItem) {
        return new Promise((resolve, reject) => {
            ssender.sendWithParam(82, phone, smsConfig.templateId, params, smsConfig.smsSign, "", "", (err, res, resData) => {
                if (err) {
                    console.log("err: ", err);
                    reject(err)
                } else {
                    console.log("request data: ", res.req);
                    console.log("response data: ", resData);
                    let {errmsg} = resData;
                    console.log(errmsg);
                    if (errmsg === 'OK') {
                        smsItem.save();
                        resolve({
                            code: 200,
                            msg: 'SMS code send success',
                        })
                    } else {
                        resolve({
                            code: 400,
                            msg: 'SMS code send fail 82----> 86',
                        })
                    }
                }
            });  // 签名参数未提供或者为空时，会使用默认签名发送短信
        })

    }
}

module.exports = utils;
// let verifyCode = utils.getCode();
// console.log(JSON.stringify({
//     code:verifyCode
// }));

