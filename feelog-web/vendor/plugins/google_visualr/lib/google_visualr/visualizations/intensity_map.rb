module GoogleVisualr
  module Visualizations

    class IntensityMap < BaseChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/intensitymap.html

      attr_accessor :colors
      attr_accessor :height
      attr_accessor :region
      attr_accessor :showOneTab
      attr_accessor :width

    end
  end
end