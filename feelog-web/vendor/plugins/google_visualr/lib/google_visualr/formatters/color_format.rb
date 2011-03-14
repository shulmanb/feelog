module GoogleVisualr
  module Formatters
    
    class ColorFormat < BaseFormat
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/reference.html#colorformatter

      attr_accessor :ranges
      attr_accessor :gradient_ranges

      def initialize
        @ranges           = Array.new
        @gradient_ranges  = Array.new
        super()
      end

      def add_range(from, to, color, bgcolor)
        options = { :from => from, :to => to, :color => color, :bgcolor => bgcolor }
        [:from, :to].each do |attr|
          options[attr] ||= 'null'
        end
        @ranges           << options
      end
  
      def add_gradient_range(from, to, color, fromBgColor, toBgColor)
        options = { :from => from, :to => to, :color => color, :fromBgColor => fromBgColor, :toBgColor => toBgColor }
        [:from, :to].each do |attr|
          options[attr] ||= 'null'
        end
        @gradient_ranges  << options
      end

      def script
        script  = "\nvar formatter = new google.visualization.#{determine_google_class}();"
        @ranges.each do |r|
          script << "formatter.addRange( #{r[:from]}, #{r[:to]}, '#{r[:color]}', '#{r[:bgcolor]}' );"
        end

        @gradient_ranges.each do |r|
          script << "formatter.addGradientRange( #{r[:from]}, #{r[:to]}, '#{r[:color]}', '#{r[:fromBgColor]}', '#{r[:toBgColor]}' );"
        end

        @columns.each do |column|
          script << "formatter.format(chart_data, #{column});"
        end
        return script
      end

    end
    
  end 
end