import 'webpack-jquery-ui/autocomplete';
import 'webpack-jquery-ui/slider';
import 'webpack-jquery-ui/sortable';

// jquery plugins
$.fn.getCursorPosition = function() {
  var input = this.get(0);
  if (!input) return; // No (input) element found
  if ('selectionStart' in input) {
    // Standard-compliant browsers
    return input.selectionStart;
  }
  if (document.selection) {
    // IE
    input.focus();
    var sel = document.selection.createRange();
    var selLen = document.selection.createRange().text.length;
    sel.moveStart('character', -input.value.length);
    return sel.text.length - selLen;
  }
};

// manually highlight a selection of text, or just move the cursor if no end val is given
$.fn.selectRange = function(start, end) {
  if (!end) end = start;
  return this.each(function() {
    if (this.setSelectionRange) {
      this.focus();
      this.setSelectionRange(start, end);
    } else if (this.createTextRange) {
      var range = this.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  });
};
