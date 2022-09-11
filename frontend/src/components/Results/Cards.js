import React from "react";
import ScrollUpButton from "react-scroll-up-button";
import ReactTooltip from "react-tooltip";
import MediaQuery from "react-responsive";
import { Map, TileLayer, Marker } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CountBar from "./CountBar";
import {
  cardPhoneTextFilter,
  cardTextFilter,
  cardSortByDistance,
  cardWebAddressFixer,
} from "../../utils/api";
import { formatDescription } from '../../utils/cardUtils'

import { greenLMarker } from "../../icons/mapIcons";

/* 2022 REDESIGN 

DARK BLUE BACKGROUND:
  #142A35
TEAL: 
  #087e8b
LIGHTER DARK BLUE BACKGROUND:
  #1C3A4A
*/

//2022 color scheme
const primaryTeal = '#087e8b';

const DetailMap = (props) => {
  return (
    <React.Fragment>
      <Map
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
      </Map>
    </React.Fragment>
  );
};

//style for background card style 
//when a location is selected by user
const selectedCardStyle = { boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.5), 0 6px 20px 0 rgba(0, 0, 0, 0.5)" }
const selectedListingTitle = { color: "#087e8b", fontWeight: "bolder" }


class Card extends React.PureComponent {
  state = {
    selector: "location",
  };

  cardRef = React.createRef();

  componentDidMount() {
    const { record } = this.props;
    this.props.handleCardRef(this.cardRef, record.id);
  }

  render() {
    const {
      record,
      selectedListing,
      updateListing,
      handleCardClick,
      handleCardSave,
      savedDataId,
      showMapDetail,
    } = this.props;

    const listing = {
      category: record.main_category,
      listingTitle: record.listing,
      parsedPhone: cardPhoneTextFilter(record),
      website: cardWebAddressFixer(record.website),
      streetAddress: record.street !== null && record.street !== '' ? `${cardTextFilter(record.street)} ${cardTextFilter(
        record.street2
      )}`.trim() : '',
      city: `${record.city}, OR ${record.postal_code}`,
      description: cardTextFilter(formatDescription(record.service_description)),
      hours: cardTextFilter(record.hours),
      covidMessage: cardTextFilter(record.covid_message),
    };

    const ShowOnMapButton = () => (
      <button
        className='card-save-button'
        data-tip='Show on map.'
        data-for='show-listing-tooltip'
        onClick={() => {
          handleCardClick(this.cardRef, record.id);
          updateListing(record.id, "card");
        }}
      >
      <FontAwesomeIcon
        icon='map-marker'
        size='sm'
        style={
          selectedListing === record.id ? {color: primaryTeal} : {color: 'grey'}
        }
      />
      Show
      <ReactTooltip
        id='show-listing-tooltip'
        place='top'
        type='dark'
        effect='solid'
      />
    </button>
    )

    const SaveButton = () => (
      <button
        className='card-save-button'
        data-tip='Save listing, print later.'
        data-for='save-tooltip'
        onClick={() => handleCardSave(record.id)}
      >
        <FontAwesomeIcon
          icon='save'
          size='sm'
          style={
            savedDataId.indexOf(record.id) > -1
              ? {color: primaryTeal}
              : null
          }
        />
        Save
        <ReactTooltip
          id='save-tooltip'
          place='top'
          type='dark'
          effect='solid'
        />
      </button>
    )

    const SUISaveButton = () => {
      const isSaved = savedDataId.indexOf(record.id) > -1;
      return (
        <button
          className='ui button basic mini fluid'
          data-tip='Save listing, print later.'
          data-for='save-tooltip'
          onClick={() => handleCardSave(record.id)}
        >
          <i style={{color: primaryTeal}}
            className={isSaved ? "ui icon bookmark" : "ui icon bookmark outline"}
          />
          {isSaved ? 'Unsave' : 'Save'}
          <ReactTooltip
            id='save-tooltip'
            place='top'
            type='dark'
            effect='solid'
          />
        </button>
      );
    }



    const ShowDistance = () => (
      <div className='card-distance'>
        {`${Number(record.distance.toFixed(1))} mi`}
      </div>
    )

    // We don't want to display cards without titles 
    if (!listing.listingTitle) return null;

    return (
      <div className='card-map-container'>
        <div
          ref={this.cardRef}
          className='card-container'
          style={record.id === selectedListing ? selectedCardStyle : null}
        >
          <div className='card-header'>
            <div className='card-category'>{listing.category}</div>
          </div>
          <div className='card-header'>
            <div
              className='card-listing'
              style={
                selectedListing === record.id ? selectedListingTitle : null
              }
            >
              {listing.listingTitle}
            </div>

            <div className='spacer' />
          </div>
          {listing.streetAddress != null && listing.streetAddress !== "" && (
            <div className='card-second-row'>
              <div className='card-street'>
                <div>
                  {/* <FontAwesomeIcon
                  className='card-map-marker'
                  icon='map-marker'
                  size='sm'
                /> */}
                  {listing.streetAddress} <br />
                  {listing.city} <br />
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href={"//www.google.com/maps/dir/" + record.directionsUrl}
                  >
                    Get Directions
                  </a>
                </div>
              </div>
              <div className='card-distance-and-miles'>
                <div style={{width: "100%"}}>
                  {(record.lat !== "" || record.lon !== "") && (
                    <ShowOnMapButton />
                  )}
                  {record.distance !== null && <ShowDistance />}
                </div>
              </div>
            </div>
          )}
          <div className='card-phone-container'>
            {listing.parsedPhone ? (
              <div>
                <FontAwesomeIcon icon={"phone"} className='phone-icon' />
                {listing.parsedPhone.map((phone, index) => {
                  return (
                    <div key={`${phone.phone}-${index}`} className='card-phone'>
                      <span>{`${phone.type}: `}</span>
                      {phone.phone}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className='card-web-container'>
            {listing.website ? (
              <div>
                <FontAwesomeIcon icon={"globe"} />
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={listing.website}
                >
                  {" website"}
                </a>
              </div>
            ) : null}
          </div>{" "}
          {!(listing.description === "") ? (
            <div className='card-item'>
              <div className='card-title'>Service Description:</div>
              <div className='card-content'>{listing.description}</div>
            </div>
          ) : null}
          {!(listing.hours === "") ? (
            <div className='card-item'>
              <div className='card-title-flex'>
                <div>Hours:</div>
                <div className='covid-item'>
                {/* KEEP THIS ONE  */}
                {listing.covidMessage && listing.covidMessage}
                </div>
              </div>
              <div className='card-content'>
                {/* KEEP THIS ONE */}
                {listing.covidMessage.toUpperCase() ===
                "CLOSED DUE TO COVID" ? (
                  <div className='covid-item'>CLOSED</div>
                ) : (
                  listing.hours
                )}
              </div>
            </div>
          ) : null}
          <div>
            <SUISaveButton />
          </div>
        </div>

        {showMapDetail ? (
          <div className='map-details-container'>
            {record.lat !== "" ? (
              <DetailMap coords={[Number(record.lat), Number(record.lon)]} />
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

class Cards extends React.PureComponent {
  state = { currentCardRef: null, cardRefs: [] };

  cardScrollToCard = (cardRef) => {
    //the card is on the first element of the
    //the cardRef array
    window.scrollTo({
      top: cardRef[0][0].offsetTop - 60,
      behavior: "smooth",
    });
  };

  handleCardRef = (ref, id) => {
    //build up the state array without directly mutating state
    this.setState((prevState) => ({
      cardRefs: [...prevState.cardRefs, [ref.current, id]],
    }));
  };

  handleCardClick = (cardRef, id) => {
    this.setState(() => ({ currentCardRef: [cardRef.current, id] }));
  };

  undisclosedCounter = (data) => {
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].street === "") {
        counter += 1;
      }
    }
    return counter;
  };

  componentDidUpdate(prevProps) {
    const { cardRefs } = this.state;
    const { selectedListing, clickType } = this.props;

    const currentCard = cardRefs.filter((ref) => ref[1] === selectedListing);
    if (this.props.selectedListing !== prevProps.selectedListing) {
      if (
        window.matchMedia("(max-width: 992px)").matches &&
        clickType === "popup"
      ) {
        this.cardScrollToCard(currentCard);
      }
      if (
        window.matchMedia("(max-width: 992px)").matches &&
        clickType === "card"
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (window.matchMedia("(min-width: 993px)").matches) {
        this.cardScrollToCard(currentCard);
      }
    }
  }

  render() {
    const {
      data,
      selectedListing,
      updateListing,
      handleCardSave,
      savedDataId,
      showMapDetail,
    } = this.props;

    return (
      // the cards container should scroll on its own
      <div className="cards-container">
        <CountBar savedDataId={savedDataId} data={data} />

        {cardSortByDistance(data).map((record, index) => (
          <Card
            key={`${record.id}-${index}`}
            record={record}
            selectedListing={selectedListing}
            updateListing={updateListing}
            handleCardSave={handleCardSave}
            handleCardClick={this.handleCardClick}
            handleCardRef={this.handleCardRef}
            savedDataId={savedDataId}
            showMapDetail={showMapDetail}
          />
        ))}
        <MediaQuery query="(max-width: 992px)">
          <ScrollUpButton
            StopPosition={0}
            ShowAtPosition={150}
            EasingType="easeOutCubic"
            AnimationDuration={500}
            style={{ left: "50%", bottom: "35px", right: "50%" }}
            ToggledStyle={{}}
          />
        </MediaQuery>
        <MediaQuery query="(min-width: 993px)">
          <ScrollUpButton
            StopPosition={0}
            ShowAtPosition={150}
            EasingType="easeOutCubic"
            AnimationDuration={500}
            style={{ left: "240px", bottom: "35px" }}
            ToggledStyle={{}}
          />
        </MediaQuery>
      </div>
    );
  }
}

export default Cards;
