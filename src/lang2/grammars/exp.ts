import * as Exp from "../exp"
import pt from "@forchange/partech"
import rr from "@forchange/readable-regular-expression"

const preserved_identifiers = [
  "Pair",
  "cons",
  "car",
  "cdr",
  "Nat",
  "zero",
  "add1",
  "Equal",
  "same",
  "replace",
  "Trivial",
  "sole",
  "Absurd",
  "String",
  "Type",
]

const identifier = new pt.Sym.Pat(
  /^identifier/,
  rr.seq(
    rr.negative_lookahead(rr.beginning, rr.or(...preserved_identifiers)),
    rr.word
  ),
  { name: "identifier" }
)

const str = pt.Sym.create_par_from_kind("string", { name: "string" })

function str_matcher(tree: pt.Tree.Tree): string {
  const s = pt.Tree.token(tree).value
  return s.slice(1, s.length - 1)
}

const num = pt.Sym.create_par_from_kind("number", { name: "number" })

function num_matcher(tree: pt.Tree.Tree): number {
  const s = pt.Tree.token(tree).value
  return Number.parseInt(s)
}

function type_assignment(): pt.Sym.Rule {
  return pt.Sym.create_rule("type_assignment", {
    named: [identifier, ":", exp],
    unnamed: [exp],
  })
}

function type_assignment_matcher(
  tree: pt.Tree.Tree
): { name: string; t: Exp.Exp } {
  return pt.Tree.matcher("type_assignment", {
    named: ([name, , t]) => {
      return {
        name: pt.Tree.token(name).value,
        t: exp_matcher(t),
      }
    },
    unnamed: ([t]) => {
      return {
        name: "_",
        t: exp_matcher(t),
      }
    },
  })(tree)
}

export function exp(): pt.Sym.Rule {
  return pt.Sym.create_rule("exp", {
    var: [identifier],
    pi: ["(", comma_separated(type_assignment), ")", "-", ">", exp],
    fn: ["(", comma_separated(identifier), ")", "=", ">", exp],
    ap: [
      identifier,
      pt.one_or_more(in_between("(", comma_separated(exp), ")")),
    ],
    sigma: ["(", identifier, ":", exp, ")", "*", exp],
    pair: ["Pair", "(", exp, ",", exp, ")"],
    cons: ["cons", "(", exp, ",", exp, ")"],
    car: ["car", "(", exp, ")"],
    cdr: ["cdr", "(", exp, ")"],
    nat: ["Nat"],
    zero: ["zero"],
    add1: ["add1", "(", exp, ")"],
    number: [num],
    nat_ind: ["Nat", ".", "ind", "(", exp, ",", exp, ",", exp, ",", exp, ")"],
    equal: ["Equal", "(", exp, ",", exp, ",", exp, ")"],
    same: ["same"],
    replace: ["replace", "(", exp, ",", exp, ",", exp, ")"],
    trivial: ["Trivial"],
    sole: ["sole"],
    absurd: ["Absurd"],
    absurd_ind: ["Absurd", ".", "ind", "(", exp, ",", exp, ")"],
    str: ["String"],
    quote: [str],
    type: ["Type"],
    suite: ["{", pt.zero_or_more(def), exp, "}"],
    the: [exp, ":", exp],
  })
}

export function exp_matcher(tree: pt.Tree.Tree): Exp.Exp {
  return pt.Tree.matcher<Exp.Exp>("exp", {
    var: ([name]) => {
      return {
        kind: "Exp.v",
        name: pt.Tree.token(name).value,
      }
    },
    pi: ([, comma_separated_type_assignments, , , , ret_t]) => {
      const type_assignments = comma_separated_matcher(type_assignment_matcher)(
        comma_separated_type_assignments
      )
      let exp = exp_matcher(ret_t)
      for (let i = type_assignments.length - 1; i >= 0; i--) {
        exp = {
          kind: "Exp.pi",
          name: type_assignments[i].name,
          arg_t: type_assignments[i].t,
          ret_t: exp,
        }
      }
      return exp
    },
    fn: ([, comma_separated_names, , , , body]) => {
      const names = comma_separated_matcher(
        (name) => pt.Tree.token(name).value
      )(comma_separated_names)
      let exp = exp_matcher(body)
      for (let i = names.length - 1; i >= 0; i--) {
        exp = {
          kind: "Exp.fn",
          name: names[i],
          body: exp,
        }
      }
      return exp
    },
    ap: ([name, exp_in_paren_list]) => {
      let exp: Exp.Exp = {
        kind: "Exp.v",
        name: pt.Tree.token(name).value,
      }
      const args_list = pt.one_or_more_matcher(
        in_between_matcher(comma_separated_matcher(exp_matcher))
      )(exp_in_paren_list)
      for (const args of args_list) {
        for (const arg of args) {
          exp = {
            kind: "Exp.ap",
            target: exp,
            arg: arg,
          }
        }
      }
      return exp
    },
    sigma: ([, name, , car_t, , , cdr_t]) => {
      return {
        kind: "Exp.sigma",
        name: pt.Tree.token(name).value,
        car_t: exp_matcher(car_t),
        cdr_t: exp_matcher(cdr_t),
      }
    },
    pair: ([, , car_t, , cdr_t]) => {
      return {
        kind: "Exp.sigma",
        name: "_",
        car_t: exp_matcher(car_t),
        cdr_t: exp_matcher(cdr_t),
      }
    },
    cons: ([, , car, , cdr]) => {
      return {
        kind: "Exp.cons",
        car: exp_matcher(car),
        cdr: exp_matcher(cdr),
      }
    },
    car: ([, , target]) => {
      return {
        kind: "Exp.car",
        target: exp_matcher(target),
      }
    },
    cdr: ([, , target]) => {
      return {
        kind: "Exp.cdr",
        target: exp_matcher(target),
      }
    },
    nat: (_) => {
      return { kind: "Exp.nat" }
    },
    zero: (_) => {
      return { kind: "Exp.zero" }
    },
    add1: ([, , prev]) => {
      return { kind: "Exp.add1", prev: exp_matcher(prev) }
    },
    number: ([num]) => {
      const n = num_matcher(num)
      return Exp.nat_from_number(n)
    },
    nat_ind: ([, , , , target, , motive, , base, , step]) => {
      return {
        kind: "Exp.nat_ind",
        target: exp_matcher(target),
        motive: exp_matcher(motive),
        base: exp_matcher(base),
        step: exp_matcher(step),
      }
    },
    equal: ([, , t, , from, , to]) => {
      return {
        kind: "Exp.equal",
        t: exp_matcher(t),
        from: exp_matcher(from),
        to: exp_matcher(to),
      }
    },
    same: (_) => {
      return { kind: "Exp.same" }
    },
    replace: ([, , target, , motive, , base]) => {
      return {
        kind: "Exp.replace",
        target: exp_matcher(target),
        motive: exp_matcher(motive),
        base: exp_matcher(base),
      }
    },
    trivial: (_) => {
      return { kind: "Exp.trivial" }
    },
    sole: (_) => {
      return { kind: "Exp.sole" }
    },
    absurd: (_) => {
      return { kind: "Exp.absurd" }
    },
    absurd_ind: ([, , , , target, , motive]) => {
      return {
        kind: "Exp.absurd_ind",
        target: exp_matcher(target),
        motive: exp_matcher(motive),
      }
    },
    str: (_) => {
      return { kind: "Exp.str" }
    },
    quote: ([str]) => {
      return { kind: "Exp.quote", str: str_matcher(str) }
    },
    type: (_) => {
      return { kind: "Exp.type" }
    },
    suite: ([, defs, body]) => {
      return {
        kind: "Exp.suite",
        defs: pt.zero_or_more_matcher(def_matcher)(defs),
        body: exp_matcher(body),
      }
    },
    the: ([exp, , t]) => {
      return {
        kind: "Exp.the",
        t: exp_matcher(t),
        exp: exp_matcher(exp),
      }
    },
  })(tree)
}

function comma_after(x: pt.Sym.Exp): pt.Sym.Rule {
  return pt.Sym.create_rule("comma_after", {
    comma_after: [x, ","],
  })
}

function comma_after_matcher<A>(
  matcher: (tree: pt.Tree.Tree) => A
): (tree: pt.Tree.Tree) => A {
  return pt.Tree.matcher("comma_after", {
    comma_after: ([x]) => matcher(x),
  })
}

function comma_separated(x: pt.Sym.Exp): pt.Sym.Rule {
  return pt.Sym.create_rule("comma_separated", {
    comma_separated: [pt.zero_or_more(comma_after(x)), x],
  })
}

function comma_separated_matcher<A>(
  matcher: (tree: pt.Tree.Tree) => A
): (tree: pt.Tree.Tree) => Array<A> {
  return pt.Tree.matcher("comma_separated", {
    comma_separated: ([comma_separated, x]) => {
      return [
        ...pt.zero_or_more_matcher(comma_after_matcher(matcher))(
          comma_separated
        ),
        matcher(x),
      ]
    },
  })
}

function in_between(before: string, x: pt.Sym.Exp, after: string): pt.Sym.Rule {
  return pt.Sym.create_rule("in_between", {
    in_between: [before, x, after],
  })
}

function in_between_matcher<A>(
  matcher: (tree: pt.Tree.Tree) => A
): (tree: pt.Tree.Tree) => A {
  return pt.Tree.matcher("in_between", {
    in_between: ([, x]) => matcher(x),
  })
}

function def(): pt.Sym.Rule {
  return pt.Sym.create_rule("def", {
    def: [identifier, "=", exp],
  })
}

function def_matcher(tree: pt.Tree.Tree): { name: string; exp: Exp.Exp } {
  return pt.Tree.matcher("def", {
    def: ([name, , exp]) => {
      return {
        name: pt.Tree.token(name).value,
        exp: exp_matcher(exp),
      }
    },
  })(tree)
}
