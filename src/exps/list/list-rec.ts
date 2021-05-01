import { Exp } from "../../exp"
import { Ctx } from "../../ctx"
import { Env } from "../../env"
import { evaluate } from "../../evaluate"
import { check } from "../../check"
import { infer } from "../../infer"
import { expect } from "../../expect"
import { Value, match_value } from "../../value"
import { Closure } from "../../closure"
import { Trace } from "../../trace"
import * as Cores from "../../cores"
import * as Exps from "../../exps"

export class ListRec extends Exp {
  target: Exp
  base: Exp
  step: Exp

  constructor(target: Exp, base: Exp, step: Exp) {
    super()
    this.target = target
    this.base = base
    this.step = step
  }

  evaluate(ctx: Ctx, env: Env): Value {
    return ListRec.apply(
      evaluate(ctx, env, this.target),
      evaluate(ctx, env, this.base),
      evaluate(ctx, env, this.step)
    )
  }

  infer(ctx: Ctx): Value {
    const target_t = infer(ctx, this.target)
    const list_t = expect(ctx, target_t, Cores.ListValue)
    const elem_t = list_t.elem_t
    const base_t = infer(ctx, this.base)
    check(ctx, this.step, list_rec_step_t(base_t, elem_t))
    return base_t
  }

  repr(): string {
    return `list_rec(${this.target.repr()}, ${this.base.repr()}, ${this.step.repr()})`
  }

  static apply(target: Value, base: Value, step: Value): Value {
    return match_value(target, [
      [Cores.NilValue, (_: Cores.NilValue) => base],
      [
        Cores.LiValue,
        ({ head, tail }: Cores.LiValue) =>
          Cores.Ap.apply(
            Cores.Ap.apply(Cores.Ap.apply(step, head), tail),
            ListRec.apply(tail, base, step)
          ),
      ],
      [
        Cores.NotYetValue,
        ({ t, neutral }: Cores.NotYetValue) =>
          match_value(t, [
            [
              Cores.ListValue,
              (list_t: Cores.ListValue) => {
                const motive_t = new Cores.PiValue(
                  list_t,
                  new Closure(
                    new Ctx(),
                    new Env(),
                    "target_list",
                    list_t,
                    new Cores.Type()
                  )
                )

                throw new Error("TODO")

                // NOTE We need to construct a constant motive function to return `base_t`
                //   but we do not have `base_t`.

                // const base_t = ???
                // const motive = ???
                // const elem_t = list_t.elem_t
                // const step_t = list_rec_step_t(base_t, elem_t)
                // return new NotYetValue(
                //   base_t,
                //   new ListIndNeutral(
                //     neutral,
                //     new Normal(motive_t, motive),
                //     new Normal(base_t, base),
                //     new Normal(step_t, step)
                //   )
                // )
              },
            ],
          ]),
      ],
    ])
  }
}

function list_rec_step_t(base_t: Value, elem_t: Value): Value {
  const ctx = new Ctx()
    .extend("base_t", new Cores.TypeValue(), base_t)
    .extend("elem_t", new Cores.TypeValue(), elem_t)
  const env = new Env()
    .extend("base_t", new Cores.TypeValue(), base_t)
    .extend("elem_t", new Cores.TypeValue(), elem_t)

  const step_t = new Cores.Pi(
    "head",
    new Cores.Var("elem_t"),
    new Cores.Pi(
      "tail",
      new Cores.List(new Cores.Var("elem_t")),
      new Cores.Pi("almost", new Cores.Var("base_t"), new Cores.Var("base_t"))
    )
  )

  return evaluate(ctx, env, step_t)
}
