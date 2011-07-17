require "base64"
class LoginController < ApplicationController
  protect_from_forgery :except => :login,:except => :authorize_client
  skip_before_filter :authorize, :except=>:home

  def logout
    reset_session
    respond_to do |format|
      format.html { redirect_to("/") }
      format.xml  { head :ok }
    end
  end

  def authorize_client
       token = params[:token]
       login_with_token(token,true)
  end


  def check_token
    token=params[:token]
    fb_user = FbGraph::User.me(token).fetch
    if fb_user == nil
      respond_to do |format|
        format.any  { render :json => {'status'=>'error'} }
      end
    else
      session[:token] = token
      respond_to do |format|
        format.any  { render :json => {'status'=>'success'} }
      end
    end

  end
  #login from client javascript FB authentication
  def home
    token = session[:token]
    login_with_token(token,false)
  end
  def auth_base64
      b64_token = params[:token]
      token = Base64.decode64(b64_token)
      puts "token=#{token}"
      fb_user = FbGraph::User.me(token).fetch
      if fb_user == nil
        respond_to do |format|
          format.any  { render :json => {'error'=>'bad token'} }
        end
      end
      uid = fb_user.identifier
      hash = {'uid'=>uid,'provider'=>'facebook'}
      login_user(hash,token)
   end
  def canvas
       app_id = "136471399753143"
       canvas_page = "http://184.73.183.35/canvas/"
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
      format.html { redirect_to('/') }
      format.xml  { head :failure }
    end
  end




  #private methods
  private

  def login_user(hash,token)
    @user = get_user(hash,token,false)
    #store token for web logins

    #check caches
#    if @@redis.exists @user.id
#      @picture = @@redis.hget(@user.id, 'pic')
#      @email = @@redis.hget(@user.id, 'email')
#    elsif
      @fb_user = FbGraph::User.me(token).fetch
      @picture = @fb_user.picture
      @@redis.hset(@user.id, 'pic', @picture)
      @@redis.hset(@user.id, 'email', @fb_user.email)
      @email = @fb_user.email
#    end
    if @user.settings == nil
       @user.settings = 0
    end
    execute_post_login(@user,@picture,@email,token)

    # Log the authorizing user in.
    respond_to do |format|
      format.html { render 'home' }
      format.xml  { head :ok }
    end
  end

  def login_with_token(token,ajax)
    fb_user = FbGraph::User.me(token).fetch
    if fb_user == nil
      respond_to do |format|
        format.any  { render :json => {'error'=>'bad token'} }
      end
    end
    uid = fb_user.identifier
    @email = fb_user.email
    #create hash similar to the hash received from fb
    hash = {'uid'=>uid,'provider'=>'facebook','user_info'=>{'name'=>fb_user.name,'email'=>@email},'credentials'=>{'token'=>token}}
    @user = get_user(hash,token, ajax)
    #already got the data from fb, just use it and update cache
    @picture = fb_user.picture
    @@redis.hset(@user.id, 'pic', @picture)
    @@redis.hset(@user.id, 'email', @email)
    if @user.settings == nil
       @user.settings = 0
    end
    execute_post_login(@user,@picture,@email,token)

    # Log the authorizing user in.
    respond_to do |format|
      if ajax == true
        @resp = {:id=>@user.id,:pic=>@picture,:name=>fb_user.name,:settings=>@user.settings}
        format.any  { render :json => @resp }
      else
        format.any  { render 'home'}
      end
    end
  end

  def check_and_expire(user_id,token)
    last_update = @@redis.hget(user_id, 'fr_update_ts')
    unless last_update == nil
      curr_ts = Time.now.to_i
      delta = curr_ts - last_update.to_i
      if(delta < 60*60) #update once in an hour
        return
      end
    end
    puts "INVALIDATING FRIENDS CACH"
    @@redis.hdel(user_id, 'fr_updated')
    Resque.enqueue(FBFriendsReader,token,user_id)

  end


  def get_user(hash,token,mobile)
    unless auth = Authorization.find_from_hash(hash)
      # Create a new user or add an auth to existing user, depending on
      # whether there is already a user signed in.
      if approved_user(hash['uid'])==false
        respond_to do |format|
          format.html { redirect_to("/beta.html") }
        end
        return
      else
        auth = Authorization.create_from_hash(hash, current_user)
        Resque.enqueue(FBOwnReader,token,auth.user.id)
        session[:initializing]=true
        puts "INITIALIZING NEW USER"
      end
    end
    self.current_user = auth.user
    user = auth.user
    unless mobile == true
      if token != auth.token
        auth.token = auth['credentials']['token']
        auth.save()
      end
    end
    return user
  end

  def execute_post_login(user, picture, email,token)
    @@redis.expire(user.id, 60*60*24)
    @@redis.expire(user.id.to_s+"friends", 60*60*24)
    session[:picture] = picture
    session[:email] = email
    #add logic not to expire for every request,
    #but retrieve updated time and test if it is older than x hours
    #and only than queue resque command
    check_and_expire(user.id,token)
  end
  def approved_user(uid)
    return true;
  end
end
