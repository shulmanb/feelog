module GoogleVisualr
  module Charts

    class ImageAreaChart < BaseChart

      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/imageareachart.html
      
      attr_accessor :backgroundColor
      attr_accessor :colors
      attr_accessor :enableEvents
      attr_accessor :height
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