Mooderator::Application.routes.draw do
#scope "/fl" do
  resources :users do
    resources :moods
  end
  match '/login' => "login#index", :via=>:get
  match '/logout' => "login#logout", :via=>:get
  match '/login' => "login#login", :via=>:post
  match '/users/:user_id/moodsgraph/' => "moods#graph", :via=>:get
  match '/auth/:provider/callback', :to => 'login#create'
  match '/auth/failure', :to => 'login#failure'
#end
end
