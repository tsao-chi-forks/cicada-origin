import { Exp, AlphaCtx } from "@/exp"
import { Ctx } from "@/ctx"
import { Env } from "@/env"
import { Value } from "@/value"
import { ClsValue, ObjValue } from "@/core"

export class Obj implements Exp {
  properties: Map<string, Exp>

  constructor(opts: { properties: Map<string, Exp> }) {
    this.properties = opts.properties
  }

  evaluate(env: Env): Value {
    throw new Error("TODO")
  }

  check(ctx: Ctx, t: Value): Value {
    throw new Error("TODO")
  }

  repr(): string {
    throw new Error("TODO")
  }

  alpha_repr(ctx: AlphaCtx): string {
    throw new Error("TODO")
  }
}