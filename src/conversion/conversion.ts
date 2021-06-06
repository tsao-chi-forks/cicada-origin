import { Core, AlphaCtx } from "../core"
import { Value } from "../value"
import { Ctx } from "../ctx"
import { readback } from "../readback"
import { Trace } from "../trace"
import * as Cores from "../cores"
import * as ut from "../ut"

export function conversion(ctx: Ctx, t: Value, x: Value, y: Value): boolean {
  return alpha_equivalent(ctx, readback(ctx, t, x), readback(ctx, t, y))
}

function alpha_equivalent(ctx: Ctx, x: Core, y: Core): boolean {
  const names = ctx.names()
  // const alpha_ctx = names.reduce(
  //   (alpha_ctx, name) => alpha_ctx.extend(name),
  //   new AlphaCtx()
  // )
  const alpha_ctx = new AlphaCtx()
  const x_repr = x.alpha_repr(alpha_ctx)
  const y_repr = y.alpha_repr(alpha_ctx)

  // // TODO
  // if (
  //   names[names.length - 1] === "equal" &&
  //   names[names.length - 2] === "j" &&
  //   names[names.length - 3] === "almost"
  // ) {
  //   if (x_repr !== y_repr) {
  //     console.log("(x_repr !== y_repr)")
  //   }
  //   console.log("names --", ctx.names())
  //   console.log("x --", x_repr, x)
  //   console.log("y --", y_repr, y)
  // }

  return x_repr === y_repr
}

export function check_conversion(
  ctx: Ctx,
  t: Value,
  from: Value,
  to: Value,
  opts: {
    description?: {
      from: string
      to: string
    }
  }
): void {
  if (!conversion(ctx, t, from, to)) {
    const t_repr = readback(ctx, new Cores.TypeValue(), t).repr()
    const from_repr = readback(ctx, t, from).repr()
    const from_description = opts.description?.from || ""
    const to_repr = readback(ctx, t, to).repr()
    const to_description = opts.description?.to || ""
    throw new Trace(
      ut.aline(`
        |I am expecting the following two values to be the same ${t_repr}.
        |But they are not.
        |from ${from_description}:
        |  ${from_repr}
        |to ${from_description}:
        |  ${to_repr}
        |`)
    )
  }
}
