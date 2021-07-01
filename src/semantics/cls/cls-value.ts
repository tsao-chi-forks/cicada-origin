import { Ctx } from "../../ctx"
import { Exp } from "../../exp"
import { Core } from "../../core"
import { Value } from "../../value"
import { readback } from "../../value"
import { evaluate } from "../../core"
import { check } from "../../exp"
import { Trace } from "../../errors"
import * as ut from "../../ut"
import * as Sem from "../../sem"
import { ClsClosure } from "./cls-closure"

export abstract class ClsValue extends Value {
  instanceofSemClsValue = true

  constructor() {
    super()
  }

  abstract field_names: Array<string>
  abstract readback(ctx: Ctx, t: Value): Core | undefined
  abstract check_properties(
    ctx: Ctx,
    properties: Map<string, Exp>
  ): Map<string, Core>

  abstract dot_value(target: Value, field_name: string): Value
  abstract dot_type(target: Value, field_name: string): Value

  abstract eta_expand_properties(ctx: Ctx, value: Value): Map<string, Core>

  eta_expand(ctx: Ctx, value: Value): Core {
    return new Sem.ObjCore(this.eta_expand_properties(ctx, value))
  }

  abstract extend_ctx(
    ctx: Ctx,
    renamings: Array<{ field_name: string; local_name: string }>
  ): {
    ctx: Ctx
    renamings: Array<{ field_name: string; local_name: string }>
  }

  abstract apply(arg: Value): Value
}

export class ClsNilValue extends ClsValue {
  get field_names(): Array<string> {
    return []
  }

  check_properties(ctx: Ctx, properties: Map<string, Exp>): Map<string, Core> {
    return new Map()
  }

  readback(ctx: Ctx, t: Value): Core | undefined {
    if (t instanceof Sem.TypeValue) {
      return new Sem.ClsNil()
    }
  }

  dot_value(target: Value, field_name: string): Value {
    throw new Trace(
      [
        `I can not dot the value out of class`,
        `because I meet an unknown field name:`,
        `  ${field_name}`,
      ].join("\n") + "\n"
    )
  }

  dot_type(target: Value, field_name: string): Value {
    throw new Trace(
      [
        `I can not dot the type out of class`,
        `because I meet an unknown field name:`,
        `  ${field_name}`,
      ].join("\n") + "\n"
    )
  }

  eta_expand_properties(ctx: Ctx, value: Value): Map<string, Core> {
    return new Map()
  }

  extend_ctx(
    ctx: Ctx,
    renamings: Array<{ field_name: string; local_name: string }>
  ): {
    ctx: Ctx
    renamings: Array<{ field_name: string; local_name: string }>
  } {
    return { ctx, renamings }
  }

  apply(arg: Value): Value {
    throw new Error("TODO")
  }
}

export class ClsConsValue extends ClsValue {
  field_name: string
  field_t: Value
  rest_t_cl: ClsClosure

  constructor(field_name: string, field_t: Value, rest_t_cl: ClsClosure) {
    super()
    this.field_name = field_name
    this.field_t = field_t
    this.rest_t_cl = rest_t_cl
  }

  get field_names(): Array<string> {
    return [this.field_name, ...this.rest_t_cl.rest_t.field_names]
  }

  check_properties(ctx: Ctx, properties: Map<string, Exp>): Map<string, Core> {
    const exp = properties.get(this.field_name)

    if (exp === undefined) {
      throw new Trace(`I expect to find field: ${this.field_name}`)
    }

    const field_core = check(ctx, exp, this.field_t)
    const rest_t_value = this.rest_t_cl.apply(
      evaluate(ctx.to_env(), field_core)
    )

    return new Map([
      [this.field_name, field_core],
      ...rest_t_value.check_properties(ctx, properties),
    ])
  }

  readback(ctx: Ctx, t: Value): Core | undefined {
    if (t instanceof Sem.TypeValue) {
      const fresh_name = ut.freshen_name(
        new Set(ctx.names),
        this.rest_t_cl.local_name
      )
      const variable = new Sem.NotYetValue(
        this.field_t,
        new Sem.VarNeutral(fresh_name)
      )
      const field_t = readback(ctx, new Sem.TypeValue(), this.field_t)
      const rest_t = readback(
        ctx.extend(fresh_name, this.field_t),
        new Sem.TypeValue(),
        this.rest_t_cl.apply(variable)
      )

      if (!(rest_t instanceof Sem.ClsCore)) {
        throw new Trace("I expect rest_t to be Sem.Cls")
      }

      return new Sem.ClsCons(this.field_name, fresh_name, field_t, rest_t)
    }
  }

  dot_value(target: Value, field_name: string): Value {
    if (field_name === this.field_name) {
      return Sem.DotCore.apply(target, this.field_name)
    }

    return this.rest_t_cl
      .apply(Sem.DotCore.apply(target, this.field_name))
      .dot_value(target, field_name)
  }

  dot_type(target: Value, field_name: string): Value {
    if (field_name === this.field_name) {
      return this.field_t
    }

    return this.rest_t_cl
      .apply(Sem.DotCore.apply(target, this.field_name))
      .dot_type(target, field_name)
  }

  eta_expand_properties(ctx: Ctx, value: Value): Map<string, Core> {
    const property_value = Sem.DotCore.apply(value, this.field_name)

    return new Map([
      [this.field_name, readback(ctx, this.field_t, property_value)],
      ...this.rest_t_cl.apply(property_value).eta_expand_properties(ctx, value),
    ])
  }

  extend_ctx(
    ctx: Ctx,
    renamings: Array<{ field_name: string; local_name: string }>
  ): {
    ctx: Ctx
    renamings: Array<{ field_name: string; local_name: string }>
  } {
    const fresh_name = ut.freshen_name(new Set(ctx.names), this.field_name)
    const variable = new Sem.NotYetValue(
      this.field_t,
      new Sem.VarNeutral(fresh_name)
    )

    return this.rest_t_cl
      .apply(variable)
      .extend_ctx(ctx.extend(fresh_name, this.field_t), [
        ...renamings,
        { field_name: this.field_name, local_name: fresh_name },
      ])
  }

  apply(arg: Value): Value {
    throw new Error("TODO")
  }
}