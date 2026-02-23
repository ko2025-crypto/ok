import { v4 as uuid } from "uuid";
import { Response } from "miragejs";
import { formatDate } from "../utils/authUtils";
import { GUEST_USERS } from "../../frontend/constants/constants";
import { JWT_SECRET } from "../../frontend/constants/constants";
const sign = require("jwt-encode");
/**
 * All the routes related to Auth are present here.
 * These are Publicly accessible routes.
 * */

/**
 * Función para validar formato de email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Función para verificar si es un usuario invitado
 */
const isGuestUser = (email, password) => {
  return GUEST_USERS.some(user => 
    user.email.toLowerCase() === email.toLowerCase() && 
    user.password === password
  );
};

/**
 * This handler handles user signups.
 * send POST Request at /api/auth/signup
 * body contains {firstName, lastName, email, password}
 * */

export const signupHandler = function (schema, request) {
  const { email, password, ...rest } = JSON.parse(request.requestBody);
  try {
    // Validar formato de email
    if (!isValidEmail(email)) {
      return new Response(
        422,
        {},
        {
          errors: ["Please enter a valid email address."],
        }
      );
    }

    // Validar que la contraseña no esté vacía
    if (!password || password.trim().length < 3) {
      return new Response(
        422,
        {},
        {
          errors: ["Password must be at least 3 characters long."],
        }
      );
    }

    // Validar que firstName no esté vacío
    if (!rest.firstName || rest.firstName.trim().length === 0) {
      return new Response(
        422,
        {},
        {
          errors: ["First name is required."],
        }
      );
    }

    // check if email already exists
    const foundUser = schema.users.findBy({ email });
    if (foundUser) {
      return new Response(
        422,
        {},
        {
          errors: ["Unprocessable Entity. Email Already Exists."],
        }
      );
    }

    const _id = uuid();
    const newUser = {
      _id,
      email: email.toLowerCase().trim(),
      password: password.trim(),
      createdAt: formatDate(),
      updatedAt: formatDate(),
      firstName: rest.firstName.trim(),
      lastName: rest.lastName ? rest.lastName.trim() : '',
      cart: [],
      wishlist: [],
    };
    const createdUser = schema.users.create(newUser);
    const encodedToken = sign({ _id, email }, JWT_SECRET);
    return new Response(201, {}, { createdUser, encodedToken });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      500,
      {},
      {
        errors: ["Internal server error. Please try again."],
      }
    );
  }
};

/**
 * This handler handles user login.
 * send POST Request at /api/auth/login
 * body contains {email, password}
 * */

export const loginHandler = function (schema, request) {
  const { email, password } = JSON.parse(request.requestBody);
  try {
    // Validar formato de email
    if (!isValidEmail(email)) {
      return new Response(
        400,
        {},
        { errors: ["Please enter a valid email address."] }
      );
    }

    // Validar que la contraseña no esté vacía
    if (!password || password.trim().length === 0) {
      return new Response(
        400,
        {},
        { errors: ["Password is required."] }
      );
    }

    // Buscar usuario por email (case insensitive)
    const foundUser = schema.users.findBy({ email: email.toLowerCase().trim() });
    
    if (!foundUser) {
      // Si no se encuentra el usuario y es un usuario invitado válido, crearlo automáticamente
      if (isGuestUser(email, password)) {
        const guestUserData = GUEST_USERS.find(user => 
          user.email.toLowerCase() === email.toLowerCase() && 
          user.password === password
        );
        
        const _id = uuid();
        const newGuestUser = {
          _id,
          email: email.toLowerCase().trim(),
          password: password.trim(),
          firstName: guestUserData.firstName,
          lastName: guestUserData.lastName,
          createdAt: formatDate(),
          updatedAt: formatDate(),
          cart: [],
          wishlist: [],
        };
        
        const createdUser = schema.users.create(newGuestUser);
        const encodedToken = sign({ _id, email: email.toLowerCase().trim() }, JWT_SECRET);
        
        // Remover password del objeto de respuesta
        const userResponse = { ...createdUser.attrs };
        delete userResponse.password;
        
        return new Response(200, {}, { foundUser: userResponse, encodedToken });
      }
      
      return new Response(
        404,
        {},
        { errors: ["The email you entered is not registered. Please check your credentials or sign up."] }
      );
    }
    
    if (password.trim() === foundUser.password) {
      const encodedToken = sign(
        { _id: foundUser._id, email: foundUser.email },
        JWT_SECRET
      );
      
      // Crear copia del usuario sin la contraseña
      const userResponse = { ...foundUser.attrs };
      delete userResponse.password;
      
      return new Response(200, {}, { foundUser: userResponse, encodedToken });
    }
    
    return new Response(
      401,
      {},
      {
        errors: [
          "Invalid password. Please check your credentials and try again.",
        ],
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      500,
      {},
      {
        errors: ["Internal server error. Please try again."],
      }
    );
  }
};
