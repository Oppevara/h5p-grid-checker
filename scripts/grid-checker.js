/**
 * GridChecker Content Type
 */

// XXX It might be better to create a special package for the library
(function(){
  if (window.PAPA_PARSE_LOADED === true) return;
  window.PAPA_PARSE_LOADED = true;
  var script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.6/papaparse.min.js";
  document.head.appendChild(script);
})();

var H5P = H5P || {};

/**
 * [description]
 * @param  {H5P.jQuery} $ jQuery usef by H5P Core
 * @return {function}   GridChecker constructor
 */
H5P.GridChecker = (function($, JoubelUI) {
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

  GridChecker.prototype.hasGridData = function() {
    return this.options.grid && this.options.grid.length > 0;
  };

  GridChecker.prototype.isCheckableType = function() {
    return this.options.gridBoxType === 'single' || this.options.gridBoxType === 'multiple';
  };

  GridChecker.prototype.isTextType = function() {
    return this.options.gridBoxType === 'text';
  };

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
      thead.find('tr').append('<th>' + column.columnText + '</th>');
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
      var rowName = 'row-' + row.rowId;
      $('<td>', {
        'text': row.rowText
      }).appendTo(tr);
      $.each(columns, function(columnIndex, column) {
        var td = $('<td>');
        var input = $('<input>', {
          'name': rowName,
          'value': column.columnId
        });
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

  GridChecker.prototype.checkAnswers = function() {
    var self = this;

    // XXX This should be defined once
    var lookup = {};
    if (this.hasGridData()) {
      $.each(this.options.grid, function() {
        lookup[this.gridRowId] = this.gridRowColumns;
      });
    }

    this.$container.find('input[type="checkbox"],input[type="radio"]').prop('disabled', true);

    $.each(self.options.rowsAndColumns.rows, function() {
      var row = this;
      $('input[name="row-' + row.rowId + '"]:checked').each(function() {
        var element = $(this);
        element.parent().addClass((lookup.hasOwnProperty(row.rowId) && lookup[row.rowId].indexOf(element.val()) === -1) ? 'incorrect' : 'correct');
      });
    });
  };

  GridChecker.prototype.showSolutions = function() {
    this.$container.find('input[type="checkbox"],input[type="radio"]')
      .prop('disabled', true);

    if (this.hasGridData()) {
      $.each(this.options.grid, function() {
        var single = this;
        $.each(single.gridRowColumns, function() {
          $('input[name="row-' + single.gridRowId + '"][value="' + this + '"]:not(:checked)').parent().addClass('solution');
        });
      });
    }
  };

  GridChecker.prototype.tryAgain = function() {
    this.$container.find('input[type="checkbox"],input[type="radio"]')
      .prop('disabled', false)
      .prop('checked', false);

    this.$container.find('td.correct, td.incorrect, td.solution').removeClass('correct incorrect solution');
  };

  GridChecker.prototype.downloadResponses = function() {
    var self = this;
    var rows = this.options.rowsAndColumns.rows;
    var columns = this.options.rowsAndColumns.columns;
    var data = [];

    data.push(['']);
    $.each(columns, function() {
      data[0].push(this.columnText);
    });

    $.each(rows, function() {
      var row = this;
      var single = [this.rowText];

      self.$container.find('input[type="text"][name="row-' + row.rowId + '"]').each(function() {
        single.push($(this).val());
      });

      data.push(single);
    });

    // XXX This is not the most elegant solution
    // Should be replaced by a meaningful library
    window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(Papa.unparse(data)), '_blank');
  };

  /**
   * Creates and fills container with content
   * @param  {object} $container Container node
   */
  GridChecker.prototype.attach = function($container) {
    var self = this;
    this.$container = $container;

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

    if (self.isCheckableType()) {
      JoubelUI.createButton({
        'class': 'h5p-question-check-answer',
        'html': 'Check answers', // TODO Translate
        'on': {
          'click': function() {
            self.checkAnswers();
            $(this).hide();
            $container.find('button.h5p-question-show-solution, button.h5p-question-try-again').show();
          }
        },
        'appendTo': $container
      });

      JoubelUI.createButton({
        'class': 'h5p-question-try-again',
        'style': 'display:none',
        'html': 'Try again', // TODO Translate
        'on': {
          'click': function() {
            self.tryAgain();
            $container.find('button.h5p-question-check-answer').show();
            $container.find('button.h5p-question-show-solution, button.h5p-question-try-again').hide();
          }
        },
        'appendTo': $container
      });

      JoubelUI.createButton({
        'class': 'h5p-question-show-solution',
        'style': 'display:none;',
        'html': 'Show solutions', // TODO Translate
        'on': {
          'click': function() {
            self.showSolutions();
            $(this).hide();
          }
        },
        'appendTo': $container
      });
    }

    if ( self.isTextType() ) {
      JoubelUI.createButton({
        'class': 'h5p-grid-checker-download-responses',
        'html': 'Download responses', // TODO Translate
        'on': {
          'click': function() {
            self.downloadResponses();
          }
        },
        'appendTo': $container
      });
    }
  };

  return GridChecker;
})(H5P.jQuery, H5P.JoubelUI);
