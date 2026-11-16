import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }

  const token = header.slice(7).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: 'Error de configuracion del servidor'
    });
    return;
  }

  let userId: string;

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256']
    });

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      res.status(401).json({ message: 'Token invalido' });
      return;
    }

    userId = payload.sub;
  } catch {
    res.status(401).json({
      message: 'Token invalido o expirado'
    });
    return;
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(401).json({
        message: 'Usuario no encontrado'
      });
      return;
    }

    res.locals.authUser = {
      id: user._id.toString(),
      role: user.role
    };

    next();
  } catch {
    res.status(500).json({
      message: 'Error al verificar el usuario'
    });
  }
}

export function requireRole(...allowedRoles: ('admin' | 'employee')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.authUser;

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: 'No tienes permiso para realizar esta accion'
      });
    }

    next();
  };
}
