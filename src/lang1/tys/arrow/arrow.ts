import { Ty } from "../../ty"
import { EtaExpander } from "../../eta-expander"
import { Repr } from "../../repr"
import { arrow_eta_expander } from "./arrow-eta-expander"

export type Arrow = EtaExpander & Repr & {
  kind: "Ty.arrow"
  arg_t: Ty
  ret_t: Ty
}

export function Arrow(arg_t: Ty, ret_t: Ty): Arrow {
  return {
    kind: "Ty.arrow",
    arg_t,
    ret_t,
    ...arrow_eta_expander(arg_t, ret_t),
    repr:()=> ""
  }
}