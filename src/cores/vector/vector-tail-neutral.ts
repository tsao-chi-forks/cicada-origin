import { Neutral } from "../../neutral"
import { Core } from "../../core"
import { Ctx } from "../../ctx"
import * as Cores from "../../cores"

export class VectorTailNeutral implements Neutral {
  target: Neutral

  constructor(target: Neutral) {
    this.target = target
  }

  readback_neutral(ctx: Ctx): Core {
    return new Cores.VectorTail(this.target.readback_neutral(ctx))
  }
}