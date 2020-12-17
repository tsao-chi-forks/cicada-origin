import { Exp } from "../exp"
import { Value } from "../value"
import { Mod } from "../mod"
import { Ctx } from "../ctx"
import { Readbackable } from "../readbackable"

export type ReadbackAsType = Readbackable & {
  readback_as_type: (the: { mod: Mod; ctx: Ctx }) => Exp
}

export function ReadbackAsType(the: {
  readback_as_type: (the: { mod: Mod; ctx: Ctx }) => Exp
}): ReadbackAsType {
  return {
    ...the,
    readbackability: (_, { mod, ctx }) => the.readback_as_type({ mod, ctx }),
  }
}
