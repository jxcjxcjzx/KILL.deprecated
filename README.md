KILL -- the lambda evaluator
====

<font color="red">***online***</font> http://kenpusney.github.io/KILL/

[TOC]

## Intro

`KILL` (which stands for "`Kimmy's Interpreter for Lambda Limited`") is a limited lambda evaluator. Since it's syntax borrowed from several functional programming languages, it also have some outstanding features like `currying` `continuation` `closure` etc.

## Features

  + Lexical scoping
  + General functional style.
      + first-class function
      + auto currying
      + closure
      + recursion
  + Continuations
      + call/cc

## Syntax

### let bindings

The keyword `let` should bind value to an object, where the object is on the left hand side of `:=` and the value on right.

```haskell
let x := id 1
trace x

let f := \x x+1
trace (f x)
```

### lambda expression

The `lambda expression` is also called `anonymous function`, which has zero or more parameters and produce a result. Parameters and lambda body is separated by `->` the arrow, and if parameters' more than zero, the arrow could be omitted.

```haskell
let f := \x -> succ x
trace (f 1)

let g := \x succ x
trace (g 2)

let h := \x ->
            succ x
trace (h 3)

let i := -> id 1
trace (i)
```

### currying

`Currying` means partial applying. when you make a function call, it always bind arguments one by one, which means, if you have a function of two, after apply one on it, you'll get another function of one.

```haskell
let f := \x \y add x y
let add_one := f 1
let add_two := f 2

trace (add_one 1)
trace (add_two 1)
```
Currying happens all the time on evaluating, even it just product a value. So, to prevent currying, use `quote` or `'` or `id` to wrap.
```
let f := id 1
let g := quote 2

trace f
trace g
```

### sequential expression

A sequential expression begins with `begin`, ends with `;`, even it's sequential processing, it always return it's first expression when no `callcc`.

```haskell
let f := -> begin (trace 1) (trace 2) (trace 3);
trace (f)
```

by means of `callcc` when can get a regular `begin`:
```
let f := -> callcc (\ret begin (trace 1) (trace 2) (ret (trace 3));)
trace (f)
```
which returns all passed to `ret`.

### conditional expression & recursion

conditional expression `if ... then ... else` is for branching executions. see the factorial for example:
```
let fact := \i \v ->
        if is_zero i then id v else fact (pred i) (mul i v)
trace (fact 5)
```

### set! operator

`set!` operator borrowed from Scheme, which changes the value of object to it's closure.
```haskell
let x := id 1
trace x
set!x id 2
trace x
```

### list & list processing
List is wrapped by `[]`, within it is a comma separated expression list.
```
let a := id ['1,'2,'3];

map trace a
```

Basic list operator:
`first` `rest` `length` `map` `reduce` ...(see `src/cps.js` for more information)


## Advanced Concepts

### Closures

A closure is a code block with its evaluation context.
```haskell
let pair :=\x \y \f f x y

let fst := \x \y id x
let snd := \x \y id y

let p := pair 1 2

trace (p fst)
trace (p snd)
```
while `pair 1 2` will returns a function that takes a function which takes pairs two value, the value `p` is treated as a function(block) with its two value(context).

Also, a closure could ref it's up-level value(which is also called as `upval`) in it's evaluation context:
```haskell
let gen := \x -> -> set!x succ x

let b := gen 0

trace (b)
trace (b)
```

For more information, see [Closure](http://en.wikipedia.org/wiki/Closure_(computer_programming))

### Continuations

todo

### Iteration

todo

## TODOs

  + Full List & Tuple support
  + Types (Annotation, Checking, Inference)
  + Module System
  + Compiler
  + Documents. 

## References

  + 王垠：怎样写一个解释器 http://www.yinwang.org/blog-cn/2012/08/01/interpreter/
  + Belleve Invis：预告：从解释器到抽象解释 http://typeof.net/m/trailer-from-a-interpreter-to-abstract-interpretation.html
  