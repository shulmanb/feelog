require 'emotions/emotions_parser'

class ResqueClient
  @@redis = Redis.new
  Resque.redis = @@redis
  @@parser = EmotionsParser.new

end