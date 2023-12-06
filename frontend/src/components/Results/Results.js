import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconSelector from '../Home/IconSelector';
import { SearchBar } from '../Home/SearchBar';
import Cards from './Cards';
import SimpleMap from './Map';
import { getFilteredRecords, detailsQueryBuilder } from '../../utils/api';
import '../../css/Results.css';

const Results = (props) => {
//  const [queryVals, setQueryVals] = useState(null);
//  const [data, setData] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickType, setClickType] = useState(null);  //to keep track of how scroll should happen
 
  const location = useLocation();

  const updateListing = (id, clickType) => {
    setSelectedListing(id);
    setClickType(clickType);
    // setState(prevState => ({ ...prevState, selectedListing: id, clickType }));
  };

  const query = queryString.parse(location.search);
  const dataMap = {
    search: query.search,
    category: query.category,
    parent: query.parent
  };

  const { records } = props;

useEffect(() => {
  setLoading(false)
}, [])

//  useEffect(() => {
    const data = getFilteredRecords(
      dataMap.search,
      dataMap.category,
      dataMap.parent,
      records
    );

   // const queryVals = dataMap
//    setData(data)

    // setState(prevState => ({
    //   ...prevState,
    //   queryVals: dataMap,
    //   data,
    //   loading: false
    // }));
//  }, []);

  const {
    searchData,
    handleCardSave,
    handleSaveDelete,
    savedDataId
  } = props;

  const styles = {
    faIcon: {
      color: '#393f48',
      marginRight: '5px'
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
        path={'/results'}
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
                    pathname: '/details',
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
  )
}

export default Results;

// import React from 'react';
// import { Link } from 'react-router-dom';
// import queryString from 'query-string';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import IconSelector from '../Home/IconSelector';
// import SearchBar from '../Home/SearchBar';
// import Cards from './Cards';
// import SimpleMap from './Map';
// import { getFilteredRecords, detailsQueryBuilder } from '../../utils/api';
// import '../../css/Results.css';

// class Results extends React.Component {
//   state = {
//     queryVals: null,
//     data: null,
//     selectedListing: null,
//     loading: true,
//     clickType: null //to keep track of how scroll should happen
//   };

//   updateListing = (id, clickType) => {
//     this.setState(() => ({ selectedListing: id, clickType }));
//   };

//   //check to see which query values are search OR
//   //category and/or parent
//   //and then set state with result
//   // the next few blocks are not DRY'd
//   componentDidMount() {
//     const queryVals = queryString.parse(this.props.location?.search);

//     const dataMap = {
//       search: queryVals.search,
//       category: queryVals.category,
//       parent: queryVals.parent
//     };

//     const { records } = this.props;
//     const data = getFilteredRecords(
//       dataMap.search,
//       dataMap.category,
//       dataMap.parent,
//       records
//     );

//     this.setState(() => ({
//       queryVals: dataMap,
//       data,
//       loading: false
//     }));
//   }

//   componentDidUpdate(prevProps) {
//     if (this.props.location?.search !== prevProps.location?.search) {
//       const queryVals = queryString.parse(this.props.location?.search);

//       const dataMap = {
//         search: queryVals.search,
//         category: queryVals.category,
//         parent: queryVals.parent
//       };

//       const { records } = this.props;
//       const data = getFilteredRecords(
//         dataMap.search,
//         dataMap.category,
//         dataMap.parent,
//         records
//       );

//       this.setState(() => ({
//         queryVals: dataMap,
//         data,
//         loading: false
//       }));
//     }
//   }

//   // This is to deal with the unwanted rerenderings happening
//   //on mobile
//   shouldComponentUpdate(nextProps, nextState) {
//     if (
//       (nextState.loading !== this.state.loading && nextProps === this.props) ||
//       (nextState.selectedListing !== this.state.selectedListing &&
//         nextProps === this.props) ||
//       nextProps.location?.search !== this.props.location?.search ||
//       nextState.data !== this.state.data
//     ) {
//       return true;
//     } else {
//       return false;
//     }
//   }

//   render() {
//     const { data, loading, selectedListing, clickType } = this.state;
//     const {
//       records,
//       searchData,
//       handleCardSave,
//       handleSaveDelete,
//       savedDataId
//     } = this.props;

//     const styles = {
//       faIcon: {
//         color: '#393f48',
//         marginRight: '5px'
//       }
//     };

//     if (loading === true) {
//       return <div>Loading...</div>;
//     }
//     return (
//       <div>
//         <div className="basic-search-container">
//           <SearchBar records={records} searchData={searchData} />
//         </div>
//         <IconSelector
//           records={records}
//           searchData={searchData}
//           path={'/results'}
//           isVisible={false}
//         />

//         <div className="results-outer-container">
//           <div className="results-container">
//             <div className="map-container">
//               <SimpleMap
//                 data={data}
//                 selectedListing={selectedListing}
//                 clickType={clickType}
//                 updateListing={this.updateListing}
//                 savedDataId={savedDataId}
//               />
//               {savedDataId.length > 0 ? (
//                 <div className="print-button-container">
//                   <Link
//                     to={{
//                       pathname: '/details',
//                       search: detailsQueryBuilder(savedDataId)
//                     }}
//                   >
//                     <div className="print-button">
//                       <FontAwesomeIcon
//                         style={styles.faIcon}
//                         icon="print"
//                         size="sm"
//                       />
//                       Print Saved Listings
//                     </div>
//                   </Link>
//                   <div
//                     className="print-button"
//                     onClick={() => {
//                       handleSaveDelete();
//                     }}
//                   >
//                     Clear Saved Listings
//                   </div>
//                 </div>
//               ) : null}
//             </div>
//             <Cards
//               data={data}
//               selectedListing={selectedListing}
//               updateListing={this.updateListing}
//               clickType={clickType}
//               handleCardSave={handleCardSave}
//               savedDataId={savedDataId}
//               showMapDetail={false}
//             />
//           </div>
//         </div>
//       </div>
//     );
//   }
// }
// export default Results;