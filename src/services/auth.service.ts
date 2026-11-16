import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export async function registerUser(
  name: unknown,
  email: unknown,
  password: unknown
) {
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new AuthError(400, 'Datos de registro invalidos');
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new AuthError(400, 'Nombre o correo invalido');
  }

  if (
    Buffer.byteLength(password, 'utf8') < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new AuthError(400, 'La contrasena debe tener entre 8 y 72 bytes');
  }

  const existingUser = await User.exists({ email: cleanEmail });

  if (existingUser) {
    throw new AuthError(409, 'El correo ya esta registrado');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'employee'
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      throw new AuthError(409, 'El correo ya esta registrado');
    }

    throw error;
  }
}

export async function loginUser(email: unknown, password: unknown) {
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    throw new AuthError(400, 'Correo y contrasena requeridos');
  }

  const cleanEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: cleanEmail
  }).select('+passwordHash');

  if (!user) {
    throw new AuthError(401, 'Credenciales incorrectas');
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    throw new AuthError(401, 'Credenciales incorrectas');
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET no esta configurado');
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    secret,
    { expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

