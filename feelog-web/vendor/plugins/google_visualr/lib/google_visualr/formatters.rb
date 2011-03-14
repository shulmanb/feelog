module GoogleVisualr
  module Formatters
    
    # google reference:
    # http://code.google.com/apis/visualization/documentation/reference.html#formatters
    
    require File.dirname(__FILE__) + '/formatters/base_format'
    require File.dirname(__FILE__) + '/formatters/arrow_format'
    require File.dirname(__FILE__) + '/formatters/bar_format'
    require File.dirname(__FILE__) + '/formatters/color_format'
    require File.dirname(__FILE__) + '/formatters/date_format'
    require File.dirname(__FILE__) + '/formatters/number_format'
    require File.dirname(__FILE__) + '/formatters/pattern_format'
    
    class Formatters < Array
      
      def initialize(formatters = [])
        add_formats(formatters)
      end
      
      def add(format = nil)
        self.push(format) if( !format.nil? and format.is_a?(GoogleVisualr::Formatters::BaseFormat) )
      end
      
      def add_formats(formatters = [])
        unless formatters.empty?
          formatters.each do |format|
            add(format)
          end
        end        
      end
      
    end
    
  end
end