class FriendsController < ApplicationController
  #before_filter :authorize
  # GET /:user_id/friends
  @@redis = Redis.new
  def index
    user_id = params[:user_id]
    updated = @@redis.hget(user_id, 'updated')
    puts 'UPDATED = '+updated.to_s
    @resp = {}
    if updated != nil
        #pickup new data and send it back
        #array of {key=>{'m'=>mood,'p'=>post,'t'=>msg['time']}} structures
        @friends = @@redis.hgetall(user_id+":friends")
    elsif
      #not refreshed, send old cache back
      @friends = @@redis.hgetall(user_id+":friends")
      @resp.update({'retry'=>5})
    end
    #parse the json str to ruby hash
    unless @friends == nil
      @friends.each{|key,json_val|
        @resp.update({key=>JSON.parse(json_val)})
      }
    end
    puts "RESPONSE OBJ "+@resp.to_s
    respond_to do |format|
      format.json  { render :json => @resp}
    end
  end
  


end
