import { Ty } from "../../ty"
import * as Value from "../../value"
import * as Exp from "../../exp"
import { EtaExpander } from "../../eta-expander"
import * as Neutral from "../../neutral"
import { readback } from "../../readback"
import { do_ap } from "../../exps/ap"
import * as ut from "../../../ut"

export const arrow_eta_expander = (arg_t: Ty, ret_t: Ty) =>
  EtaExpander({
    eta_expand: (value, { used }) => {
      // NOTE everything with a function type
      //   is immediately read back as having a Lambda on top.
      //   This implements the η-rule for functions.
      const name = ut.freshen_name(used, value_arg_name(value))
      const variable = Value.not_yet(arg_t, Neutral.v(name))
      const ret = do_ap(value, variable)
      return Exp.fn(name, readback(new Set([...used, name]), ret_t, ret))
    },
  })

function value_arg_name(value: Value.Value): string {
  return value.kind === "Value.fn" ? value.name : "x"
}
