class EmotionsParser
  def initialize
    @@ops = eval(File.open('lib/emotions/emotions.rb') {|f| f.read })
  end
  def extracts_countable_words(post)
    countable_pos = %w{JJ JJR JJS NN NNP NNPS NNS RBS VB VBD VBG VBN VBP VBZ WDT }
    countable = []
    tgr = EngTagger.new
    sentences = tgr.get_sentences(post)
    for s in sentences do
      tagged = tgr.get_readable(s).split()
      next if tagged == nil
      for word in tagged do
        puts "testing "+word
        split = word.split('/')
        pos = split[1]
        w = split[0]
        puts "chceking pos #{pos}"
        res =  countable_pos.select {|v| v == pos}
        if res.length == 1
          puts "adding #{w} to countable"
          w = w.downcase
          if w.end_with?('.')
            l = w.length-1
            w = w[0..l]
          end
          countable.push(w)
        end
      end
    end
    return countable
  end

  #simple algorithm for extracting emotions from posts
  #1) split post to sentences
  #2) for each sentence: find adjective (JJ, JJR and JJS will be added later)
  #   for every adjective check if emotion defined, noemotions then test for smiley if not skip the sentence
  #3) if emotion found test if sentence starts with nnp (Am, Is, Limor), vbd (was) if it is skip
  #   if sentence is not in the first sence (PRP = I) then skip, or no PRP
  #4) if past tense skip (VBD, VBN)
  #5) get the happiness scale and add to the average
  def pars_post(post)
    post.downcase!
    tgr = EngTagger.new
    start = Time.now
    sentences = tgr.get_sentences(post)
#    puts "PARSING #{sentences.to_s}"
    sum = 0;
    num = 0;
    for s in sentences do
      sen_start = Time.now
      tagged = s #tgr.get_readable(s)
      #puts "TAGGED #{tagged.to_s}"
      next if tagged == nil
      arr = tagged.split(' ');
      #This rule removed bacause specifiying someone elses mood reflects yours
      #next if arr[0].end_with?('/NNP')
      #test if starts with PAST  if yes skip
      #see if return it
      #next if arr[0].end_with?('/VBD')
      #test if PRP and not I
      #see if return it
      #next if arr[0].end_with?('/PRP') and arr[0].split('/')[0] != 'I'
      an_res = analyze_sentence(arr)
      local_sum = an_res[0]
      local_num = an_res[1]
      relevant = an_res[2]

      if local_sum == 0 and relevant
        #test for smileys
        res = check_for_smileys(s)
#        puts "SMILEY TEST #{res}"
        local_sum +=res[0]
        local_num+=res[1]
      end
      sum+=local_sum
      num+=local_num
#      puts "SENTENCE PARSED IN #{Time.now.usec-sen_start.usec}"
    end
    puts "POST PARSED IN #{Time.now.usec-start.usec}"
    return 0 if num == 0
    return sum/num
  end


  private
  def has_smiley(sentence ,smiley)
    return true if sentence.scan(smiley).size() > 0
    sm = smiley.gsub(/(.{1})(?=.)/, '\1 \2')
    return true if sentence.scan(sm).size() > 0
    sm = smiley.dup.insert(1, ' ')
    return true if sentence.scan(sm).size() > 0
    unless smiley.size < 3
      sm = smiley.dup.insert(2, ' ')
      return true if sentence.scan(sm).size() > 0
    end
    unless smiley.size < 4
      sm = smiley.dup.insert(3, ' ')
      return true if sentence.scan(sm).size() > 0
    end
  end


  def check_for_smileys(s)
    sum = 0
    num = 0
    smileys = @@ops[:smileys]
    for smiley in smileys
      if has_smiley(s,smiley[0])
        sum += smiley[1]
        num += 1
      end
    end
    return [sum,num]
  end

  def analyze_sentence(arr)
#    puts "ANALYZING SENTENCE #{arr.to_s}"
    i = 0
    relevant = true
    sum = 0
    num = 0
    for word in arr do
#      puts "CHECKING WORD #{word}"
#      if word.end_with?('/JJ') || word.end_with?('/NNP')
#        word = word.split('/')[0]
#        puts "UNTAGGED WORD #{word}"
        dict = @@ops[word]
#        puts "dictionary value for #{word} is #{dict}"
        unless dict == nil
          num+=1
          tmp_sum=dict[:v]
          #check if previous word in sentence is RB and if it is in dictionary
          unless i == 0
            prev = arr[i-1]
#            if prev.end_with?('/RB')
              prev = prev.split('/')[0]
              score = dict[prev]
              tmp_sum=score unless score == nil
#            end
          end
#          puts "WORD SCORE #{tmp_sum} total #{sum+tmp_sum}"
          sum+=tmp_sum
        end
#      elsif word.end_with?('/VBD') or word.end_with?('/VBN')
        #4) if past tense skip (VBD, VBN), clear all scores for the sentence
#        relevant = false
#        num = 0
#        sum = 0
#        break
#      end
      i =i+1
    end
    return [sum,num,relevant]
  end
end
