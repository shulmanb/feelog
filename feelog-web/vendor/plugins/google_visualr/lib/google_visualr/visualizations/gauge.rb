module GoogleVisualr
  module Visualizations

    class Gauge < BaseChart
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/gallery/gauge.html
      
      attr_accessor :greenFrom
      attr_accessor :greenTo
      attr_accessor :height
      attr_accessor :majorTicks
      attr_accessor :max
      attr_accessor :min
      attr_accessor :minorTicks
      attr_accessor :redFrom
      attr_accessor :redTo
      attr_accessor :width
      attr_accessor :yellowFrom
      attr_accessor :yellowTo

    end

  end
end