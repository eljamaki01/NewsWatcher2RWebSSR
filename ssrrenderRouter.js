const express = require('express')
const router = express.Router()

const SSRRender = require('./ssrrender');

router.get('/', SSRRender);

module.exports = router;
