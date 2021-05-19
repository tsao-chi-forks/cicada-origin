import { Ctx } from "../../ctx"
import { Core } from "../../core"
import { Exp } from "../../exp"
import { Value } from "../../value"
import * as Cores from "../../cores"
import { Telescope } from "../../telescope"
import { Trace } from "../../trace"
import * as ut from "../../ut"

export class ClsValue {
  telescope: Telescope
  name?: string

  constructor(telescope: Telescope, opts?: { name?: string }) {
    this.telescope = telescope
    this.name = opts?.name
  }

  check_properties(ctx: Ctx, properties: Map<string, Exp>): Map<string, Core> {
    const { cores } = this.telescope.check_properties_aux(ctx, properties)
    return cores
  }

  readback(ctx: Ctx, t: Value): Core | undefined {
    if (t instanceof Cores.TypeValue) {
      const entries = this.telescope.readback(ctx)
      return new Cores.Cls(entries, { name: this.name })
    }
  }

  eta_expand_properties(ctx: Ctx, value: Value): Map<string, Core> {
    return this.telescope.eta_expand_properties(ctx, value)
  }

  eta_expand(ctx: Ctx, value: Value): Core {
    return new Cores.Obj(this.eta_expand_properties(ctx, value))
  }

  dot_type(target: Value, name: string): Value {
    return this.telescope.dot_type(target, name)
  }

  dot_value(target: Value, name: string): Value {
    return this.telescope.dot_value(target, name)
  }

  fulled(): boolean {
    return this.telescope.fulled()
  }

  apply(arg: Value): Cores.ClsValue {
    return new Cores.ClsValue(this.telescope.apply(arg), { name: this.name })
  }

  get names(): Array<string> {
    return this.telescope.names
  }

  extend_ctx(ctx: Ctx): Ctx {
    return this.telescope.extend_ctx(ctx)
  }
}
