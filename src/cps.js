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

var ArgumentError = function (message, expected, found) {
    this.__proto__ = Error;
    this.message = message;
    this.expected = expected;
    this.found = found;
    this.name = "ArgumentError";
};


function comprehension(values, fn, lst) {
    if(values.length){
        for(var i = 0; i < values[0].list.length; i++){
            if(values.length == 1){
                lst.push(fn(id)(values[0].list[i]));
            }else{
                comprehension(values.slice(1), fn(id)(values[0].list[i]),lst);
            }
        }
    }
    return new List(lst);
}

function id(x){ return x }
function trace(x) {console.log(x); return x;}
function _$$comprehension(lst, fn, arr){
    arr = arr || [];
    lst[0].map(function (x) {
        if(lst.length == 1) return arr.push(fn(x));
        return compre(lst.slice(1),fn(x),arr);
    });
    return arr;
}

function run(source) {
  var add = curry(function (a,b) {
      return a + b;
  }),
  sub = curry(function (a, b) { return a - b; }),
  mul = curry(function (a, b) { return a * b; }),
  filter = curry(function(pred,lst){ return lst.filter(pred); }),
  range = curry(function (start, end) {
    var arr = [];
    for(var i = start; i < end; i++){
     arr.push(i);
    }
    return arr;
  });
  return (function() {eval (source);})();
}
