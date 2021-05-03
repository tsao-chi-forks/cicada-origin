import { Exp } from "../../exp"
import { Core } from "../../core"
import { evaluate } from "../../evaluate"
import { check } from "../../check"
import { Ctx } from "../../ctx"
import { Value } from "../../value"
import * as Cores from "../../cores"

export class AbsurdInd extends Exp {
  target: Exp
  motive: Exp

  constructor(target: Exp, motive: Exp) {
    super()
    this.target = target
    this.motive = motive
  }

  infer(ctx: Ctx): { t: Value; core: Core } {
    // NOTE the `motive` here is not a function from target_t to type,
    //   but a element of type.
    // NOTE We should always infer target,
    //   but we do a simple check for the simple absurd.
    const target_core = check(ctx, this.target, new Cores.AbsurdValue())
    const motive_core = check(ctx, this.motive, new Cores.TypeValue())
    const t = evaluate(ctx.to_env(), motive_core)
    const core = new Cores.AbsurdInd(target_core, motive_core)
    return { t, core }
  }

  repr(): string {
    return `absurd_ind(${this.target.repr()}, ${this.motive.repr()})`
  }
}
