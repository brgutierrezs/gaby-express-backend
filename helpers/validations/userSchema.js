const yup = require('yup');


//Esquema para el registro
const registerSchema = yup.object({
    username: yup
        .string()
        .required('El username es requerido')
        .min(3, 'El username debe tener al menos 3 caracteres')
        .max(50, 'El username no puede tener mas de 50 caracteres'),

    email: yup
        .string()
        .required('El username es requerido')
        .email('Debe tener un email valido'),

    password: yup
        .string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
});

//Esquema para actualizar perfil
// Esquema para actualización de perfil
const profileUpdateSchema = yup.object({
    first_name: yup
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    
    last_name: yup
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres'),
    
    phone: yup
      .string()
      .matches(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido'),
    
    address_line: yup
      .string()
      .min(5, 'La dirección debe tener al menos 5 caracteres'),
    
    region: yup
      .string()
      .required('La región es requerida'),
    
    country: yup
      .string()
      .required('El país es requerido')
  });

  module.exports = {
    registerSchema,
    profileUpdateSchema
  };