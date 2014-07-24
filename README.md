KILL -- the lambda evaluator
====

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

## Advanced Concepts

### Closures

todo

### Continuations

todo

### Iteration

todo

## TODOs

  + List & Tuple support
  + Types (Annotation, Checking, Inference)
  + Module System
  + Compiler
  + Documents. 