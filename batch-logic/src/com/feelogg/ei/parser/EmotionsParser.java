package com.feelogg.ei.parser;

import opennlp.tools.postag.POSModel;
import opennlp.tools.postag.POSTaggerME;
import opennlp.tools.sentdetect.SentenceDetectorME;
import opennlp.tools.sentdetect.SentenceModel;
import opennlp.tools.tokenize.Tokenizer;
import opennlp.tools.tokenize.TokenizerME;
import opennlp.tools.tokenize.TokenizerModel;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

/**
* Created by IntelliJ IDEA.
* User: Home
* Date: 8/13/11
* Time: 6:06 PM
* To change this template use File | Settings | File Templates.
*/
public class EmotionsParser {
    private SentenceModel model;
    private POSModel posModel;
    private TokenizerModel tokenModel;
    private HashMap<String, HashMap<String, Integer>> dictionary;
    public EmotionsParser(HashMap<String,HashMap<String,Integer>> dictionary){
        System.out.println("parser initializing");
        try {
            InputStream modelIn = this.getClass().getResourceAsStream("en-sent.bin");
            model = new SentenceModel(modelIn);
            this.dictionary = dictionary;
            System.out.println("parser initialized");
            InputStream posModelIn = this.getClass().getResourceAsStream("en-pos-maxent.bin");
            posModel = new POSModel(posModelIn);
            InputStream tagModelIn = this.getClass().getResourceAsStream("en-token.bin");
            tokenModel = new TokenizerModel(tagModelIn);
        }catch (IOException e) {
          e.printStackTrace();
        }
    }

//  simple algorithm for extracting emotions from posts
//  1) split post to sentences
//  2) for each sentence: find adjective (JJ, JJR and JJS will be added later)
//     for every adjective check if emotion defined, noemotions then test for smiley if not skip the sentence
//  3) if emotion found test if sentence starts with nnp (Am, Is, Limor), vbd (was) if it is skip
//     if sentence is not in the first sence (PRP = I) then skip, or no PRP
//  4) if past tense skip (VBD, VBN)
//  5) get the happiness scale and add to the average
  public int pars_post(String post){
    post = post.toLowerCase();
    SentenceDetectorME sentenceDetector = new SentenceDetectorME(model);
    long start = System.currentTimeMillis();
    String[] sentences = sentenceDetector.sentDetect(post);
    int sum = 0;
    int num = 0;
    for( String s:sentences){
      String tagged = s;//add tagging later
      if (tagged == null){
          continue;
      }
      String[] arr = tagged.split(" ");

//      This rule removed bacause specifiying someone elses mood reflects yours
//      next if arr[0].end_with?('/NNP')
//      test if starts with PAST  if yes skip
//      see if return it
//      next if arr[0].end_with?('/VBD')
//      test if PRP and not I
//      see if return it
//      next if arr[0].end_with?('/PRP') and arr[0].split('/')[0] != 'I'

      Object[] an_res = analyze_sentence(arr);
      int local_sum = (Integer)an_res[0];
      int local_num = (Integer)an_res[1];
      boolean relevant = (Boolean)an_res[2];

      if(relevant){
        //test for smileys
        int[] res = check_for_smileys(s);
        local_sum +=res[0];
        local_num+=res[1];
      }
      sum+=local_sum;
      num+=local_num;
    }
    System.out.println("POST PARSED IN "+ (System.currentTimeMillis()-start));
    if(num == 0){
        return 0;
    }
    return sum/num;
  }


  private boolean has_smiley(String sentence ,String smiley){
    if(sentence.contains(smiley)){
        return true;
    }
    //insert spaces after every character
    if(sentence.contains(smiley.replaceAll(".(?!$)", "$0 "))){
       return true;
    }
    //insert space after first character
    StringBuilder sm = new StringBuilder(smiley);
    sm.insert(1, ' ');
    if(sentence.contains(sm)){
          return true;
    }
    //insert space after second character
    if(smiley.length() >= 3){
      sm = new StringBuilder(smiley);
      sm.insert(2, ' ');
      if(sentence.contains(smiley)){
          return true;
      }
    }
    //insert space after forth character
    if(smiley.length() >= 4){
        sm = new StringBuilder(smiley);
          sm.insert(3, ' ');
          if(sentence.contains(smiley)){
              return true;
          }
    }
    //insert space after last character
    sm.insert(smiley.length() -1, ' ');
    if(sentence.contains(smiley)){
          return true;
    }
    return false;
  }

  private int[] check_for_smileys(String s){
    int sum = 0;
    int num = 0;
    Map<String,Integer> smileys = dictionary.get("smileys");
    for(Map.Entry<String,Integer> smiley:smileys.entrySet()){
      if (has_smiley(s,smiley.getKey())){
        sum += smiley.getValue();
        num += 1;
      }
    }
      int[] ret = new int[]{sum,num};
    return ret;
  }

  private Object[] analyze_sentence(String[] arr){
    int i = 0;
    boolean relevant = true;
    int sum = 0;
    int num = 0;
    for (String word:arr){
        Map<String,Integer> dict = dictionary.get(word);
        if (dict != null){
          num++;
          int tmp_sum=dict.get("v");
          //check if previous word in sentence is RB and if it is in dictionary
          if(i != 0){
            String prev = arr[i-1];
//            if prev.end_with?('/RB')
              prev = prev.split("/")[0];
              Integer score = dict.get(prev);
              if(score != null){
                tmp_sum=score;
              }
//            }
        }
          if (tmp_sum > 0){
            sum+=tmp_sum;
          }else{
            num--;
          }
        }
      i++;
    }
    return new Object[]{sum,num,relevant};
  }



    public String[] extracts_countable_words(String post){
      long start = System.currentTimeMillis();
      String[] countable_pos = new String[]{"JJ", "JJR", "JJS", "NN", "NNP", "NNPS", "NNS", "RBS", "VB", "VBD", "VBG", "VBN", "VBP", "VBZ", "WDT" };
      String[] exclude = new String[]{"was", "is", "be", "will"};
      HashSet<String> posSet = new HashSet<String>();
      HashSet<String> excludeSet = new HashSet<String>();
      posSet.addAll(Arrays.asList(countable_pos));
      excludeSet.addAll(Arrays.asList(exclude));
      ArrayList<String> countable = new ArrayList<String>();
      SentenceDetectorME sentenceDetector = new SentenceDetectorME(model);
      Tokenizer tokenizer = new TokenizerME(tokenModel);
      POSTaggerME tagger = new POSTaggerME(posModel);

      String[] sentences = sentenceDetector.sentDetect(post);
      for(String s:sentences){
        String tokens[] = tokenizer.tokenize(s);
        String[] tagged = tagger.tag(tokens);
        if(tagged == null || tagged.length == 0){
            continue;
        }
        for(int i=0; i < tagged.length;i++){
          String pos = tagged[i];
          String w = tokens[i];
          if(excludeSet.contains(w)){
              continue;
          }
          boolean res =  posSet.contains(pos);
          if(res){
            w = w.toLowerCase();
            if(w.endsWith(".")){
              int l = w.length()-1;
              w = w.substring(0,l);
             }
            countable.add(w);
          }
        }
      }
      System.out.println("DONE IN"+ (System.currentTimeMillis()-start)+" "+Arrays.toString(countable.toArray()));
      return countable.toArray(new String[0]);
    }
}
