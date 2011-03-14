module GoogleVisualr
  module Formatters
    
    class BarFormat   < BaseFormat
      
      # google reference
      # http://code.google.com/apis/visualization/documentation/reference.html#barformatter

      attr_accessor :base
      attr_accessor :colorNegative
      attr_accessor :colorPositive
      attr_accessor :drawZeroLine
      attr_accessor :max
      attr_accessor :min
      attr_accessor :showValue
      attr_accessor :width

    end
  
  end 
end
