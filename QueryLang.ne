# Nearley grammar definition
# https://nearley.js.org

MAIN  -> OR								{% function(d) {return d[0]} %}

COND  -> SATTR _ EQ _ STR 				{% function(d) {return [d[2], d[0], d[4]]} %}
		 | NATTR _ COMP _ NUM 			{% function(d) {return [d[2], d[0], d[4]]} %}
		 | NATTR _ EQ _ NUM 			{% function(d) {return [d[2], d[0], d[4]]} %}
		 | BATTR _ EQ _ BOOL 			{% function(d) {return [d[2], d[0], d[4]]} %}
		 | SATTR _ CONT _ STR			{% function(d) {return [d[2], d[0], d[4]]} %}
		 | DATTR _ EQ _ STR				{% function(d) {return [d[2], d[0], d[4]]} %}
		 | DATTR _ COMP _ STR			{% function(d) {return [d[2], d[0], d[4]]} %}

P	  -> "(" _ OR _ ")"					{% function(d) {return d[2]} %}
		 | COND							{% function(d) {return d[0]} %}

AND	  -> P _ "and" _ AND				{% function(d) {return [d[2], d[0], d[4]]} %}
		 | P							{% id %}

OR	  -> COND _ "or" _ AND				{% function(d) {return [d[2], d[0], d[4]]} %}
		 | AND							{% function(d) {return d[0]} %}

NATTR -> "id"							{% function(d) {return d[0]} %}

SATTR -> "title" 						{% function(d) {return d[0]} %}
         | "notes" 						{% function(d) {return d[0]} %}
		 | "priority" 					{% function(d) {return d[0]} %}
		 | "stage"						{% function(d) {return d[0]} %}

DATTR -> "due"							{% function(d) {return d[0]} %}
		 | "resolved"					{% function(d) {return d[0]} %}

BATTR -> "hidden" 						{% function(d) {return d[0]} %}
         | "done"						{% function(d) {return d[0]} %}

BOOL  -> "true" 						{% function(d) {return true} %}
		 | "false"						{% function(d) {return false} %}

COMP  -> ">" 							{% function(d) {return d[0]} %}
		 | "<"							{% function(d) {return d[0]} %}

EQ	  -> "=" 							{% function(d) {return d[0]} %}
		 | "!="							{% function(d) {return d[0]} %}

CONT  -> "~"							{% function(d) {return d[0]} %}
		 | "!~"							{% function(d) {return d[0]} %}

NUM   -> [1-9]:+ 						{% function(d) {return parseInt(d[0].join(""))} %}

STR   -> "\"" ([^"]|"\\\""):* "\""		{% function(d) {return d[1].join("").replace('\\\"', '"')} %}

_	  -> [\s]:*							{% function(d) {return null } %}