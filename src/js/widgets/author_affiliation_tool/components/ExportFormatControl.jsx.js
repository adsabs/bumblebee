define(['react'], function(React) {
  /**
   * Dropdown containing export format strings for the user to select
   */
  const ExportFormatControl = (props) => {
    if (!props.formats || props.formats.length === 0) {
      return null;
    }
    return (
      <select
        onChange={(e) => props.onChange(e.target.value)}
        value={props.format}
        id="export-format-control"
        className="form-control"
        title="Select a format"
      >
        {props.formats.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    );
  };

  return ExportFormatControl;
});
