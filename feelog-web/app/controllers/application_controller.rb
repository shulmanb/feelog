class ApplicationController < ActionController::Base
  before_filter :authorize, :check_redis_connection

  #protect_from_forgery
  @@redis = Redis.new
  Resque.redis = @@redis

  protected
  
    def current_user
      @current_user ||= User.find_by_id(session[:user_id])
    end
  
    def signed_in?
      !!current_user
    end
    def check_redis_connection
      #remove after test
      #end remove after test
      if @@redis.client.connected? != true
        @@redis.client.connect
      end
    end
    def authorize
      user_id = params[:user_id]
      if user_id == nil
        #check for token
        if session[:token] == nil
          respond_to do |format|
            format.json  { render :error }
            format.any {redirect_to("/")}
         end

        end
      else
        if !(signed_in?) or (user_id.to_i != self.current_user.id)
          respond_to do |format|
            format.json  { render :error }
            format.any {redirect_to("/")}
         end
        end
      end
    end

    helper_method :current_user, :signed_in?, :authorize
  
    def current_user=(user)
      @current_user = user
      session[:user_id] = user.id
    end
end
