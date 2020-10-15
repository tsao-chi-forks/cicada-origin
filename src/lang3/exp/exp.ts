import * as Stmt from "../stmt"

export type Exp =
  | v
  | pi
  | fn
  | ap
  | cls
  | obj
  | dot
  | equal
  | same
  | replace
  | absurd
  | absurd_ind
  | str
  | quote
  | union
  | datatype
  | type
  | begin
  | the

export interface v {
  kind: "Exp.v"
  name: string
}

export const v = (name: string): v => ({
  kind: "Exp.v",
  name,
})

export interface pi {
  kind: "Exp.pi"
  name: string
  arg_t: Exp
  ret_t: Exp
}

export const pi = (name: string, arg_t: Exp, ret_t: Exp): pi => ({
  kind: "Exp.pi",
  name,
  arg_t,
  ret_t,
})

export interface fn {
  kind: "Exp.fn"
  name: string
  ret: Exp
}

export const fn = (name: string, ret: Exp): fn => ({
  kind: "Exp.fn",
  name,
  ret,
})

export interface ap {
  kind: "Exp.ap"
  target: Exp
  arg: Exp
}

export const ap = (target: Exp, arg: Exp): ap => ({
  kind: "Exp.ap",
  target,
  arg,
})

export interface cls {
  kind: "Exp.cls"
  sat: Array<{ name: string; t: Exp; exp: Exp }>
  scope: Array<{ name: string; t: Exp }>
}

export const cls = (
  sat: Array<{ name: string; t: Exp; exp: Exp }>,
  scope: Array<{ name: string; t: Exp }>
): cls => ({
  kind: "Exp.cls",
  sat,
  scope,
})

export interface obj {
  kind: "Exp.obj"
  properties: Map<string, Exp>
}

export const obj = (properties: Map<string, Exp>): obj => ({
  kind: "Exp.obj",
  properties,
})

export interface dot {
  kind: "Exp.dot"
  target: Exp
  name: string
}

export const dot = (target: Exp, name: string): dot => ({
  kind: "Exp.dot",
  target,
  name,
})

export interface equal {
  kind: "Exp.equal"
  t: Exp
  from: Exp
  to: Exp
}

export const equal = (t: Exp, from: Exp, to: Exp): equal => ({
  kind: "Exp.equal",
  t,
  from,
  to,
})

export interface same {
  kind: "Exp.same"
}

export const same: same = {
  kind: "Exp.same",
}

export interface replace {
  kind: "Exp.replace"
  target: Exp
  motive: Exp
  base: Exp
}

export const replace = (target: Exp, motive: Exp, base: Exp): replace => ({
  kind: "Exp.replace",
  target,
  motive,
  base,
})

export interface absurd {
  kind: "Exp.absurd"
}

export const absurd: absurd = {
  kind: "Exp.absurd",
}

export interface absurd_ind {
  kind: "Exp.absurd_ind"
  target: Exp
  motive: Exp
}

export const absurd_ind = (target: Exp, motive: Exp): absurd_ind => ({
  kind: "Exp.absurd_ind",
  target,
  motive,
})

export interface str {
  kind: "Exp.str"
}

export const str: str = {
  kind: "Exp.str",
}

export interface quote {
  kind: "Exp.quote"
  str: string
}

export const quote = (str: string): quote => ({
  kind: "Exp.quote",
  str,
})

export interface union {
  kind: "Exp.union"
  left: Exp
  right: Exp
}

export const union = (left: Exp, right: Exp): union => ({
  kind: "Exp.union",
  left,
  right,
})

export interface FormalArg {
  name?: string,
  t: Exp
}

export interface SumEntry {
  tag: string
  args: Array<FormalArg>
  ret_args: Array<FormalArg>
}

export interface datatype {
  kind: "Exp.datatype"
  name: string
  args: Array<FormalArg>
  sums: Array<SumEntry>
}

export const datatype = (
  name: string,
  args: Array<FormalArg>,
  sums: Array<SumEntry>
): datatype => ({
  kind: "Exp.datatype",
  name,
  args,
  sums,
})

export interface type {
  kind: "Exp.type"
}

export const type: type = {
  kind: "Exp.type",
}

export interface begin {
  kind: "Exp.begin"
  stmts: Array<Stmt.Stmt>
  ret: Exp
}

export const begin = (stmts: Array<Stmt.Stmt>, ret: Exp): begin => ({
  kind: "Exp.begin",
  stmts,
  ret,
})

export interface the {
  kind: "Exp.the"
  t: Exp
  exp: Exp
}

export const the = (t: Exp, exp: Exp): the => ({
  kind: "Exp.the",
  t,
  exp,
})
