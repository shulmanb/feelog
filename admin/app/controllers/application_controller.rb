class ApplicationController < ActionController::Base
#  protect_from_forgery
  @@redis = Redis.new
  Resque.redis = @@redis

   protected
    def check_redis_connection
      #remove after test
      #end remove after test
      if @@redis.client.connected? != true
        @@redis.client.connect
      end
    end

end
