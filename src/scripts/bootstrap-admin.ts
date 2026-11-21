
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/user.model';

async function bootstrapAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();
  const mongoUri = process.env.MONGO_URI;

  if (!email || !mongoUri) {
    throw new Error('Debes indicar un correo y configurar MONGO_URI');
  }

  // Solo se permite usar una base de datos local.
  if (!/^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(mongoUri)) {
    throw new Error('Este script solo permite MongoDB local');
  }

  try {
    await mongoose.connect(mongoUri);

    // Evita crear otro administrador con este procedimiento.
    const adminExists = await User.exists({ role: 'admin' });

    if (adminExists) {
      throw new Error('Ya existe un administrador');
    }

    // El usuario debe haberse registrado primero como empleado.
    const user = await User.findOne({
      email,
      role: 'employee'
    });

    if (!user) {
      throw new Error('No existe un empleado con ese correo');
    }

    user.role = 'admin';
    await user.save();

    console.log('Primer administrador creado:', user.email);
  } finally {
    await mongoose.disconnect();
  }
}

bootstrapAdmin().catch((error) => {
  console.error('Error:', error.message);
  process.exitCode = 1;
});
