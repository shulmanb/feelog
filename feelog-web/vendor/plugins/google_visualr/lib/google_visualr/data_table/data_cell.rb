module GoogleVisualr
  module DataTable
    
    class DataCell
      
      attr_accessor :row_index
      attr_accessor :column_index
      attr_accessor :value
      attr_accessor :formatted_value
      attr_accessor :properties
      
      
      def initialize(row_index, column_index, value, formatted_value = nil , properties = nil)
        @row_index        = row_index
        @column_index     = column_index
        @value            = value
        @formatted_value  = formatted_value
        @properties       = properties
      end
      
      def render
        res = ""
        res << "chart_data.setCell("
        res << "#{row_index}, #{column_index}, #{GoogleVisualr::Utilities::GoogleTypeConversion.convert(value)}"
        res << ", '#{formatted_value}'" unless formatted_value.blank?
        res << ", '#{properties}'"      unless properties.blank?
        res << ");"
        return res
      end
      
    end
  end
end