import { Exp, AlphaReprOpts } from "../exp"
import { Ctx } from "../ctx"
import { Env } from "../env"
import { Inferable } from "../inferable"
import { infer } from "../infer"
import * as Value from "../value"
import { evaluate } from "../evaluate"
import * as Explain from "../explain"
import * as Neutral from "../neutral"
import * as Trace from "../trace"

export class Car extends Object implements Exp {
  kind = "Car"
  target: Exp

  constructor(target: Exp) {
    super()
    this.target = target
  }

  evaluability({ env }: { env: Env }): Value.Value {
    return do_car(evaluate(env, this.target))
  }

  checkability(t: Value.Value, the: { ctx: Ctx }): void {
    return Inferable({
      inferability: ({ ctx }: { ctx: Ctx }) => {
        const target_t = infer(ctx, this.target)
        const sigma = Value.is_sigma(ctx, target_t)
        return sigma.car_t
      },
    }).checkability(t, the)
  }

  inferability({ ctx }: { ctx: Ctx }): Value.Value {
    const target_t = infer(ctx, this.target)
    const sigma = Value.is_sigma(ctx, target_t)
    return sigma.car_t
  }

  repr(): string {
    return `car(${this.target.repr()})`
  }

  alpha_repr(opts: AlphaReprOpts): string {
    return `car(${this.target.alpha_repr(opts)})`
  }
}

export function do_car(target: Value.Value): Value.Value {
  if (target.kind === "Value.cons") {
    return target.car
  } else if (target.kind === "Value.not_yet") {
    if (target.t.kind === "Value.sigma") {
      return Value.not_yet(target.t.car_t, Neutral.car(target.neutral))
    } else {
      throw new Trace.Trace(
        Explain.explain_elim_target_type_mismatch({
          elim: "car",
          expecting: ["Value.sigma"],
          reality: target.t.kind,
        })
      )
    }
  } else {
    throw new Trace.Trace(
      Explain.explain_elim_target_mismatch({
        elim: "car",
        expecting: ["Value.cons", "Value.not_yet"],
        reality: target.kind,
      })
    )
  }
}
