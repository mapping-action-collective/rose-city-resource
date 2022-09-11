import React from "react";
import MediaQuery from "react-responsive";
// import PropTypes from 'prop-types';

class CountBar extends React.PureComponent {
  undisclosedCounter = (data) => {
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].street === "NA" ||
        data[i].street === null ||
        data[i].street === ""
      ) {
        counter += 1;
      }
    }
    return counter;
  };

  locationCounter = (data) => {
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].street !== "NA" &&
        data[i].street !== null &&
        data[i].street !== ""
      ) {
        counter += 1;
      }
    }
    return counter;
  };

  render() {
    const {data, savedDataId} = this.props;
    return (
      <div className='counts-container'>
        <div className='counts'>{`${data.length} Results`}</div>
        <div className='counts'>{`${this.locationCounter(
          data
        )} Locations`}</div>
        <MediaQuery query='(min-width: 993px)'>
          <div className='counts saved-counts'>{`${savedDataId.length} Saved`}</div>
        </MediaQuery>
      </div>
    );
  }
}

export default CountBar;
