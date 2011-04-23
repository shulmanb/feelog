Mooderator::Application.routes.draw do
  resources :users do
    resources :moods
  end
  match '/users/:user_id/moods/limit/:limit' => "moods#index", :via=>:get
  match '/login' => "login#index", :via=>:get
  match '/logout' => "login#logout", :via=>:get
  match '/login' => "login#login", :via=>:post
  match '/users/:user_id/moodsgraph/' => "moods#graph", :via=>:get
  match '/auth/:provider/callback', :to => 'login#create'
  match '/login_mobile', :to => "login#authorize_client", :via=>:post
  match '/auth/failure', :to => 'login#failure'
  match '/users/:user_id/friends' => "friends#index", :via=>:get

end
