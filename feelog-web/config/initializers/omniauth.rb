Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'CONSUMER_KEY', 'CONSUMER_SECRET'
  provider :facebook, '187063221337398', '64dd51a5306d59f5f7e6b07c10775695',:display => "page"
end
OmniAuth.config.path_prefix = '/auth'