class ApplicationController < ActionController::Base
  protect_from_forgery
  @@redis = Redis.new

  protected
  
    def current_user
      @current_user ||= User.find_by_id(session[:user_id])
    end
  
    def signed_in?
      !!current_user
    end
    def check_redis_connection
      if @@redis.client.connected? != true
        @@redis.client.connect
      end
    end
    def authorize
      user_id = params[:user_id]
      if !(signed_in?) or (user_id.to_i != self.current_user.id)
        respond_to do |format|
          format.html {redirect_to(login_path)}
          format.js {redirect_to(login_path)}
          format.json  { render :error }
       end
      end
    end

    helper_method :current_user, :signed_in?, :authorize
  
    def current_user=(user)
      @current_user = user
      session[:user_id] = user.id
    end
end
