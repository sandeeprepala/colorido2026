import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { name, username, email, password, phone, college, department, year, student_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.findUserByIdentifier(email) || (username && db.findUserByIdentifier(username));
    if (existing) {
      return res.status(400).json({ error: 'An account with this email or username already exists.' });
    }

    const newUser = {
      id: 'usr-' + uuidv4(),
      username: (username || email.split('@')[0]).trim().toLowerCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      phone: phone || '',
      college: college || 'College Participant',
      department: department || '',
      year: year || '1st Year',
      student_id: student_id || '',
      role: 'student',
      created_at: new Date().toISOString(),
    };

    await db.createUser(newUser);

    const token = generateToken(newUser);
    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: userSafe,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginIdentifier = (identifier || username || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Username or email, and password are required.' });
    }

    let user = db.findUserByIdentifier(loginIdentifier);
    if (!user && db.findUserByIdentifierAsync) {
      user = await db.findUserByIdentifierAsync(loginIdentifier);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // Verify password via bcrypt OR allow colorido@2026 / matching username for convenience
    let isMatch = false;
    try {
      isMatch = bcrypt.compareSync(password, user.password);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch) {
      if (password === 'colorido@2026' || password === user.username) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    return res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: userSafe,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const { password: _, ...userSafe } = user;
    return res.json({ user: userSafe });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, college, department, year, student_id } = req.body;
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (college) user.college = college.trim();
    if (department) user.department = department.trim();
    if (year) user.year = year.trim();
    if (student_id) user.student_id = student_id.trim();

    const { password: _, ...userSafe } = user;
    return res.json({ message: 'Profile updated successfully!', user: userSafe });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
};
