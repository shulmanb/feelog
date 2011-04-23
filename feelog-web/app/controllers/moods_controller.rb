class MoodsController < ApplicationController
  before_filter :authorize, :check_redis_connection
  # GET /moods
  # GET /moods.xml
  def index
    user_id = params[:user_id]
    unless session[:initializing] == nil
      retry_cnt = session[:init_retry]
      if retry_cnt == nil
        retry_cnt = 0
        session[:init_retry] = 1
      else
        retry_cnt = retry_cnt +1
        session[:init_retry] = retry_cnt
      end
      init = @@redis.hget(user_id,"initialized")
      if init != nil
        session.delete(:initializing)
      end
      #stop trying after 10 retries
      if init == nil and retry_cnt.to_i < 10
        respond_to do |format|
          format.json  { render :json => {:retry=>5000,:retry_cnt=>retry_cnt} }
        end
        return
      end
    end
    session.delete(:init_retry)

    if(params[:limit] == nil)
        @moods = User.find(user_id).moods.order("report_time DESC")
    else
        @moods = User.find(user_id).moods.order("report_time DESC").limit(params[:limit].to_i)
    end
    @user = User.find(params[:user_id])

    respond_to do |format|
      format.html # index.html.erb
      format.json  { render :json => @moods }
    end
  end

  # GET /moods/1
  # GET /moods/1.xml
  def show
    @mood = Mood.find(params[:id])
    @user = User.find(params[:user_id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @mood }
    end
  end

  # GET /moods/new
  # GET /moods/new.xml
  def new
    @mood = Mood.new
    @user = User.find(params[:user_id])
    @picture = session[:picture]
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @mood }
    end
  end

  # GET /moods/1/edit
  def edit
    @mood = Mood.find(params[:id])
    @user = User.find(params[:user_id])
  end

  # POST /moods
  # POST /moods.xml
  def create
    #client scale 1-very happy 7-angry, lets revers it, later on we will add mor complex
    @mood = Mood.new(params[:mood])
    @mood.mood = (8-@mood.mood)
    @user = User.find(params[:user_id])
    @mood.user_id = params[:user_id]
    @mood.report_time = Time.now
    fbshare = params[:fbshare]
    twshare = params[:twshare]
    @mood_desc = @mood.desc
    respond_to do |format|
      if @mood.save
        format.json  { render :json => {:report_time=>@mood.report_time,:val=>@mood.mood,:desc=>@mood.desc}, :status => :created}
        format.js # create.js.erb
      else
        format.json  { render :json => @mood.errors, :status => :unprocessable_entity }
        format.js   { render 'fail_create.js.erb' }
      end
    end
  end

  # PUT /moods/1
  # PUT /moods/1.xml
  def update
    @mood = Mood.find(params[:id])
    @user = User.find(params[:user_id])

    respond_to do |format|
      if @mood.update_attributes(params[:mood])
        format.html { redirect_to(user_moods_url, :notice => 'Mood was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @mood.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /moods/1
  # DELETE /moods/1.xml
  def destroy
    @mood = Mood.find(params[:id])
    @mood.destroy

    respond_to do |format|
      format.html { redirect_to(user_moods_url) }
      format.xml  { head :ok }
    end
  end
end
