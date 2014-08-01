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
    })
});