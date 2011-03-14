module GoogleVisualr
  module Visualizations

    class Map < BaseChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/map.html
      
      attr_accessor :enableScrollWheel
      attr_accessor :showTip
      attr_accessor :showLine
      attr_accessor :lineColor
      attr_accessor :lineWidth
      attr_accessor :mapType
      attr_accessor :useMapTypeControll
      attr_accessor :zoomLevel

    end
  
  end
end