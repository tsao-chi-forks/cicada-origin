import { Neutral } from "../neutral"
import { Normal } from "../normal"
import { Exp } from "../exp"
import { Ctx } from "../ctx"
import { Car } from "../core"
import { readback_neutral } from "../readback"

export class CarNeutral {
  kind: "Neutral.car" = "Neutral.car"
  target: Neutral

  constructor(target: Neutral) {
    this.target = target
  }

  readback_neutral(ctx: Ctx): Exp {
    return new Car(readback_neutral(ctx, this.target))
  }
}