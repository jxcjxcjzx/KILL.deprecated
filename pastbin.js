var YCache = function(f) {
    var thunk = {};
    return (function(g){
        return g(g);
    })(function(h) {
        return function() {
            var index = [].join.apply(arguments,[", "]);
            if (!(index in thunk))
                thunk[index] = f(h(h)).apply(null, arguments);
            return thunk[index];
        };
    });
};
