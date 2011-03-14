module GoogleVisualr
  module Utilities
    
    module GoogleAttributeReflection
      
      private
      
      def determine_google_attributes(rejected_attributes = [])
        
        attributes = instance_variable_names
        parameters = Array.new
        
        rejected_attributes.each do |rejected_attribute|
          attributes.delete(rejected_attribute)
        end
        
        attributes.each do |attribute|
          key         = attribute.gsub("@", "")
          value       = instance_variable_get(attribute)
          parameter   = "#{key}:#{GoogleVisualr::Utilities::GoogleTypeConversion.convert(value)}"
          parameters << parameter
        end

        return "{" + parameters.join(",") + "}"
      end
      
    end
  
  end
end