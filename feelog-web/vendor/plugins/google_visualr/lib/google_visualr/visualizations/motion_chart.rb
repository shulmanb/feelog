module GoogleVisualr
  module Visualizations

    class MotionChart < BaseChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/motionchart.html
      
      attr_accessor :height
      attr_accessor :width
      attr_accessor :state
      attr_accessor :showChartButtons
      attr_accessor :showHeader
      attr_accessor :showSelectListComponent
      attr_accessor :showSidePanel
      attr_accessor :showXMetricPicker
      attr_accessor :showYMetricPicker
      attr_accessor :showXScalePicker
      attr_accessor :showYScalePicker
      attr_accessor :showAdvancedPanel

    end
    
  end
end