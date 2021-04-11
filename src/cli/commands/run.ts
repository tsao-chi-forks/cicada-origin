import { EmptyLibrary, LocalLibrary } from "../../library"
import { Module } from "../../module"
import { Stmt } from "../../stmt"
import { Trace } from "../../trace"
import * as Syntax from "../../syntax"
import pt from "@cicada-lang/partech"
import strip_ansi from "strip-ansi"
import find_up from "find-up"
import Path from "path"
import fs from "fs"

export const command = "run <file>"
export const description = "Run a file"

export const builder = {
  color: { type: "boolean", default: true },
  module: { type: "boolean", default: true },
}

type Argv = {
  file: string
  color: boolean
  module: boolean
}

export const handler = async (argv: Argv) => {
  const text = fs.readFileSync(argv.file, { encoding: "utf-8" })

  try {
    const stmts = Syntax.parse_stmts(text)
    const library = argv["module"]
      ? await find_local_library(Path.dirname(argv.file))
      : new EmptyLibrary()
    const mod = new Module({ library })
    await run_stmts(mod, stmts)
  } catch (error) {
    if (error instanceof pt.ParsingError) {
      let message = error.message
      message += "\n"
      message += pt.report(error.span, text)
      console.error(argv["color"] ? message : strip_ansi(message))
      process.exit(1)
    }

    throw error
  }
}

async function find_local_library(cwd: string): Promise<LocalLibrary> {
  const config_file = await find_up("library.json", { cwd })
  if (!config_file) {
    throw new Error(
      `I can not find a library.json config file,\n` +
        `I searched upward from: ${cwd}`
    )
  }

  return LocalLibrary.from_config_file(config_file)
}

async function run_stmts(mod: Module, stmts: Array<Stmt>): Promise<void> {
  try {
    for (const stmt of stmts) await stmt.execute(mod)
    if (mod.output) {
      console.log(mod.output)
    }
  } catch (error) {
    if (error instanceof Trace) {
      console.error(error.repr((exp) => exp.repr()))
      process.exit(1)
    }

    throw error
  }
}
