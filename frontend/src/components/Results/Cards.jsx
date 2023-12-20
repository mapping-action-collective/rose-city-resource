import React, { useEffect, useRef } from "react";
import ScrollToTop from "react-scroll-up";
import { Tooltip } from "react-tooltip";
import MediaQuery from "react-responsive";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CountBar from "./CountBar";
import {
  cardPhoneTextFilter,
  cardTextFilter,
  cardSortByDistance,
  cardWebAddressFixer
} from "../../utils/api";
import { greenLMarker } from "../../icons/mapIcons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";

const DetailMap = (props) => {
  return (
    <React.Fragment>
      <MapContainer
        center={props.coords}
        zoom={15}
        scrollWheelZoom={true}
        tap={true}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={props.coords} icon={greenLMarker} />
      </MapContainer>
    </React.Fragment>
  );
};

//style for background
//card style when a location is
//selected by user
const style = {
  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.5), 0 6px 20px 0 rgba(0, 0, 0, 0.5)"
};

const Card = ({
  record,
  selectedListing,
  updateListing,
  //handleCardClick,
  handleCardSave,
  savedDataId,
  showMapDetail,
  addCardRef
}) => {
  const cardRef = useRef();

  useEffect(() => {
    if (cardRef) {
      addCardRef(cardRef, record.id);
    }
  }, [cardRef]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const textMap = {
    parsedCategory: record.main_category,
    parsedListing: record.listing,
    parsedPhone: cardPhoneTextFilter(record),
    parsedWeb: cardWebAddressFixer(record.website),
    parsedStreet:
      record.street !== null && record.street !== ""
        ? `${cardTextFilter(record.street)} ${cardTextFilter(
            record.street2
          )}`.trim()
        : "",
    parsedCity: `${record.city}, OR ${record.postal_code}`,
    parsedDescription: cardTextFilter(record.service_description),
    parsedHours: cardTextFilter(record.hours),
    parsedCOVID: cardTextFilter(record.covid_message)
  };

  return (
    <div className="card-map-container">
      <div
        ref={cardRef}
        className="card-container"
        style={record.id === selectedListing ? style : null}
      >
        <div className="card-header">
          <div className="card-category">{textMap.parsedCategory}</div>
          {textMap.parsedCOVID === "CLOSED DUE TO COVID" ? (
            <div className="covid-item">{textMap.parsedCOVID}</div>
          ) : null}
        </div>
        <div className="card-header">
          <div
            className="card-listing"
            style={
              selectedListing === record.id
                ? {
                    color: "#27a727",
                    fontWeight: "bolder"
                  }
                : null
            }
          >
            {textMap.parsedListing}
          </div>
          <div className="spacer" />
          {record.lat !== "" || record.lon !== "" ? (
            <button
              className="card-save-button"
              data-tip="Show on map."
              data-for="show-listing-tooltip"
              onClick={() => {
                //handleCardClick(cardRef, record.id);
                updateListing?.(record.id, "card"); // Cards on the Details page don't receive this prop
              }}
            >
              <FontAwesomeIcon
                icon="map-marker"
                size="sm"
                style={
                  selectedListing === record.id ? { color: "#27a727" } : null
                }
              />
              Show
              <Tooltip
                id="show-listing-tooltip"
                place="top"
                type="dark"
                effect="solid"
              />
            </button>
          ) : null}
          {!showMapDetail ? (
            <MediaQuery query="(min-width: 993px)">
              <button
                className="card-save-button"
                data-tip="Save listing, print later."
                data-for="save-tooltip"
                onClick={() => handleCardSave(record.id)}
              >
                <FontAwesomeIcon
                  icon="save"
                  size="sm"
                  style={
                    savedDataId.indexOf(record.id) > -1
                      ? { color: "green" }
                      : null
                  }
                />
                Save
                <Tooltip
                  id="save-tooltip"
                  place="top"
                  type="dark"
                  effect="solid"
                />
              </button>
            </MediaQuery>
          ) : null}
        </div>
        <div className="card-street">
          {textMap.parsedStreet != null && textMap.parsedStreet !== "" ? (
            <div>
              {textMap.parsedStreet} <br />
              {textMap.parsedCity} <br />
              {/* if the distance is not null then return it in the card */}
              {record.distance !== null ? (
                <div className="card-distance">
                  <FontAwesomeIcon
                    className="card-map-marker"
                    icon="map-marker"
                    size="sm"
                  />
                  {`${Number(record.distance.toFixed(2))} miles`}
                  <br />
                </div>
              ) : null}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={"//www.google.com/maps/dir/" + record.directionsUrl}
              >
                Get Directions
              </a>
            </div>
          ) : (
            <div className="card-undisclosed">Undisclosed Location</div>
          )}
        </div>
        <div className="covid-item covid-temp-listing">
          {textMap.parsedCOVID === "TEMPORARY COVID RESPONSE SERVICE"
            ? textMap.parsedCOVID
            : null}
        </div>
        <div className="card-phone-container">
          {textMap.parsedPhone ? (
            <div>
              <FontAwesomeIcon icon={"phone"} className="phone-icon" />
              {textMap.parsedPhone.map((phone, index) => {
                return (
                  <div key={`${phone.phone}-${index}`} className="card-phone">
                    <span>{`${phone.type}: `}</span>
                    {phone.phone}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="card-web-container">
          {textMap.parsedWeb ? (
            <div>
              <FontAwesomeIcon icon={"globe"} />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={textMap.parsedWeb}
              >
                {" website"}
              </a>
            </div>
          ) : null}
        </div>
        {!(textMap.parsedDescription === "") ? (
          <div className="card-item">
            <div className="card-title">Service Description:</div>
            <div className="card-content">{textMap.parsedDescription}</div>
          </div>
        ) : null}
        {!(textMap.parsedHours === "") ? (
          <div className="card-item">
            <div className="card-title-flex">
              <div>Hours:</div>
              <div className="covid-item">
                {textMap.parsedCOVID === "HOURS CHANGED DUE TO COVID"
                  ? textMap.parsedCOVID
                  : null}
              </div>
            </div>
            <div className="card-content">
              {textMap.parsedCOVID === "CLOSED DUE TO COVID" ? (
                <div className="covid-item">CLOSED</div>
              ) : (
                textMap.parsedHours
              )}
            </div>
          </div>
        ) : null}
      </div>
      {showMapDetail ? (
        <div className="map-details-container">
          {record.lat !== "" ? (
            <DetailMap coords={[Number(record.lat), Number(record.lon)]} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const Cards = ({
  data,
  selectedListing,
  updateListing,
  handleCardSave,
  savedDataId,
  showMapDetail,
  clickType
}) => {
  //const [cardRefs, setCardRefs] = useState([]);
  const cardRefs = useRef([]);

  const cardScrollToCard = (id) => {
    const ref = cardRefs.current[id];
    if (ref) {
      const card = ref.current; // cardRefs has a current property and so does each ref stored in that array (yeah, confusing)
      window.scrollTo({ top: card.offsetTop - 60, behavior: "smooth" });
    }
  };

  const addCardRef = (ref, id) => {
    cardRefs.current[id] = ref;
  };

  useEffect(
    () => {
      if (
        window.matchMedia("(max-width: 992px)").matches &&
        clickType === "popup"
      ) {
        cardScrollToCard(selectedListing);
      }

      if (
        window.matchMedia("(max-width: 992px)").matches &&
        clickType === "card"
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (window.matchMedia("(min-width: 993px)").matches) {
        cardScrollToCard(selectedListing);
      }
    },
    [selectedListing] /* eslint-disable-line react-hooks/exhaustive-deps */
  );

  return (
    // the cards container should scroll on its own
    <div className="cards-container">
      <CountBar savedDataId={savedDataId} data={data} />

      {cardSortByDistance(data).map((record) => {
        return (
          <Card
            key={record.id}
            record={record}
            selectedListing={selectedListing}
            updateListing={updateListing}
            handleCardSave={handleCardSave}
            //handleCardClick={handleCardClick}
            addCardRef={addCardRef}
            savedDataId={savedDataId}
            showMapDetail={showMapDetail}
          />
        );
      })}
      <MediaQuery query="(max-width: 992px)">
        <ScrollToTop
          showUnder={160}
          style={{
            position: "fixed",
            bottom: 50,
            left: 320,
            cursor: "pointer",
            transitionDuration: "0.2s",
            transitionTimingFunction: "linear",
            transitionDelay: "0s",
            fontSize: "60px",
            color: "gray"
          }}
        >
          <FontAwesomeIcon icon={faAnglesUp} size="lg" />
        </ScrollToTop>
      </MediaQuery>
      <MediaQuery query="(min-width: 993px)">
        <ScrollToTop
          showUnder={160}
          style={{
            position: "fixed",
            bottom: 50,
            left: 220,
            cursor: "pointer",
            transitionDuration: "0.2s",
            transitionTimingFunction: "linear",
            transitionDelay: "0s",
            fontSize: "50px",
            color: "gray"
          }}
        >
          <FontAwesomeIcon icon={faAnglesUp} size="lg" />
        </ScrollToTop>
      </MediaQuery>
    </div>
  );
};

export default Cards;
