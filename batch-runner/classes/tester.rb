require "lib/emotions/emotions_parser_wrapper"
parser = EmotionsParserWrapper.new
#
res = parser.pars_post("stock markets make me angry....")
puts res
#res = parser.extracts_countable_words("I will be learning a lot")
