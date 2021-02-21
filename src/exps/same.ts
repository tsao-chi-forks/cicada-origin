import { Exp, AlphaReprOpts } from "../exp"
import { Ctx } from "../ctx"
import { Env } from "../env"
import * as Value from "../value"
import { readback } from "../readback"
import * as Trace from "../trace"
import * as ut from "../ut"

export class Same extends Object implements Exp {
  kind = "Same"

  constructor() {
    super()
  }

  checkability(t: Value.Value, { ctx }: { ctx: Ctx }): void {
    const equal = Value.is_equal(ctx, t)
    if (!Value.conversion(ctx, equal.t, equal.from, equal.to)) {
      throw new Trace.Trace(
        ut.aline(`
          |I am expecting the following two values to be the same type:
          |  ${readback(ctx, Value.type, equal.t).repr()}
          |But they are not.
          |from:
          |  ${readback(ctx, equal.t, equal.from).repr()}
          |to:
          |  ${readback(ctx, equal.t, equal.to).repr()}
          |`)
      )
    }
  }

  evaluability(the: { env: Env }): Value.Value {
    return Value.same
  }

  repr(): string {
    return "same"
  }

  alpha_repr(opts: AlphaReprOpts): string {
    return "same"
  }
}