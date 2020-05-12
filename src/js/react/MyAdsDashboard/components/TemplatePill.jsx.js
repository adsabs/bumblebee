define(['react'], function(React) {
  /**
   * @typedef TemplateType
   * @property {string} color
   * @property {string} label
   */

  /** @type {Object.<string, TemplateType>} */
  const templateTypeConstants = {
    arxiv: { color: 'primary', label: 'arXiv' },
    citations: { color: 'info', label: 'Citations' },
    authors: { color: 'warning', label: 'Authors' },
    keyword: { color: 'success', label: 'Keyword' },
    general: { color: '#AA5535', label: 'General' },
  };

  /**
   *
   * @param {string} shortName the name of the template type
   * @returns {string}
   */
  const getTemplateLabel = (shortName) => {
    return templateTypeConstants[shortName].label;
  };

  /**
   *
   * @param {Object} props
   * @param {string} props.name the name of the template type
   */
  const TemplatePill = ({ name, disabled }) => {
    let shortName = name || 'general';
    let isHex = templateTypeConstants[shortName].color.startsWith('#');
    return (
      <span
        className={`label label-${
          isHex ? 'default' : templateTypeConstants[shortName].color
        } ${disabled ? 'text-faded' : ''}`}
        style={{
          maxWidth: 120,
          display: 'block',
          color: disabled ? '#999999' : 'white',
          backgroundColor: isHex
            ? templateTypeConstants[shortName].color
            : 'auto',
        }}
      >
        {getTemplateLabel(shortName)}
      </span>
    );
  };

  return TemplatePill;
});
