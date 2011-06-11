# To change this template, choose Tools | Templates
# and open the template in the editor.

$:.unshift File.join(File.dirname(__FILE__),'..','lib/emotions/')
$:.unshift File.join(File.dirname(__FILE__),'..','lib/')

require 'test/unit'
require 'emotions/emotions_parser'
class EmotionsParserTest < Test::Unit::TestCase
  @parser = ResqueClient.new
  def test_smiley
    post = 'She is angry today. I am =) today. I was very happy last year'
    res = @parser.pars_post(post)
    assert_equal(5, res)
  end
end
