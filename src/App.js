import React, { Component } from 'react';
import superagent from 'superagent';
import './App.css';
import { Switch, Route } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { IndexLinkContainer } from 'react-router-bootstrap';
import { connect } from 'react-redux'
import LoginView from './views/loginview';
import NewsView from './views/newsview';
import HomeNewsView from './views/homenewsview';
import SharedNewsView from './views/sharednewsview';
import ProfileView from './views/profileview';
import NotFound from './views/notfound';

//export default class App extends Component {
class App extends Component {

  componentDidMount() {
    // Check for token in HTML5 client side local storage
    const storedToken = window.localStorage.getItem("userToken");
    if (storedToken) {
      const tokenObject = JSON.parse(storedToken);
      // this.setState({ session: tokenObject, loggedIn: true, currentMsg: `Signed in as ${tokenObject.displayName}` });
      this.props.dispatch({ type: 'RECEIVE_TOKEN_SUCCESS', msg: `Signed in as ${tokenObject.displayName}`, session: tokenObject });
      // window.location.hash = "#news";
    } else {
      // window.location.hash = "";
    }
  }

  handleLogout = (event) => {
    const { dispatch } = this.props
    event && event.preventDefault();
    superagent.delete(`/api/sessions/${this.props.session.userId}`)
      .set('Content-Type', 'application/json')
      .set('x-auth', this.props.session.token)
      .end((err, res) => {
        if (err || !res.ok || res.status !== 200) {
          dispatch({ type: 'MSG_DISPLAY', msg: `Sign out failed: ${res.body.message}` });
        } else {
          dispatch({ type: 'DELETE_TOKEN_SUCCESS', msg: "Signed out" });
          window.localStorage.removeItem("userToken");
          window.location.hash = "";
        }
      });
  }

  render() {
    return (
      <div>
        <Navbar fluid default collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              NewsWatcher {this.props.currentMsg && <span><small>({this.props.currentMsg})</small></span>}
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              {<IndexLinkContainer to="/" replace><NavItem >Home Page News</NavItem></IndexLinkContainer>}
              {this.props.loggedIn && <IndexLinkContainer to="/news" replace><NavItem >My News</NavItem></IndexLinkContainer>}
              {this.props.loggedIn && <IndexLinkContainer to="/sharednews" replace><NavItem >Shared News</NavItem></IndexLinkContainer>}
              {this.props.loggedIn && <IndexLinkContainer to="/profile" replace><NavItem >Profile</NavItem></IndexLinkContainer>}
              {this.props.loggedIn && <NavItem onClick={this.handleLogout}>Logout</NavItem>}
              {!this.props.loggedIn && <IndexLinkContainer to="/login" replace><NavItem >Login</NavItem></IndexLinkContainer>}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <hr />
        <Switch>
          <Route exact path="/" component={HomeNewsView} />
          <Route path="/login" component={LoginView} />
          <Route path="/news" component={NewsView} />
          <Route path="/sharednews" component={SharedNewsView} />
          <Route path="/profile" render={props => <ProfileView appLogoutCB={this.handleLogout} {...props} />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loggedIn: state.app.loggedIn,
    session: state.app.session,
    currentMsg: state.app.currentMsg
  }
}

// export default App;
// export default connect(mapStateToProps)(App)
export default withRouter(connect(mapStateToProps)(App))
