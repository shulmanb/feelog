Mooderator::Application.routes.draw do
  resources :users do
    resources :moods
  end
  match '/users/:user_id/moods/limit/:limit' => "moods#index", :via=>:get
  match '/users/:user_id/moods_page/:size/:page' => "moods#get_feels_page", :via=>:get
  match '/login' => "login#index", :via=>:get
  match '/logout' => "login#logout", :via=>:get
  match '/login' => "login#login", :via=>:post
  match '/users/:user_id/moodsgraph/' => "moods#graph", :via=>:get
  match '/auth/:provider/callback', :to => 'login#create'
  match '/login_mobile', :to => "login#authorize_client", :via=>:post
  match '/canvas', :to => "login#canvas", :via=>:post
  match '/auth/failure', :to => 'login#failure'
  match '/users/:user_id/friends' => "friends#index", :via=>:get
  match '/users/:user_id/words/:mood' => "words#index", :via=>:get
  match '/users/:user_id/words/:mood/:word' => "words#max_word_count", :via=>:get
  match '/users/:user_id/happy_words' => "words#happy_words", :via=>:get
  match '/users/:user_id/gloomy_words' => "words#gloomy_words", :via=>:get

end
