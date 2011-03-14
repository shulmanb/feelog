module GoogleVisualr
  module Utilities
    
    module GooglePackageReflection
      
      protected

      # Defines a concrete google api package name
      def google_package
        return nil
      end

      private

      # Determines the google api package name
      def determine_google_package
        return (google_package || self.class.to_s.split('::').last.downcase)
      end      
      
    end
    
  end
end