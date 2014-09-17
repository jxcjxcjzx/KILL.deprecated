

kill.env = (function (kill) {

    function curry(fn,obj) {
        function curry$$(fn, len, args){
            return function () {
                if(len <= arguments.length) return fn.apply(obj,args.concat([].slice.apply(arguments)));
                return curry$$(fn, len-arguments.length, args.concat([].slice.apply(arguments)));
            }
        }
        return curry$$(fn, fn.length,[]);
    }
    function _$$comprehension(lst, fn, arr){
        arr = arr || [];
        lst[0].map(function (x) {
            if(lst.length == 1) return arr.push(fn(x));
            return _$$comprehension(lst.slice(1),fn(x),arr);
        });
        return arr;
    }
    var evil = function () {

        var trace = function (x) {console.log(x); return x;};

        var id = function (x) {return x;};
        var succ = function (x) {return x+1;};
        var pred = function (x) {return x-1;};

        var add = curry(function (a,b) {return a + b;});
        var sub = curry(function (a,b) {return a - b;});
        var mul = curry(function (a,b) {return a * b;});
        var div = curry(function (a,b) {return a / b;});
        var mod = curry(function (a,b) {return a % b;});

        var pow = curry(function (a, b) {return Math.pow(a,b);});

        var equal = curry(function (a, b) { return a === b;});
        var ne = curry(function (a, b) { return a !== b;});
        var gt = curry(function (a, b) { return a > b;});
        var ge = curry(function (a, b) { return a >= b;});
        var lt = curry(function (a, b) { return a < b;});
        var le = curry(function (a, b) { return a <= b;});

        var not = function(a){return !a;};
        var and = curry(function(a,b){ return a && b;});
        var or = curry(function(a,b){ return a || b;});

        var map = curry(function (fn,lst) {return lst.map(fn);});
        var filter = curry(function(pred,lst){return lst.filter(pred);});

        var first = function(x){return x[0];};
        var rest = function(x){return x.slice(1);};
        var length = function(x){return x.length;};
        var concat = curry(function(fst,rst){return fst.concat(rst);});

        var reduce =  curry(function (fn, val, lst) {
            for(var i = 0; i< lst.length; i++){
                val = fn(val)(lst[i]);
            }
            return val;
        });

        var range = curry(function (start, end) {
            var arr = [];
            for(var i = start; i < end; i++){
                arr.push(i);
            }
            return arr;
        });

        var zero = function (x) {return x == 0;};
        var one = function (x) {return x == 1;};
        var odd = function (x) {return (x%2 != 0);};
        var even = function (x) {return (x%2 == 0);};

        var T = function(lst) {return new Tuple(lst);};

        kill.fn = {
            trace: trace, id: id,
            succ: succ, pred: pred,
            add:add, sub:sub, mul:mul, div: div, mod: mod, pow:pow,

            equal: equal, ne: ne, ge: ge, gt: gt, le: le, lt: lt,
            not: not, and: and, or: or,
            first: first, rest:rest, length:length, concat: concat,
            filter: filter, map: map, reduce: reduce,
            range: range,
            zero:zero, one:one, odd:odd, even:even,

            T: T
        };

        return function(src){return eval(src);};
    }();

    kill.env = {
        evil:evil,
        curry:curry
    };
    return kill.env;
}(kill));

