module GoogleVisualr
  module Formatters
    
    class DateFormat  < BaseFormat
      
      # google reference: 
      # http://code.google.com/apis/visualization/documentation/reference.html#dateformatter

      attr_accessor :formatType
      attr_accessor :pattern
      attr_accessor :timeZone
      
    end

  end
end
