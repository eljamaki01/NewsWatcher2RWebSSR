import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { HashRouter } from 'react-router-dom'
// import { BrowserRouter } from 'react-router-dom'

import { Provider } from 'react-redux'
import reducer from './reducers'
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './index.css';

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__
delete window.__PRELOADED_STATE__
const store = createStore(reducer, preloadedState);

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App/>
    </HashRouter>
  </Provider>, document.getElementById('root')
);
