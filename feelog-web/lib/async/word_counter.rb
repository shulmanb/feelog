require 'async/fb/resque_client'

class WordCounter < ResqueClient
  @queue = :words_parsing
  def self.perform(post, mood, userid)
     puts "RECEIVED POST "+post
     countable_words = @@parser.extracts_countable_words(post)
     puts "COUNTABLE WORDS "+countable_words.to_s
     unless countable_words.length == 0
       max_counts = @@redis.hkeys(userid.to_s+":words:"+mood.to_s+":max")
       if max_counts == nil
         max_counts = []
       end
       puts "MAX_COUNTS ARRAY #{max_counts.to_s}"
       if max_counts.length > 1
         max_counts = max_counts.sort{|x,y| x[1]<=>y[1]}
       end
       for word in countable_words do
         puts "increasing count for "+word
         val = @@redis.hincrby(userid.to_s+":words:"+mood.to_s, word,1)
         #get max hash {1=>word}
         if max_counts.length < 20
            @@redis.hset(userid.to_s+":words:"+mood.to_s+":max",word,val)
            puts "adding word #{word} for max count for count #{val} as empty place"
            max_counts.push([word,val])
            max_counts.sort{|x,y|
              puts x.to_s+" "+y.to_s
              puts x[1].to_s+" "+y[1].to_s
              x[1]<=>y[1]
            }
         elsif val > max_counts[0]
           puts "adding word #{word} for max count for count #{val} as bigger value"
            @@redis.hset(userid.to_s+":words:"+mood.to_s+":max",word,val)
            max_counts.push([word,val])
            max_counts.sort{|x,y| x[1]<=>y[1]}
            toDel = max_counts.shift
            puts "removing from max count value #{toDel[0]}"
            @@redis.hdel(userid.to_s+":words:"+mood.to_s+":max",toDel[0])
         end
       end
     end
  end
end