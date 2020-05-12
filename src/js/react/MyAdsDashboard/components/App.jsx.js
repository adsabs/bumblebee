define([
  'react',
  '../constants',
  '../containers/Dashboard',
  '../containers/SelectTemplate',
  '../containers/ArxivForm',
  '../containers/CitationsForm',
  '../containers/AuthorsForm',
  '../containers/KeywordForm',
  '../containers/GeneralForm',
  '../containers/ImportNotificationsForm',
], function(
  React,
  { page: PAGE },
  Dashboard,
  SelectTemplate,
  ArxivForm,
  CitationsForm,
  AuthorsForm,
  KeywordForm,
  GeneralForm,
  ImportNotificationsForm
) {
  const getComponent = (page) => {
    switch (page) {
      case PAGE.DASHBOARD:
        return <Dashboard />;
      case PAGE.ARXIV_FORM:
        return <ArxivForm />;
      case PAGE.CITATIONS_FORM:
        return <CitationsForm />;
      case PAGE.AUTHORS_FORM:
        return <AuthorsForm />;
      case PAGE.KEYWORD_FORM:
        return <KeywordForm />;
      case PAGE.GENERAL_FORM:
        return <GeneralForm />;
      case PAGE.SELECT_TEMPLATE:
        return <SelectTemplate />;
      case PAGE.IMPORT_NOTIFICATIONS:
        return <ImportNotificationsForm />;
    }
  };

  const TITLES = {
    [PAGE.ARXIV_FORM]: 'arXiv',
    [PAGE.CITATIONS_FORM]: 'Citations',
    [PAGE.AUTHORS_FORM]: 'Authors',
    [PAGE.KEYWORD_FORM]: 'Keywords',
    [PAGE.GENERAL_FORM]: 'General',
    [PAGE.SELECT_TEMPLATE]: 'Create New',
    [PAGE.IMPORT_NOTIFICATIONS]: 'Import',
  };

  const getMiddleMessage = (page, isEditing) => {
    let msg = '';
    if (
      page !== PAGE.SELECT_TEMPLATE &&
      page !== PAGE.IMPORT_NOTIFICATIONS &&
      page !== PAGE.DASHBOARD
    ) {
      msg = ` ${isEditing ? 'Editing' : 'Create New'} |`;
    }
    return msg;
  };

  const getPageTitle = (page, isEditing) => {
    let title = TITLES[page];

    if (title) {
      return `myADS |${getMiddleMessage(page, isEditing)} ${title}`;
    }
    return 'myADS';
  };

  const getBackButton = (page, onClick) => {
    if (page === PAGE.DASHBOARD) {
      return null;
    }

    let onBack;
    switch (page) {
      case PAGE.ARXIV_FORM:
      case PAGE.CITATIONS_FORM:
      case PAGE.KEYWORD_FORM:
      case PAGE.AUTHORS_FORM:
      case PAGE.GENERAL_FORM:
        onBack = onClick.bind(null, PAGE.SELECT_TEMPLATE);
        break;
      default:
        onBack = onClick.bind(null, PAGE.DASHBOARD);
    }

    return (
      <button className="btn btn-default" onClick={onBack} title="go back">
        <i className="fa fa-chevron-left" aria-hidden="true" /> Go Back
      </button>
    );
  };

  class App extends React.Component {
    render() {
      return (
        <div className="panel panel-default" style={{ marginTop: 50 }}>
          <div className="panel-heading">
            {getBackButton(
              this.props.editingNotification ? null : this.props.page,
              this.props.goTo
            )}{' '}
            {getPageTitle(this.props.page, this.props.editingNotification)}
          </div>
          <div className="panel-body" style={{ minHeight: 600 }}>
            {getComponent(this.props.page)}
          </div>
        </div>
      );
    }
  }

  return App;
});
