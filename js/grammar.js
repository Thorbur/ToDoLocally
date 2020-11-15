// Generated automatically by nearley, version undefined
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "MAIN", "symbols": ["OR"], "postprocess": function(d) {return d[0]}},
    {"name": "COND", "symbols": ["SATTR", "_", "EQ", "_", "STR"], "postprocess": function(d) {return [d[2], d[0], d[4]]}},
    {"name": "COND", "symbols": ["NATTR", "_", "COMP", "_", "NUM"], "postprocess": function(d) {return [d[2], d[0], d[4]]}},
    {"name": "COND", "symbols": ["NATTR", "_", "EQ", "_", "NUM"], "postprocess": function(d) {return [d[2], d[0], d[4]]}},
    {"name": "COND", "symbols": ["BATTR", "_", "EQ", "_", "BOOL"], "postprocess": function(d) {return [d[2], d[0], d[4]]}},
    {"name": "COND", "symbols": ["SATTR", "_", "CONT", "_", "STR"], "postprocess": function(d) {return [d[2], d[0], d[4]]}},
    {"name": "P", "symbols": [{"literal":"(","pos":88}, "_", "OR", "_", {"literal":")","pos":96}], "postprocess": function(d) {return d[2]}},
    {"name": "P", "symbols": ["COND"], "postprocess": function(d) {return d[0]}},
    {"name": "AND$string$1", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "AND", "symbols": ["P", "_", "AND$string$1", "_", "AND"], "postprocess": function(d) {return [d[2], d[0], d[4]]}},
    {"name": "AND", "symbols": ["P"], "postprocess": id},
    {"name": "OR$string$1", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OR", "symbols": ["COND", "_", "OR$string$1", "_", "AND"], "postprocess": function(d) {return [d[2], d[0], d[4]]}},
    {"name": "OR", "symbols": ["AND"], "postprocess": function(d) {return d[0]}},
    {"name": "NATTR$string$1", "symbols": [{"literal":"d"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NATTR", "symbols": ["NATTR$string$1"], "postprocess": function(d) {return d[0]}},
    {"name": "NATTR$string$2", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"s"}, {"literal":"o"}, {"literal":"l"}, {"literal":"v"}, {"literal":"e"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NATTR", "symbols": ["NATTR$string$2"], "postprocess": function(d) {return d[0]}},
    {"name": "NATTR$string$3", "symbols": [{"literal":"i"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NATTR", "symbols": ["NATTR$string$3"], "postprocess": function(d) {return d[0]}},
    {"name": "SATTR$string$1", "symbols": [{"literal":"t"}, {"literal":"i"}, {"literal":"t"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "SATTR", "symbols": ["SATTR$string$1"], "postprocess": function(d) {return d[0]}},
    {"name": "SATTR$string$2", "symbols": [{"literal":"n"}, {"literal":"o"}, {"literal":"t"}, {"literal":"e"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "SATTR", "symbols": ["SATTR$string$2"], "postprocess": function(d) {return d[0]}},
    {"name": "SATTR$string$3", "symbols": [{"literal":"p"}, {"literal":"r"}, {"literal":"i"}, {"literal":"o"}, {"literal":"r"}, {"literal":"i"}, {"literal":"t"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "SATTR", "symbols": ["SATTR$string$3"], "postprocess": function(d) {return d[0]}},
    {"name": "SATTR$string$4", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"a"}, {"literal":"g"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "SATTR", "symbols": ["SATTR$string$4"], "postprocess": function(d) {return d[0]}},
    {"name": "BATTR$string$1", "symbols": [{"literal":"h"}, {"literal":"i"}, {"literal":"d"}, {"literal":"d"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "BATTR", "symbols": ["BATTR$string$1"], "postprocess": function(d) {return d[0]}},
    {"name": "BATTR$string$2", "symbols": [{"literal":"d"}, {"literal":"o"}, {"literal":"n"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "BATTR", "symbols": ["BATTR$string$2"], "postprocess": function(d) {return d[0]}},
    {"name": "BOOL$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "BOOL", "symbols": ["BOOL$string$1"], "postprocess": function(d) {return true}},
    {"name": "BOOL$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "BOOL", "symbols": ["BOOL$string$2"], "postprocess": function(d) {return false}},
    {"name": "COMP", "symbols": [{"literal":">","pos":228}], "postprocess": function(d) {return d[0]}},
    {"name": "COMP", "symbols": [{"literal":"<","pos":234}], "postprocess": function(d) {return d[0]}},
    {"name": "EQ", "symbols": [{"literal":"=","pos":242}], "postprocess": function(d) {return d[0]}},
    {"name": "EQ$string$1", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "EQ", "symbols": ["EQ$string$1"], "postprocess": function(d) {return d[0]}},
    {"name": "CONT", "symbols": [{"literal":"~","pos":256}], "postprocess": function(d) {return d[0]}},
    {"name": "NUM$ebnf$1", "symbols": [/[1-9]/]},
    {"name": "NUM$ebnf$1", "symbols": [/[1-9]/, "NUM$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "NUM", "symbols": ["NUM$ebnf$1"], "postprocess": function(d) {return parseInt(d[0].join(""))}},
    {"name": "STR$ebnf$1", "symbols": []},
    {"name": "STR$ebnf$1", "symbols": [/[\S\s]/, "STR$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "STR", "symbols": [{"literal":"\"","pos":273}, "STR$ebnf$1", {"literal":"\"","pos":278}], "postprocess": function(d) {return d[1].join("")}},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": [/[\s]/, "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null }}
]
  , ParserStart: "MAIN"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
