module GoogleVisualr
  module Visualizations

    class PieChart < BaseChart
      include GoogleVisualr::Packages::CoreChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/piechart.html

      attr_accessor :backgroundColor
      attr_accessor :colors
      attr_accessor :fontSize
      attr_accessor :fontName
      attr_accessor :height
      attr_accessor :is3D
      attr_accessor :legend
      attr_accessor :legendTextStyle
      attr_accessor :pieSliceText
      attr_accessor :pieSliceTextStyle
      attr_accessor :reverseCategories
      attr_accessor :sliceVisibilityThreshold
      attr_accessor :title
      attr_accessor :titleTextStyle
      attr_accessor :tooltipTextStyle
      attr_accessor :width

    end

  end
end