module.exports = {
    user: require('./userModel'),           //用户表
    onLineLog: require('./onLineLog'),
    SMS: require('./SMSModel'),//qq_sms发送验证码存储表
    msgLog: require('./msgLogModel'),//信息发送成功存储表
    offLineMsg: require('./offLineMsgModel'),//信息失败存储表
    company: require('./companyModel') //公司内容存储表
};