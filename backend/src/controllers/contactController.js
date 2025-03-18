const Contact = require('../models/Contact');
const csv = require('csv-parse');

exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create({
      ...req.body,
      owner: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: { contact }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'A contact with this email already exists'
      });
    }
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { contacts }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { contact }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { contact }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contact not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.importContacts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a CSV file'
      });
    }

    const contacts = [];
    const errors = [];

    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true
    });

    parser.on('readable', async () => {
      let record;
      while ((record = parser.read())) {
        try {
          const contact = {
            owner: req.user._id,
            email: record.email?.trim(),
            firstName: record.firstName?.trim() || '',
            lastName: record.lastName?.trim() || '',
            company: record.company?.trim() || '',
            tags: record.tags ? record.tags.split(',').map(tag => tag.trim()) : [],
            notes: record.notes?.trim() || ''
          };

          // Validate email
          if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
            errors.push(`Invalid email: ${contact.email}`);
            continue;
          }

          contacts.push(contact);
        } catch (error) {
          errors.push(`Error processing row: ${error.message}`);
        }
      }
    });

    parser.on('end', async () => {
      try {
        // Use insertMany with ordered: false to continue on error
        const result = await Contact.insertMany(contacts, { ordered: false });
        
        res.status(200).json({
          status: 'success',
          data: {
            imported: result.length,
            errors: errors
          }
        });
      } catch (error) {
        // Handle duplicate emails
        if (error.writeErrors) {
          const duplicates = error.writeErrors
            .filter(err => err.code === 11000)
            .map(err => err.err.op.email);
          
          errors.push(...duplicates.map(email => `Duplicate email: ${email}`));
        }

        res.status(207).json({
          status: 'partial',
          data: {
            imported: error.insertedDocs?.length || 0,
            errors: errors
          }
        });
      }
    });

    parser.write(req.file.buffer);
    parser.end();
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};