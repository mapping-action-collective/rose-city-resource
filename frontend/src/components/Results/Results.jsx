import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconSelector from "../Home/IconSelector";
import { SearchBar } from "../Home/SearchBar";
import Cards from "./Cards";
import SimpleMap from "./Map";
import { getFilteredRecords, detailsQueryBuilder } from "../../utils/api";
import "../../css/Results.css";

const Results = (props) => {
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickType, setClickType] = useState(null); //to keep track of how scroll should happen

  const location = useLocation();

  const updateListing = (id, _clickType) => {
    setClickType(_clickType);
    setSelectedListing(id);
  };

  const query = queryString.parse(location.search);

  const dataMap = {
    search: query.search,
    category: query.category,
    parent: query.parent
  };

  const { records } = props;

  useEffect(() => {
    setLoading(false);
  }, []);

  /* Warning: removing useMemo here will cause a lot of UI glitching and bugginess in the map */
  const data = useMemo(
    () =>
      getFilteredRecords(
        dataMap.search,
        dataMap.category,
        dataMap.parent,
        records
      ),
    [dataMap.search, dataMap.category, dataMap.parent, records]
  );

  const { searchData, handleCardSave, handleSaveDelete, savedDataId } = props;

  const styles = {
    faIcon: {
      color: "#393f48",
      marginRight: "5px"
    }
  };

  if (loading === true) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="basic-search-container">
        <SearchBar records={records} searchData={searchData} />
      </div>
      <IconSelector
        records={records}
        searchData={searchData}
        path={"/results"}
        isVisible={false}
      />

      <div className="results-outer-container">
        <div className="results-container">
          <div className="map-container">
            <SimpleMap
              data={data}
              selectedListing={selectedListing}
              clickType={clickType}
              updateListing={updateListing}
              savedDataId={savedDataId}
            />
            {savedDataId.length > 0 ? (
              <div className="print-button-container">
                <Link
                  to={{
                    pathname: "/details",
                    search: detailsQueryBuilder(savedDataId)
                  }}
                >
                  <div className="print-button">
                    <FontAwesomeIcon
                      style={styles.faIcon}
                      icon="print"
                      size="sm"
                    />
                    Print Saved Listings
                  </div>
                </Link>
                <div
                  className="print-button"
                  onClick={() => {
                    handleSaveDelete();
                  }}
                >
                  Clear Saved Listings
                </div>
              </div>
            ) : null}
          </div>
          <Cards
            data={data}
            selectedListing={selectedListing}
            updateListing={updateListing}
            clickType={clickType}
            handleCardSave={handleCardSave}
            savedDataId={savedDataId}
            showMapDetail={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Results;
