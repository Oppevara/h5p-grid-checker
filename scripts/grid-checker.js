/**
 * GridChecker Content Type
 */

var H5P = H5P || {};

/**
 * [description]
 * @param  {H5P.jQuery} $ jQuery usef by H5P Core
 * @return {function}   GridChecker constructor
 */
H5P.GridChecker = (function($) {
  /**
   * Constructor function
   * @param       {object} options Object holding current data and configurations
   * @param       {integer} id     Entity unique identifier
   * @constructor
   */
  function GridChecker(options, id) {
    this.options = options;
    this.id = id;
  }

  /**
   * Builds and returns a table head node
   * @param  {array} columns Columns data
   * @return {object}        Resulting table head node
   */
  GridChecker.prototype.buildGridTableHead = function(columns) {
    var thead = $('<thead>');

    thead.append('<tr>');
    $.each(columns, function(index, column) {
      if (index === 0) {
        thead.find('tr').append('<th>');
      }
      thead.find('tr').append('<th>' + column + '</th>');
    });

    return thead;
  };

  /**
   * Builds and returns a table body
   * @param  {object} options Data object of the content
   * @return {object}         Resulting table body node
   */
  GridChecker.prototype.buildGridTableBody = function(options) {
    var rows = options.rowsAndColumns.rows;
    var columns = options.rowsAndColumns.columns;
    var gridBoxType = options.gridBoxType;
    var tbody = $('<tbody>');

    $.each(rows, function(rowIndex, row) {
      var tr = $('<tr>');
      var rowName = 'row-' + rowIndex;
      $('<td>').text(row).appendTo(tr);
      $.each(columns, function(columnIndex, column) {
        var td = $('<td>');
        var input = $('<input>');
        input.attr('name', rowName).attr('value', columnIndex);
        switch(gridBoxType) {
          case "single":
            input.attr('type', 'radio');
            break;
          case "multiple":
            input.attr('type', 'checkbox');
            break;
          case "text":
            input.attr('type', 'text').attr('value', '');
            break;
        }
        td.append(input);
        tr.append(td);
      });
      tbody.append(tr);
    });

    return tbody;
  };

  /**
   * Builds and returns a table
   * @param  {object} options Data object of the content
   * @return {object}         Resulting table node
   */
  GridChecker.prototype.buildGridTable = function(options) {
    var table = $('<table>');

    table.addClass('h5p-grid-checker-response');

    table.append(this.buildGridTableHead(options.rowsAndColumns.columns));
    table.append(this.buildGridTableBody(options));

    return table;
  };

  /**
   * Creates and fills container with content
   * @param  {object} $container Container node
   */
  GridChecker.prototype.attach = function($container) {
    $container.addClass('h5p-grid-checker');
    $('<h3>').addClass('h5p-grid-check-headline').text(this.options.headline).appendTo($container);

    if (this.options.bodyText) {
      $('<div>').addClass('h5p-grid-checker-bodyText').html(this.options.bodyText).appendTo($container);
    }

    if (this.options.rowsAndColumns && this.options.rowsAndColumns.rows.length > 0 && this.options.rowsAndColumns.columns.length > 0) {
      var tableContainer = $('<div>').addClass('h5p-grid-checker-responsive');

      tableContainer.append(this.buildGridTable(this.options));
      $container.append(tableContainer);
    }
  };

  return GridChecker;
})(H5P.jQuery);
