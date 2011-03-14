module GoogleVisualr
  module Utilities
    
    module GoogleClassReflection
      
      protected 
      
      # Defines a concrete google api class name
      def google_class
        return nil
      end
      
      private
      
      # Determines the google api class name
      def determine_google_class
        return (google_class || self.class.to_s.split('::').last)
      end
      
    end
    
  end
end