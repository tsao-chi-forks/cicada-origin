package xieyuheng.cicada

import collection.immutable.ListMap
import scala.util.{ Try, Success, Failure }

import pretty._
import eval._
import check._
import readback._

object infer {

  def infer(env: Env, exp: Exp): Value = {
    try {
      exp match {
        case Var(name: String) =>
          env.lookup_type(name) match {
            case Some(t) => t
            case None =>
              throw Report(List(
                s"can not find var: ${name} in env\n"
              ))
          }

        case Type() =>
          ValueType()

        case StrType() =>
          ValueType()

        case Str(str: String) =>
          ValueStrType()

        // check(local_env, A1, type)
        // fresh_var = fresh_var_from(x1)
        // local_env = local_env.ext(x1, eval(local_env, A1), fresh_var)
        // ...
        // check(local_env, R, type)
        // ------------
        // infer(local_env, { x1 : A1, x2 : A2, ... -> R }) = type
        case Pi(type_map: ListMap[String, Exp], return_type: Exp) =>
          var local_env = env
          type_map.foreach {
            case (name, t) =>
              check(local_env, t, ValueType())
              val fresh_var = util.fresh_var_from(s"infer:Pi:${name}")
              local_env = local_env.ext(name, eval(local_env, t), fresh_var)
          }
          check(local_env, return_type, ValueType())
          ValueType()

        case Fn(type_map: ListMap[String, Exp], body: Exp) =>
          ???
//           var local_ctx = ctx
//           type_map.foreach {
//             case (name, exp) =>
//               check(env, local_ctx, exp, ValueType())
//               local_ctx = local_ctx.ext(name, eval(env, exp))
//           }
//           val return_type_value = infer(env, local_ctx, body)
//           val return_type = readback(return_type_value)
//           ValuePi(Telescope(type_map, env), return_type)

        case FnCase(cases) =>
          throw Report(List(
            s"the language is not designed to infer the type of FnCase: ${exp}\n"
          ))

        // TODO
        // ------------
        // infer(local_env, { x1 = d1 : A1, x2 = d2 : A2, ..., y1 : B1, y2 : B2, ... }) = type
        case Cl(defined, type_map: ListMap[String, Exp]) =>
          ???
//           var local_env = env
//           var local_ctx = ctx
//           defined.foreach {
//             case (name, (t, v)) =>
//               check(local_env, local_ctx, t, ValueType())
//               val t_value = eval(local_env, t)
//               check(local_env, local_ctx, v, t_value)
//               val v_value = eval(local_env, v)
//               local_ctx = local_ctx.ext(name, t_value)
//               local_env = local_env.ext(name, v_value)
//           }
//           type_map.foreach {
//             case (name, t) =>
//               check(local_env, local_ctx, t, ValueType())
//               local_ctx = local_ctx.ext(name, eval(env, t))
//           }
//           ValueType()

        case Obj(value_map: ListMap[String, Exp]) =>
          ???
//           ValueClInferedFromObj(value_map.map {
//             case (name, exp) =>
//               val value = eval(env, exp)
//               (name, infer(env, ctx, readback(value)))
//           })

        // { x1 : A1, x2 : A2, ... -> R } @ telescope_env = infer(env, f)
        // check(env, a1, eval(telescope_env, A1))
        // telescope_env = telescope_env.ext(x1, eval(env, a1), eval(telescope_env, A1))
        // ...
        // ------------
        // infer(env, f(a1, a2, ...)) = eval(telescope_env, R)
        case Ap(target: Exp, arg_list: List[Exp]) =>
          ???
//           infer(env, ctx, target) match {
//             case ValuePi(telescope: Telescope, return_type: Exp) =>
//               val value_list = arg_list.map { eval(env, _) }
//               val (new_defined, new_telescope) = telescope_apply(telescope, value_list)
//               eval(new_telescope.env, return_type)

//             case ValueType() =>
//               eval(env, target) match {
//                 case ValueCl(defined, telescope) =>
//                   val value_list = arg_list.map { eval(env, _) }
//                   val (new_defined, new_telescope) = telescope_apply(telescope, value_list)
//                   ValueType()

//                 case t =>
//                   throw Report(List(
//                     s"expecting ValueCl but found: ${t}\n"
//                   ))
//               }

//             case t =>
//               throw Report(List(
//                 s"expecting ValuePi type but found: ${t}\n"
//               ))
//           }

//         // CASE `ValueClInferedFromObj`
//         // TODO maybe we should not use `ValueClInferedFromObj`
//         // [infer] env |- e : ValueClInferedFromObj { ..., m : T, ... }
//         // ------------
//         // [infer] env |- e.m : T
//         // CASE `ValueCl` TODO
        case Dot(target: Exp, field: String) =>
          ???
//           val t_infered = infer(env, ctx, target)

//           t_infered match {
//             case ValueClInferedFromObj(type_map: ListMap[String, Value]) =>
//               type_map.get(field) match {
//                 case Some(t) => t
//                 case None =>
//                   throw Report(List(
//                     s"infer fail\n" +
//                       s"on ValueClInferedFromObj\n" +
//                       s"target exp: ${pretty_exp(target)}\n" +
//                       s"infered target type: ${pretty_value(t_infered)}\n" +
//                       s"can not find field for dot: ${field}\n"
//                   ))
//               }

//             case ValueCl(defined, telescope) =>
//               defined.get(field) match {
//                 case Some((t, v)) =>
//                   infer(env, ctx, readback(v))
//                 case None =>
//                   util.telescope_force(telescope, telescope.name_list).get(field) match {
//                     case Some(t) => t
//                     case None =>
//                       throw Report(List(
//                         s"infer fail\n" +
//                           s"on ValueCl\n" +
//                           s"target exp: ${pretty_exp(target)}\n" +
//                           s"infered target type: ${pretty_value(t_infered)}\n" +
//                           s"can not find field for dot: ${field}\n"
//                       ))
//                   }
//               }

//             case t =>
//               throw Report(List(
//                 s"expecting class\n" +
//                   s"found type: ${pretty_value(t)}\n" +
//                   s"target: ${pretty_exp(target)}\n"
//               ))
//           }

        case Block(block_entry_map: ListMap[String, BlockEntry], body: Exp) =>
          ???
//           var local_ctx = ctx
//           block_entry_map.foreach {
//             case (name, BlockEntryLet(exp)) =>
//               local_ctx = local_ctx.ext(name, eval(env, exp))
//             case (name, BlockEntryDefine(_t, exp)) =>
//               local_ctx = local_ctx.ext(name, eval(env, exp))
//           }
//           infer(env, local_ctx, body)

      }
    } catch {
      case report: Report =>
        report.throw_prepend(
          s"infer fail\n" +
            s"exp: ${pretty_exp(exp)}\n"
        )
    }

  }

}
