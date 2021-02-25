import { Ctx } from "../ctx"
import { Exp } from "../exp"
import { readback } from "../readback"
import * as Value from "../value"
import * as Closure from "../value/closure"
import * as Neutral from "../neutral"
import * as ut from "../ut"
import { TypeValue } from "./type-value"
import { Sigma } from "./sigma"

export class SigmaValue {
  kind: "Value.sigma" = "Value.sigma"
  car_t: Value.Value
  cdr_t_cl: Closure.Closure

  constructor(car_t: Value.Value, cdr_t_cl: Closure.Closure) {
    this.car_t = car_t
    this.cdr_t_cl = cdr_t_cl
  }

  readback(ctx: Ctx, t: Value.Value): Exp | undefined {
    if (t instanceof TypeValue) {
      const fresh_name = ut.freshen_name(
        new Set(ctx.names()),
        this.cdr_t_cl.name
      )
      const variable = Value.not_yet(this.car_t, Neutral.v(fresh_name))
      const car_t = readback(ctx, Value.type, this.car_t)
      const cdr_t = readback(
        ctx.extend(fresh_name, this.car_t),
        Value.type,
        Value.Closure.apply(this.cdr_t_cl, variable)
      )
      return new Sigma(fresh_name, car_t, cdr_t)
    }
  }
}
