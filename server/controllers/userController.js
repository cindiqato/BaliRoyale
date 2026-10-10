const UserModel = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baliroyale_secret_key';

// ---------- CRUD (already built) ----------

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

// ---------- Auth ----------

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 'guest',
    });

    await newUser.save();

    const user = newUser.toObject();
    delete user.password;
    res.json({ message: 'Registered successfully', user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ message: 'Login successful', token, user: safeUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  register,
  login,
  getMe,
};