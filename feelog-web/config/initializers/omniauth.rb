Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'CONSUMER_KEY', 'CONSUMER_SECRET'
  provider :facebook, '136471399753143', 'fd2473b50818ca5ce3972d082da9c118',:display => "page"
end
OmniAuth.config.path_prefix = '/fl/auth'