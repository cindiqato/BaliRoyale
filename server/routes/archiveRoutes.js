const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/archives', auth, admin, archiveController.getArchives);
router.get('/archives/:id', auth, admin, archiveController.getArchiveById);
router.post('/archives', auth, admin, archiveController.archiveRecord);
router.put('/archives/:id/restore', auth, admin, archiveController.restoreArchive);

module.exports = router;