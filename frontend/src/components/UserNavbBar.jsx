import { Link } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Offcanvas from 'react-bootstrap/Offcanvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../stylesheets/UserNAV.css";

export default function AppNavBar() {
  return (
    <>
      {[false].map((expand) => (
        <Navbar key={expand} bg="transperanet" variant="transperanet" expand={expand} className="mb-3">
          <Container fluid>
            <Link to="/user" className="navbar-brand">
              {/* <img src={".."} alt="Logo" height="80" /> */}
            </Link>
          
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="end"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`} className="text-black">
                 AWS
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body className="offcanvas-body">
                <Nav className="justify-content-end flex-grow-1 pe-3 " >
                  <Link to="/login" className="nav-link text-black ">Signout</Link>
                  <Link to="/add" className="nav-link text-black ">Home</Link>
                  <Link to="/profile" className="nav-link text-black">Profile</Link>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </>
  );
}
