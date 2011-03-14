module GoogleVisualr
  module Charts

    class ImageBarChart < BaseChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/imagebarchart.html
      
      attr_accessor :backgroundColor
      attr_accessor :colors
      attr_accessor :enableEvents
      attr_accessor :height
      attr_accessor :isStacked
      attr_accessor :isVertical
      attr_accessor :legend
      attr_accessor :max
      attr_accessor :min
      attr_accessor :showCategoryLabels
      attr_accessor :showValueLabels
      attr_accessor :title
      attr_accessor :valueLabelsInterval
      attr_accessor :width

    end
    
  end
end