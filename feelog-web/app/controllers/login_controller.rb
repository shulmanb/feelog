class LoginController < ApplicationController
  layout "login"
  protect_from_forgery :except => :login,:except => :authorize_client
  before_filter :check_redis_connection
  def login
    @user = User.find(3)
    self.current_user = @user

    respond_to do |format|
      format.html { redirect_to(new_user_mood_path(@user)) }
      format.xml  { head :ok }
    end
  end

  def logout
    reset_session
    respond_to do |format|
      format.html { redirect_to("/") }
      format.xml  { head :ok }
    end
  end
  
  def authorize_client
       token = params[:token]
       fb_user = FbGraph::User.me(token).fetch
       if fb_user == nil
         respond_to do |format|
           format.any  { render :json => {'error'=>'bad token'} }
         end
       end
       uid = fb_user.identifier
       hash = {'uid'=>uid,'provider'=>'facebook'}

       unless auth = Authorization.find_from_hash(hash)
         # Create a new user or add an auth to existing user, depending on
         # whether there is already a user signed in.
         auth = Authorization.create_from_hash(hash, current_user)
         Resque.enqueue(FBOwnReader,token,auth.user.id)
         session[:initializing]=true
         puts "INITIALIZING NEW USER"
       end
       self.current_user = auth.user
       user = auth.user
       #already got the data from fb, just use it and update cache
       picture = fb_user.picture
       email = fb_user.email
       @@redis.hset(user.id, 'pic', picture)
       @@redis.hset(user.id, 'email', email)

       @@redis.expire(user.id, 60*60*24)
       @@redis.expire(user.id.to_s+"friends", 60*60*24)

       session[:picture] = picture
       session[:email] = email
       #add logic not to expire for every request,
       #but retrieve updated time and test if it is older than x hours
       #and only than queue resque command
       @@redis.hdel(user.id, 'fr_updated')
       Resque.enqueue(FBFriendsReader,token,user.id)
       @resp = {:id=>user.id}
       #try and generate the token here

      # Log the authorizing user in.
      respond_to do |format|
        format.any  { render :json => @resp }
      end
  end


  def create
    auth = request.env['rack.auth']

    unless @auth = Authorization.find_from_hash(auth)
      # Create a new user or add an auth to existing user, depending on
      # whether there is already a user signed in.
      @auth = Authorization.create_from_hash(auth, current_user)
      Resque.enqueue(FBOwnReader,auth['credentials']['token'],@auth.user.id)
      session[:initializing]=true
      puts "INITIALIZING NEW USER"
    end

    if auth['credentials']['token'] != @auth.token
      @auth.token = auth['credentials']['token']
      @auth.save()
    end
    self.current_user = @auth.user
    @user = @auth.user

    #add caching here, set the expiration here
    if @@redis.exists @user.id
      @picture = @@redis.hget(@user.id, 'pic')
      @email = @@redis.hget(@user.id, 'email')
    elsif
      @fb_user = FbGraph::User.me(auth['credentials']['token']).fetch
      @picture = @fb_user.picture
      @@redis.hset(@user.id, 'pic', @picture)
      @@redis.hset(@user.id, 'email', @fb_user.email)
      @email = @fb_user.email
    end
    @@redis.expire(@user.id, 60*60*24)
    @@redis.expire(@user.id.to_s+"friends", 60*60*24)

    session[:picture] = @picture
    session[:email] = @email
    #add logic not to expire for every request, 
    #but retrieve updated time and test if it is older than x hours
    #and only than queue resque command
    @@redis.hdel(@user.id, 'fr_updated')
    Resque.enqueue(FBFriendsReader,auth['credentials']['token'],@user.id)

    # Log the authorizing user in.
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
