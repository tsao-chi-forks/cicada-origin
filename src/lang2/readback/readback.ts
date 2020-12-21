import * as Readback from "../readback"
import * as Evaluate from "../evaluate"
import * as Value from "../value"
import * as Neutral from "../neutral"
import * as Exp from "../exp"
import * as Ctx from "../ctx"
import * as ut from "../../ut"
import { do_car } from "../exps/car"
import { do_cdr } from "../exps/cdr"
import { do_ap } from "../exps/ap"

export function readback(
  ctx: Ctx.Ctx,
  t: Value.Value,
  value: Value.Value
): Exp.Exp {
  if (t.kind === "Value.nat" && value.kind === "Value.zero") {
    return Exp.zero
  } else if (t.kind === "Value.nat" && value.kind === "Value.add1") {
    return Exp.add1(Readback.readback(ctx, t, value.prev))
  } else if (t.kind === "Value.pi") {
    // NOTE everything with a function type
    //   is immediately read back as having a Lambda on top.
    //   This implements the η-rule for functions.
    const fresh_name = ut.freshen_name(new Set(ctx.keys()), t.ret_t_cl.name)
    const variable = Value.not_yet(t.arg_t, Neutral.v(fresh_name))
    return Exp.fn(
      fresh_name,
      Readback.readback(
        Ctx.extend(ctx, fresh_name, t.arg_t),
        Value.Closure.apply(t.ret_t_cl, variable),
        do_ap(value, variable)
      )
    )
  } else if (t.kind === "Value.sigma") {
    // NOTE Pairs are also η-expanded.
    //   Every value with a pair type,
    //   whether it is neutral or not,
    //   is read back with cons at the top.
    const car = do_car(value)
    const cdr = do_cdr(value)
    return Exp.cons(
      Readback.readback(ctx, t.car_t, car),
      Readback.readback(ctx, Value.Closure.apply(t.cdr_t_cl, car), cdr)
    )
  } else if (t.kind === "Value.trivial") {
    // NOTE the η-rule for trivial states that
    //   all of its inhabitants are the same as sole.
    //   This is implemented by reading the all back as sole.
    return Exp.sole
  } else if (
    t.kind === "Value.absurd" &&
    value.kind === "Value.not_yet" &&
    value.t.kind === "Value.absurd"
  ) {
    return Exp.the(Exp.absurd, Readback.readback_neutral(ctx, value.neutral))
  } else if (t.kind === "Value.equal" && value.kind === "Value.same") {
    return Exp.same
  } else if (t.kind === "Value.str" && value.kind === "Value.quote") {
    return Exp.quote(value.str)
  } else if (t.kind === "Value.type" && value.kind === "Value.nat") {
    return Exp.nat
  } else if (t.kind === "Value.type" && value.kind === "Value.str") {
    return Exp.str
  } else if (t.kind === "Value.type" && value.kind === "Value.trivial") {
    return Exp.trivial
  } else if (t.kind === "Value.type" && value.kind === "Value.absurd") {
    return Exp.absurd
  } else if (t.kind === "Value.type" && value.kind === "Value.equal") {
    return Exp.equal(
      Readback.readback(ctx, Value.type, value.t),
      Readback.readback(ctx, value.t, value.from),
      Readback.readback(ctx, value.t, value.to)
    )
  } else if (t.kind === "Value.type" && value.kind === "Value.sigma") {
    const fresh_name = ut.freshen_name(new Set(ctx.keys()), value.cdr_t_cl.name)
    const variable = Value.not_yet(value.car_t, Neutral.v(fresh_name))
    const car_t = Readback.readback(ctx, Value.type, value.car_t)
    const cdr_t = Readback.readback(
      Ctx.extend(ctx, fresh_name, value.car_t),
      Value.type,
      Value.Closure.apply(value.cdr_t_cl, variable)
    )
    return Exp.sigma(fresh_name, car_t, cdr_t)
  } else if (t.kind === "Value.type" && value.kind === "Value.pi") {
    const fresh_name = ut.freshen_name(new Set(ctx.keys()), value.ret_t_cl.name)
    const variable = Value.not_yet(value.arg_t, Neutral.v(fresh_name))
    const arg_t = Readback.readback(ctx, Value.type, value.arg_t)
    const ret_t = Readback.readback(
      Ctx.extend(ctx, fresh_name, value.arg_t),
      Value.type,
      Value.Closure.apply(value.ret_t_cl, variable)
    )
    return Exp.pi(fresh_name, arg_t, ret_t)
  } else if (t.kind === "Value.type" && value.kind === "Value.type") {
    return Exp.type
  } else if (value.kind === "Value.not_yet") {
    // NOTE  t and value.t are ignored here,
    //  maybe use them to debug.
    return Readback.readback_neutral(ctx, value.neutral)
  } else {
    throw new Error(
      ut.aline(`
      |I can not readback value: ${ut.inspect(value)},
      |of type: ${ut.inspect(t)}.
      |`)
    )
  }
}
