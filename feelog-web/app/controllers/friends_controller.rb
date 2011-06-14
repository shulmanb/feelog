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
      retry_cnt = session[:friends_retry]
      if retry_cnt == nil
        #not refreshed, send old cache back
        @friends = @@redis.hgetall(user_id+":friends")
        retry_cnt = 0
        session[:friends_retry] = 1
      else
        retry_cnt = retry_cnt +1
        session[:friends_retry] = retry_cnt
      end
      if retry_cnt.to_i < 10
        if retry_cnt.to_i > 2
          @resp.update({'retry'=>15000})
        else
          @resp.update({'retry'=>5000})
        end
      else
        session.delete(:friends_retry)
      end
      @resp.update({'retry_cnt'=>retry_cnt})
    end
    #parse the json str to ruby hash
    unless @friends == nil
      @friends.each{|key,json_val|
        @resp.update({key=>JSON.parse(json_val)})
      }
    end
    respond_to do |format|
      format.json  { render :json => @resp}
    end
  end
end
