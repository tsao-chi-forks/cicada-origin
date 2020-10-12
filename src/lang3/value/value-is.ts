import * as Value from "../value"
import * as Ctx from "../ctx"
import * as Trace from "../../trace"

export function is_pi(ctx: Ctx.Ctx, value: Value.Value): Value.pi {
  if (value.kind === "Value.pi") {
    return value
  } else {
    throw new Trace.Trace(
      Value.unexpected(mod, ctx, value, { message: `I am expecting the type pi.` })
    )
  }
}

export function is_cls(ctx: Ctx.Ctx, value: Value.Value): Value.cls {
  if (value.kind === "Value.cls") {
    return value
  } else {
    throw new Trace.Trace(
      Value.unexpected(mod, ctx, value, { message: `I am expecting the type cls.` })
    )
  }
}

export function is_equal(ctx: Ctx.Ctx, value: Value.Value): Value.equal {
  if (value.kind === "Value.equal") {
    return value
  } else {
    throw new Trace.Trace(
      Value.unexpected(mod, ctx, value, {
        message: `I am expecting the type equal.`,
      })
    )
  }
}

export function is_absurd(ctx: Ctx.Ctx, value: Value.Value): Value.absurd {
  if (value.kind === "Value.absurd") {
    return value
  } else {
    throw new Trace.Trace(
      Value.unexpected(mod, ctx, value, {
        message: `I am expecting the type absurd.`,
      })
    )
  }
}

export function is_str(ctx: Ctx.Ctx, value: Value.Value): Value.str {
  if (value.kind === "Value.str") {
    return value
  } else {
    throw new Trace.Trace(
      Value.unexpected(mod, ctx, value, {
        message: `I am expecting the type string.`,
      })
    )
  }
}
