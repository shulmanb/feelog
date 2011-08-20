class User < ActiveRecord::Base
  has_many :moods
  has_many :authorizations
  
  def self.create_from_hash!(hash)
    create(:username => hash['user_info']['name'],:email=>hash['user_info']['email'],:settings=>15)
  end
  
end
