import React from "react";
import MediaQuery from "react-responsive";

const CountBar = ({ data, savedDataId }) => {
  const undisclosedCounter = (data) => {
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

  return (
    <div className="counts-container">
      <div className="counts">{`${data.length} Results`}</div>
      <div className="counts">{`${undisclosedCounter(
        data
      )} Undisclosed Locations`}</div>
      <MediaQuery query="(min-width: 993px)">
        <div className="counts">{`${savedDataId.length} Saved`}</div>
      </MediaQuery>
    </div>
  );
};

export default CountBar;
