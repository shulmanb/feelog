class WordsController < ApplicationController
  before_filter :check_redis_connection
#:authorize,
  def index
    mood = params[:mood]
    userid = params[:user_id]
    @words = @@redis.hgetall(userid+":words:"+mood+":max")
    respond_to do |format|
      format.json  { render :json => @words}
    end
  end

  def happy_words
    userid = params[:user_id]
    @ret = get_mood_words(userid,4,7,10)
    respond_to do |format|
      format.json  { render :json => @ret}
    end
  end

  def gloomy_words
    userid = params[:user_id]
    @ret = get_mood_words(userid,1,3,10)
    respond_to do |format|
      format.json  { render :json => @ret}
    end
  end

  def max_word_count
    mood = params[:mood]
    userid = params[:user_id]
    word = params[:word]
    @word = @@redis.hget(userid+":words:"+mood+":max",word)
    respond_to do |format|
      format.json  { render :json => @word}
    end
  end

  private
  def get_mood_words(userid,start_mood,end_mood,num)
    words = {}
    for i in start_mood..end_mood do
      w = @@redis.hgetall(userid+":words:"+i.to_s+":max")
      w.each{|k,v|
        if words[k] != nil
          words[k] = words[k] + v.to_i
        else
          words[k] = v.to_i
        end
      }
    end
    words_arr = []
    words.each_pair{|k,v|words_arr.push([k,v.to_i])}
    words_arr = words_arr.sort{|x,y| x[1]<=>y[1]}
    if words_arr.length < num
      ret = words_arr
    else
      ret = []
      (1..10).each{|i|
        elem = words_arr[words_arr.length-i]
        ret.push(elem)
      }
    end
    return ret
  end
end
