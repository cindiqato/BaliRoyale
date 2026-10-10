const PackageModel = require('../models/Package');

// Public: get all active, non-archived packages
const getPackages = (req, res) => {
  PackageModel.find({ isArchived: false })
    .then((packages) => res.json(packages))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

// Public: get one package by id
const getPackageById = (req, res) => {
  PackageModel.findById(req.params.id)
    .then((pkg) => {
      if (!pkg) return res.status(404).json({ error: 'Package not found' });
      res.json(pkg);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

// Admin: create package
const createPackage = (req, res) => {
  const newPackage = new PackageModel(req.body);
  newPackage
    .save()
    .then((pkg) => res.json(pkg))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

// Admin: update package
const updatePackage = (req, res) => {
  PackageModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((pkg) => res.json(pkg))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

// Admin: archive package (soft delete)
const archivePackage = (req, res) => {
  PackageModel.findByIdAndUpdate(
    req.params.id,
    { isArchived: true, status: 'archived' },
    { new: true }
  )
    .then((pkg) => res.json({ message: 'Package archived', package: pkg }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  archivePackage,
};