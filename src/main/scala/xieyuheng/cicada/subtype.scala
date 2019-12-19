package xieyuheng.cicada

import java.util.UUID

import collection.immutable.ListMap

import eval._
import equivalent._
import pretty._

object subtype {

  def subtype(ctx: Ctx, s: Value, t: Value): Unit = {
    try {
      (s, t) match {
        case (s: ValuePi, ValueType()) => ()

        case (s: ValueClAlready, ValueType()) => ()

        case (s: ValuePi, t: ValuePi) =>
          if (s.arg_type_map.size != t.arg_type_map.size) {
            throw Report(List(s"subtype fail on ValuePi, arity mis-match"))
          } else {
            val name_list = s.arg_type_map.keys.zip(t.arg_type_map.keys).map {
              case (s_name, t_name) =>
                val uuid: UUID = UUID.randomUUID()
                s"#subtype-pi-type:${s_name}:${t_name}:${uuid}"
            }.toList
            val (s_arg_type_map, s_return_type) =
              util.force_telescope_with_return(
                name_list, s.arg_type_map, s.return_type, s.env)
            val (t_arg_type_map, t_return_type) =
              util.force_telescope_with_return(
                name_list, t.arg_type_map, t.return_type, t.env)
            subtype_list_map(ctx, t_arg_type_map, s_arg_type_map)
            subtype(ctx, s_return_type, t_return_type)
          }

        case (s: ValueClAlready, t: ValueClAlready) =>
          subtype_list_map(ctx, s.type_map, t.type_map)

        case (s: ValueCl, t: ValueClAlready) =>
          val name_list = s.type_map.keys.toList
          val type_map = util.force_telescope(name_list, s.type_map, s.env)
          subtype_list_map(ctx, type_map, t.type_map)

        case (s: ValueClAlready, t: ValueCl) =>
          val name_list = t.type_map.keys.toList
          val type_map = util.force_telescope(name_list, t.type_map, t.env)
          subtype_list_map(ctx, s.type_map, type_map)

        case (s, t) =>
          equivalent(ctx, s, t)
      }
    } catch {
      case report: Report =>
        report.prepend(
          s"subtype fail\n" +
            s"s: ${pretty_value(s)}\n" +
            s"t: ${pretty_value(t)}\n")
    }
  }

  def subtype_list_map(
    ctx: Ctx,
    s_map: ListMap[String, Value],
    t_map: ListMap[String, Value],
  ): Unit = {
    t_map.foreach {
      case (name, t) =>
        s_map.get(name) match {
          case Some(s) =>
            subtype(ctx, s, t)
          case None =>
            throw Report(List(s"subtype_list_map can not find field: ${name}"))
        }
    }
  }

}
