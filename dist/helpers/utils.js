"use strict";
exports.__esModule = true;
exports.times = function (foo, len) {
    var list = new Array(len);
    var index = 0;
    while (index < len) {
        list[index] = foo(index);
        index += 1;
    }
    return list;
};
exports.shuffle = function (array) {
    var index = array.length;
    var temp;
    var rand;
    while (index) {
        rand = Math.floor(Math.random() * index--);
        temp = array[index];
        array[index] = array[rand];
        array[rand] = temp;
    }
    return array;
};
//# sourceMappingURL=utils.js.map