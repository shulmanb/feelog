require File.expand_path(File.join(File.dirname(__FILE__),'..', 'spec_helper'))

module GoogleVisualr
  module Utilities
    
    describe GoogleTypeConversion do
      subject { GoogleVisualr::Utilities::GoogleTypeConversion }
  
      it "should convert a ruby array object" do
        test_array = [1,2, "hello world"]        
        subject.convert(test_array).should == "[1,2,'hello world']"
      end
  
      it "should convert a ruby boolean object" do
        subject.convert(true).should  == "true"
        subject.convert(false).should == "false"
      end
  
      it "should convert a ruby date object" do
        test_date = Date.new
        subject.convert(test_date).should == "new Date(#{test_date.year},#{test_date.month-1},#{test_date.day})"
      end
  
      it "should convert a ruby datetime object" do
        test_date = DateTime.new
        subject.convert(test_date).should == "new Date(#{test_date.year},#{test_date.month-1},#{test_date.day},#{test_date.hour},#{test_date.min},#{test_date.sec})"
      end
  
      it "should convert a ruby float object" do
        subject.convert(5.0).should == 5.0
      end
  
      it "should convert a ruby hash object" do
        test_hash = {:entry => "hello world", :code => "101", :width => 23}
        subject.convert(test_hash).should == "{width:23,entry:'hello world',code:'101'}"
      end
  
      it "should convert a ruby integer object" do
        subject.convert(5).should == 5
      end
  
      it "should convert a ruby string" do
        subject.convert("hello world").should == "'hello world'"
      end
  
      it "should convert a ruby time object" do
        test_date = Time.new
        subject.convert(test_date).should == "new Date(#{test_date.year},#{test_date.month-1},#{test_date.day},#{test_date.hour},#{test_date.min},#{test_date.sec})"
      end
    end
    
  end
end
