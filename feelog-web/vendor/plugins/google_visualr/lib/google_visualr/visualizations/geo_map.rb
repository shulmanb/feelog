module GoogleVisualr
  module Visualizations

    class GeoMap < BaseChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/geomap.html

      attr_accessor :region
      attr_accessor :dataMode
      attr_accessor :width
      attr_accessor :height
      attr_accessor :colors
      attr_accessor :showLegend
      attr_accessor :showZoomOut
      attr_accessor :zoomOutLabel

    end
    
  end
end