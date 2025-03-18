const express = require('express');
const multer = require('multer');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes
router.use(authMiddleware.protect);

router
  .route('/')
  .get(contactController.getContacts)
  .post(contactController.createContact);

router.post('/import', upload.single('file'), contactController.importContacts);

router
  .route('/:id')
  .get(contactController.getContact)
  .patch(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;