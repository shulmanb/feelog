class EmotionsParser
  def initialize
    @@ops = eval(File.open('lib/emotions/emotions.rb') {|f| f.read })
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
    tgr = EngTagger.new
    sentences = tgr.get_sentences(post)
    sum = 0;
    num = 0;
    for s in sentences do
      tagged = tgr.get_readable(s)
      next if tagged == nil
      arr = tagged.split(' ');
      #This rule removed bacause specifiying someone elses mood reflects yours
      #next if arr[0].end_with?('/NNP')
      #test if starts with PAST  if yes skip
      next if arr[0].end_with?('/VBD')
      #test if PRP and not I
      next if arr[0].end_with?('/PRP') and arr[0].split('/')[0] != 'I'
      an_res = analyze_sentence(arr)
      local_sum = an_res[0]
      local_num = an_res[1]
      relevant = an_res[2]

      if local_sum == 0 and relevant
        #test for smileys
        res = check_for_smileys(s)
        local_sum +=res[0]
        local_num+=res[1]
      end
      sum+=local_sum
      num+=local_num
    end
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
    i = 0
    relevant = true
    sum = 0
    num = 0
    for word in arr do
      if word.end_with?('/JJ')
        word = word.split('/')[0]
        dict = @@ops[word]
        unless dict == nil
          num+=1
          tmp_sum=dict[:v]
          #check if previous word in sentence is RB and if it is in dictionary
          unless i == 0
            prev = arr[i-1]
            if prev.end_with?('/RB')
              prev = prev.split('/')[0]
              score = dict[prev]
              tmp_sum=score unless score == nil
            end
          end
          sum+=tmp_sum
        end
      elsif word.end_with?('/VBD') or word.end_with?('/VBN')
        #4) if past tense skip (VBD, VBN), clear all scores for the sentence
        relevant = false
        num = 0
        sum = 0
        break
      end
      i =i+1
    end
    return [sum,num,relevant]
  end
end
