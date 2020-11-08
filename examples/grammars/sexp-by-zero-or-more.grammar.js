// Symbol expression (a.k.a. sexp) -- implemented by zero_or_more

module.exports = {
  $start: "sexp",

  identifier: { $pattern: ["identifier"] },

  sexp: {
    "sexp:symbol": ["identifier"],
    "sexp:list": ['"("', { $ap: ["zero_or_more", "sexp"] }, '")"'],
  },

  zero_or_more: {
    $fn: [
      "x",
      {
        "zero_or_more:zero": [],
        "zero_or_more:more": [
          { head: "x" },
          { tail: { $ap: ["zero_or_more", "x"] } },
        ],
      },
    ],
  },
}
