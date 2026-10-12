const UserModel = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logAction } = require('./auditLogController');

const JWT_SECRET = 'baliroyale_secret_key';

// ---------- CRUD ----------

const getUsers = (req, res) => {
  UserModel.find()
    .then((users) => res.json(users))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
};

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, role } = req.body;

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
      role: role || 'guest',
    });

    await newUser.save();

    const user = newUser.toObject();
    delete user.password;

    await logAction({
      actor: req.user.id,
      action: 'create_user',
      targetModel: 'users',
      targetId: newUser._id,
      details: `Created ${role || 'guest'}: ${email}`,
    });

    res.json({ message: 'User created', user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await logAction({
      actor: req.user.id,
      action: 'update_user',
      targetModel: 'users',
      targetId: user._id,
      details: `Updated user: ${user.email}`,
    });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);

    await logAction({
      actor: req.user.id,
      action: 'deactivate_user',
      targetModel: 'users',
      targetId: req.params.id,
      details: 'Deactivated user',
    });

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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