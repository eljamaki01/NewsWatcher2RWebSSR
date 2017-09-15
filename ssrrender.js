const path = require('path')
const fs = require('fs')
const config = require('./config');

const React = require('react')
const { renderToString } = require('react-dom/server')
const { StaticRouter } = require('react-router-dom')

const { createStore } = require('redux')
const { Provider } = require('react-redux')
const { default: App } = require('./src/App')
const { default: reducer } = require('./src/reducers')
import { toHours } from './src/utils/utils';

var express = require('express');
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
var router = express.Router();

//
// Return all the Home Page news stories. Call the middleware first to verify we have a logged in user.
//
module.exports = function handleSSR(req, res, next) {
  req.db.collection.findOne({ _id: config.GLOBAL_STORIES_ID }, { homeNewsStories: 1 }, function (err, doc) {
    if (err)
      return next(err);

    // Populate an initial state
    for (var i = 0; i < doc.homeNewsStories.length; i++) {
      doc.homeNewsStories[i].hours = toHours(doc.homeNewsStories[i].date);
    }
    let preloadedState = { homenews: { isLoading: false, news: doc.homeNewsStories } }

    // Create a new Redux store instance
    const store = createStore(reducer, preloadedState)

    const context = {}
    const html = renderToString(
      <Provider store={store}>
        <StaticRouter
          location={req.url}
          context={context}
        >
          <App />
        </StaticRouter>
      </Provider>
    )

    // Grab the initial state from our Redux store
    const finalState = store.getState()

    // Send the rendered page back to the client
    const filePath = path.resolve(__dirname, 'build', 'index.html')
    fs.readFile(filePath, 'utf8', (err, htmlData) => {
      if (err) {
        console.error('read err', err)
        return res.status(404).end()
      }

      // We're good, so send the response
      let replace1 = htmlData.replace('{{SSR}}', html)
      let replace2 = replace1.replace(`console.log("REPLACE")`,
        `window.__PRELOADED_STATE__ = ${JSON.stringify(finalState).replace(/</g, '\\u003c')}`)
      res.send(replace2)
    })
  });
};
