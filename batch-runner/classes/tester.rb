require "..lib/emotions/emotions_parser_wrapper"
parser = EmotionsParserWrapper.new
#
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")
#res = parser.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!")



res = parser.extracts_countable_words("ok , until now i was loughing my way to the bank amid the big drops of rain , but now it is not funny any more... rainy on monday? my first \"summer vacation day\" ???!!!")
res = parser.extracts_countable_words("I learned a lot")
res = parser.extracts_countable_words("I'm learning a lot")
res = parser.extracts_countable_words("I was going to  learn a lot")
res = parser.extracts_countable_words("I will be learning a lot")
