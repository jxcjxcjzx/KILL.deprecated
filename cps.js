
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
            };
            case 'if': {
                var test = form[1];
                var consequent = form[2];
                var alternate = form[3];
                return interpret(form[1], env, function(c){
                    if(c) return interpret(consequent, env, ctx)
                    else  return interpret(alternate, env, ctx)
                })
            };
            case 'callcc': {
                return interpret(form[1], env, function(f){
                    var fctx = function(){
                        return function(x){ return ctx(x) }};
                    return f(fctx)(fctx)
                })
            };
            case 'quote': {
                return ctx(form[1])
            };
            //TODO:
            case 'let': {
                var items = form[1];
                for(var i = 0; i < items.length; i++)
                    env[items[i][0]] = interpret(items[i][1],env,ctx);
                return ctx(env);
            };
            case 'set!': {
                var item = form[1];
                var val = form[2]
                return interpret(form[2], env, function(result){
                    if(!env.hasOwnProperty(item)){
                        return ctx(env.__proto__[item] = result);
                    }
                    return ctx(env[item] = result);
                });
            };
            // case 'begin': {
            //     var value;
            //     for(var i = 1; i < form.length; i++)
            //         value = interpret(form[i], env, ctx);
            //     return value;
            // }
            default: {
                return interpretCall(form, env, ctx);
            };
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
            if(x$) return ctx([x0])
            else return ctx([x0].concat(x$))
        })
    })
}

function id(x){ return x }

var env0 = {
    trace: function(ctx){
        return function(x) { console.log(x);return ctx(x) }},
    begin: function(ctx){
        return function(x$) {return ctx(arguments[arguments.length - 1]) }}
};

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
    },
    id: function(ctx){
        return function(x) { return ctx(x); };
    }
}

function run(sequences, env, ctx){
    var env = env || _.extend(env0,env1);
    var ctx = ctx || id;
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
