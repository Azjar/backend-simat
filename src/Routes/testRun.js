const express = require('express')
const router = express.Router()
const { syncTestRun } = require('../Controllers/testRunController')

router.post('/test-runs/sync', syncTestRun)

module.exports = router
