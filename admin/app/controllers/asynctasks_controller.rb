class AsynctasksController < ApplicationController
  before_filter :check_redis_connection

  def execute
    id = params[:id]
    task = params[:task]
    auth = User.find(id).authorizations
    token = auth[0].token
    if task == 'own'
      Resque.enqueue(FBOwnReader,token,id)
      respond_to do |format|
       format.any  { render :json => {:res=>'fbown job enqueued'}}
      end
    end
    if task == 'friends'
      Resque.enqueue(FBFriendsReader,token,id)
      respond_to do |format|
       format.any  { render :json => {:res=>'fbown job enqueued'}}
      end
    end

  end
end
