'use strict';
define([
  'react',
  'jquery'
], function (React, $) {

  var NoBibcodeMessage = React.createClass({
    render: function () {
      return (
        <div>
          <h2 className="s-abstract-title">Abstract Not Found</h2>
          <div className="s-abstract-text">
            No Valid abstract selected for retrieval or abstract not yet indexed in ADS.
          </div>
        </div>
      );
    }
  });

  var Title = React.createClass({
    render: function () {
      return (
        <h2
          className="s-abstract-title"
          dangerouslySetInnerHTML={{__html: this.props.title}}
        ></h2>
      );
    }
  });

  var AuthorAffiliationButton = React.createClass({
    render: function () {
      if (this.props.hasAffiliation) {
        return (
          <button
            className="btn btn-xs btn-default-flat s-toggle-aff"
            id="toggle-aff"
            onClick={this.props.toggleShowAffiliations}
          >{this.props.showAffiliations ? 'Hide' : 'Show'} Affiliations</button>
        );
      }
      return null;
    }
  });

  var MoreAuthorsButton = React.createClass({
    render: function () {
      if (this.props.hasMoreAuthors) {
        return (
          <button
            className="btn btn-xs btn-default-flat s-toggle-authors"
            id="toggle-more-authors"
            onClick={this.props.toggleExtraAuthors}
          >{this.props.showExtraAuthors ? 'Hide' : 'Show All'} Authors</button>
        );
      }
      return null;
    }
  });

  var AuthorsAndAff = React.createClass({
    render: function () {
      var props = this.props;
      var dots = null;
      var links = function (items) {
        return items.map(function (item, n) {
          var name = item[0];
          var aff = item[1];
          var link = item[2];
          var href = '#search/q=author:' + link + '&sort=date%20desc,%20bibcode%20desc';
          var affiliations = null;

          if (props.showAffiliations) {
            affiliations = (
              <span className="affiliation">
              &nbsp;(<i>{aff}</i>)
            </span>
            );
          }

          return (
            <li className="author">
              <a href={href}>{name}</a>
              {affiliations}
              {(n === items.length - 1) ? '' : ';'}
            </li>
          );
        });
      };

      if (props.hasMoreAuthors && !props.showExtraAuthors) {
        dots = (
          <li className="author extra-dots">
            ; <a
            title="Show All Authors"
            style={{cursor: 'pointer'}}
            onClick={props.toggleExtraAuthors}>...</a>
          </li>
        );
      }

      return (
        <div className="s-authors-and-aff" id="authors-and-aff">
          <ul className="list-inline">
            {links(props.authorAff)}
            {dots}
            {props.showExtraAuthors ? links(props.authorAffExtra) : null}
          </ul>
        </div>
      );
    }
  });

  var AbstractText = React.createClass({
    render: function () {
      return (
        <div className="s-abstract-text">
          <h4 className="sr-only">Abstract</h4>
          {(this.props.abstract) ?
            <p dangerouslySetInnerHTML={{__html: this.props.abstract}}></p> :
            <p><i>No Abstract</i></p>
          }
        </div>
      );
    }
  });

  var AbstractMetaData = React.createClass({
    render: function () {
      var props = this.props;
      var pubRaw = null;
      var formattedDate = null;
      var doi = null;
      var bibcode = null;
      var keywords = null;

      if (props.pub_raw) {
        pubRaw = (
          <div>
            <dt>Publication</dt>
            <dd>
              <div id="article-publication"
                   dangerouslySetInnerHTML={{__html: props.pub_raw }}
              ></div>
            </dd>
          </div>
        );
      }

      if (props.formattedDate) {
        formattedDate = (
          <div>
            <dt>Pub Date:</dt>
            <dd>{props.formattedDate}</dd>
          </div>
        );
      }

      if (props.doi) {
        doi = (
          <div>
            <dt>DOI:</dt>
            <dd><a href={props.doi.href} target="_blank">{props.doi.doi}</a></dd>
          </div>
        )
      }

      if (props.bibcode) {
        bibcode = (
          <div>
            <dt>Bibcode</dt>
            <dd>
              {props.bibcode}
              &nbsp;
              <i
                ref="helpPopover"
                className="icon-help"
                data-toggle="popover"
                data-content="The bibcode is assigned by the ADS as a unique identifier for the paper."
              ></i>
            </dd>
          </div>
        );
      }

      if (props.keyword) {
        var items = props.keyword.map(function (k, n) {
          if (n === props.keyword.length - 1) {
            return (<li>{k}</li>);
          }
          return (<li>{k};</li>)
        });

        keywords = (
          <div id="keywords">
            <dt>Keywords</dt>
            <dd>
              <ul className="list-inline">
                {items}
              </ul>
            </dd>
          </div>
        );
      }

      return (
        <dl className="s-abstract-dl-horizontal">
          {pubRaw}
          {formattedDate}
          {doi}
          {bibcode}
          {keywords}
        </dl>
      );
    },
    componentDidMount: function () {

      // Initialize help popover
      $(this.refs['helpPopover']).popover({
        trigger: 'hover',
        placement: 'right',
        html: true
      });
    }
  });

  var AbstractComponent = React.createClass({
    getInitialState: function () {
      return {
        showExtraAuthors: false,
        showAffiliations: false
      };
    },
    toggleShowAffiliations: function () {
      this.setState({
        showAffiliations: !this.state.showAffiliations
      });
    },
    toggleExtraAuthors: function () {
      this.setState({
        showExtraAuthors: !this.state.showExtraAuthors
      });
    },
    render: function () {
      var docs = this.props.docs;
      if (!docs) {
        return null;
      }
      if (!docs.bibcode) {
        return (<NoBibcodeMessage/>);
      }

      return (
        <div>
          <Title title={docs.title}/>
          <AuthorAffiliationButton
            toggleShowAffiliations={this.toggleShowAffiliations}
            showAffiliations={this.state.showAffiliations}
            hasAffiliation={docs.hasAffiliation}
          />
          &nbsp;
          <MoreAuthorsButton
            toggleExtraAuthors={this.toggleExtraAuthors}
            showExtraAuthors={this.state.showExtraAuthors}
            hasMoreAuthors={docs.hasMoreAuthors}
          />
          <AuthorsAndAff
            toggleExtraAuthors={this.toggleExtraAuthors}
            authorAff={docs.authorAff}
            hasMoreAuthors={docs.hasMoreAuthors}
            authorAffExtra={docs.authorAffExtra}
            showAffiliations={this.state.showAffiliations}
            showExtraAuthors={this.state.showExtraAuthors}
          />
          <AbstractText abstract={docs.abstract}/>
          <br/>
          <AbstractMetaData
            pub_raw={docs.pub_raw}
            formattedDate={docs.formattedDate}
            doi={docs.doi}
            bibcode={docs.bibcode}
            keyword={docs.keyword}
          />
        </div>
      );
    }
  });

  return AbstractComponent;
});
