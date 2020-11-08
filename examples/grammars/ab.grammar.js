// equal number of "a" "b"

module.exports = {
  $start: "ab",
  ab: {
    "ab:head_a": ['"a"', "b"],
    "ab:head_b": ['"b"', "a"],
  },
  a: {
    "a:one_a": ['"a"'],
    "a:more_a": ['"a"', "ab"],
    "a:after_b": ['"b"', "a", "a"],
  },
  b: {
    "b:one_b": ['"b"'],
    "b:more_b": ['"b"', "ab"],
    "b:after_a": ['"a"', "b", "b"],
  },
}
