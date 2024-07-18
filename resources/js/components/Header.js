import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import * as actions from '../store/actions';

class Header extends Component {
  state = {
    isOpen: false,
    currentTime: new Date(),
  };

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState({ currentTime: new Date() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  handleLogout = (e) => {
    e.preventDefault();
    this.props.dispatch(actions.authLogout());
  };

  render() {
    const { currentTime } = this.state;
    const formattedDate = currentTime.toLocaleDateString();
    const formattedTime = currentTime.toLocaleTimeString();

    return (
      <Navbar color="dark" dark expand="md" className="mb-4 sticky-top">
        <NavbarBrand tag={Link} to="/">
          <img src="/images/logo.png" alt="Logo" style={{ height: '30px', marginRight: '10px' }} />
          BUMBLEBEE SAMPLE
        </NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            {this.props.isAuthenticated && (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/archive">
                    Archive
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    Account
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem tag={Link} to="/settings" style={{ fontSize: 'small'}}>
                      Settings
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={this.handleLogout} style={{ fontSize: 'small'}}>
                      Log Out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </>
            )}
          </Nav>
        </Collapse>
        <NavItem className="date-time">
              <span>{formattedDate} {formattedTime}</span>
            </NavItem>
      </Navbar>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(Header);
