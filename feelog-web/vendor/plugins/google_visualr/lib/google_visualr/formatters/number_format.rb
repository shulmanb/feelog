module GoogleVisualr
  module Formatters
    
    class NumberFormat < BaseFormat
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/reference.html#numberformatter

      attr_accessor :decimalSymbol
      attr_accessor :fractionDigits
      attr_accessor :groupingSymbol
      attr_accessor :negativeColor
      attr_accessor :negativeParens
      attr_accessor :prefix
      attr_accessor :suffix

    end
    
  end
end