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
                    break;
                case "callcc":
                    break;
                case "quote":
                    break;
                case "set!":
                    break;
                case "list":
                    break;
                case "tuple":
                    break;
                case "uc_lambda":
                    break;
                case "list_comp":
                    break;
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
        return ctx(form);
    };

    var dump =function (form, ctx) {
        ctx = ctx || trace;
        if(form instanceof Statements){
            var stmts = [];
            for(var i = 0; i < form.count(); i++){
                if(!(form.get(i) instanceof Array))
                    stmts.push(dump(form.get(i), id));
            }
            return ctx(stmts.join(";\n"));
        }
        if(form instanceof Lambda)
            return ctx("(function("+ dump(form.argv,id) +"){ return " + dump(form.body,id) + ";})");
        else if(form instanceof FCall){
            return dump(form.args, function (args) {
                return ctx(dump(form.name,id)+"("+args+")");
            })
        }else if(form instanceof Bindings){
            return ctx("var "+form.bindings.map(function (binding) {
                return binding.name+"="+dump(binding.val,id);
            }).join(', '));
        }
        if(typeof(form) === "String"){
            /**
             * @TODO:
             * Syntax Translation:
             *      ? => $q_
             *      ! => $e_
             *      ...
             * */
            return ctx(form);
        }
        return ctx(form);
    };

    var compile = function (tree) {
        var stmts = new Statements();
        for(var i=0; i < tree.length; i++){
            stmts.append(transform(tree[i],id));
        }
        return dump(stmts);
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