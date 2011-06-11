require 'emotions/emotions_parser'

class MoodsController < ApplicationController
  before_filter :authorize, :check_redis_connection
  @@parser = EmotionsParser.new


  # GET /moods
  # GET /moods.xml
  def index
    user_id = params[:user_id]
    unless session[:initializing] == nil
      retry_cnt = session[:init_retry]
      if retry_cnt == nil
        retry_cnt = 0
        session[:init_retry] = 1
      else
        retry_cnt = retry_cnt +1
        session[:init_retry] = retry_cnt
      end
      init = @@redis.hget(user_id,"initialized")
      if init != nil
        session.delete(:initializing)
      end
      #stop trying after 10 retries
      if init == nil and retry_cnt.to_i < 10
        respond_to do |format|
          format.json  { render :json => {:retry=>15000,:retry_cnt=>retry_cnt} }
        end
        return
      end
    end
    session.delete(:init_retry)

    if(params[:limit] == nil)
        @moods = User.find(user_id).moods.order("report_time DESC")
    else
        @moods = User.find(user_id).moods.order("report_time DESC").limit(params[:limit].to_i)
    end
    #@user = User.find(params[:user_id])

    respond_to do |format|
      format.html # index.html.erb
      format.json  { render :json => @moods }
    end
  end

  def get_feels_page
    user_id = params[:user_id]
    #starting 0
    page = params[:page].to_i
    size = params[:size].to_i
    @moods = User.find(user_id).moods.order("report_time DESC").limit(size).offset(page*size)

    respond_to do |format|
      format.json  { render :json => @moods }
    end

  end

  # GET /moods/1
  # GET /moods/1.xml
  def show
    @mood = Mood.find(params[:id])
    respond_to do |format|
      format.any  { render :json => @mood }
    end
  end

  # GET /moods/new
  # GET /moods/new.xml
  def new
    @mood = Mood.new
    @user = User.find(params[:user_id])
    @picture = session[:picture]
    @fb = session[:fb]
    respond_to do |format|
      format.any # new.html.erb
    end
  end

  # GET /moods/1/edit
  def edit
    @mood = Mood.find(params[:id])
    @user = User.find(params[:user_id])
  end

  # POST /moods
  # POST /moods.xml
  def create
    #client scale 1-very happy 7-angry, lets revers it, later on we will add mor complex
    @mood = Mood.new(params[:mood])
    @mood.mood = (8-@mood.mood)
    @user = User.find(params[:user_id])
    @mood.user_id = params[:user_id]
    @mood.report_time = Time.now
    fbshare = params[:fbshare]
    twshare = params[:twshare]
    @mood_desc = @mood.desc
    #Resque.enqueue(WordCounter,@mood.desc, @mood.mood, @mood.user_id)
    perform(@mood.desc, @mood.mood, @mood.user_id)
    respond_to do |format|
      if @mood.save
        format.json  { render :json => {:report_time=>@mood.report_time,:val=>@mood.mood,:desc=>@mood.desc}, :status => :created}
        format.js # redirect_fbct_fb.js.erb
      else
        format.json  { render :json => @mood.errors, :status => :unprocessable_entity }
        format.js   { render 'fail_create.js.erb' }
      end
    end
  end

  # PUT /moods/1
  # PUT /moods/1.xml
  def update
    @mood = Mood.find(params[:id])
    @user = User.find(params[:user_id])

    respond_to do |format|
      if @mood.update_attributes(params[:mood])
        format.html { redirect_to(user_moods_url, :notice => 'Mood was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @mood.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /moods/1
  # DELETE /moods/1.xml
  def destroy
    @mood = Mood.find(params[:id])
    @mood.destroy

    respond_to do |format|
      format.html { redirect_to(user_moods_url) }
      format.xml  { head :ok }
    end
  end


  private
  #we will store counter for every word for a mood in a hash {word=>count}
  #we will store top 20 words in a hash {count=>word}
  def perform(post, mood, userid)
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
