module GoogleVisualr
  module DataTable
    
    require File.dirname(__FILE__) + '/data_table/data_column'
    require File.dirname(__FILE__) + '/data_table/data_row'
    require File.dirname(__FILE__) + '/data_table/data_cell'
    
    class DataTable
      
      # google reference:
      # http://code.google.com/apis/visualization/documentation/reference.html#DataTable
    
      attr_accessor :cols
      attr_accessor :rows
      attr_accessor :cells
      
      ##############################
      # Constructors
      ##############################
      #
      # GoogleVisualr::DataTable::DataTable.new:
      # Creates an empty DataTable instance. Use add_columns, add_rows and set_value or set_cell methods to populate the DataTable.
      #
      # GoogleVisualr::DataTable::DataTable.new(data object):
      # Creates a DataTable by passing a JavaScript-string-literal like data object into the data parameter. This object can contain formatting options.
      ##############################
      # Syntax Description of Data Object
      ##############################
      #
      # The data object consists of two required top-level properties, cols and rows.
      #
      # * cols property
      #
      #   cols is an array of objects describing the ID and type of each column. Each property is an object with the following properties (case-sensitive):
      #
      #   * type            [Required] The data type of the data in the column. Supports the following string values:
      #     - 'string'    : String value. Example values: v:'foo', v:'bar'
      #     - 'number'    : Number value. Example values: v:7, v:3.14, v:-55
      #     - 'boolean'   : Boolean value ('true' or 'false'). Example values: v:true, v:false
      #     - 'date'      : Date object, with the time truncated. Example value: v:Date.parse('2010-01-01')
      #     - 'datetime'  : DateTime/Time object, time inclusive. Example value: v:DateTime.parse('2010-01-01 14:20:25')
      #     - 'timeofday' : Array of 3 numbers or 4 numbers, [Hour,Minute,Second,(Optional) Milliseconds]. Example value: v:[8, 15, 0]
      #   * label           [Optional] A string value that some visualizations display for this column. Example: label:'Height'
      #   * id              [Optional] A unique (basic alphanumeric) string ID of the column. Be careful not to choose a JavaScript keyword. Example: id:'col_1'
      #
      # * rows property
      #
      #   The rows property holds an array of row objects. Each row object has one required property called c, which is an array of cells in that row.
      #
      #   Each cell in the table is described by an object with the following properties:
      #
      #   * v               [Optional] The cell value. The data type should match the column data type.
      #   * f               [Optional] A string version of the v value, formatted strictly for display only. If omitted, a string version of v will be used.
      #
      #   Cells in the row array should be in the same order as their column descriptions in cols.
      #
      #   To indicate a null cell, you can either specify null, or set empty string for a cell in an array, or omit trailing array members.
      #   So, to indicate a row with null for the first two cells, you could specify [ '', '', {cell_val}] or [null, null, {cell_val}].
      
      def initialize(data = {})
        @cols  = Array.new
        @rows  = Array.new
        @cells = Array.new
        
        unless data.empty?
          cols = data[:cols]
          add_columns(cols)

          rows = data[:rows]
          rows.each do |row|
            add_row(row[:c])
          end
        end
      end
    
      # Adds a new column to the DataTable.
      #
      # Parameters:
      #   * type            [Required] The data type of the data in the column. Supports the following string values:
      #     - 'string'    : String value. Example values: v:'hello'
      #     - 'number'    : Number value. Example values: v:7 , v:3.14, v:-55
      #     - 'date'      : Date object, with the time truncated. Example values: v:Date.parse('2010-01-01')
      #     - 'datetime'  : Date object including the time. Example values: v:Date.parse('2010-01-01 14:20:25')
      #     - 'boolean'   : Boolean value ('true' or 'false'). Example values: v: true
      #   * label           [Optional] A string value that some visualizations display for this column. Example: label:'Height'
      #   * id              [Optional] A unique (basic alphanumeric) string ID of the column. Be careful not to choose a JavaScript keyword. Example: id:'col_1'
      def add_column (type, label = '', id = '')
        @cols << GoogleVisualr::DataTable::DataColumn.new(type, label, id)
      end

      # Adds multiple columns to the DataTable.
      #
      # Parameters:
      #   * columns         [Required] An array of column objects {:type, :label, :id}. Calls add_column for each column object.
      def add_columns(columns = Array.new)
        columns.each do |column|
          add_column(column[:type], column[:label], column[:id])
        end
      end

      # Adds a new row to the DataTable.
      # Call method without any parameters to add an empty row, otherwise, call method with a row object.
      #
      # Parameters:
      #   * row             [Optional] An array of cell values specifying the data for the new row.
      #     - You can specify a value for a cell (e.g. 'hi') or specify a formatted value using cell objects (e.g. {v:55, f:'Fifty-five'}) as described in the constructor section.
      #     - You can mix simple values and cell objects in the same method call.
      #     - To create an empty cell, use nil or empty string.
      def add_row(row = nil)
        @rows << GoogleVisualr::DataTable::DataRow.new(row)
      end

      # Adds multiple rows to the DataTable. You can call this method with data to populate a set of new rows or create new empty rows.
      #
      # Parameters:
      #   * array_or_num    [Required] Either an array or a number.
      #     - Array: An array of row objects used to populate a set of new rows. Each row is an object as described in add_row().
      #     - Number: A number specifying the number of new empty rows to create.
      def add_rows(array_or_num)

        if array_or_num.is_a?(Array)
          array_or_num.each do |row|
            add_row(row)
          end
        else
          add_row(array_or_num)
        end

      end

      # Sets the value and/or formatted value of a cell.
      #
      # Parameters:
      #   * row_index       [Required] A number greater than or equal to zero, but smaller than the total number of rows.
      #   * column_index    [Required] A number greater than or equal to zero, but smaller than the total number of columns.
      #   * value           [Required] The cell value. The data type should match the column data type.
      #   * formatted_value [Optional] A string version of value, formatted strictly for display only. If omitted, a string version of value will be used.
      def set_cell(row_index, column_index, value, formatted_value=nil, properties=nil)
        @cells << GoogleVisualr::DataTable::DataCell.new(row_index, column_index, value, formatted_value, properties)
      end

      # Sets the value of a cell. Overwrites any existing cell value, and clear out any formatted value for the cell.
      #
      # Parameters:
      #   * row_index       [Required] A number greater than or equal to zero, but smaller than the total number of rows.
      #   * column_index    [Required] A number greater than or equal to zero, but smaller than the total number of columns.
      #   * value           [Required] The cell value. The data type should match the column data type.
      def set_value(row_index, column_index, value)
        @cells << GoogleVisualr::DataTable::DataCell.new(row_index, column_index, value)
      end   
    
      def render
        res = "var chart_data = new google.visualization.DataTable();"
        
        @cols.each do |column|
          res << " #{column.render}"
        end
        
        @rows.each do |row|
          res << " #{row.render}"
        end
        
        @cells.each do |cell|
          res << " #{cell.render}"
        end
        
        return res
      end
    
    end
    
  end
end