module GoogleVisualr

  class BaseChart
    include GoogleVisualr::Utilities::GoogleAttributeReflection
    include GoogleVisualr::Utilities::GooglePackageReflection
    include GoogleVisualr::Utilities::GoogleClassReflection

    attr_accessor :data_table
    attr_accessor :formatters

    ##############################
    # Constructors
    ##############################
    #
    # GoogleVisualr::visualization.new:
    # Creates an empty visualization instance. Use add_columns, add_rows and set_value or set_cell methods to populate the visualization.
    #
    # GoogleVisualr::visualization.new(data object):
    # Creates a visualization by passing a JavaScript-string-literal like data object into the data parameter. This object can contain formatting options.
    
    def initialize(options = {}, data = GoogleVisualr::DataTable::DataTable.new, formatters = [])
      set_options(options)
      @data_table = data
      @formatters = GoogleVisualr::Formatters::Formatters.new(formatters)
    end
    
    ### OPTIONS

    # Sets chart configuration options with a hash.
    #
    # Parameters:
    #  *options            [Required] A hash of configuration options.
    def set_options(options = {})
      options.each_pair do | key, value |
        send "#{key}=", value
      end
    end
    
    ### RENDER

    # Generates JavaScript and renders the visualization in the final HTML output.
    #
    # Parameters:
    #  *element_id            [Required] The ID of the DIV element that the visualization should be rendered in.
    #
    # Note: This is the super method.    
    def render(element_id)
      return render_script_tag(render_javascript_code(element_id))
    end
    
    def render_script_tag(code)
      script  = "\n<script type='text/javascript'>"
      script << "\n  //<![CDATA["
      script << "\n    #{code}"
      script << "\n    }});"
      script << "\n  //]]>"
      script << "\n</script>"
      
      return script
    end
    
    def render_javascript_code(element_id)
      code = "\n    google.load('visualization','1', {packages: ['#{determine_google_package}'], callback: function() {"
      code << "\n      #{@data_table.render}"
      if @formatters
        @formatters.each do |formatter|
          code << formatter.script
        end
      end
      code << "\n      var chart = new google.visualization.#{determine_google_class}(document.getElementById('#{element_id}'));"
      code << "\n      chart.draw(chart_data, #{determine_google_parameters});"
      
      return code
    end
        
    private

    # determines valid instance variables of child class
    def determine_google_parameters
      return determine_google_attributes(["@data_table", "@formatters"])      
    end

  end

end