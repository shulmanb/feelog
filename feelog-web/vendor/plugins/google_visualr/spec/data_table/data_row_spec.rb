require File.expand_path(File.join(File.dirname(__FILE__),'..', 'spec_helper'))

module GoogleVisualr
  module DataTable
    describe DataTable do
      before(:each) do
      end
      
      it "should accept an array for initialization" do
        row = DataRow.new [0, 1, 2]
        row.data.should be_a_kind_of(Array)
      end
      
      it "should accept a hash for initialization" do
        row = DataRow.new ({ :v => 8, :f => "eight" })
        row.data.should be_a_kind_of(Hash)
      end
      
      it "should render a hash" do
        row = DataRow.new ({ :v => 8, :f => "eight" })
        row.render.should eql("chart_data.addRows( [ [{v: 8, f: 'eight'}] ] );")
      end
      
    end
  end
end
