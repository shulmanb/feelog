module GoogleVisualr
  module DataTable
  
    class DataColumn
    
      attr_accessor :type
      attr_accessor :label
      attr_accessor :id

      def initialize(type, label = '', id = '')
        @type  = type
        @label = label
        @id    = id
      end
    
      def render
        "chart_data.addColumn('#{@type}', '#{@label}', '#{@id}');"
      end

    end
    
  end
end