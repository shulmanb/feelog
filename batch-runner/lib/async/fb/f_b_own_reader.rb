require 'async/fb/f_b_reader'

class FBOwnReader < FBReader
  @queue = :own
  def self.initialize
    @@redis.hset(userid,"initialized",true)
    @@redis.expire(userid, 60*60*24)
  end
  def self.store_moods(userid,moods)
    if @@redis.client.connected? != true
      @@redis.client.connect
    end
    moods.each(){|mood_obj|
      mood = Mood.new
      mood.mood = mood_obj[:m]
      mood.desc = mood_obj[:p]
      mood.user_id = userid
      mood.report_time = mood_obj[:t]
      mood.fb_id = mood_obj[:i]
      mood.save()
      puts "#{userid.to_s} STORED MOOD "+mood.mood.to_s+" "+mood.desc.to_s+" "+mood.report_time.to_s+" "+mood.user_id.to_s
      Resque.enqueue(WordCounter,mood.desc, mood.mood, mood.user_id)
    };

  end
  def self.perform(accesskey, userid)
    #retrieve statuses for the last 30 days
   #query:  select%20status_id,uid,time,message%20from%20status%20where%20uid=me()%20and%20time>1300000000%20limit%201000
    puts "userid #{userid.to_s} OWN PROCESSING STARTED"
    start = Time.now
    batch = []
    t = (Time.now - 3600*24*30)
    since = t.strftime('%Y-%m-%d')
    url = 'me/posts?fields=id,message,type,from,updated_time&limit=1000&since='+since
    batch.push({'method'=>'GET','relative_url'=>url})
    json_batch =  JSON.generate(batch)

    response = RestClient.post("https://graph.facebook.com",
          :access_token=>accesskey,
          :batch=>json_batch)
    done = false
    count = 0
    while(!done)
      result = parse_response(response,false)
      moods = prepare_moods(result[0],false,true)
      count+=moods.size
      store_moods(userid, moods)
      if result[1] == nil
         done = true
      else
        arr = result[1].split('&')
        uri = arr[0]+'&'+arr[1]+'&'+arr[2]+'&'+arr[3]+'&'+URI.escape(arr[4])+'&'+arr[5]
        response = RestClient.get(uri)
      end
    end
    if count >=10
      initialize()
    end
    #now retrieve statuses for the last year (365 )(without last 30 days)in a different queue
    Resque.enqueue(FBOwnLongReader,accesskey,userid,count)
    puts "userid #{userid.to_s} OWN PROCESSING DONE #{Time.now - start}"
  end

end
