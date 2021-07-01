import { Ctx } from "../../ctx"
import { Core } from "../../core"
import { Value } from "../../value"
import { readback } from "../../value"
import * as Sem from "../../sem"

export class VecValue extends Value {
  head: Value
  tail: Value

  constructor(head: Value, tail: Value) {
    super()
    this.head = head
    this.tail = tail
  }

  readback(ctx: Ctx, t: Value): Core | undefined {
    if (t instanceof Sem.VectorValue) {
      return new Sem.Vec(
        readback(ctx, t.elem_t, this.head),
        readback(ctx, t, this.tail)
      )
    }
  }
}