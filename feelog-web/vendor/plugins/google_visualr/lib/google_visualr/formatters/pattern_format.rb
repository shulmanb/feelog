module GoogleVisualr
  module Formatters
    
    class PatternFormat < BaseFormat
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/reference.html#patternformatter

      attr_accessor :pattern
      attr_accessor :target_column
      
      def script
        script   = "\n      var formatter = new google.visualization.#{determine_google_class}("
        script  <<  "'#{@pattern}'"
        script  << ");"
        script  << " formatter.format(chart_data, [#{@columns.join(",")}]"
        script  << ", #{@target_column}" unless @target_column.blank?
        script  << ");"
        return script
      end
      
    end
    
  end
end