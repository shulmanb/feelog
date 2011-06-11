require "base64"
class LoginController < ApplicationController
  protect_from_forgery :except => :login,:except => :authorize_client
  before_filter :check_redis_connection

  def logout
    reset_session
    respond_to do |format|
      format.html { redirect_to("/") }
      format.xml  { head :ok }
    end
  end

  def authorize_client
       token = params[:token]
       login_with_token(token)
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
      format.html { redirect_to(login_path(@user)) }
      format.xml  { head :failure }
    end
  end




  #private methods
  private

  def login_user(hash,token)
    @user = get_user(hash,token,false)
    #store token for web logins

    #check caches
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

    execute_post_login(@user,@picture,@email,token)

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
    user = get_user(hash,token, true)
    #already got the data from fb, just use it and update cache
    picture = fb_user.picture
    email = fb_user.email
    @@redis.hset(user.id, 'pic', picture)
    @@redis.hset(user.id, 'email', email)

    execute_post_login(user,picture,email,token)

    @resp = {:id=>user.id,:pic=>picture,:name=>fb_user.name}
    # Log the authorizing user in.
    respond_to do |format|
      format.any  { render :json => @resp }
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
          format.html { redirect_to("/") }
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
    return false;
  end
end
