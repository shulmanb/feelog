require "base64"
require "oauth2"
class LoginController < ApplicationController
  layout "login"
  protect_from_forgery :except => :login,:except => :authorize_client
  before_filter :check_redis_connection

  def logout
    reset_session
    respond_to do |format|
      format.html { redirect_to("/") }
      format.xml  { head :ok }
    end
  end

  def authorize_iphone_client
    client = OAuth2::Client.new('136471399753143', 'fd2473b50818ca5ce3972d082da9c118', :site => 'https://graph.facebook.com')
    resp = client.web_server.get_access_token(params[:code], :redirect_uri => 'http://www.facebook.com/connect/login_success.html')
    access_token =   JSON.parse(resp.get('/access_token'))
    login_with_token(access_token)
  end


  def authorize_client
       token = params[:token]
       login_with_token(token)
  end

  def canvas
       app_id = "136471399753143"
       canvas_page = "http://ec2-184-73-183-35.compute-1.amazonaws.com:8080/canvas"
       @auth_url = "http://www.facebook.com/dialog/oauth?client_id=" + app_id + "&redirect_uri=" + URI.escape(canvas_page, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))

       signed_request = params["signed_request"]
       #TODO: check the signature
       payload = signed_request.split('.')[1]
       payload += '=' * (4 - payload.length.modulo(4))
       json_str = Base64.decode64(payload.tr('-_','+/'))
       data = JSON.parse(json_str)
       if data["user_id"] == nil
              respond_to do |format|
                format.any {render 'redirect_fb.js.erb' }
              end
       else
           session[:fb] = true
           hash = {'uid'=>data["user_id"],'provider'=>'facebook'}
           login_user(hash,data["oauth_token"])
       end
  end


  def create
    auth = request.env['rack.auth']
    login_user(auth,auth['credentials']['token'])
  end

  def failure
    respond_to do |format|
      format.html { redirect_to(login_path(@user)) }
      format.xml  { head :failure }
    end
  end

  private


  def login_user(hash,token)
    unless @auth = Authorization.find_from_hash(hash)
      # Create a new user or add an auth to existing user, depending on
      # whether there is already a user signed in.
      @auth = Authorization.create_from_hash(hash, current_user)
      Resque.enqueue(FBOwnReader,token,@auth.user.id)
      session[:initializing]=true
      puts "INITIALIZING NEW USER"
    end

    if token != @auth.token
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
      @fb_user = FbGraph::User.me(token).fetch
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
    Resque.enqueue(FBFriendsReader,token,@user.id)

    # Log the authorizing user in.
    respond_to do |format|
      format.html { redirect_to(new_user_mood_path(@user)) }
      format.xml  { head :ok }
    end
  end


  def login_with_token(token)
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
    @resp = {:id=>user.id,:pic=>picture,:name=>fb_user.name}
    #try and generate the token here

    # Log the authorizing user in.
    respond_to do |format|
      format.any  { render :json => @resp }
    end
  end
end
