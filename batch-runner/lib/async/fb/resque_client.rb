require 'emotions/emotions_parser_wrapper'

class ResqueClient
  @@redis = Redis.new
  Resque.redis = @@redis
  @@parser = EmotionsParserWrapper.new

end