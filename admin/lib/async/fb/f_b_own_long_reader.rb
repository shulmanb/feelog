require 'async/fb/f_b_reader'

class FBOwnLongReader < FBReader
  @queue = :own_long
  def self.store_moods(userid,moods)
    moods.each(){|id,mood_obj|
      mood = Mood.new
      mood.mood = mood_obj[:m]
      mood.desc = mood_obj[:p]
      mood.user_id = userid
      mood.report_time = mood_obj[:t]
      mood.fb_id = mood_obj[:i]
      mood.save()
      puts "STORED LONG MOOD "+mood.mood.to_s+" "+mood.desc.to_s+" "+mood.report_time.to_s+" "+mood.user_id.to_s
      Resque.enqueue(WordCounter,mood.desc, mood.mood, mood.user_id)
    };
    @@redis.hset(userid,"initialized",true)
    @@redis.expire(userid, 60*60*24)

  end
  def self.perform(accesskey, userid)
      if @@redis.client.connected? != true
        @@redis.client.connect
      end

    #retrieve statuses for the last 30 days
    batch = []
    t = (Time.now - 3600*24*30)
    t1 = (Time.now - 3600*24*365)
    until_t = t.strftime('%Y-%m-%d')
    since_t = t1.strftime('%Y-%m-%d')
    url = 'me/statuses?limit=10000&since='+since_t+'&until='+until_t
    batch.push({'method'=>'GET','relative_url'=>url})
    json_batch =  JSON.generate(batch)

    response = RestClient.post("https://graph.facebook.com",
          :access_token=>accesskey,
          :batch=>json_batch)
    result = parse_response(response)
    moods = prepare_moods(result)
    store_moods(userid, moods)
  end

end
