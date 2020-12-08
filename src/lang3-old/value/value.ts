import * as Closure from "./closure"
import * as Telescope from "./telescope"
import * as DelayedSums from "./delayed-sums"
import * as Neutral from "../neutral"
import * as Exp from "../exp"
import * as Mod from "../mod"
import * as Modpath from "../modpath"
import * as Env from "../env"

export type Value =
  | pi
  | fn
  | case_fn
  | cls
  | obj
  | equal
  | same
  | absurd
  | str
  | quote
  | union
  | typecons
  | datatype
  | datacons
  | data
  | type
  | mod
  | not_yet

export type pi = {
  kind: "Value.pi"
  arg_t: Value
  ret_t_cl: Closure.Closure
}

export const pi = (arg_t: Value, ret_t_cl: Closure.Closure): pi => ({
  kind: "Value.pi",
  arg_t,
  ret_t_cl,
})

export type fn = {
  kind: "Value.fn"
  ret_cl: Closure.Closure
}

export const fn = (ret_cl: Closure.Closure): fn => ({
  kind: "Value.fn",
  ret_cl,
})

export type case_fn = {
  kind: "Value.case_fn"
  ret_cl: Array<Closure.Closure>
}

export const case_fn = (ret_cl: Array<Closure.Closure>): case_fn => ({
  kind: "Value.case_fn",
  ret_cl,
})

export type cls = {
  kind: "Value.cls"
  sat: Array<{ name: string; t: Value; value: Value }>
  tel: Telescope.Telescope
}

export const cls = (
  sat: Array<{ name: string; t: Value; value: Value }>,
  tel: Telescope.Telescope
): cls => ({
  kind: "Value.cls",
  sat,
  tel,
})

export type obj = {
  kind: "Value.obj"
  properties: Map<string, Value>
}

export const obj = (properties: Map<string, Value>): obj => ({
  kind: "Value.obj",
  properties,
})

export type equal = {
  kind: "Value.equal"
  t: Value
  from: Value
  to: Value
}

export const equal = (t: Value, from: Value, to: Value): equal => ({
  kind: "Value.equal",
  t,
  from,
  to,
})

export type same = {
  kind: "Value.same"
}

export const same: same = {
  kind: "Value.same",
}

export type absurd = {
  kind: "Value.absurd"
}

export const absurd: absurd = {
  kind: "Value.absurd",
}

export type str = {
  kind: "Value.str"
}

export const str: str = {
  kind: "Value.str",
}

export type quote = {
  kind: "Value.quote"
  str: string
}

export const quote = (str: string): quote => ({
  kind: "Value.quote",
  str,
})

export type union = {
  kind: "Value.union"
  left: Value
  right: Value
}

export const union = (left: Value, right: Value): union => ({
  kind: "Value.union",
  left,
  right,
})

export type typecons = {
  kind: "Value.typecons"
  name: string
  t: Value
  delayed: DelayedSums.DelayedSums
}

export const typecons = (
  name: string,
  t: Value,
  delayed: DelayedSums.DelayedSums
): typecons => ({
  kind: "Value.typecons",
  name,
  t,
  delayed,
})

export type datatype = {
  kind: "Value.datatype"
  typecons: typecons
  args: Array<Value>
  t: Value
}

export const datatype = (
  typecons: typecons,
  args: Array<Value>,
  t: Value
): datatype => ({
  kind: "Value.datatype",
  typecons,
  args,
  t,
})

export type datacons = {
  kind: "Value.datacons"
  typecons: typecons
  tag: string
  t: Value
}

export const datacons = (
  typecons: typecons,
  tag: string,
  t: Value
): datacons => ({
  kind: "Value.datacons",
  typecons,
  tag,
  t,
})

export type data = {
  kind: "Value.data"
  datacons: datacons
  args: Array<Value>
  t: Value
}

export const data = (
  datacons: datacons,
  args: Array<Value>,
  t: Value
): data => ({
  kind: "Value.data",
  datacons,
  args,
  t,
})

export type mod = {
  kind: "Value.mod"
  modpath: Modpath.Modpath
  mod: Mod.Mod
}

export const mod = (modpath: Modpath.Modpath, mod: Mod.Mod): mod => ({
  kind: "Value.mod",
  modpath,
  mod,
})

export type type = {
  kind: "Value.type"
}

export const type: type = {
  kind: "Value.type",
}

export type not_yet = {
  kind: "Value.not_yet"
  t: Value
  neutral: Neutral.Neutral
}

export const not_yet = (t: Value, neutral: Neutral.Neutral): not_yet => ({
  kind: "Value.not_yet",
  t,
  neutral,
})