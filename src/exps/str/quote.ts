import { Exp } from "../../exp"
import { Core } from "../../core"
import { Ctx } from "../../ctx"
import { Env } from "../../env"
import { Value } from "../../value"
import * as Cores from "../../cores"

export class Quote extends Exp {
  str: string

  constructor(str: string) {
    super()
    this.str = str
  }

  infer(ctx: Ctx): { t: Value; core: Core } {
    return new Cores.StrValue()
  }

  repr(): string {
    return `"${this.str}"`
  }
}
