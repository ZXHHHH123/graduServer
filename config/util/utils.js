

class utils{

    static getCode(){
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
    }
}

module.exports = utils;
// let verifyCode = utils.getCode();
// console.log(JSON.stringify({
//     code:verifyCode
// }));

