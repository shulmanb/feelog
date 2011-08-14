require 'async/fb/f_b_reader'
class FBFriendsReader < FBReader
  @queue = :friends
  def self.perform(accesskey, userid)
    if @@redis.client.connected? != true
      @@redis.client.connect
    end
   #query:  select%20status_id,uid,time,message%20from%20status%20where%20uid%20in%20(select%20uid2%20from%20friend%20where%20uid1=%20me())
   #query:  select uid, name, status, profile_update_time from user where uid in (select uid1 from friend where uid2 = me()) and profile_update_time != 0 and status != "" and status.status_id != 0 order by profile_update_time desc
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
#    puts "CHECKING FRIENDS #{p['data']}"
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
        tmp_res = parse_response(response)
        moody_friends = prepare_moods(tmp_res[0])
        unless moody_friends.empty?
          update_cache(userid,moody_friends,true)
        end
        result.update(moody_friends)
       end
       i+=1
    end
    json_batch =  JSON.generate(batch)
    response = RestClient.post("https://graph.facebook.com",
      :access_token=>accesskey,
      :batch=>json_batch)
    tmp_res = parse_response(response)
    moody_friends = prepare_moods(tmp_res[0])
    result.update(moody_friends)
    update_cache(userid,result,false)
  end

  def self.update_cache(userid, moody_friends,partial)
    #for the id put map of json objects {friend_id=>mood_obj}, one for a friend
    #remove old entities
    if partial
#      puts moody_friends.to_xml
      if !@@redis.exists(userid.to_s+':friends')
        #use partial only if no cache exists
        moody_friends.each() { |id,mood_obj|
          puts "ADDING TO REDIS PARTIAL for key #{userid.to_s+':friends'} JSON #{JSON.generate(mood_obj)}"
          @@redis.hset(userid.to_s+':friends:partial', id, JSON.generate(mood_obj))
        }
      end
    else
      @@redis.del(userid.to_s+':friends')
      moody_friends.each() { |id,mood_obj|
        puts "ADDING TO REDIS for key #{userid.to_s+':friends'} JSON #{JSON.generate(mood_obj)}"
        @@redis.hset(userid.to_s+':friends', id, JSON.generate(mood_obj))
      }
      @@redis.del(userid.to_s+':friends:partial')
      @@redis.hset(userid, 'fr_updated', true)
      @@redis.hset(userid, 'fr_update_ts', Time.now.to_i)
    end
  end
end
