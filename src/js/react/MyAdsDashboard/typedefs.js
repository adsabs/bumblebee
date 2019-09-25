/**
 * @enum {string}
 */
const TemplateTypes = {
  ARXIV: 'arxiv',
  AUTHORS: 'authors',
  CITATIONS: 'citations',
  KEYWORD: 'keyword',
  GENERAL: 'general'
};

/**
 * @typedef Notification
 * @property {string} id
 * @property {string} name
 * @property {TemplateTypes} type
 * @property {string} frequency
 * @property {string} created
 * @property {boolean} active
 *
 * @typedef Request
 * @property {string} status
 * @property {any} result
 * @property {string} error
 */

export { TemplateTypes };
