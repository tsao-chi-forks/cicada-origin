import { Exp } from "../../exp"
import { Core } from "../../core"
import { Ctx } from "../../ctx"
import { Env } from "../../env"
import { evaluate } from "../../core"
import { check } from "../../exp"
import { Value } from "../../value"
import * as Cores from "../../cores"

export class NatInd extends Exp {
  target: Exp
  motive: Exp
  base: Exp
  step: Exp

  constructor(target: Exp, motive: Exp, base: Exp, step: Exp) {
    super()
    this.target = target
    this.motive = motive
    this.base = base
    this.step = step
  }

  free_names(bound_names: Set<string>): Set<string> {
    return new Set([
      ...this.target.free_names(bound_names),
      ...this.motive.free_names(bound_names),
      ...this.base.free_names(bound_names),
      ...this.step.free_names(bound_names),
    ])
  }

  subst(name: string, exp: Exp): Exp {
    return new NatInd(
      this.target.subst(name, exp),
      this.motive.subst(name, exp),
      this.base.subst(name, exp),
      this.step.subst(name, exp)
    )
  }

  infer(ctx: Ctx): { t: Value; core: Core } {
    const target_core = check(ctx, this.target, new Cores.NatValue())
    const motive_t = nat_ind_motive_t
    const motive_core = check(ctx, this.motive, motive_t)
    const motive_value = evaluate(ctx.to_env(), motive_core)
    const base_core = check(
      ctx,
      this.base,
      Cores.Ap.apply(motive_value, new Cores.ZeroValue())
    )
    const step_core = check(ctx, this.step, nat_ind_step_t(motive_value))
    const target_value = evaluate(ctx.to_env(), target_core)

    return {
      t: Cores.Ap.apply(motive_value, target_value),
      core: new Cores.NatInd(target_core, motive_core, base_core, step_core),
    }
  }

  repr(): string {
    const args = [
      this.target.repr(),
      this.motive.repr(),
      this.base.repr(),
      this.step.repr(),
    ].join(", ")

    return `nat_ind(${args})`
  }
}

export const nat_ind_motive_t: Value = evaluate(
  new Env(),
  new Cores.Pi("target_nat", new Cores.Nat(), new Cores.Type())
)

export function nat_ind_step_t(motive: Value): Value {
  return evaluate(
    new Env().extend("motive", motive),
    new Cores.Pi(
      "prev",
      new Cores.Nat(),
      new Cores.Pi(
        "almost",
        new Cores.Ap(new Cores.Var("motive"), new Cores.Var("prev")),
        new Cores.Ap(
          new Cores.Var("motive"),
          new Cores.Add1(new Cores.Var("prev"))
        )
      )
    )
  )
}