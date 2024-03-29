import React, { useState } from "react";
import MediaQuery from "react-responsive";
import { NavLink } from "react-router-dom";
import "../css/Nav.css";
import srLogo from "../images/sr-logo-sm.png";
import rcrLogo from "../images/rcr-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSTransition } from "react-transition-group";

const NavDrawer = ({ navVisible, onClick }) => (
  <CSSTransition
    in={navVisible}
    timeout={200}
    classNames="navdrawer"
    appear={true}
  >
    {
      (/*status*/) => {
        return (
          <div className="navdrawer">
            <NavLink
              className="nav-drawer-item"
              //activeClassName="nav-drawer-item-active"
              //exact
              to="/about"
              onClick={onClick}
            >
              ABOUT
            </NavLink>
            <NavLink
              className="nav-drawer-item"
              //activeClassName="nav-drawer-item-active"
              //exact
              to="/suggest-edit"
              onClick={onClick}
            >
              SUGGEST UPDATE
            </NavLink>
          </div>
        );
      }
    }
  </CSSTransition>
);

const Nav = () => {
  const [navDrawerVisible, setNavDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setNavDrawerVisible((prevNavDrawerVisible) => !prevNavDrawerVisible);
  };

  const logoDrawerToggle = () => setNavDrawerVisible(false);

  return (
    <div className="nav">
      <header>
        <nav className="nav-container">
          <div className="sr-logo">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://news.streetroots.org/"
              onClick={logoDrawerToggle}
            >
              <img src={srLogo} alt="Street Roots Home" />
            </a>
          </div>
          <div className="rcr-logo">
            <NavLink to="/" onClick={logoDrawerToggle}>
              <img src={rcrLogo} alt="Rose City Resource Home" />
            </NavLink>
          </div>
          <div className="spacer" />
          <MediaQuery query="(min-width: 600px)">
            <NavLink className="nav-item" to="/about">
              ABOUT
            </NavLink>
            <NavLink className="nav-item" to="/suggest-edit">
              SUGGEST UPDATE
            </NavLink>
          </MediaQuery>
          <MediaQuery query="(max-width: 599px)">
            <FontAwesomeIcon
              icon={["fa", "bars"]}
              className="hamburger-icon"
              onClick={toggleDrawer}
            />
          </MediaQuery>
        </nav>
        <MediaQuery query="(max-width: 599.999999px)">
          <NavDrawer onClick={toggleDrawer} navVisible={navDrawerVisible} />
        </MediaQuery>
      </header>
    </div>
  );
};

export default Nav;
