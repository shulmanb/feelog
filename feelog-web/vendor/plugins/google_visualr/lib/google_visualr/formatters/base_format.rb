module GoogleVisualr
  module Formatters
  
    class BaseFormat
      include GoogleVisualr::Utilities::GoogleAttributeReflection
      include GoogleVisualr::Utilities::GoogleClassReflection

      # google reference:
      # http://code.google.com/apis/visualization/documentation/reference.html#formatters

      attr_accessor :columns

      def initialize(options = {})
        @columns = Array.new
        
        options.each_pair do | key, value |
          self.send "#{key}=", value
        end
      end

      def columns(*columns)
        @columns = columns.flatten
      end

      def script
        script   = "\nvar formatter = new google.visualization.#{determine_google_class}("
        script  <<  determine_google_parameters
        script  << ");"

        @columns.each do |column|
         script << "formatter.format(chart_data, #{column});"
        end
        return script
      end
            
      private
            
      # determines defined instance variables of child class
      def determine_google_parameters
        return determine_google_attributes(["@columns"])
      end
      
    end
    
 end
end