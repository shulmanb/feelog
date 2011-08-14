require 'async/fb/resque_client'

class WordCounter < ResqueClient
  @queue = :words_parsing
  def self.perform(post, mood, userid)
    puts "RECEIVED POST "+post
    countable_words = @@parser.extracts_countable_words(post)
    puts "COUNTABLE WORDS "+countable_words.to_s
    unless countable_words.length == 0
      #retreiving max_counts hash for mood
      max_counts_hash = @@redis.hgetall(userid.to_s+":words:"+mood.to_s+":max")
      max_counts = []
      if max_counts_hash == nil
        max_counts_hash = {}
      else
        max_counts_hash.each_pair{|k,v|max_counts.push([k,v.to_i])}
      end
      puts "MAX_COUNTS ARR #{max_counts.to_s}"
      if max_counts.length > 1
        max_counts = max_counts.sort{|x,y| x[1]<=>y[1]}
      end
      for word in countable_words do
        puts "increasing count for "+word
        val = @@redis.hincrby(userid.to_s+":words:"+mood.to_s, word,1)
        puts "value for #{word} is #{val}"
        #get max hash {1=>word}

        if max_counts_hash[word] != nil
           max_counts_hash[word]= max_counts_hash[word].to_i + 1
           @@redis.hincrby(userid.to_s+":words:"+mood.to_s+":max",word,1)
           max_counts.each{|k,v|
             if k == word
                v+=1
             end
           }
           max_counts.sort{|x,y|
             x[1]<=>y[1]
           }
        else
          if max_counts.length < 20
             @@redis.hset(userid.to_s+":words:"+mood.to_s+":max",word,val)
             puts "adding word #{word} for max count for count #{val} as empty place"
             max_counts.push([word,val.to_i])
             max_counts_hash[word] = val.to_i
             max_counts.sort{|x,y|
               x[1]<=>y[1]
             }
             puts "max counts after sort #{max_counts.to_s}"
          elsif val > max_counts[0][1]
            max_counts.push([word,val.to_i])
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
end