/*
* 成功的操作
*
* */

var QcloudSms = require("qcloudsms_js");

// 短信应用SDK AppID
var appid = 1400178619;  // SDK AppID是1400开头

// 短信应用SDK AppKey
var appkey = "a91640ed5de2e2b064e79d9835fe6c69";

// 需要发送短信的手机号码
var phoneNumbers = ["13755038432", "15580958471", "12345678903"];

// 短信模板ID，需要在短信应用中申请
var templateId = 262418;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
//templateId 7839 对应的内容是"您的验证码是: {1}"
// 签名
var smsSign = "人才匹配应用";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

// 实例化QcloudSms
var qcloudsms = QcloudSms(appid, appkey);

// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
function callback(err, res, resData) {
    if (err) {
        console.log("err: ", err);
    } else {
        console.log("request data: ", res.req);
        console.log("response data: ", resData);
    }
}



var ssender = qcloudsms.SmsSingleSender();
var params = ["5678" , '2'];
ssender.sendWithParam(86, phoneNumbers[1], templateId, params, smsSign, "", "", callback);  // 签名参数未提供或者为空时，会使用默认签名发送短信









//
// var strMobile = "13788888888"; //tel 的 mobile 字段的内容
// var strAppKey = "5f03a35d00ee52a21327ab048186a2c4"; //sdkappid 对应的 appkey，需要业务方高度保密
// var strRand = "7226249334"; //url 中的 random 字段的值
// var strTime = "1457336869"; //UNIX 时间戳
// // var sig = sha256(appkey=$appkey&random=$random&time=$time&mobile=$mobile);