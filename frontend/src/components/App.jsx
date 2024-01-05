import React, { useEffect, useState } from "react";
import Loading from "./static_components/Loading";
import Home from "./Home/Home";
import About from "./static_components/About";
import SuggestEdit from "./static_components/SuggestEdit";
import Results from "./Results/Results";
import Details from "./Details";
import Nav from "./Nav";
import Footer from "./static_components/Footer";
import Banner from "./Banner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import sanitizeHtml from "sanitize-html-react";
import {
  getRecords,
  addUserDistancesToRecords,
  getMetaInformation,
  getCategorySearchData,
  getMainSearchData,
  dateString,
  isPreviewMode
} from "../utils/api";
import "../icons/iconsInit";
import config from "../config.json";

const App = () => {
  const [records, setRecords] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [savedDataId, setSavedDataId] = useState([]);
  const [metaInformation, setMetaInformation] = useState({});
  const [bannerContent, setBannerContent] = useState("");
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [revisionDate, setRevisionDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /* Attempt to convert an old RCR link from when HashRouter was in use */
  /* This is a convenience for the user to be able to use old links */
  const location = window.location;
  const url = location.href;
  if (/#/.test(url)) {
    const newLocation = location.hash.substring(1);
    window.location = newLocation;
  }

  const handleCardSave = (id) => {
    if (savedDataId.indexOf(id) === -1) {
      setSavedDataId((prevSavedDataId) => [...prevSavedDataId, id]);
    } else {
      const filterArr = savedDataId.filter((item) => item !== id);
      setSavedDataId(filterArr);
    }
  };

  const handleSaveDelete = () => {
    setSavedDataId([]);
  };

  const filterData = (records) => {
    const generalCategories = getCategorySearchData(
      records,
      "general_category"
    );
    const parentCategories = getCategorySearchData(
      records,
      "parent_organization"
    );
    const mainCategories = getMainSearchData(records);
    // return a new object with the search data
    return {
      general: generalCategories,
      main: mainCategories,
      parent: parentCategories
    };
  };

  const handleGetData = async () => {
    const records = await getRecords();
    const searchData = filterData(records);
    setSearchData(searchData);
    return records;
  };

  const handleBrowserGeolocatorInput = async (records) => {
    const { records: distanceRecords } =
      await addUserDistancesToRecords(records);
    setRecords(distanceRecords);
  };

  useEffect(() => {
    if (records) {
      setIsLoading(false);
    }
  }, [records]);

  useEffect(() => {
    const fetchMetaAndData = async () => {
      // Since we can't do async/await directly in useEffect
      if (!Object.keys(metaInformation).length) {
        setMetaInformation(await getMetaInformation());
      }

      if (Object.keys(metaInformation).length) {
        const cleanHtml = sanitizeHtml(
          metaInformation.site_banner_content,
          config.banner.options
        );

        setBannerContent(cleanHtml);
        setBannerEnabled(metaInformation.site_banner_enabled);
        setRevisionDate(dateString(metaInformation.last_update));
      }

      if (!records) {
        const nonDistanceRecords = await handleGetData();
        handleBrowserGeolocatorInput(nonDistanceRecords);
      }
    };

    fetchMetaAndData();
  }, [metaInformation, records]);

  return (
    <BrowserRouter>
      <div>
        <div className="main-content">
          {isPreviewMode() === true ? (
            <div>
              <center>
                This site is using preview data. To view production data, please
                close the tab and reload the site
              </center>
            </div>
          ) : (
            <React.Fragment />
          )}
          {bannerEnabled === true &&
          typeof bannerContent === "string" &&
          bannerContent.length > 0 ? (
            <Banner
              bannerEnabled={bannerEnabled}
              bannerContent={bannerContent}
            />
          ) : (
            <React.Fragment />
          )}
          <Nav />
          <Routes>
            <Route
              exact
              path="/"
              element={<Home records={records} searchData={searchData} />}
            />
            <Route exact path="/about" element={<About />} />
            <Route exact path="/suggest-edit" element={<SuggestEdit />} />
            <Route
              path="/results"
              element={
                <React.Fragment>
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <Results
                      records={records}
                      searchData={searchData}
                      handleCardSave={handleCardSave}
                      handleSaveDelete={handleSaveDelete}
                      savedDataId={savedDataId}
                    />
                  )}
                </React.Fragment>
              }
            />
            <Route
              exact
              path="/details"
              element={
                <Details
                  records={records}
                  handleCardSave={handleCardSave}
                  savedDataId={savedDataId}
                />
              }
            />
            <Route
              path="/admin"
              render={() => {
                window.location.href = [
                  window.location.protocol,
                  "//",
                  window.location.host.replace(/\d+/, "5900"),
                  "/admin/dashboard"
                ].join("");
              }}
            />
            {/* for all other routes */}
            <Route render={() => <p>Not Found</p>} />
          </Routes>
        </div>
        <Footer revisionDate={revisionDate} />
      </div>
    </BrowserRouter>
  );
};

export default App;
