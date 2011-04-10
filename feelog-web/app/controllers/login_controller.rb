class LoginController < ApplicationController
  layout "login"
  protect_from_forgery :except => :login
  def login
    @user = User.find(3)
    self.current_user = @user

    respond_to do |format|
      format.html { redirect_to(new_user_mood_path(@user)) }
      format.xml  { head :ok }
    end
  end

  def logout
    session[:user_id] = nil
    respond_to do |format|
      format.html { redirect_to("/") }
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
    @fb_user = FbGraph::User.me(auth['credentials']['token']).fetch
    @picture = @fb_user.picture
    session[:picture] = @picture
    session[:email] = @fb_user.email
    # Log the authorizing user in.
    self.current_user = @auth.user
    @user = @auth.user
#    Resque.enqueue(FBFriendsReader,auth['credentials']['token'],@user.id)

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
