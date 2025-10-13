
import bcrypt from 'bcrypt';
import jwt, { decode } from 'jsonwebtoken';
import { 
  getUserByEmail, 
  getUserByUsername, 
  addUser, 
  getUserById,
  updateProfile as updateProfileModel,
  updatePassword,
  getAllUsers as getAllUsersFromModel,
  deleteUser as deleteUserFromModel
} from '../models/userModel.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role, no_hp: user.no_hp},
    process.env.JWT_SECRET,
  );
};

export const register = async (req, res) => {
  try {
    const { email, username, password, no_hp, role = 'user' } = req.body;
    
    console.log('Register request body:', req.body);
    
    if (!email || !username || !password) {
      return res.status(400).json({ 
        message: 'Email, username dan password wajib diisi',
        received: { email: !!email, username: !!username, password: !!password }
      });
    }

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    const existingUser = await getUserByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const existingUsername = await getUserByUsername(trimmedUsername);
    if (existingUsername) {
      return res.status(409).json({ message: 'Username sudah terdaftar' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    const newUser = await addUser({ 
      email: trimmedEmail, 
      username: trimmedUsername,
      password: hash, 
      no_hp: no_hp || null,
      role
    });

    res.status(201).json({ 
      message: 'Registrasi berhasil',
      user: { 
        id: newUser[0].id, 
        email: newUser[0].email, 
        username: newUser[0].username,
        role: newUser[0].role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Error Server', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password, email, username } = req.body;
    
    console.log('Login request body:', JSON.stringify(req.body, null, 2));
    
    const loginIdentifier = emailOrUsername || email || username;
    
    if (!loginIdentifier || !password) {
      return res.status(400).json({ 
        message: 'Email/Username dan password wajib diisi',
        debug: {
          received_fields: Object.keys(req.body),
          received_values: {
            emailOrUsername: emailOrUsername || 'not provided',
            email: email || 'not provided', 
            username: username || 'not provided',
            password: password ? 'provided' : 'not provided'
          }
        }
      });
    }

    const trimmedIdentifier = loginIdentifier.trim();

    let user;
    if (trimmedIdentifier.includes('@')) {
      user = await getUserByEmail(trimmedIdentifier);
    } else {
      user = await getUserByUsername(trimmedIdentifier);
    }

    if (!user) {
      return res.status(401).json({ message: 'Email/Username atau Password Salah' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email/Username atau Password Salah' });
    }

    const token = generateToken(user);

    res.json({ 
      message: 'Login Sukses', 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        role: user.role,
        no_hp: user.no_hp,
        profile_image: user.profile_image
      },
      token: token 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error Server', error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', { 
    httpOnly: true, 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logout sukses' });
};

export const verify = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Token tidak ditemukan');
      return res.status(401).json({ message: 'Tidak ada token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      ok: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
        no_hp: decoded.no_hp,
        profile_image: decoded.profile_image
      },
    });
  } catch (error) {
    console.error('Error verifikasi:', error);
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const { username, no_hp, profile_image } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({ message: 'Username wajib diisi' });
    }

    const trimmedUsername = username.trim();

    const existingUser = await getUserByUsername(trimmedUsername);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    const updateData = { username: trimmedUsername };
    if (no_hp !== undefined) {
      updateData.no_hp = no_hp;
    }
    if (profile_image !== undefined) {
      updateData.profile_image = profile_image;
    }

    await updateProfileModel(userId, updateData);

    const updatedUser = await getUserById(userId);
    
    res.json({
      message: 'Profile berhasil diupdate',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        no_hp: updatedUser.no_hp,
        role: updatedUser.role,
        profile_image: updateData.profile_image
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error Server', error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Password lama, password baru, dan konfirmasi password wajib diisi' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Password lama tidak benar' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(userId, hashedNewPassword);

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Error Server', error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersFromModel();
    res.json({
      message: 'Daftar users berhasil diambil',
      users: users
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Error Server', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }

    const userToDelete = await getUserById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await deleteUserFromModel(id);

    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Error Server', error: err.message });
  }
};