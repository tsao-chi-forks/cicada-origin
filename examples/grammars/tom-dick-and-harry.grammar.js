// tom dick and harry

module.exports = {
  $start: "tom_dick_and_harry",

  tom_dick_and_harry: {
    "tom_dick_and_harry:name": ["name"],
    "tom_dick_and_harry:list": [
      { $ap: ["one_or_more", "name_entry"] },
      '"and"',
      "name",
    ],
  },

  name: {
    "name:tom": ['"tom"'],
    "name:dick": ['"dick"'],
    "name:harry": ['"harry"'],
  },

  name_entry: {
    "name_entry:name_alone": ["name"],
    "name_entry:name_comma": ["name", '","'],
  },

  one_or_more: {
    $fn: [
      "x",
      {
        "one_or_more:one": [{ value: "x" }],
        "one_or_more:more": [
          { head: "x" },
          { tail: { $ap: ["one_or_more", "x"] } },
        ],
      },
    ],
  },
}
