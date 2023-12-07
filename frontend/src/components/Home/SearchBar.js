import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
// import LinkButton from "./LinkButton";
import '../../css/Home.css';
import { getFilteredSearchList, queryBuilder } from "../../utils/api";

//need this to use the react portal
const modalRoot = document.getElementById("modal-root");

const AdvancedSearchModal = (props) => {
  const { searchData, onClose } = props
  const [categoryVals, setCategoryVals] = useState([])
  const [parentVals, setParentVals] = useState([])
  const [selection, setSelection] = useState('Category')

  // this needs to be refratored a bit to be more DRY
  function toggleCheckedValue(val, selection) {
    if (selection === "Category") {
      const index = categoryVals.indexOf(val); // get index to determine if the aray gets spliced.
      if (index === -1) {
        //add to the list
        setCategoryVals([...categoryVals, val]);
      } else {
        //remove from list
        categoryVals.splice(index, 1);
        setCategoryVals(categoryVals);
      }
    } else {
      const index = parentVals.indexOf(val); // get index to determine if the aray gets spliced.
      if (index === -1) {
        //add to the list
        setParentVals([...parentVals, val]);
      } else {
        //remove from list
        parentVals.splice(index, 1);
        setParentVals(parentVals);
      }
    }
  };

  function selectCategory() {
    setSelection({ selection: "Category" });
  };

  function selectOrganization() {
    setSelection({ selection: "Organization" });
  };

  function handleSubmit(event) {
    event.preventDefault();
  };

  function handleNoSelection(event) {
    if (categoryVals < 1 && parentVals < 1) {
      event.preventDefault();
      alert("Please make a selection.");
    }
  };

  useEffect(() => {
    //this seems hacky.  There must be a better way...SO?
    document.getElementsByTagName("body")[0].style.overflow = "hidden";
    return () => {
      document.getElementsByTagName("body")[0].style.overflow = "visible";
    };
  }, []);

  const generalCats = Object.keys(searchData.general);
  const mainCatsMap = searchData.main;
  const parentCats = Object.keys(searchData.parent).sort();

  //style for the category selector
  const styles = { selection: { color: "#FC3C3C" } };

  return ReactDOM.createPortal(
    // loop through the search data keys to populate the
    //advanced search
    <div className="modal">
      <div className="modal-box">
        <div className="modal-search-heading-container">
          <div className="modal-heading-title">
            Search by {`${selection}`}
          </div>

          <div className="search-nav-container-2">
            <div className="modal-heading-button" onClick={onClose}>
              Cancel
            </div>
            <span className="modal-heading-divider" />
            <Link
              to={{
                pathname: `/results`,
                search: queryBuilder(categoryVals, parentVals),
              }}
              onClick={handleNoSelection}
            >
              <div className="modal-heading-button" onClick={onClose}>
                Apply
              </div>
            </Link>
          </div>
        </div>
        <hr />
        <div className="search-nav-container-1">
          <div
            className="modal-search-category"
            onClick={selectCategory}
            style={selection === "Category" ? styles.selection : null}
          >
            <FontAwesomeIcon icon={"angle-left"} />
            Category
          </div>
          <span className="modal-heading-divider" />
          <div
            className="modal-search-organization"
            onClick={selectOrganization}
            style={selection === "Organization" ? styles.selection : null}
          >
            Organization
            <FontAwesomeIcon icon={"angle-right"} />
          </div>
        </div>
        {/* --------------------------------------------------------------------- */}
        {selection === "Category" ? (
          <form
            className="modal-search-container"
            onSubmit={handleSubmit}
          >
            {generalCats.map((genCat) => {
              return (
                <div key={genCat} className="modal-search-item">
                  <div className="modal-search-item-title">{genCat}</div>
                  {Object.keys(mainCatsMap[genCat] ?? []).map((mainCat) => {
                    return (
                      <React.Fragment key={mainCat}>
                        <label
                          className="advanced-container"
                          htmlFor={mainCat}
                        >
                          {mainCat}
                          <input
                            id={mainCat}
                            type="checkbox"
                            name={mainCat}
                            value={mainCat}
                            onChange={(val) =>
                              toggleCheckedValue(
                                val.target.value,
                                selection
                              )
                            }
                          />
                          <span className="checkmark" />
                        </label>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </form>
        ) : (
            <form
              className="modal-search-container"
              onSubmit={handleSubmit}
            >
              {parentCats.map((parentCat) => {
                return (
                  <React.Fragment key={parentCat}>
                    <label className="advanced-container" htmlFor={parentCat}>
                      {parentCat}
                      <input
                        id={parentCat}
                        type="checkbox"
                        name={parentCat}
                        value={parentCat}
                        onChange={(val) =>
                          toggleCheckedValue(val.target.value, selection)
                        }
                      />
                      <span className="checkmark" />
                    </label>
                  </React.Fragment>
                );
              })}
            </form>
          )}
      </div>
    </div>,
    modalRoot
  );
}

export const SearchBar = (props) => {
  const [searchValue, setSearchValue] = useState("");
//  const [filterSearchList, setFilterSearchList] = useState(null);
  const [showAdvSearchModal, setShowAdvSearchModal] = useState(false);
  const { records, searchData, match } = props;
  const navigate = useNavigate();

  function handleChange(e) {
    const value = e.target.value;
    setSearchValue(value);
  };

  function handleKeyPress (e) {
    if (e.key == 'Enter') {
        navigate(`/results?search=${searchValue}`)
    }
  }

  function toggleAdvSearchModal() {
    setShowAdvSearchModal(!showAdvSearchModal);
  };

  function handleAdvSearchCloseModal () {
    setShowAdvSearchModal(false);
  };

  const searchCats = [
    "general_category",
    "main_category",
    "parent_organization",
    "listing",
  ];

  const searchList = getFilteredSearchList(searchCats, records);

  return (
    <div className="search-bar">
      <form
        className=""
        style={{ width: "100%" }}
      >
        <input
          className="search-input"
          id="search-item"
          placeholder="Search..."
          type="text"
          autoComplete="off"
          value={searchValue} // Setting `value` makes <input> a controlled element
          onChange={handleChange}
          onKeyUp={handleKeyPress}
          list="data"
        />
        {/* loop through the list of options */}
        <datalist id="data">
          {searchList.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        {/* W.8.23.20 QUESTION: how can we change this to handle multiple search terms? or misspellings, alternate capitalization, etc? 
        
        right now it only works if a single search term is spelled exactly correctly, with the words in order. for example, we have both Spanish language services, and mental health services in the database, but "spanish mental health" has 0 matches. What's the best way to fix this? */}
        <Link
          className="search-button"
          to={`/results?search=${searchValue}`}
          //onClick={handleSubmit}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <FontAwesomeIcon icon="search" style={{ marginLeft: 10 }} />
            <span style={{ marginRight: 30 }}>SEARCH</span>
          </div>
        </Link>
      </form>
      <div className="advanced-search" onClick={toggleAdvSearchModal}>
        Advanced Search
      </div>
      {showAdvSearchModal ? (
        <AdvancedSearchModal
          onClose={handleAdvSearchCloseModal}
          searchData={searchData}
          match={match} // this was passed down via React router
        />
      ) : null}
    </div>
  );
}
