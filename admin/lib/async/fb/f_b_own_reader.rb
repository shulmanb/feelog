require 'async/fb/f_b_reader'

class FBOwnReader < FBReader
  @queue = :own
  def self.store_moods(userid,moods)
    if @@redis.client.connected? != true
      @@redis.client.connect
    end
    moods.each(){|id,mood_obj|
      mood = Mood.new
      mood.mood = mood_obj[:m]
      mood.desc = mood_obj[:p]
      mood.user_id = userid
      mood.report_time = mood_obj[:t]
      mood.fb_id = mood_obj[:i]
      mood.save()
      puts "STORED MOOD "+mood.mood.to_s+" "+mood.desc.to_s+" "+mood.report_time.to_s+" "+mood.user_id.to_s
      Resque.enqueue(WordCounter,mood.desc, mood.mood, mood.user_id)
    };
    @@redis.hset(userid,"initialized",true)
    @@redis.expire(userid, 60*60*24)

  end
  def self.perform(accesskey, userid)
    #retrieve statuses for the last 30 days
    batch = []
    t = (Time.now - 3600*24*30)
    since = t.strftime('%Y-%m-%d')
    url = 'me/statuses?limit=1000&since='+since
    batch.push({'method'=>'GET','relative_url'=>url})
    json_batch =  JSON.generate(batch)

    response = RestClient.post("https://graph.facebook.com",
          :access_token=>accesskey,
          :batch=>json_batch)
    result = parse_response(response)
    moods = prepare_moods(result)
    store_moods(userid, moods)
    #now retrieve statuses for the last year (365 )(without last 30 days)in a different queue
    Resque.enqueue(FBOwnLongReader,accesskey,userid)
  end

end
