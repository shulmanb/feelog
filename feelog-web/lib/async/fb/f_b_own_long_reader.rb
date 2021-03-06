require 'async/fb/f_b_reader'

class FBOwnLongReader < FBReader
  @queue = :own_long
  def self.store_moods(userid,moods)
    moods.each(){|mood_obj|
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
  end

  def self.perform(accesskey, userid)
      if @@redis.client.connected? != true
        @@redis.client.connect
      end
     #query: select%20status_id,uid,time,message%20from%20status%20where%20uid=me()%20and%20time>1300000000%20%20and%20time<1300000000%20limit%201000
    #retrieve statuses for the last 30 days
      batch = []
      t = (Time.now - 3600*24*30)
      t1 = (Time.now - 3600*24*365)
      until_t = t.strftime('%Y-%m-%d')
      since_t = t1.strftime('%Y-%m-%d')
      url = 'me/posts?fields=id,message,type,from,updated_time&limit=1000&since='+since_t+'&until='+until_t
      batch.push({'method'=>'GET','relative_url'=>url})
      json_batch =  JSON.generate(batch)

      response = RestClient.post("https://graph.facebook.com",
            :access_token=>accesskey,
            :batch=>json_batch)
      done = false
      while(!done)
        result = parse_response(response)
        moods = prepare_moods(result[0],true)
        store_moods(userid, moods)
        if result[1] == nil
           done = true
        else
          arr = result[1].split('&')
          uri = arr[0]+'&'+arr[1]+'&'+arr[2]+'&'+URI.escape(arr[3])+'&'+arr[4]+'&'+arr[5]
          response = RestClient.get(uri)
        end
      end
  end

end
