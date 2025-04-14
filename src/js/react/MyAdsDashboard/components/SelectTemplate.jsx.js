define(['react', '../constants'], function(React, { page }) {
  class SelectTemplate extends React.Component {
    render() {
      return (
        <div>
          <div className="list-group">
            <a
              href="javascript:void(0);"
              className="list-group-item"
              onClick={() => this.props.goTo(page.ARXIV_FORM)}
            >
              <h2 className="h4">arXiv</h2>
              <p>Daily updates from arXiv.org</p>
            </a>
            <a
              href="javascript:void(0);"
              className="list-group-item"
              onClick={() => this.props.goTo(page.CITATIONS_FORM)}
            >
              <h2 className="h4">Citations</h2>
              <p>
                Weekly updates on the latest citations to your papers or those
                by any other author
              </p>
            </a>
            <a
              href="javascript:void(0);"
              className="list-group-item"
              onClick={() => this.props.goTo(page.AUTHORS_FORM)}
            >
              <h2 className="h4">Authors</h2>
              <p>
                Weekly updates on the latest papers by your favorite authors
              </p>
            </a>
            <a
              href="javascript:void(0);"
              className="list-group-item"
              onClick={() => this.props.goTo(page.KEYWORD_FORM)}
            >
              <h2 className="h4">Keywords</h2>
              <p>
                Weekly updates on the most recent, most popular, and most cited
                papers on your favorite keyword(s) or any other ADS query
              </p>
            </a>
            <a
              href="javascript:void(0);"
              className="list-group-item"
              onClick={() => this.props.goTo(page.GENERAL_FORM)}
            >
              <h2 className="h4">General</h2>
              <p>
                Notification based on a general, free-form query that you can
                create from the results page.
              </p>
            </a>
          </div>
        </div>
      );
    }
  }

  return SelectTemplate;
});
