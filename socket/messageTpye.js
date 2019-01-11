let messageType = {
    'public': 'public',//公共消息
    'private': 'private'//私聊
};
let messageClass = {
    'message': "chat",//聊天消息
    'pushMessage': "pushMsg",//推送消息
    'redPoint': "redPoint",//红点提示
};
module.exports = {messageType, messageClass};