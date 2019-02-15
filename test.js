// setImmediate(() => {
//   console.log('setimmediate执行');
// })
// process.nextTick(function () {
//   console.log('nextTick执行')
// });
console.log('普通执行');


var str = '深';
var buf = new Buffer(str);
console.log(buf.length);


var buf1 = new Buffer(100);
console.log(buf1[50]);

