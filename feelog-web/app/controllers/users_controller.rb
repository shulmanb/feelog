class UsersController < ApplicationController
  before_filter :authorize, :check_redis_connection

  def retrieve_settings
      user_id = params[:user_id]
      user = User.find(user_id)
      @resp = {:settings=>@user.settings}
      respond_to do |format|
        format.any  { render :json => @resp }
      end

  end

  def store_settings
    user_id = params[:user_id]
    settings = params[:settings]
    user = User.find(user_id)
    user.settings = settings.to_i
    user.save()
    respond_to do |format|
      format.any  { render :json => {}}
    end
  end
  def insights
    user_id = params[:user_id]
    @insights = getInsightsForDate(user_id)
    respond_to do |format|
      format.any  { render :json => @insights }
    end
  end

  private
  def getInsightsForDate(userid)
    date = Time.now
    weekday = date.wday
    month = date.month
    dom = date.mday
    part_of_month = (dom/7).to_i
    weekday_hash= @@redis.hgetall(userid.to_s+":weekday:"+weekday)
    month_hash=@@redis.hgetall(userid.to_s+":month:"+month)
    dom_hash=@@redis.hgetall(userid.to_s+":dom:"+dom)
    part_of_month_hash=@@redis.hgetall(userid.to_s+":pom:"+part_of_month)

    #happy/sad today
    today_mood = calculateHappySadStatus(weekday_hash)
    result = {}
    if today_mood == 1
      result['today'] = 'happy'
      #happy
    elsif today_mood == 0
      result['today'] = 'sad'
      #sad
    end
    happy_day = calculateHappiestDay(userid.to_s)
    result['happy_day'] = happy_day
    sad_day = calculateSadDay(userid.to_s)
    result['sad_day'] = sad_day
    return result
  end

  def calculateHappiestDay(user)
    max_avg = 4
    happy_day = -1
    (0..6).each{|i|
      weekday_hash= @@redis.hgetall(userid.to_s+":weekday:"+i)
      total_vals = 0
      total_mood = 0
      weekday_hash.each_pair{|k,v|
        total_vals=total_vals+v
        total_mood = total_mood+k*v
      }
      avg = total_mood/total_vals
      if avg > max_avg
         happy_day = i
      end
    }
    return happy_day
  end

  def calculateSadDay(user)
    max_avg = 4
    sad_day = -1
    (0..6).each{|i|
      weekday_hash= @@redis.hgetall(userid.to_s+":weekday:"+i)
      total_vals = 0
      total_mood = 0
      weekday_hash.each_pair{|k,v|
        total_vals=total_vals+v
        total_mood = total_mood+k*v
      }
      avg = total_mood/total_vals
      if avg < max_avg
         sad_day = i
      end
    }
    return sad_day
  end

  def calculateHappySadStatus(hash)
      total_happy = hash[7]+hash[6]+hash[5]
      total_sad = hash[1]+hash[2]+hash[3]
      total = total_happy+total_sad+hash[3]
      if total_happy > total_sad
          if total_happy >= 0.6*total
            return 1;
          end
      else
        if total_sad >= 0.6*total
          return 0;
        end
      end
      return nil;
  end

end
