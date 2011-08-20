class FriendsController < ApplicationController
  before_filter  :check_redis_connection
  #:authorize,
  # GET /:user_id/friends
  def index
    user_id = params[:user_id]
    updated = @@redis.hget(user_id, 'fr_updated')
    @resp = {}
    if updated != nil
        #pickup new data and send it back
        #array of {key=>{'m'=>mood,'p'=>post,'t'=>msg['time']}} structures
        @friends = @@redis.hgetall(user_id+":friends")
    else
      if session[:first_session]
        partials = @@redis.hgetall(user_id+":friends:partial")
        if session[:partial_cnt]==nil ||
           session[:partial_cnt] = '' ||
           partials.size < session[:partial_cnt].to_i
          @friends =  partials
          session[:partial_cnt] = partials.size
        else
          @friends = nil
        end
      end

      retry_cnt = session[:friends_retry]
      if retry_cnt == nil
        #not refreshed, send old cache back
        if @friends == nil
          @friends = @@redis.hgetall(user_id+":friends")
         end
        retry_cnt = 0
        session[:friends_retry] = 1
      else
        retry_cnt = retry_cnt +1
        session[:friends_retry] = retry_cnt
      end
      if retry_cnt.to_i < 50
        if retry_cnt.to_i > 40
          @resp.update({'retry'=>40000})
        elsif retry_cnt.to_i > 30
          @resp.update({'retry'=>30000})
        elsif retry_cnt.to_i > 20
            @resp.update({'retry'=>20000})
        elsif retry_cnt.to_i > 10
          @resp.update({'retry'=>10000})
        else
          @resp.update({'retry'=>5000})
        end
        puts "SENDING RETRY in #{@resp['retry']} userid #{user_id}"
      else
        puts "RETRY TIMEDOUT... userid #{user_id}"
        session.delete(:friends_retry)
      end
      @resp.update({'retry_cnt'=>retry_cnt})
    end
    #parse the json str to ruby hash
    friends_arr = []
    unless @friends == nil
      @friends.each{|key,json_val|
        val = JSON.parse(json_val)
        val['u_id']=key
        friends_arr.push(val)
      }
    end
    friends_arr = friends_arr.sort_by{|v|v['t']}.reverse()
    @resp['friends']=friends_arr
    respond_to do |format|
      format.json  { render :json => @resp}
    end
  end
end
