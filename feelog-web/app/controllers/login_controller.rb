class LoginController < ApplicationController
  layout "login"
  
  def index
    @login = Login.new
    respond_to do |format|
          format.html # index.html.erb
    end
  end
  
  def login
    @user = User.find(3)
    self.current_user = @user

    respond_to do |format|
      format.html { redirect_to(new_user_mood_path(@user)) }
      format.xml  { head :ok }
    end
  end

  def create
    auth = request.env['rack.auth']
    unless @auth = Authorization.find_from_hash(auth)
      # Create a new user or add an auth to existing user, depending on
      # whether there is already a user signed in.
      @auth = Authorization.create_from_hash(auth, current_user)
    end
    # Log the authorizing user in.
    self.current_user = @auth.user
    @user = @auth.user

    respond_to do |format|
      format.html { redirect_to(new_user_mood_path(@user)) }
      format.xml  { head :ok }
    end
    
  end

  def failure
    respond_to do |format|
      format.html { redirect_to(login_path(@user)) }
      format.xml  { head :failure }
    end
  end
end
