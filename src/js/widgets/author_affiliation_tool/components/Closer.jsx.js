

define([
  'react'
], function (React) {
  const style = {
    position: 'absolute',
    right: '5px'
  };

  /**
   * A simple closer link that looks like an `X`
   */
  const Closer = ({ onClick }) => {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      onClick();
    };

    return (
      <a href="javascript:void(0)" style={style} onClick={e => handleClick(e)}>
        <i className="fa fa-times fa-2x"/>
      </a>
    );
  };

  return Closer;
});
