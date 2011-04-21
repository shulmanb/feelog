require 'emotions/emotions_parser'

class FBReader
  @@redis = Redis.new
  @@paser = EmotionsParser.new

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

  def self.prepare_moods(messages_hash)
    moods={} #hash of id==>mood
    messages_hash.each {|key, val|
      for msg in val['msgs'] do
        post = msg['msg']
        mood = @@paser.pars_post(post)
        if mood > 0
          moods.update({key=>{:m=>mood,:p=>post,:t=>msg['time'],:n=>val['name']}})
          break
        end
      end
    }
    return moods
  end
end
