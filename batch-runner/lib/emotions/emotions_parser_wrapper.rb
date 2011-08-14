require "java"
require "lib/jwnl-1.3.3.jar"
require "lib/moods_parser.jar"
require "lib/opennlp-maxent-3.0.1-incubating.jar"
require "lib/opennlp-tools-1.5.1-incubating.jar"
require "lib/emotions/emotions"

import com.feelogg.ei.parser.EmotionsParser
import java.util.HashMap

class EmotionsParserWrapper
  def initialize
    @@ops = eval(File.open('lib/emotions/emotions.rb') {|f| f.read })
    map = HashMap.new
    @@ops.each_pair{|k, v|
      tmp = HashMap.new
      v.each_pair{|key,val|
          tmp.put(key.to_s, java.lang.Integer.new(val.to_i))
      }
      map.put(k.to_s, tmp)
    }
    puts "MAP DONE"

    @@java_parser = EmotionsParser.new map
  end
  def extracts_countable_words(post)
    @@java_parser.extracts_countable_words(post)
  end

  def pars_post(post)
    @@java_parser.pars_post(post)
  end
end
