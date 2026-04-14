import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="main-navbar">
      <div className="nav-brand">
        <Link to="/">G-CAS</Link>
      </div>
      <div className="nav-links">
        {/* Placeholder for future links */}
      </div>
    </nav>
  );
};

export default Navbar;
