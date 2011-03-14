module GoogleVisualr
  module DataTable
    
    class DataRow
    
      attr_accessor :data
      attr_accessor :count
    
      def initialize(row_or_number)
        if row_or_number.is_a?(Array)
          @data   = row_or_number
          @count  = nil
        else
          @data   = nil 
          @count  = row_or_number
        end
      end
    
      def render
        if @data
          return "chart_data.addRow( [" +  @data.join(",")  + "] );"
        else
          return "chart_data.addRows(#{@count});"
        end
      end
    
    end
    
  end
end