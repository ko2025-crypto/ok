import { v4 as uuid } from 'uuid';
import { formatDate } from '../utils/authUtils';
import { GUEST_USERS } from '../../frontend/constants/constants';
/**
 * User Database can be added here.
 * You can add default users of your wish with different attributes
 * Every user will have cart (Quantity of all Products in Cart is set to 1 by default), wishList by default
 * */

const defaultUsers = [
  {
    _id: uuid(),
    firstName: 'Jethalal',
    lastName: 'Gada',
    email: 'jethalal.gada@gmail.com',
    password: 'babitaji1234',
    createdAt: formatDate(),
    updatedAt: formatDate(),
  },
];

// Agregar usuarios invitados adicionales
const additionalGuestUsers = GUEST_USERS.slice(1).map(user => ({
  _id: uuid(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  password: user.password,
  createdAt: formatDate(),
  updatedAt: formatDate(),
}));

export const users = [...defaultUsers, ...additionalGuestUsers];