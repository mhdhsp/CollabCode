import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../utils/authUtils';  // Changed import
import logo from '../assets/logo.svg';

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();  // Use util

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="logo" style={{ height: 32, marginRight: 8 }} />
          CollabCode 
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
          aria-controls="navContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0" />
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact
              </Link>
            </li>
            {!isAuthenticated() ? (  // Use util
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Sign Up
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary ms-2" to="/login">
                    Log In
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item d-flex align-items-center me-2">
                  <span className="small text-muted">Hi, {user?.displayName || 'User'}</span>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary me-2" to="/projects">
                    Projects
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;