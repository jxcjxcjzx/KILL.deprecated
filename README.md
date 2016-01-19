KILL - Keep it lightweight & lint
====

<font color="red">***online***</font> http://kenpusney.github.io/KILL/

[TOC]

## Intro

`KILL` is a dynamic-typed programming language which compiles to JavaScript. Since it's syntax borrowed from several functional programming languages, it also have functional features like `currying`, `closure`, `list comprehension`etc.

## Features

  + Lexical scoping
  + General functional style.
      + first-class function
      + auto currying
      + closure
      + recursion
  + <del>Continuations<del/>
      + <del>call/cc</del>
  + <del>Compile-time AST Transform</del>

## Syntax

### let bindings

The keyword `let` should bind value to an object, where the object is on the left hand side of `:=` and the value on right.

```haskell
let x := 1
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

### sequential expression

A sequential expression begins with `begin`, ends with `end`, even it's sequential processing, it always return it's first expression when no `callcc`.

```haskell
let f := -> begin trace 1; trace 2; trace 3; end
f []
```


### conditional expression & recursion

conditional expression `if ... then ... else` is for branching executions. see the factorial for example:
```
let fact := \i \v ->
        if zero i then id v else fact (pred i) (mul i v)
trace (fact 5 1)
```

### set! operator

`set!` operator borrowed from Scheme, which changes the value of object to it's closure.
```haskell
let x := 1
trace x
set!x 2
trace x
```

### list & list processing
List is wrapped by `[]`, within it is a comma separated expression list.
```
let a := [1,2,3]

map trace a
```

Basic list operator:
`first` `rest` `length` `map` `reduce` ...(see `src/env.js` for more information)


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

--- sadly there is no intermediate call action now.
trace (b [])
trace (b [])
```

For more information, see [Closure](http://en.wikipedia.org/wiki/Closure_(computer_programming))

### <del>Continuations</del>

### List Comprehension
```
let fib :=
    \i \m \n ->
        if zero i
        then id m
        else fib (sub i 1) n (add m n)

let x :=
        1,
    y :=
        24

[trace (fib a 0 1) | a in (range x y) if odd a]
```

todo

## TODOs

  + String support
  + <del>Types (Annotation, Checking, Inference)</del>
  + Module System
  + <del>Compiler</del>
  + Documents. 
