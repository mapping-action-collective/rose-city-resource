import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cards from './Results/Cards';
import { cardDetailsFilter, directionsUrlBuilder } from '../utils/api';

const Details = (props) => {
  const [cardDetailsData, setCardDetailsData] = useState(null);
  const location = useLocation();

    const { records } = props;
    const queryVals = queryString.parse(location.search);
    const savedIds = Array.isArray(queryVals.saved) ? queryVals.saved : [queryVals.saved];
    const detailsData = cardDetailsFilter(records, savedIds);

  useEffect(() => {
    setCardDetailsData(
      detailsData.map(record => {
        const directionsUrl = directionsUrlBuilder(
          record.street,
          record.city,
          record.postal_code
        );
        return Object.assign(record, { directionsUrl });
      })
    );
  }, [props.records]); // eslint-disable-line react-hooks/exhaustive-deps

  const { savedDataId, handleCardSave } = props;

  if (cardDetailsData !== null) {
    return (
      <div className="details-outer-container">
        <div className="details-inner-container">
          <div
            className="print-details-button"
            onClick={() => {
              window.print();
            }}
          >
            <FontAwesomeIcon icon={["fa", "print"]} style={{marginRight: '5px', marginLeft: '5px'}}/>
            Print Results
          </div>
          <Cards
            data={cardDetailsData}
            selectedListing={''}
            updateListing={null}
            handleCardSave={handleCardSave}
            savedDataId={savedDataId}
            showMapDetail={true}
          />
        </div>
      </div>
    );
  } else {
    return <div>loading</div>;
  }
}

export default Details;
