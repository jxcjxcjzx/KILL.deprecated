/**
 * Created by Kim on 2014/8/1.
 */

kill.compiler = (function (kill) {

    var Lambda = function(argc,argv, body){
        this.argc = argc;
        this.argv = argv;
        this.body = body;
        this.merge = function (lmbd) {
            return new Lambda(argc+lmbd.argc, argv.concat(lmbd.argv),lmbd.body);
        }
    };

    var Binding = function (name, val) {
        this.name = name;
        this.val = val;
    };

    var Bindings = function(bindings){
        this.bindings = bindings;
        this.append = function (binding) {
            this.bindings.push(binding);
            return this;
        }
    };

    var FCall = function (name, args) {
        this.name = name;
        this.args = args;
    };

    var If = function(cond, consequence, alternative){
        this.cond = cond;
        this.consequence = consequence;
        this.alternative = alternative;
    };
    
    var Statements = function () {
        var stmts = [];
        this.append = function(stmt){
            stmts.push(stmt);
            return this;
        };
        this.count = function () {
            return stmts.length;
        };
        this.get = function (index) {
            return stmts[index];
        }
    };

    var transform = function (form, ctx) {
        ctx = ctx || trace;
        if (form instanceof Array && form.length) {
            switch (form[0]) {
                case "let":
                    var bindings=form[1];
                    var bindres=new Bindings([]);
                    for(var i=0; i < bindings.length; i++){
                        bindres.append(new Binding(bindings[i][0],
                            transform(bindings[i][1],id)));
                    }
                    return ctx(bindres);
                case "lambda":
                    var param = form[1];
                    var body = form[2];
                    var lambda = new Lambda(param.length, param);
                    return transform(body, function (bdy) {
                        lambda.body = bdy;
                        return ctx(lambda);
                    });
                case "if":
                    var cond = form[1];
                    var consequence = form[2];
                    var alternative = form[3];
                    return ctx(
                        new If(
                            transform(cond,id),
                                transform(consequence,id),
                                transform(alternative,id))
                    );
                /// TODO:call_cc
//                case "callcc":
//                    break;
                case "quote":
                    return ctx(form[1]);
                case "set!":
                    var atom = form[1];
                    var expr = form[2];
                    return ctx([atom, "=", dump(transform(expr),id)].join(" "));
                case "list":
                    var lst = [];
                    for(i = 0; i < form[1].length; i++){
                        lst.push(transform(form[1][i],id));
                    }
                    return ctx(new List(lst));
                case "tuple":
                    var tup = form[1][1];
                    var tuple = [];
                    for(i = 0; i < tup.length; i++){
                        tuple.push(transform(tup[i],id));
                    }
                    return ctx(new Tuple(tuple));
                case "uc_lambda":
                    break;
                case "list_comp":
                    var list = form[1];
                    var comp = form[2];
                    return ctx("_$$comprehension("+dump(transform(new List(list.map(function (arg) {
                        return transform(arg[1],id);
                    })),id),id)+", "+dump(transform(comp,id),id)+")");
                default:
                    return transform(form[0], function (fn) {
                        if(form.slice(1).length){
                            if(fn instanceof FCall){
                                return ctx(new FCall(fn,transform(form.slice(1),id)));
                            }else{
                                return ctx(new FCall(fn,transform(form.slice(1),id)));
                            }
                        }
                        return ctx(fn);
                    })
            }
        }
        if(typeof(form) == "String"){
            /**
             * @TODO:
             * Syntax Translation:
             *      ? => $q_
             *      ! => $e_
             *      ...
             * */
            form.replace(/\?/g,"$q_");
            form.replace(/!/g,"$e_");
            return ctx(form);
        }
        return ctx(form);
    };

    var dump =function (form, ctx) {
        ctx = ctx || trace;
        if(form instanceof Statements){
            var stmts = [];
            for(var i = 0; i < form.count(); i++){
                if((form.get(i) instanceof Array) && form.get(i).length)
                    continue;
                stmts.push(dump(form.get(i), id));
            }
            return ctx(stmts.join(";\n"));
        }
        if(form instanceof Lambda)
            return ctx("(function("+ dump(form.argv,id) +"){ return " + dump(form.body,id) + ";})");
        else if(form instanceof If){
            return ctx("( "+dump(form.cond,id)+" ) ? " +
                "( "+dump(form.consequence,id)+" ) : " +
                "( "+dump(form.alternative,id)+" )");
        }
        else if(form instanceof FCall){
            return dump(form.args, function (args) {
                return ctx(dump(form.name,id)+"("+args+")");
            })
        }else if(form instanceof Bindings){
            return ctx("var "+form.bindings.map(function (binding) {
                return binding.name+"="+dump(binding.val,id);
            }).join(', '));
        }else if(form instanceof List){
            var lst = [];
            for(i = 0; i < form.list.length; i++){
                lst.push(dump(form.list[i],id));
            }
            return ctx("[" + lst.join(", ")+"]");
        }else if(form instanceof Tuple){
            var tup = [];
            for(i = 0; i < form.size(); i++){
                tup.push(dump(form.get(i),id));
            }
            return ctx("tuple("+tup.join(", ")+")");
        }
        return ctx(form);
    };

    var compile = function (tree) {
        var stmts = new Statements();
        for(var i=0; i < tree.length; i++){
            stmts.append(transform(tree[i],id));
        }
        return dump(stmts,id);
    };

    kill.compiler = {
        dump:dump,
        transform:transform,
        compile:compile,
        Lambda:Lambda,
        FCall:FCall,
        Binding:Binding
    };
    return kill.compiler;
}(kill));

function curry(fn,obj) {
    function curry$$(fn, len, args){
        return function (arg) {
            if(len <= 1) return fn.apply(obj,args.concat([arg]));
            return curry$$(fn, len-1, args.concat(arg));
        }
    }
    return curry$$(fn, fn.length,[]);
}

add = curry(function (a,b) {
    return a + b;
});

sub = curry(function (a, b) {
    return a - b;
});

mul = curry(function (a, b) {
    return a * b;
});

filter = curry(function(pred,lst){
    return lst.filter(pred);
});

range = curry(function (start, end) {
    var arr = [];
    for(var i = start; i < end; i++){
        arr.push(i);
    }
    return arr;
});

zero = function(x){return x == 0;};
odd = function (x) {
    return (x%2 != 0);
};
