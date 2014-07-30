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

function interpret(form, env, ctx){
    if(form instanceof Array && form.length){
        switch(form[0]){
            case 'lambda': {
                var params = form[1];
                var body = form[2];
                return ctx(function(ctx){ return function() {
                    var e = Object.create(env);
                    for(var j = 0; j < params.length; j++)
                        e[params[j]] = arguments[j];
                    return interpret(body, e, ctx)
                }})
            }
            case 'if': {
                var consequent = form[2];
                var alternate = form[3];
                return interpret(form[1], env, function(c){
                    if(c) return interpret(consequent, env, ctx);
                    else  return interpret(alternate, env, ctx);
                })
            }
            case 'callcc': {
                return interpret(form[1], env, function(f){
                    var fctx = function(){
                        return function(x){ return ctx(x) }};
                    return f(fctx)(fctx)
                })
            }
            case 'quote': {
                return ctx(form[1])
            }
            //TODO:
            case 'let': {
                var items = form[1];
                for(var i = 0; i < items.length; i++)
                    env[items[i][0]] = interpret(items[i][1],env,ctx);
                return ctx(env);
            }
            case 'set!': {
                var item = form[1];
                return interpret(form[2], env, function(result){
                    if(!env.hasOwnProperty(item)){
                        return ctx(env.__proto__[item] = result);
                    }
                    return ctx(env[item] = result);
                });
            }
            case 'list': {
                return interpretL(form[1], env, ctx, List);
            }
            case 'tuple': {
                return interpretL(form[1], env, ctx, Tuple);
            }
            case 'uc_lambda': {
                var uc_params = form[1];
                var uc_body = form[2];
                return ctx(function(ctx){ return function(tup) {
                    if(!(tup instanceof Tuple))
                        throw new ArgumentError("Argument Type Error","Tuple", tup);
                    if(tup.size() != uc_params.length)
                        throw new ArgumentError("Argument mismatch:", uc_params.length, tup.size());
                    var e = Object.create(env);
                    for(var j = 0; j < tup.size(); j++){
                        e[uc_params[j]] = tup.get(j);
                    }

                    return interpret(uc_body, e, ctx)
                }})
            }
            case 'list_comp': {
                var comp_fn = form[2];
                var values = interpretL(form[1].map(function (x) { return x[1]; }), env, id, List);
                return ctx(comprehension(values.list, interpret(comp_fn, env, id),[]));
            }
            // case 'begin': {
            //     var value;
            //     for(var i = 1; i < form.length; i++)
            //         value = interpret(form[i], env, ctx);
            //     return value;
            // }
            default: {
                return interpretCall(form, env, ctx);
            }
        }
    } else if(typeof form === 'string') {
        return ctx(env[form]);
    } else {
        return ctx(form)
    }
}

function interpretCall(form, env, ctx){
    return interpret(form[0], env, function(callee){
        return interpret$(form.slice(1), env, function(args){
            return callee(ctx).apply(null, args)
        })
    })
}

function interpret$(form, env, ctx){
    if(!form.length) return ctx(null);
    else return interpret(form[0], env, function(x0){
        return interpret$(form.slice(1), env, function(x$){
            if(x$) return ctx([x0]);
            else return ctx([x0].concat(x$));
        })
    })
}

function interpretL(items, env, ctx, ctor){
    var _list = [];
    for(var i = 0; i < items.length; i++){
        _list.push(interpret(items[i],env,id));
    }
    return ctx(new ctor(_list));
}

function id(x){ return x }


/** base env  */
var env0 = {
    trace: function(ctx){
        return function(x) { console.log(x);
            return ctx(x); };},
    begin: function(ctx){
        return function(x$) {return ctx(arguments[arguments.length - 1]) }},
    /** ID */
    id: function(ctx){
        return function(x) { return ctx(x); };
    }
};

/** Standard functions */

var env1 = {
    /** Arithmetic functions */
    succ: function(ctx){
        return function(x) { return ctx(x+1); };
    },
    is_zero: function(ctx){
        return function(x) { return ctx(x == 0); };
    },
    pred: function(ctx){
        return function(x) { return ctx(x-1); };
    },
    add: function(ctx){
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x+y); };});};
    },
    mul: function(ctx){
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x*y); };});};
    },
    pow: function(ctx){
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(Math.pow(x,y)); };});};
    },
    sub: function(ctx){
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x-y); };});};
    },

    /** Relation functions */
    equal: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x === y);};});};
    },
    ne: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x !== y);};});};
    },
    gt: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x > y);};});};
    },
    ge: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x >= y);};});};
    },
    lt: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x < y);};});};
    },
    le: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x <= y);};});};
    },
    /** Logical functions */
    not: function(ctx) {
        return function(x) { return ctx(!x); };
    },
    and: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x && y);};});};
    },
    or: function(ctx) {
        return function(x) { return ctx(function(ctx) {return function(y){ return ctx(x || y);};});};
    }
};

/** List Utils */
var env2 = {
    length: function(ctx){
        return function (lst) {
            if(lst instanceof List)
                return ctx(lst.list.length);
            return ctx(null);
        };
    },
    first: function(ctx){
        return function (lst) {
            if(lst instanceof List)
                return ctx(lst.list[0]);
            return ctx(null);
        }
    },
    rest: function(ctx){
        return function (lst) {
            if(lst instanceof List){
                if (!lst.list.length) return ctx(null);
                return ctx(new List(lst.list.slice(1)));
            }
            return ctx(null);
        }
    },
    concat: function(ctx){
        return function (lst) {
            return ctx(function (ctx) {
                return function (lst2) {
                    if(lst instanceof List && lst2 instanceof lst){
                        var _list = lst.list.concat(lst2.list);
                        return ctx(new List(_list));
                    }
                    return ctx(null)
                }
            });
        }
    },
    map: function(ctx){
        return function (fun) {
            return ctx(function (ctx) {
                return function(lst){
                    if(lst instanceof List){
                        var _list = [];
                        for(var i = 0; i < lst.list.length; i++){
                            _list.push(fun(id).apply(null,[lst.list[i]]));
                        }
                        return ctx(new List(_list));
                    }
                    return null;
                }
            })
        }
    },
    reduce: function(ctx){
        return function (fun) {
            return ctx(function (ctx) {
                return function (acc) {
                    return ctx(function (ctx) {
                        return function (list) {
                            if(list instanceof List){
                                for(var i = 0; i < list.list.length; i ++){
                                    acc = fun(id).apply(null,[acc])(id).apply(null,[list.list[i]])
                                }
                                return ctx(acc);
                            }
                            return ctx(null);
                        }
                    })
                }
            })
        }
    },
    filter: function (ctx) {
        return function (pred) {
            return ctx(function (ctx) {
                return function (lst) {
                    if(lst instanceof List){
                        var filtered = [];
                        for (var i = 0; i < lst.list.length; i ++){
                            var item = lst.list[i];
                            if (pred(id).apply(null,[item])){
                                filtered.push(item);
                            }
                        }
                        return ctx(new List(filtered));
                    }
                    return ctx(null);
                }
            })
        }
    },
    range: function (ctx) {
        return function (begin) {
            return ctx(function (ctx) {
                return function (end) {
                    var lst = [];
                    for(var i = begin; i < end; i++){
                        lst.push(i);
                    }
                    return ctx(new List(lst));
                }
            })
        }
    }
};

/** Common predicates */
var env3 = {
    "odd?": function (ctx) {
        return function (num) {
            return ctx(num%2 == 1);
        };
    },
    "even?": function (ctx) {
        return function (num) {
            return ctx(num%2 == 0);
        }
    },
    "any?": function (ctx) {
        return function (pred) {
            return ctx(function (ctx) {
                return function (lst) {
                    if(lst instanceof List){
                        for(var i = 0; i < lst.list.length; i++){
                            if(pred(id).apply(null,[lst.list[i]]))
                                return ctx(true);
                        }
                        return ctx(false);
                    }
                    return ctx(null);
                }
            })
        }
    },
    "all?": function (ctx) {
        return function (pred) {
            return ctx(function (ctx) {
                return function (lst) {
                    if(lst instanceof List){
                        for(var i = 0; i < lst.list.length; i++){
                            if(!pred(id).apply(null,[lst.list[i]]))
                                return ctx(false);
                        }
                        return ctx(true);
                    }
                    return ctx(null);
                }
            })
        }
    }
};

/** Tuple utils */

var env4 = {
    "T": function (ctx) {
        return function (lst) {
            if(lst instanceof List){
                return ctx(new Tuple(lst.list));
            }
            return ctx(new Tuple(lst));
        }
    },
    "fst": function (ctx) {
        return function (tup) {
            if(tup instanceof Tuple && tup.size()){
                return ctx(tup.get(0));
            }
            return ctx(null);
        }
    },
    "snd": function (ctx) {
        return function (tup) {
            if(tup instanceof Tuple && tup.size() > 1){
                return ctx(tup.get(1));
            }
            return ctx(null);
        }
    },
    "index": function (ctx) {
        return function (index) {
            return ctx(function (ctx) {
                return function (tup) {
                    if(tup instanceof Tuple && index < tup.size()){
                        return ctx(tup.get(index));
                    }
                }
            });
        };
    },
    "get": function (ctx) {
        return function (tup) {
            return ctx(function (ctx) {
                return function (index) {
                    if(tup instanceof Tuple && index < tup.size()){
                        return ctx(tup.get(index));
                    }
                }
            });
        };
    }
};

function run(sequences, env, ctx){
    env = env || _.extend(env0,env1,env2,env3,env4);
    ctx = ctx || id;
    var e = Object.create(env);
    for(var i = 0; i < sequences.length; i++){
        interpret(sequences[i], e, ctx);
    }
    return e;
}

// interpret(['trace', ['callcc', ['lambda', ['return'], ['begin', 
//     ['trace', ['quote', 1]],  // traces
//     ['return', ['quote', 2]], // returns, sent to 'trace'
//     ['trace', ['quote', 3]]   // not executed
// ]]]], env0, id);
