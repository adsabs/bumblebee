

define([
  'react', 'react-prop-types'
], function (React, ReactPropTypes) {
  const Closer = ({ onClick }) => {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    };

    return (
      <a href="javascript:void(0)" className="pull-right" onClick={e => handleClick(e)}>
        <i className="fa fa-times fa-2x"/>
      </a>
    );
  };

  Closer.propTypes = {
    onClick: ReactPropTypes.func.isRequired
  };

  return Closer;
});
