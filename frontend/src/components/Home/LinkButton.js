//import React from 'react';
import { Link } from 'react-router-dom';

const LinkButton = props => {
  const {
    //history,
    // location,
    // match,
    // staticContext,
    to,
    //onClick,
    // ⬆ filtering out props that `button` doesn’t know what to do with.
    ...rest
  } = props;
  return (
    <Link to={to}>
      <button
        {...rest} // `children` is just another prop!
        // onClick={event => {
        //   onClick && onClick(event);
        //   history.push(to);
        // }}
        //type="submit"
        disabled={false}
      />
    </Link>
  );
};

export default LinkButton
