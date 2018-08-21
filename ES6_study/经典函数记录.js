//将val前面补0，并返回num长度的字符串
var padLeft_ = function(num, val) {
    return(new Array(num).join('0') + val).slice(-num);
};