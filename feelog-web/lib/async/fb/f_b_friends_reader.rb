# To change this template, choose Tools | Templates
# and open the template in the editor.

class FBFriendsReader
  @queue = :friends

  def self.perform(accesskey, userid)
    @fb_user = FbGraph::User.me(accesskey).fetch
    i = 0
    for friend in @fb_user.friends do
       friend.fetch
       puts "#{i} #{friend.name} "
       i=i+1
    end
  end
end
