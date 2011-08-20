require 'async/fb/resque_client'
require 'json'
class FBReader < ResqueClient
  @@coder = HTMLEntities.new
  def self.parse_body(body,gonext)
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


  def self.parse_response(response,gonext=true)
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
        next if post == nil
        post_id = msg['post_id']
        post_obj = nil
        if usecache
          post_obj = @@redis.get(post_id)
        end

        if post_obj == nil
          mood = @@parser.pars_post(post)
          if mood > 0
            post_obj = {:m=>mood,:p=>@@coder.encode(post),:t=>msg['time'],:n=>val['name'],:i=>msg['post_id'],:lc=>msg['likes_count'],:cc=>msg['comments_count']}
            if own == false
              @@redis.set(post_id,JSON.generate(post_obj))
              #hold in cache for 7 days, later on add exact time calculation
              @@redis.expire(post_id, 60*60*24*7)
            end
          else
            if own == false
              @@redis.set(post_id,0)
              #hold in cache for 7 days, later on add exact time calculation
              @@redis.expire(post_id, 60*60*24*7)
            end
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
end
