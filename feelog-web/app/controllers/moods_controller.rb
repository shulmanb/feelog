require 'emotions/emotions_parser'

class MoodsController < ApplicationController
  before_filter :authorize, :check_redis_connection
  #
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
    respond_to do |format|
      format.json  { render :json => @moods }
    end
  end

  def get_feels_range_page
    user_id = params[:user_id]
    #starting 0
    zoom = params[:zoom].to_i
    size = params[:size].to_i
    end_t = params[:end].to_i
    start_t = params[:start].to_i
    tmp_moods = User.find(user_id).moods.where("report_time >= ?",Time.at(start_t)).order("report_time DESC")
    status = {}
    if zoom > 0
      status = aggregateByZoomLevel(tmp_moods,zoom, size,nil)
      page = getAggregatedMoodsPage(status[:result],end_t,size)
    else
      status[:result] = tmp_moods
      page = getMoodsPage(status[:result],end_t,size)
    end
    moods = getMoodsForPage(zoom,size,page,user_id)
    @return = {:page=>page,:moods=>moods}
    respond_to do |format|
      format.json  { render :json => @return }
    end
  end


  def get_feels_page
    user_id = params[:user_id]
    #starting 0
    page = params[:page].to_i
    size = params[:size].to_i
    @moods = getMoodsForPage(params[:zoom],size,page,user_id)

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
    @mood_desc = @mood.desc
    if params[:fb_id] != nil
      @mood.fb_id = params[:fb_id]
    end
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
        format.json  { head :ok }
      else
        format.json  { render :xml => @mood.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /moods/1
  # DELETE /moods/1.xml
  def destroy
    @mood = Mood.find(params[:id])
    @mood.destroy

    respond_to do |format|
      format.json  { head :ok }
    end
  end


  private
  def getMoodsForPage(zoom,size,page,user_id)
    if(zoom != nil && zoom.to_i>0)
      tmp_moods = Mood.joins(:user).where("user_id = ?",user_id).order("report_time DESC").limit(calculateZoomLimit(params[:zoom],size*(page+1)))
      status = aggregateByZoomLevel(tmp_moods,zoom, size,page)
      moods = status[:result]
      if status[:need_more]
        #try another query with bigger limit
      end
    else
      moods = User.find(user_id).moods.order("report_time DESC").limit(size).offset(page*size)
    end
    return moods
  end


  def getMoodsPage(moods,end_t,page_size)
    page = 0
    i = page_size - 1
    while i < moods.size
       if moods[i].report_time.to_i <= end_t.to_i
         break
       end
       i = i + page_size
      page = page + 1
    end
    return page
  end


  def getAggregatedMoodsPage(moods,end_t,page_size)
    page = 0
    i = page_size-1
    while i < moods.size
       if moods[i][:e] >= end_t && moods[i][:s]<=end_t
         break
       end
       i = i + page_size
       page = page+1
    end
    return page
  end


  def calculateZoomLimit(zoom,limit)
    limit = limit.to_i
    case zoom
      when '1'
        return limit*10
      when '2'
        return limit*10*7
      when '3'
        return limit*10*7*31
    end
  end

  #calculates the last mood to retrieve acording to the limit and zoom
  #1=>daily, 2=>weekly, 3=>monthly
  def calculateZoomOffsetDate(zoom,limit)
    now = Time.now
    limit = limit.to_i
    case zoom
      when '1'
        #calculate the midnight <limit-1> days ago
        base = Time.mktime(now.year, now.month, now.day,0,0,0)
        return base - (60*60*24)*(limit-1)
      when '2'
        #calculate the midnight of the Saturday limit-1 weeks ago days ago
        base = Time.mktime(now.year, now.month, now.day,0,0,0)
        return base - (60*60*24)*(limit*7-1)
      when '3'
        #calculate the first day of the month that was limit -1 month ago
        month = now.month - limit
        year = 0
        if(month < 0)
          month=12+month
          year = -1
        else
          month=month+1
        end
        return Time.mktime(now.year+year, month, 1,0,0,0)
    end
  end

  #perform aggregation of moods according to the zoom level
  #receives ordered array of moods according to the report_time
  def aggregateByZoomLevel(moods,zoom, limit, page)
      case zoom.to_s
        when '1'
          return aggregate(moods, limit,page){|a,b|
            aTime = a.yday
            bTime = b.yday
            s_date = Time.mktime(b.year, b.month, b.day,0,0,0)
            e_date = Time.mktime(b.year, b.month, b.day,23,59,59)
            {:res=>(aTime == bTime),:period=>b.to_i,:s=>s_date.to_i,:e=>e_date.to_i}
          }
        when '2'
          return aggregate(moods, limit,page){|a,b|
            aTime = a.strftime('%U')
            bTime = b.strftime('%U')
            s_date = Time.parse(Date.commercial(b.year, b.strftime('%U').to_i, 1).to_s)
            e_date = Time.parse(Date.commercial(b.year, b.strftime('%U').to_i, 7).to_s)
            {:res=>(aTime == bTime),:period=> s_date.strftime("%b%d")+"-"+e_date.strftime("%b%d"),:s=>s_date.to_i,:e=>e_date.to_i}
          }
        when '3'
          return aggregate(moods, limit,page){|a,b|
            aTime = a.month
            bTime = b.month
            s_date = DateTime.new(b.year, b.month, 1).to_time
            e_date = (DateTime.new(b.year, b.month+1, 1)-1).to_time
            {:res=>(aTime == bTime),:period=>b.month,:s=>s_date.to_i,:e=>e_date.to_i}
          }
      end
  end

  def aggregate( moods, limit,page, &same_period)
    #BUG!!! the aggregation is performed in UTC I should receive the offset from the browser
    limit = limit.to_i
    if page != nil
      page = page.to_i
    end
    aggr_value = 0
    aggr_count = 0
    result = Array.new
    index = 0
    eval = nil
    moods.each{|x|
      if aggr_count > 0
        eval = yield x.report_time.time,moods[index-1].report_time.time
        if eval[:res]
          #same period add to value and count
          aggr_count=aggr_count+1
          aggr_value=aggr_value+x.mood
          #puts "#{x.report_time.time.to_s} #{aggr_count.to_s} #{x.user_id}"
        else
          #start new period
           result.push({:count=>aggr_count,:avg=>(aggr_value/aggr_count).ceil,:per=>eval[:period],:s=>eval[:s],:e=>eval[:e]})
           aggr_count=1
           aggr_value=x.mood
        end
      else
        aggr_count=1
        aggr_value=x.mood
      end
      index=index+1
    }
    #push the last period
    result.push({:count=>aggr_count,:avg=>(aggr_value/aggr_count).ceil,:per=>eval[:period],:s=>eval[:s],:e=>eval[:e]})
    res = {}
    res[:need_more] = false
    if page != nil
      if result.size > limit
        offset = limit*(page)
        if offset > result.size
           #offset = result.size - limit
          result = []
        end
        result = result[offset,limit]
      elsif page > 0 && result.size < limit
        res[:need_more] = true
      end
    end
    res[:result] = result
    return res
  end


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
