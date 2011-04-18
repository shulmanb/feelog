Mooderator::Application.routes.draw do
  resources :users do
    resources :moods
    resources :friends
  end
  match '/users/:user_id/moods/limit/:limit' => "moods#index", :via=>:get
  match '/login' => "login#index", :via=>:get
  match '/logout' => "login#logout", :via=>:get
  match '/login' => "login#login", :via=>:post
  match '/users/:user_id/moodsgraph/' => "moods#graph", :via=>:get
  match '/auth/:provider/callback', :to => 'login#create'
  match '/auth/failure', :to => 'login#failure'

end
