require 'async/fb/resque_client'
class FBReader < ResqueClient
  @@coder = HTMLEntities.new

  def self.parse_response(response)
    parsed = JSON.parse(response)
    hash={}
    for resp in parsed
      body = JSON.parse(resp['body'])
      data = body['data']
      for d in data
        id = d['from']['id']
        post_id = d['id']
        name = d['from']['name']
        message = d['message']
        time = d['updated_time']
        curr = hash[id]
        likesCount = 0
        commentsCount = 0
        if d[:likes]!=nil
          likesCount = d[:likes][:data].length
        end
        if d[:comments]!=nil
          commentsCount = d[:comments][:data].length
        end
        if curr == nil
          curr={'name'=>name,'msgs'=>[]}
        end
        curr['msgs'].push({'msg'=>message,'time'=>time,'post_id'=>post_id,'likes_count'=>likesCount,'comments_count'=>commentsCount})
        hash[id]=curr
      end
    end
    return hash
  end

  def self.prepare_moods(messages_hash, own=false)
    if own
      moods = []
    else
      moods={} #array of moods for own hash for firnds
    end
    messages_hash.each {|key, val|
      for msg in val['msgs'] do
        #check cache if post was already parsed in the past
        post_id = msg['post_id']
        post_obj = @@redis.get(key+"_"+post_id)
        if post_obj == nil
          post = msg['msg']
          mood = @@parser.pars_post(post)
          if mood > 0
            post_obj = {:m=>mood,:p=>@@coder.encode(post),:t=>msg['time'],:n=>val['name'],:i=>msg['post_id'],:lc=>msg['likes_count'],:cc=>msg['comments_count']}
            puts "Adding to posts cache key #{key+"_"+post_id}"
            @@redis.set(key+"_"+post_id,post_obj)
            #hold in cache for 7 days, later on add exact time calculation
            @@redis.expire(key+"_"+post_id, 60*60*24*7)
          else
            puts "Adding to posts cache empty key #{key+"_"+post_id}"
            @@redis.set(key+"_"+post_id,0)
            #hold in cache for 7 days, later on add exact time calculation
            @@redis.expire(key+"_"+post_id, 60*60*24*7)
          end
        else
          puts "Found in posts cache key #{key+"_"+post_id}"
        end
        if post_obj != nil && post_obj != 0
          puts "adding post for key #{key+"_"+post_id} #{post_obj}"
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
end
