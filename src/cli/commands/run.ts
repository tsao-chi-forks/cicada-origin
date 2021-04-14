import { EmptyLibrary } from "../../library/empty-library"
import { LocalLibrary } from "../../library/local-library"
import { Module } from "../../module"
import { Stmt } from "../../stmt"
import { Trace } from "../../trace"
import * as Syntax from "../../syntax"
import find_up from "find-up"
import Path from "path"
import fs from "fs"

export const command = "run <file>"
export const description = "Run a file"

export const builder = {
  module: { type: "boolean", default: true },
}

type Argv = {
  file: string
  module: boolean
}

export const handler = async (argv: Argv) => {
  const library = argv["module"]
    ? await LocalLibrary.from_config_file(
        await find_library_config_file(Path.dirname(argv.file))
      )
    : new EmptyLibrary()
  const mod = new Module({ library })

  const text = fs.readFileSync(argv.file, { encoding: "utf-8" })
  const stmts = Syntax.parse_stmts(text)

  try {
    for (const stmt of stmts) await stmt.execute(mod)
    if (mod.output) console.log(mod.output)
  } catch (error) {
    if (error instanceof Trace) {
      console.error(error.repr((exp) => exp.repr()))
      process.exit(1)
    }

    throw error
  }
}

async function find_library_config_file(cwd: string): Promise<string> {
  const config_file = await find_up("library.json", { cwd })
  if (!config_file) {
    throw new Error(
      `I can not find a library.json config file,\n` +
        `I searched upward from: ${cwd}`
    )
  }

  return config_file
}
