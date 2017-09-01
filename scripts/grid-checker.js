var H5P = H5P || {};

H5P.GridChecker = (function($) {
  function GridChecker(options, id) {
    this.options = options;
    this.id = id;
  }

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

  GridChecker.prototype.buildGridTableBody = function(options) {
    var rows = this.options.rowsAndColumns.rows;
    var columns = this.options.rowsAndColumns.columns;
    var gridBoxType = this.options.gridBoxType;
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

  GridChecker.prototype.buildGridTable = function(options) {
    var table = $('<table>');

    table.append(this.buildGridTableHead(options.rowsAndColumns.columns));
    table.append(this.buildGridTableBody(options));

    return table;
  };

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
