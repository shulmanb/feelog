require 'async/fb/f_b_reader'
class FBFriendsReader < FBReader
  @queue = :friends
  def self.perform(accesskey, userid)
    if @@redis.client.connected? != true
      @@redis.client.connect
    end

    response = RestClient.post("https://graph.facebook.com",
      :access_token=>accesskey,
      :batch=>'[{"method":"GET","relative_url":"me/friends"}]')
    parsed = JSON.parse(response)
    p = JSON.parse(parsed[0]['body'])
    t = (Time.now - 3600*24*5)
    since = t.strftime('%Y-%m-%d')
    #build batch request for latest status messages for all friends
    batch = []
    i = 1
    result={}
    for friend in p['data'] do
       url = friend['id']+'/statuses?since='+since
       batch.push({'method'=>'GET','relative_url'=>url})
       if i==20
        i=0;
        json_batch =  JSON.generate(batch)
        batch=[]
        response = RestClient.post("https://graph.facebook.com",
          :access_token=>accesskey,
          :batch=>json_batch)
        result.update(parse_response(response))
       end
       i+=1
    end
    json_batch =  JSON.generate(batch)
    response = RestClient.post("https://graph.facebook.com",
      :access_token=>accesskey,
      :batch=>json_batch)
    result.update(parse_response(response))
    moody_friends = prepare_moods(result)
    update_cache(userid,moody_friends)
  end

  def self.update_cache(userid, moody_friends)
    puts "MOODS "+moody_friends.to_xml
    #for the id put map of json objects {friend_id=>mood_obj}, one for a friend
    moody_friends.each() { |id,mood_obj|
      puts "ADDING TO REDIS for key #{userid.to_s+':friends'} JSON #{JSON.generate(mood_obj)}"
      @@redis.hset(userid.to_s+':friends', id, JSON.generate(mood_obj))
    }
    @@redis.hset(userid, 'fr_updated', true)
    @@redis.hset(userid, 'fr_update_ts', Time.now)
    @@redis.expire(userid.to_s+'friends', 60*60*24)
  end
end
