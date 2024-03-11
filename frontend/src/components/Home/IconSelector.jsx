import React, { useState } from "react";
import MediaQuery from "react-responsive";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSTransition } from "react-transition-group";
import { objectKeyByValue, queryBuilder } from "../../utils/api.js";

// font awesome icons color
const iconColor = "white";

/* Desktop display of main "Food," "Goods," etc icons */
const PrimaryIconsLarge = ({
  onMouseEnter,
  onMouseExit,
  showDropdown,
  iconMap,
  searchData,
  selectedData,
  path
}) => {
  return (
    <MediaQuery query="(min-width: 993px)">
      <div className="categories-container" onMouseLeave={() => onMouseExit()}>
        <div className="icons-container">
          {Object.keys(iconMap).map((icon) => {
            return (
              <div
                key={icon}
                className="icon-container"
                onMouseEnter={() => onMouseEnter(iconMap[icon], searchData)}
              >
                <div>
                  <FontAwesomeIcon icon={icon} color={iconColor} size="2x" />
                </div>
                <div className="icon-name">{iconMap[icon]}</div>
              </div>
            );
          })}
        </div>
        {showDropdown ? (
          <div className="icons-dropdown-container">
            {Object.keys(selectedData)?.map((selection) => {
              return (
                <Link
                  key={selection}
                  to={{
                    pathname: path,
                    search: queryBuilder([selection], [])
                  }}
                >
                  <div className="icon-dropdown-container">
                    <div className="icon-dropdown-name">{`${selection}  (${selectedData[selection]})`}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </MediaQuery>
  );
};

/* Mobile display of main "Food," "Goods," etc icons */
const PrimaryIconsSmall = ({
  onSelectFwd,
  iconMap,
  searchData,
  toggleBrowseContainer,
  isBrowseVisible
}) => {
  return (
    <MediaQuery query="(max-width: 992px)">
      <div className="categories-container">
        <div
          className="browse-categories"
          onClick={() => toggleBrowseContainer()}
        >
          <div className="browse">Browse Categories</div>
          <div>
            <FontAwesomeIcon
              //use the plus icon for onClick events
              icon={"angle-down"}
              color={iconColor}
              size="lg"
            />
          </div>
        </div>
        <CSSTransition
          in={isBrowseVisible}
          timeout={500}
          classNames="browse-drawer"
          mountOnEnter={true}
        >
          {
            (/*state*/) => {
              return (
                <div className="icons-container">
                  {Object.keys(iconMap).map((icon) => {
                    return (
                      <div
                        key={icon}
                        className="icon-container"
                        onClick={() => onSelectFwd(iconMap[icon], searchData)}
                      >
                        <div className="small-icon">
                          <FontAwesomeIcon
                            icon={icon}
                            color={iconColor}
                            size="lg"
                          />
                        </div>

                        <div className="icon-name">{iconMap[icon]}</div>
                        <div className="category-plus">
                          <FontAwesomeIcon
                            //use the plus icon for onClick events
                            icon={"angle-right"}
                            color={iconColor}
                            size="lg"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="browse-categories-bottom" />
                </div>
              );
            }
          }
        </CSSTransition>
      </div>
    </MediaQuery>
  );
};

const SecondaryIcons = ({
  onSelectBack,
  selectedItem,
  selectedData,
  searchData,
  iconMap,
  toggleBrowseContainer,
  isBrowseVisible
}) => {
  return (
    <MediaQuery query="(max-width: 992px)">
      <div className="categories-container">
        <div
          className="browse-categories"
          onClick={() => toggleBrowseContainer()}
        >
          <div className="browse">Browse Categories</div>
          <div>
            <FontAwesomeIcon
              //use the plus icon for onClick events
              icon={"angle-down"}
              color={iconColor}
              size="lg"
            />
          </div>
        </div>
        <CSSTransition
          in={isBrowseVisible}
          timeout={500}
          classNames="browse-drawer"
        >
          {
            (/*status*/) => (
              <div className="icons-container">
                <div
                  className="selected-item"
                  onClick={() => onSelectBack(searchData)}
                >
                  <div>
                    <FontAwesomeIcon
                      icon={"angle-left"}
                      color={iconColor}
                      size="lg"
                    />
                  </div>
                  <div>
                    <FontAwesomeIcon
                      icon={objectKeyByValue(iconMap, selectedItem)[0]}
                      color={iconColor}
                      size="sm"
                    />
                  </div>
                  <div>{selectedItem}</div>
                </div>
                {Object.keys(selectedData).map((selection) => {
                  return (
                    <Link
                      key={selection}
                      to={{
                        pathname: `/results`,
                        search: queryBuilder([selection], [])
                      }}
                    >
                      <div className="icon-container">
                        <div className="icon-name">{`${selection}  (${selectedData[selection]})`}</div>
                      </div>
                    </Link>
                  );
                })}
                <div className="browse-categories-bottom" />
              </div>
            )
          }
        </CSSTransition>
      </div>
    </MediaQuery>
  );
};

const Selectors = ({
  isVisible,
  onMouseEnter,
  onMouseExit,
  onSelectFwd,
  onSelectBack,
  navCategory,
  selectedItem,
  selectedData,
  searchData,
  showDropdown,
  path
}) => {
  const [isBrowseVisible, setIsBrowseVisible] = useState(isVisible);

  const toggleBrowseContainer = () => {
    setIsBrowseVisible((prevIsBrowseVisible) => !prevIsBrowseVisible);
  };

  const iconMap = {
    utensils: "Food",
    home: "Housing & Shelter",
    tshirt: "Goods",
    "bus-alt": "Transit",
    heartbeat: "Health & Wellness",
    "money-bill-wave": "Money",
    "hand-holding-heart": "Care & Safety",
    briefcase: "Work",
    "balance-scale": "Legal",
    sun: "Day Services",
    "hands-helping": "Specialized Assistance"
  };

  switch (navCategory) {
    case "general_category":
      return (
        <div>
          <PrimaryIconsLarge
            onMouseEnter={onMouseEnter}
            onMouseExit={onMouseExit}
            showDropdown={showDropdown}
            iconMap={iconMap}
            navCategory={navCategory}
            searchData={searchData}
            selectedData={selectedData}
            path={path}
            toggleBrowseContainer={toggleBrowseContainer}
            isBrowseVisible={isBrowseVisible}
          />

          <PrimaryIconsSmall
            onSelectFwd={onSelectFwd}
            navCategory={navCategory}
            iconMap={iconMap}
            searchData={searchData}
            toggleBrowseContainer={toggleBrowseContainer}
            isBrowseVisible={isBrowseVisible}
          />
        </div>
      );
    case "main_category":
      return (
        <div>
          <PrimaryIconsLarge
            onMouseEnter={onMouseEnter}
            onMouseExit={onMouseExit}
            showDropdown={showDropdown}
            iconMap={iconMap}
            navCategory={navCategory}
            searchData={searchData}
            toggleBrowseContainer={toggleBrowseContainer}
            isBrowseVisible={isBrowseVisible}
          />

          <SecondaryIcons
            onSelectBack={onSelectBack}
            selectedItem={selectedItem}
            selectedData={selectedData}
            searchData={searchData}
            iconMap={iconMap}
            toggleBrowseContainer={toggleBrowseContainer}
            isBrowseVisible={isBrowseVisible}
          />
        </div>
      );
    default:
      return null;
  }
};

//All the state and methods live here and are passed down as props to all the specific components.
const IconSelector = ({ searchData, path, isVisible }) => {
  const [navCategory, setNavCategory] = useState("general_category");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleSelectedItemFwd = (selectedItem, searchData) => {
    const selectedData = searchData.main[selectedItem];
    setNavCategory("main_category");
    setSelectedItem(selectedItem);
    setSelectedData(selectedData);
  };

  const toggleSelectedItemBack = (searchData) => {
    const selectedData = searchData.general;
    setSelectedData(selectedData);
    setSelectedItem(null);
    setNavCategory("general_category");
  };

  const showSelectionBox = (selectedItem, searchData) => {
    if (searchData) {
      const selectedData = searchData.main[selectedItem];
      setSelectedData(selectedData);
    }
    setNavCategory("general_category");
    setSelectedItem(selectedItem);
    setShowDropdown(true);
  };

  const hideSelectionBox = () => {
    setShowDropdown(false);
    setSelectedData(null);
    setSelectedItem(null);
  };

  return (
    <div className="all-categories">
      <Selectors
        onMouseEnter={showSelectionBox}
        onMouseExit={hideSelectionBox}
        onSelectFwd={toggleSelectedItemFwd}
        onSelectBack={toggleSelectedItemBack}
        navCategory={navCategory}
        selectedData={selectedData}
        searchData={searchData}
        selectedItem={selectedItem}
        showDropdown={showDropdown}
        path={path}
        isVisible={isVisible}
      />
    </div>
  );
};

export default IconSelector;
