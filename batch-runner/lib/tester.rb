require "rubygems"
require "lib/emotions/emotions_parser_wrapper"
require "json"
require "rest-client"
require "htmlentities"
@@parser = EmotionsParserWrapper.new
@@coder = HTMLEntities.new

def self.prepare_moods(messages_hash,usecache=true,own=false)
    if own
      moods = []
    else
      moods={} #array of moods for own hash for firnds
    end
    messages_hash.each {|key, val|
      if val == nil || val['msgs'] == nil
        next
      end
      for msg in val['msgs'] do
        #check cache if post was already parsed in the past
        post = msg['msg']
        puts "checking #{post}"
        next if post == nil
        post_id = msg['post_id']
        post_obj = nil

        if post_obj == nil
          mood = @@parser.pars_post(post)
          if mood > 0
            post_obj = {:m=>mood,:p=>@@coder.encode(post),:t=>msg['time'],:n=>val['name'],:i=>msg['post_id'],:lc=>msg['likes_count'],:cc=>msg['comments_count']}
          end
        else
     #     puts "Found in posts cache key #{key+"_"+post_id} #{post_obj}"
          if post_obj != '0'
            post_obj = JSON.parse(post_obj)
          end
        end
        if post_obj != nil && post_obj != '0'
          puts "adding post for key #{post_id} #{post_obj}"
          if !own
            moods.update({key=>post_obj})
            break
          else
            moods.push(post_obj)
          end
        end
      end
    }
    return moods
  end

def parse_body(body,gonext)
  hash={}
  data = body['data']
  for d in data
    id = d['from']['id']
    name = d['from']['name']
    post_id = d['id']
    message = d['message']
    time = d['updated_time']
    curr = hash[id]
    if curr == nil
      curr={'name'=>name,'msgs'=>[]}
    end
    curr['msgs'].push({'msg'=>message,'time'=>time,'post_id'=>post_id})
    hash[id]=curr
  end
  if body['paging']!= nil
    if gonext == true
      return [hash,body['paging']['next']]
    else
      return [hash,body['paging']['previous']]
    end
  end
  return [hash,nil]
end

def parse_response(response,gonext)
  parsed = JSON.parse(response)
  if parsed[0] != nil
    if parsed.size > 1
      hash={}
      parsed.each{|p|
        body = JSON.parse(p['body'])
        hash.update(parse_body(body,gonext)[0])
      }
      return [hash,nil]
    else
      body = JSON.parse(parsed[0]['body'])
      return parse_body(body,gonext)
    end
  else
    body = parsed
    return parse_body(body,gonext)
  end
end


def store_moods(userid,moods)
  moods.each(){|mood_obj|
    mood = mood_obj[:m]
    desc = mood_obj[:p]
    user_id = userid
    report_time = mood_obj[:t]
    fb_id = mood_obj[:i]
    puts "#{userid.to_s} STORED MOOD "+mood.to_s+" "+desc.to_s+" "+report_time.to_s+" "+user_id.to_s
  };
end

def perform_long(accesskey, userid)
    batch = []
    t = (Time.now - 3600*24*31)
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
      result = parse_response(response,true)
      moods = prepare_moods(result[0],false,true)
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


def perform(accesskey, userid)
    #retrieve statuses for the last 30 days
   #query:  select%20status_id,uid,time,message%20from%20status%20where%20uid=me()%20and%20time>1300000000%20limit%201000


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
    while(!done)
      result = parse_response(response,false)
      moods = prepare_moods(result[0],false,true)
      store_moods(userid, moods)
      if result[1] == nil
         done = true
      else
        arr = result[1].split('&')
        uri = arr[0]+'&'+arr[1]+'&'+arr[2]+'&'+arr[3]+'&'+URI.escape(arr[4]+'&'+arr[5])
        response = RestClient.get(uri)
      end
    end
  end

puts "executing own reading"
perform('136471399753143|f3239e04691198493cdc7176.1-579617528|ipB8TWC_yT7jbaiqiwlTnRd2i0Y',7)
puts "done"
puts "executing own long reading"
perform_long('136471399753143|f3239e04691198493cdc7176.1-579617528|ipB8TWC_yT7jbaiqiwlTnRd2i0Y',7)
puts "done"