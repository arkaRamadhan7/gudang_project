import { date } from "zod";
import { getAllUsers, getUserByEmail, addUser, getUserById,updateUserById } from "../models/userModel.js";
import { registerSchema, updateUserSchema } from "../schemas/updateUserSchema.js";
import { datetime, status } from "../utils/general.js";
import { hashPassword } from "../utils/hash.js";
import { db } from "../core/config/knex.js";


export const fetchAllUsers = async (req, res) => {
  try {
    const users = await db('users').select('*');

    res.status(200).json({
      status: 200,
      message: 'Data user berhasil diambil',
      users,
      datetime: datetime()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Gagal mengambil data user',
      users: []
    });
  }
};


export const createNewUser = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    console.log('Body:', req.body);

     if (!validation.success) {
  return res.status(400).json({
    message: "Validasi gagal",
    datetime: datetime(),
    errors: validation.error.errors.map((err) => ({
      field: err.path[0],
      message: err.message,
    })),
  });
}

const { username, password, email, no_hp, role, gudang, toko } = validation.data;

const existingUser = await getUserByEmail(email);
if (existingUser) {
  return res.status(400).json({
    status: status.BAD_REQUEST,
    message: "Email sudah terdaftar",
    datetime: datetime(),
  });
}

const hashedPassword = await hashPassword(password);

const newUser = await addUser({ username, password: hashedPassword, email, no_hp, role, gudang, toko });

return res.status(200).json({
  status: status.SUKSES,
  message: "Data user berhasil ditambahkan",
  datetime: datetime(),
  user: {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    no_hp: newUser.no_hp,
    role: newUser.role,
    gudang: newUser.gudang,
    toko: newUser.toko
},
});

  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};
export const getUserDetail = async (req, res) => {
try {
  const { id } = req.params;
  const user = await getUserById(id);

  if (!user) {
    return res.status(404).json({
      status: status.NOT_FOUND,
      message: 'User tidak ditemukan',
      datetime: datetime(),
    });
  }

  return res.status(200).json({
    status: status.SUKSES,
    message: 'Detail user berhasil didapatkan',
    datetime: datetime(),
    user,
  });
} catch (error) {
  return res.status(500).json({
    status: status.GAGAL,
    message: `Terjadi kesalahan: ${error.message}`,
    datetime: datetime(),
  });
}
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }
    
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }
    
    const { username, password, email, no_hp, role, gudang, toko, profile_image } = validation.data;
    
    // Gunakan hasOwnProperty atau 'in' operator untuk mengecek keberadaan field
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (no_hp) updateData.no_hp = no_hp;
    if (role) updateData.role = role;
    
    // Untuk field yang boleh null, cek apakah field ada di req.body
    if ('gudang' in validation.data) {
      updateData.gudang = gudang; // Bisa null
    }
    
    if ('toko' in validation.data) {
      updateData.toko = toko; // Bisa null
    }

    if ('profile_image' in validation.data) {
      updateData.profile_image = profile_image;
    }
    
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    await updateUserById(id, updateData);
    const updatedUser = await getUserById(id);
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data user berhasil diperbarui",
      datetime: datetime(),
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        no_hp: updatedUser.no_hp,
        role: updatedUser.role,
        gudang: updatedUser.gudang,
        toko: updatedUser.toko,
        profile_image: updatedUser.profile_image
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};export const deleteUser = async (req,res) => {
  try {
    const { id } =req.params;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: 'User tidak di temukan',
        datetime: datetime(),
      });
    }

    await db("users").where({ id }).del();

    return res.status(200).json({
      status: status.SUKSES,
      message : 'user berhasil dihapus',
      datetime: datetime(),
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const getTotalusers = async (req,res) => {
  try {
    const data = await db("users").count("* as total").first();

    res.status(200).json({
      status: status.SUKSES,
      message: 'Berhasil menampilkan seluruh users',
      datetime: datetime(),
      total: data.total
    });
  } catch (err) {
    res.status(500).json({
      status: status.ERROR,
      message: 'gagal Mengambil data seluruh users',
      datetime: datetime(),
      error: err.message
    });
  }
};

export const usertoko = async (req,res) => {
  try {
    const data = await db ("users").where("toko"). first();

    res.status(200).json ({
      status : status.SUKSES,
      message : 'Berhasil menampilkan users by toko',
      datetime : datetime(),
      data : data,
    });
    } catch (err) {
      res.status(500).json({
        status : status.ERROR,
        message : 'Gagal mengambil data seluruh users by toko',
        datetime : datetime()
      });
    }
};