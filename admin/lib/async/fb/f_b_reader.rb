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

  def self.prepare_moods(messages_hash)
    moods={} #hash of id==>mood
    messages_hash.each {|key, val|
      for msg in val['msgs'] do
        post = msg['msg']
        mood = @@parser.pars_post(post)
        if mood > 0
          moods.update({key=>{:m=>mood,:p=>@@coder.encode(post),:t=>msg['time'],:n=>val['name'],:i=>msg['post_id'],:lc=>msg['likes_count'],:cc=>msg['comments_count']}})
          break
        end
      end
    }
    return moods
  end
end
