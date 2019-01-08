var utils = module.exports;
// control variable of func "myPrint"
var isPrintFlag = false;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};


utils.invokeCallbackNoFunction = function (cb) {


    cb.apply(null, Array.prototype.slice.call(arguments, 1));

};
/**
 * clone an object
 */
utils.clone = function (origin) {
    if (!origin) {
        return;
    }

    var obj = {};
    for (var f in origin) {
        obj[f] = origin[f];
    }
    return obj;
};

utils.size = function (obj) {
    if (!obj) {
        return 0;
    }

    var size = 0;
    for (var f in obj) {
        if (obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

utils.deepCopy = deepCopy;


function deepCopy(p, c = null) {
    c = c || (!!p.length || p.length == 0 ) ? [] : {};
    for (let i in p) {
        if (typeof p[i] === 'object' && p[i] != null) {
            //c[i] = (!!p[i].length ||p[i].length==0 )?[]:{};
            c[i] = deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
};


// print the file name and the line number ~ begin
function getStack() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

utils.msg = function (code, msg, data) {

    return {
        code: code || null,
        msg: msg || null,
        data: data || null
    }
};

function getFileName(stack) {
    return stack[1].getFileName();
}

function getLineNumber(stack) {
    return stack[1].getLineNumber();
}

utils.myPrint = function () {
    if (isPrintFlag) {
        var len = arguments.length;
        if (len <= 0) {
            return;
        }
        var stack = getStack();
        var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
        for (var i = 0; i < len; ++i) {
            aimStr += arguments[i] + ' ';
        }
    }
};
// print the file name and the line number ~ end

utils.findDataByParams = function (params, data) {
    let res = [];

    for (let i in data) {
        let item = data[i];
        let goIn = true;
        for (let j in params) {
            // if(item[j]==params[j]){
            //     res.push(item);
            // }
            if (item[j] != params[j]) {
                goIn = false;
                break;
            }
        }
        if (goIn) {
            res.push(item);
        }
    }
    return res;
};
utils.findArrayDataByParams = function (params, data) {
    let res = [];
    for (let j in params) {
        // console.log(j);
        if(params[j]){
            res.push(data[params[j]])
        }
    }
    return res;
};

utils.findArrayDataByParam = function (param, data) {
    let res = [];
    for (let j in data) {
        for (let i in param) {
            // console.log(i);
            // console.log( param[i]);
            // console.log(data[j][i]);
            if(data[j][i]==param[i]){
                res.push(data[j])
            }
        }

    }
    return res;
};

utils.findOneDataByParams = function (params, data) {
    let res = null;
    for (let i in data) {
        let item = data[i];

        let goIn = true;
        for (let j in params) {

            if (item[j] != params[j]) {

                goIn = false;
                break;
            }
        }
        if (goIn) {
            res = item;
            break;
        }
    }
    if (res) {
        return deepCopy(res);
    } else {
        return null
    }

};

utils.count = function (data) {
    let res = 0;
    for (let i in data) {
        res++;
    }
    return res;
};


utils.findArrayByParams = function (arrays, data, sort) {
    let array = [];
    for (let i in arrays) {
        let item = data[arrays[i]];
        array.push(item);
    }
    if (sort == 1) {
        array.sort(function sortNumber(a, b) {
            return a - b
        });
    } else {
        array.sort(function sortNumber(a, b) {
            return b - a
        });
    }
    return array;
};


utils.createFilter = function (msg, session, name) {

    if (session.get(msg.userId + name + '') == 1) {
        return false;
    } else {
        session.set(msg.userId + name + '', 1);
        session.push(msg.userId + name + '');
        return true;
    }
};

utils.removeFilter = function (msg, session, name) {
    session.set(msg.userId + name + '', 0);
    session.push(msg.userId + name + '');
};
