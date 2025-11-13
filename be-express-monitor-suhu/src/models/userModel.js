import { db } from '../core/config/knex.js';

// Ambil semua user (termasuk profile_image)
export const getAllUsers = () => {
  return db('users').select('id', 'email', 'username', 'no_hp', 'role', 'profile_image');
};

// Cari user berdasarkan email
export const getUserByEmail = (email) => {
  return db('users').where({ email }).first();
};

// Cari user berdasarkan username
export const getUserByUsername = (username) => {
  return db('users').where({ username }).select("*").first();
};

// Cari user berdasarkan id
export const getUserById = (id) => {
  return db('users').where({ id }).select("*").first();
};

// Update data user by id (flexible update)
export const updateUserById = (id, data) => {
  return db('users').where({ id }).update(data).returning('*');
};

// Tambah user baru
export const addUser = (data) => {
  return db('users').insert(data).returning('*');
};

// Cari user by email/username
export const getUserByEmailOrUsername = (emailOrUsername) => {
  return db('users')
    .where({ email: emailOrUsername })
    .orWhere({ username: emailOrUsername })
    .select("*")
    .first();
};

// Hapus user
export const deleteUser = (id) => {
  return db('users').where({ id }).del();
};

export const updatePassword = (id, password) => {
  return db('users').where({ id }).update({ password }).returning('*');
};

export const updateProfile = (id, data) => {
  const allowedFields = ['username', 'no_hp', 'profile_image'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  return db('users').where({ id }).update(updateData).returning('*');
};
