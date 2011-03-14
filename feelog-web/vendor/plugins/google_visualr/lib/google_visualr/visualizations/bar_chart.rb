module GoogleVisualr
  module Visualizations

    class BarChart < BaseChart
      include GoogleVisualr::Packages::CoreChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/barchart.html
      
      attr_accessor :backgroundColor
      attr_accessor :colors
      attr_accessor :fontSize
      attr_accessor :fontName
      attr_accessor :hAxis
      attr_accessor :height
      attr_accessor :isStacked
      attr_accessor :legend
      attr_accessor :legendTextStyle
      attr_accessor :reverseCategories
      attr_accessor :title
      attr_accessor :titleTextStyle
      attr_accessor :tooltipTextStyle
      attr_accessor :vAxis
      attr_accessor :width

    end
  
  end
end