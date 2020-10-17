import * as Exp from "../exp"
import * as Value from "../value"
import * as Normal from "../normal"
import * as Neutral from "../neutral"
import * as Trace from "../../trace"

export function do_ap(target: Value.Value, arg: Value.Value): Value.Value {
  if (target.kind === "Value.fn") return Value.Closure.apply(target.ret_cl, arg)
  if (target.kind === "Value.cls") return ap_cls(target, arg)
  if (target.kind === "Value.not_yet") return ap_not_yet(target, arg)
  throw new Trace.Trace(
    Exp.explain_elim_target_mismatch({
      elim: "ap",
      expecting: ["Value.fn", "Value.cls", "Value.not_yet"],
      reality: target.kind,
    })
  )
}

function ap_cls(target: Value.cls, arg: Value.Value): Value.cls {
  if (target.tel.next === undefined) throw new Trace.Trace("target cls is full")

  return Value.cls(
    [
      ...target.sat,
      {
        name: target.tel.next.name,
        t: target.tel.next.t,
        value: arg,
      },
    ],
    Value.Telescope.fill(target.tel, arg)
  )
}

function ap_not_yet(target: Value.not_yet, arg: Value.Value): Value.not_yet {
  if (target.t.kind === "Value.pi")
    return Value.not_yet(
      Value.Closure.apply(target.t.ret_t_cl, arg),
      Neutral.ap(target.neutral, new Normal.Normal(target.t.arg_t, arg))
    )

  throw new Trace.Trace(
    Exp.explain_elim_target_type_mismatch({
      elim: "ap",
      expecting: ["Value.pi"],
      reality: target.t.kind,
    })
  )
}
