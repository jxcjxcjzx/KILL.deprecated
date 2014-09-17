var List = function (lst) {
    this.list = lst;
};

var Tuple = function () {
    var elements;
    if(arguments.length == 1 && arguments[0] instanceof Array){
        elements = arguments[0];
    }else{
        elements = arguments;
    }
    var size = elements.length;
    this.size = function () {
        return size;
    };
    this.get = function (i) {
        if (i < size && i >= 0){
            return elements[i];
        }
    };
    return this;
};

function id(x) {
    return x;
}

function trace(x){
    console.log(x);
    return x;
}