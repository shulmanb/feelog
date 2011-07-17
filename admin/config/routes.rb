Admin::Application.routes.draw do
  match '/users/:user_id/token' => "users#get_user_token", :via=>:get
  match '/users/:user_id/async/:task' => "asynctasks#execute", :via=>:get
end
