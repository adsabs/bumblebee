define(['react', 'prop-types'], function(React, ReactPropTypes) {
  const Closer = ({ onClick }) => {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      onClick();
    };

    return (
      <a
        href="javascript:void(0)"
        className="pull-right"
        onClick={(e) => handleClick(e)}
        aria-label="close"
      >
        <i className="fa fa-times fa-2x" aria-hidden="true" />
        <span className="sr-only">close</span>
      </a>
    );
  };

  Closer.propTypes = {
    onClick: ReactPropTypes.func.isRequired,
  };

  return Closer;
});
