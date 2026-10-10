const UserModel = require('../models/User');

const getUsers = (req, res) => {
  UserModel.find()
    .then((users) => res.json(users))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

const createUser = (req, res) => {
  const newUser = new UserModel(req.body);
  newUser
    .save()
    .then((user) => res.json(user))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

const updateUser = (req, res) => {
  UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((user) => res.json(user))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

const deleteUser = (req, res) => {
  UserModel.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: 'User deleted' }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

module.exports = { getUsers, createUser, updateUser, deleteUser };