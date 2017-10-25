/**
 * GridChecker Content Type
 */

// It would be useful to load those as H5P dependencies, but those seem to want to attach themselves to global window object
(function(){
  if (window.PAPA_PARSE_LOADED === true) return;
  window.PAPA_PARSE_LOADED = true;
  var script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.6/papaparse.min.js";
  document.head.appendChild(script);
})();
(function(){
  if (window.BLOB_POLYFILL_LOADED === true) return;
  window.BLOB_POLYFILL_LOADED = true;
  var script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/blob-polyfill/1.0.20150320/Blob.min.js";
  document.head.appendChild(script);
})();
(function(){
  if (window.FILE_SAVER_LOADED === true) return;
  window.FILE_SAVERLOADED = true;
  var script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js";
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

    this.l10n = $.extend({
      'checkAnswers': 'Check answers',
      'tryAgain': 'Try again',
      'showSolutions': 'Show solutions',
      'downloadResponses': 'Download responses',
      'missingAnswersHeading': 'Some answers are missing',
      'missingAnswersBody': 'At least one row is missing an answer! Please corret and try again!'
    }, options.l10n !== undefined ? options.l10n : {});
  }

  /**
   * Returns headline
   * @return {string} Headline text
   */
  GridChecker.prototype.getHeadline = function() {
    return this.options.headline;
  };

  /**
   * Retuns body text
   * @return {string} Body text
   */
  GridChecker.prototype.getBodyText = function() {
    return this.options.bodyText;
  };

  /**
   * Returns rows data
   * @return {array} An array with rows
   */
  GridChecker.prototype.getRows = function() {
    return this.options.rowsAndColumns.rows;
  };

  /**
   * Returns columns data
   * @return {array} An array with columns
   */
  GridChecker.prototype.getColumns = function() {
    return this.options.rowsAndColumns.columns;
  };

  /**
   * Returns Grid Box Type option
   * @return {string} Type value
   */
  GridChecker.prototype.getType = function() {
    return this.options.gridBoxType;
  };

  /**
   * Returns requireResponse option value
   * @return {boolean} Response is required or not
   */
  GridChecker.prototype.getRequireResponse = function() {
    return this.options.requireResponse;
  };

  /**
   * Returns grid data or an empty array
   * @return {array}
   */
  GridChecker.prototype.getGrid = function() {
    return this.options.grid || [];
  };

  /**
   * Determines if grid data is available
   * @return {boolean}
   */
  GridChecker.prototype.hasGridData = function() {
    var grid = this.getGrid();

    return grid && grid.length > 0;
  };

  /**
   * Returns columns array for a row or an empty array
   * @param  {object} row Grid row
   * @return {array}      Columns data
   */
  GridChecker.prototype.getGridRowColumns = function(row) {
      return (row.hasOwnProperty('gridRowColumns') && Array.isArray(row.gridRowColumns)) ? row.gridRowColumns : [];
  };

  /**
   * Determines if current type is checkable
   * @return {boolean}
   */
  GridChecker.prototype.isCheckableType = function() {
    return ['single', 'multiple'].indexOf(this.getType()) !== -1;
  };

  /**
   * Determines if current type is textual
   * @return {boolean}
   */
  GridChecker.prototype.isTextType = function() {
    return this.getType() === 'text';
  };

  /**
   * Build table head and appends to table node provided
   * @param  {object} table   Table node
   * @param  {array}  columns Columns data
   * @return {object}         Resulting table head node
   */
  GridChecker.prototype.buildGridTableHead = function(table, columns) {
    var tr = $('<tr>');

    $('<th>').appendTo(tr);
    $.each(columns, function(index, column) {
      $('<th>', {
        'html': column.columnText
      }).appendTo(tr);
    });

    $('<thead>').append(tr).appendTo(table);
  };

  /**
   * Build table body and appends to table node provided
   * @param  {object} table Table node
   * @return {object}       Resulting table body node
   */
  GridChecker.prototype.buildGridTableBody = function(table) {
    var self = this;
    var type = self.getType();
    var tbody = $('<tbody>');

    $.each(self.getRows(), function() {
      var row = this;
      var rowName = 'row-' + row.rowId;
      var tr = $('<tr>', {
        'class': rowName
      });
      $('<td>', {
        'html': row.rowText
      }).appendTo(tr);
      $.each(self.getColumns(), function() {
        var column = this;
        var td = $('<td>');
        var input = $('<input>', {
          'name': rowName,
          'value': column.columnId
        });
        switch(type) {
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

    tbody.appendTo(table);
  };

  /**
   * Builds and returns a table
   * @return {object} Resulting table node
   */
  GridChecker.prototype.buildGridTable = function() {
    var table = $('<table>', {
      'class': 'h5p-grid-checker-response'
    });

    this.buildGridTableHead(table, this.getColumns());
    this.buildGridTableBody(table);

    return table;
  };

  /**
   * Determines if current marked andwers pass validation.
   * Only checks each row having a value in case on checable type and response requirement
   * @return {boolean} Marked responses have passed validation logic
   */
  GridChecker.prototype.validateCheckAnswers = function() {
    var self = this;

    if (!self.isCheckableType()) {
      return true;
    }

    if (self.getRequireResponse() !== true) {
      return true;
    }

    var valid = true;
    $.each(self.getRows(), function() {
      var row = this;
      if (self.$container.find('input[name="row-' + row.rowId + '"]:checked').length === 0) {
        valid = false;
      }
    });

    return valid;
  };

  /**
   * Check given answers and apply corresponding visuals
   * @return {void}
   */
  GridChecker.prototype.checkAnswers = function() {
    var self = this;

    // XXX This should be defined once
    var lookup = {};
    if (self.hasGridData()) {
      $.each(self.getGrid(), function() {
        lookup[this.gridRowId] = self.getGridRowColumns(this);
      });
    }

    self.$container.find('input[type="checkbox"],input[type="radio"]').prop('disabled', true);

    $.each(self.getRows(), function() {
      var row = this;
      self.$container.find('input[name="row-' + row.rowId + '"]:checked').each(function() {
        var element = $(this);
        element.parent().addClass((lookup.hasOwnProperty(row.rowId) && lookup[row.rowId].indexOf(element.val()) === -1) ? 'incorrect' : 'correct');
      });
    });
  };

  /**
   * Check given answers and apply visuals to unmarked correct answers
   * @return {void}
   */
  GridChecker.prototype.showSolutions = function() {
    var self = this;

    self.$container.find('input[type="checkbox"],input[type="radio"]')
      .prop('disabled', true);

    if (self.hasGridData()) {
      $.each(self.getGrid(), function() {
        var single = this;
        $.each(self.getGridRowColumns(single), function() {
          self.$container.find('input[name="row-' + single.gridRowId + '"][value="' + this + '"]:not(:checked)').parent().addClass('solution');
        });
      });
    }
  };

  /**
   * Uncheck given andwers and remove any checking or validation visuals
   * @return {void}
   */
  GridChecker.prototype.tryAgain = function() {
    this.$container.find('input[type="checkbox"],input[type="radio"]')
      .prop('disabled', false)
      .prop('checked', false);

    this.$container.find('td.correct, td.incorrect, td.solution').removeClass('correct incorrect solution');
  };

  /**
   * Trigger download of CSV file with textual data
   * @return {void}
   */
  GridChecker.prototype.downloadResponses = function() {
    var self = this;
    var data = [];

    data.push(['']);
    $.each(self.getColumns(), function() {
      data[0].push(this.columnText);
    });

    $.each(self.getRows(), function() {
      var dataRow = [this.rowText];

      self.$container.find('input[type="text"][name="row-' + this.rowId + '"]').each(function() {
        dataRow.push($(this).val());
      });

      data.push(dataRow);
    });

    saveAs(new Blob([Papa.unparse(data)], { type: 'text/csv;charset=utf-8' }), "responses.csv");
  };

  /**
   * Creates and fills container with content
   * @param  {object} $container Container node
   * @return {void}
   */
  GridChecker.prototype.attach = function($container) {
    var self = this;
    self.$container = $container;

    $container.addClass('h5p-grid-checker');
    $('<h3>', {
      'class': 'h5p-grid-check-headline',
      'html': self.getHeadline()
    }).appendTo($container);

    if (self.getBodyText()) {
      $('<div>', {
        'class': 'h5p-grid-checker-bodyText',
        'html': self.getBodyText()
      }).appendTo($container);
    }

    if (self.getRows().length > 0 && self.getColumns().length > 0) {
      var tableContainer = $('<div>', {
        'class': 'h5p-grid-checker-responsive'
      }).append(this.buildGridTable(this.options))
      .appendTo($container);
    }

    if (self.isCheckableType()) {
      JoubelUI.createButton({
        'class': 'h5p-question-check-answer',
        'html': self.l10n.checkAnswers,
        'on': {
          'click': function() {
            if (!self.validateCheckAnswers()) {
              JoubelUI.createHelpTextDialog(self.l10n.missingAnswersHeading, self.l10n.missingAnswersBody).appendTo($container);
              return;
            }
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
        'html': self.l10n.tryAgain,
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
        'html': self.l10n.showSolutions,
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
        'html': self.l10n.downloadResponses,
        'on': {
          'click': function() {
            $container.find('input[name^="row-"][type="text"]').prop('disabled', true);
            self.downloadResponses();
            $(this).hide();
            $container.find('button.h5p-question-try-again').show();
          }
        },
        'appendTo': $container
      });

      JoubelUI.createButton({
        'class': 'h5p-question-try-again',
        'style': 'display:none',
        'html': self.l10n.tryAgain,
        'on': {
          'click': function() {
            $(this).hide();
            $container.find('input[name^="row-"][type="text"]').val('').prop('disabled', false);
            $container.find('button.h5p-question-check-answer').show();
          }
        },
        'appendTo': $container
      });
    }
  };

  return GridChecker;
})(H5P.jQuery, H5P.JoubelUI);
