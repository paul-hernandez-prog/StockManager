import { Request, Response } from 'express';
import { registerUser, loginUser, AuthError } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body ?? {};

    const user = await registerUser(name, email, password);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error al registrar el usuario'
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    const result = await loginUser(email, password);

    res.status(200).json({
      message: 'Inicio de sesion correcto',
      ...result
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error al iniciar sesion'
    });
  }
}
