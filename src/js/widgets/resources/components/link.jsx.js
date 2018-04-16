define([
  'react',
  'react-bootstrap',
  'react-prop-types'
], function (React, ReactBS, PropTypes) {

  const { Button } = ReactBS;

  const linkStyle = {
    padding: 0,
    paddingRight: 5
  };

  // icon for openUrl
  const OpenUrlIcon = () => (
    <i
      className="fa fa-university"
      data-toggle="tooltip"
      data-placement="top"
      title="This resource is available through your institution."
      aria-hidden="true"
    />
  );

  // icon for open access
  const OpenAccessIcon = () => (
    <i
      className="s-open-access-image"
      data-toggle="tooltip"
      data-placement="top"
      title="This is an open access item."
      aria-hidden="true"
    />
  );

  const Link = ({ name, description, url, count, open, openUrl, onClick }) => (
    <li key={name}>
      <a
        style={linkStyle}
        title={description}
        href={url}
        onClick={onClick}
        target="_blank"
      >
        {name}
        {count ? ` (${count})` : null}
      </a>
      { openUrl && <OpenUrlIcon /> }
      { open && <OpenAccessIcon /> }
    </li>
  );

  Link.propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    count: PropTypes.number,
    open: PropTypes.bool,
    onClick: PropTypes.func,
    url: PropTypes.string,
    openUrl: PropTypes.bool
  };

  Link.defaultProps = {
    name: '',
    description: '',
    count: null,
    open: false,
    url: '#',
    onClick: () => {},
    openUrl: false
  };

  return Link;
});
