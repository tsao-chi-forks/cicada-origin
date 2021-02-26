import { Exp, AlphaCtx } from "../exp"
import { Ctx } from "../ctx"
import { Env } from "../env"
import { evaluate } from "../evaluate"
import { check } from "../check"
import * as Explain from "../explain"
import * as Value from "../value"
import * as Normal from "../normal"
import * as Neutral from "../neutral"
import * as Trace from "../trace"

import { Type } from "./type"
import { Nat } from "./nat"
import { Pi, Ap } from "../core"
import { NatValue, ZeroValue, Add1Value } from "../core"
import { PiValue } from "../core"
import { NotYetValue } from "../core"
import { nat_ind_step_t } from "./nat-util"

export class NatInd implements Exp {
  target: Exp
  motive: Exp
  base: Exp
  step: Exp

  constructor(target: Exp, motive: Exp, base: Exp, step: Exp) {
    this.target = target
    this.motive = motive
    this.base = base
    this.step = step
  }

  evaluate(env: Env): Value.Value {
    return do_nat_ind(
      evaluate(env, this.target),
      evaluate(env, this.motive),
      evaluate(env, this.base),
      evaluate(env, this.step)
    )
  }

  infer(ctx: Ctx): Value.Value {
    // NOTE We should always infer target,
    //   but we do a simple check for the simple nat.
    check(ctx, this.target, new NatValue())
    const motive_t = evaluate(new Env(), new Pi("x", new Nat(), new Type()))
    check(ctx, this.motive, motive_t)
    const motive_value = evaluate(ctx.to_env(), this.motive)
    check(ctx, this.base, Ap.apply(motive_value, new ZeroValue()))
    check(ctx, this.step, nat_ind_step_t(motive_value))
    const target_value = evaluate(ctx.to_env(), this.target)
    return Ap.apply(motive_value, target_value)
  }

  repr(): string {
    return `nat_ind(${this.target.repr()}, ${this.motive.repr()}, ${this.base.repr()}, ${this.step.repr()})`
  }

  alpha_repr(ctx: AlphaCtx): string {
    return `nat_ind(${this.target.alpha_repr(ctx)}, ${this.motive.alpha_repr(
      ctx
    )}, ${this.base.alpha_repr(ctx)}, ${this.step.alpha_repr(ctx)})`
  }
}

export function do_nat_ind(
  target: Value.Value,
  motive: Value.Value,
  base: Value.Value,
  step: Value.Value
): Value.Value {
  if (target instanceof ZeroValue) {
    return base
  } else if (target instanceof Add1Value) {
    return Ap.apply(
      Ap.apply(step, target.prev),
      do_nat_ind(target.prev, motive, base, step)
    )
  } else if (target instanceof NotYetValue) {
    if (target.t instanceof NatValue) {
      const motive_t = new PiValue(
        new NatValue(),
        Value.Closure.create(new Env(), "k", new Type())
      )
      const base_t = Ap.apply(motive, new ZeroValue())
      const step_t = nat_ind_step_t(motive)
      return new NotYetValue(
        Ap.apply(motive, target),
        Neutral.nat_ind(
          target.neutral,
          new Normal.Normal(motive_t, motive),
          new Normal.Normal(base_t, base),
          new Normal.Normal(step_t, step)
        )
      )
    } else {
      throw new Trace.Trace(
        Explain.explain_elim_target_type_mismatch({
          elim: "nat_ind",
          expecting: ["new NatValue()"],
          reality: target.t.constructor.name,
        })
      )
    }
  } else {
    throw new Trace.Trace(
      Explain.explain_elim_target_mismatch({
        elim: "nat_ind",
        expecting: ["Value.zero", "Value.add1", "new NotYetValue"],
        reality: target.constructor.name,
      })
    )
  }
}
