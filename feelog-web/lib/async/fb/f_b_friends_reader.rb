# To change this template, choose Tools | Templates
# and open the template in the editor.
require 'emotions/emotions_parser'
class FBFriendsReader
  @queue = :friends
  @paser = EmotionsParser.new

  def self.perform(accesskey, userid)
    puts "RETRIEVING FRIENDS LIST"
    response = RestClient.post("https://graph.facebook.com",
      :access_token=>accesskey,
      :batch=>'[{"method":"GET","relative_url":"me/friends"}]')
    parsed = JSON.parse(response)
    p = JSON.parse(parsed[0]['body'])
    t = (Time.now - 3600*24*3)
    since = t.strftime('%Y-%m-%d')
    #build batch request for latest status messages for all friends
    batch = []
    puts "CREATING BATCH REQUEST"
    for friend in p['data'] do
       url = friend['id']+'/statuses?since='+since
       batch.push("{'method':'GET','relative_url':'"+url+"'}")
    end
    puts JSON.generate(batch)
    puts "SENDING BATCH REQUEST"

    response = RestClient.post("https://graph.facebook.com",
      :access_token=>accesskey,
      :batch=>batch)
    puts response
#    @fb_user = FbGraph::User.me(accesskey).fetch
#    i = 0
#    for friend in @fb_user.friends do
#       puts "#{i} #{friend.name} #{friend.id} "
#       i=i+1
#    end
  end
end
