import { Env } from "../env"
import { Value } from "../value"
import { Trace } from "../trace"
import * as Cores from "../cores"

type CtxEntry = {
  t: Value
  value?: Value
}

export class Ctx {
  entries: Map<string, CtxEntry>

  constructor(entries: Map<string, CtxEntry> = new Map()) {
    this.entries = entries
  }

  names(): Array<string> {
    return Array.from(this.entries.keys())
  }

  extend(name: string, t: Value, value?: Value): Ctx {
    return new Ctx(new Map([...this.entries, [name, { t, value }]]))
  }

  refine(name: string, value: Value): Ctx {
    const t = this.lookup_type(name)
    if (!t) {
      throw new Trace(`I can not refine unknown type name: ${name}`)
    }

    return new Ctx(new Map([...this.entries, [name, { t, value }]]))
  }

  lookup_type(name: string): undefined | Value {
    const entry = this.entries.get(name)
    if (entry !== undefined) return entry.t
    else return undefined
  }

  to_env(): Env {
    let env = new Env()
    for (const [name, { t, value }] of this.entries) {
      if (value !== undefined) {
        env = env.extend(name, value)
      } else {
        env = env.extend(
          name,
          new Cores.NotYetValue(t, new Cores.VarNeutral(name))
        )
      }
    }
    return env
  }
}
