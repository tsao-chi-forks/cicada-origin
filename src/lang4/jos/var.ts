import { Jo } from "../jo"
import { World } from "../world"

export type Var = Jo & {
  name: string
}

export function Var(name: string): Var {
  return {
    name,
    compose: var_lookup(name),
    cut: var_lookup(name),
  }
}

const var_lookup = (name: string) => (world: World) => {
  const value = world.env.lookup(name)
  if (value === undefined) throw new Error(`undefined name ${name}`)
  return value.comeout(world)
}
