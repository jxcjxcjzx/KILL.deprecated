/**
 * Created by Kim on 2014/8/1.
 */

describe("Compiler", function () {

    it("compiles fun_call", function () {
        kill.compiler.transform(["a", "b"]);
        expect(kill.compiler.dump(kill.compiler.transform(["a", ["b", "c"]]))).toBe("a(b(c))");
        kill.compiler.transform([["a", "b"], "c"]);
        expect(kill.compiler.dump(kill.compiler.transform([[["a", "b"], "c"], "d"]))).toBe("a(b)(c)(d)");
    });
    it("compiles lambda", function () {
        kill.compiler.transform(
            ["lambda",['a'],
                ["lambda",['x'],
                    ['a','x']]]);
        expect(kill.compiler.dump(
            kill.compiler.transform(
                [[[
                    ["lambda",["a"],
                        ["lambda",["b"],
                            ["a", "b"]]],
                    "b"], "c"], "d"]),
            trace)).toBe("(function(a){ return (function(b){ return a(b);});})(b)(c)(d)");
    });
    it("compiles let binding", function () {
        expect(kill.compiler.transform(
            ["let",[
                ["a", 1],
                ["b", ["s","c"]],
                ["c", ["lambda", ["a"], ["id", ["a"]]]],
                ["d", [["lambda", ["b"], "b"], "c"]]
            ]]));
        expect(kill.compiler.dump(kill.compiler.transform(
            ["let",[
                ["a", 1],
                ["b", ["s","c"]],
                ["c", ["lambda", ["a"], ["id", ["a"]]]],
                ["d", [["lambda", ["b"], "b"], "c"]]
            ]]))).toBe("var a=1, b=s(c), c=(function(a){ return id(a);}), d=(function(b){ return b;})(c)");
    });

    it("compiles set!expression", function () {
        expect(kill.compiler.transform(["set!", "x", ["a", ["b", "c"]]])).toBe("x = a(b(c))");
        expect(kill.compiler.transform(["set!", "x", ["lambda",["b"], ["b", "c"]]])).toBe("x = (function(b){ return b(c);})");
    });

    it("compiles quote form", function () {
        expect(kill.compiler.transform(["quote", 1])).toBe(1);
        expect(kill.compiler.transform(["quote", "Hehe"])).toBe("Hehe");
    });

    it("compiles list & tuple form", function () {
        expect(kill.compiler.dump(
            kill.compiler.transform(
                ["list",[
                    ["a","b"],
                    ["lambda",["a"],["a","b"]],
                    ["b"]]])))
            .toBe("[a(b), (function(a){ return a(b);}), b]");
        expect(kill.compiler.dump(
            kill.compiler.transform(
                ["tuple",["list",[
                    ["a","b"],
                    ["lambda",["a"],["a","b"]],
                    ["b"]]]])))
            .toBe("tuple(a(b), (function(a){ return a(b);}), b)");
    });
    it("compiles if form", function () {
        expect(kill.compiler.dump(
            kill.compiler.transform(
                ["if", ["a", "b"], ["a", "c"], ["b", "c"]]
            )
        )).toBe("if ( a(b) ) return a(c);\n"+
        "return b(c);");
    });
    it("compile whole program", function () {
        expect(kill.compiler.compile(
            kill.parser.parse(
                    "let x:= 1\n" +
                    "let a:= 2\n" +
                    "let s:= \\x -> 1\n" +
                    "let v := s 2\n" +
                    "trace v"
            )
        )).toBe(
                "var x=1;\n" +
                "var a=2;\n" +
                "var s=(function(x){ return 1;});\n"+
                "var v=s(2);\n"+
                "trace(v)"
        )
    })
});