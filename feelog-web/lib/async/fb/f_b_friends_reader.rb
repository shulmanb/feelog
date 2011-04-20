require 'emotions/emotions_parser'

class FBFriendsReader
  @queue = :friends
  @@redis = Redis.new
  @paser = EmotionsParser.new
  
  def self.parse_response(response)
    parsed = JSON.parse(response)
    hash={}
    for resp in parsed
      body = JSON.parse(resp['body'])
      data = body['data']
      for d in data
        id = d['from']['id']
        name = d['from']['name']
        message = d['message']
        time = d['updated_time']
        curr = hash[id]
        if curr == nil
          curr={'name'=>name,'msgs'=>[]}
        end
        curr['msgs'].push({'msg'=>message,'time'=>time})
        hash[id]=curr
      end
    end
    return hash
  end

  def self.perform(accesskey, userid)
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

  def self.prepare_moods(messages_hash)
    moods={} #hash of id==>mood
    messages_hash.each {|key, val|
      for msg in val['msgs'] do
        post = msg['msg']
        mood = @paser.pars_post(post)
        if mood > 0
          moods.update({key=>{:m=>mood,:p=>post,:t=>msg['time'],:n=>val['name']}})
          break
        end
      end
    }
    return moods
  end

  def self.update_cache(userid, moody_friends)
    puts "MOODS "+moody_friends.to_xml
    #for the id put map of json objects {friend_id=>mood_obj}, one for a friend
    moody_friends.each() { |id,mood_obj|
      puts "ADDING TO REDIS for key #{userid.to_s+':friends'} JSON #{JSON.generate(mood_obj)}"
      @@redis.hset(userid.to_s+':friends', id, JSON.generate(mood_obj))
    }
    @@redis.hset(userid, 'updated', true)
    @@redis.hset(userid, 'update_ts', Time.now)
    @@redis.expire(userid.to_s+'friends', 60*60*24)
    @@redis.expire(userid, 60*60*24)
  end
end
