class UsersController < ApplicationController
  def get_user_token
    id = params[:id]
    auth = User.find(id).authorizations
     respond_to do |format|
      format.any  { render :json => {:token=>auth[0].token}}
     end
  end
end
