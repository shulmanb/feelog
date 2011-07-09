class UsersController < ApplicationController
  before_filter :authorize, :check_redis_connection

  def retrieve_settings
      user_id = params[:user_id]
      user = User.find(user_id)
      @resp = {:settings=>@user.settings}
      respond_to do |format|
        format.any  { render :json => @resp }
      end

  end

  def store_settings
    user_id = params[:user_id]
    settings = params[:settings]
    user = User.find(user_id)
    user.settings = settings.to_i
    user.save()
    respond_to do |format|
      format.any  { render :json => {}}
    end
  end


end
