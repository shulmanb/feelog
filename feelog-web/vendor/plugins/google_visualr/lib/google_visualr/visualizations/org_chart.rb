module GoogleVisualr
  module Visualizations

    class OrgChart < BaseChart

      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/orgchart.html
      
      attr_accessor :allowCollapse
      attr_accessor :allowHtml
      attr_accessor :nodeClass
      attr_accessor :selectedNodeClass
      attr_accessor :size

    end
    
  end
end