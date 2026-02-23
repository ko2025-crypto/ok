import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FormRow,
  LoginAndSignupLayout,
  PasswordRow,
  Title,
} from '../components';
import { useFormInput, useNavigateIfRegistered } from '../hooks';
import { toastHandler } from '../utils/utils';
import { ToastType, LOCAL_STORAGE_KEYS } from '../constants/constants';
import { useState } from 'react';
import { signupService } from '../Services/services';
import { setIntoLocalStorage } from '../utils/utils';
import { useAuthContext } from '../contexts/AuthContextProvider';

const SignupPage = () => {
  const signupPageLocation = useLocation();
  const { updateUserAuth, user } = useAuthContext();

  const navigate = useNavigate();
  useNavigateIfRegistered(user);

  const { userInputs, handleInputChange } = useFormInput({
    firstName: '',
    lastName: '',
    email: '',
    passwordMain: '',
    passwordConfirm: '',
  });

  const [isSignupFormLoading, setIsSignupFormLoading] = useState(false);

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    // Validar que todos los campos requeridos estén llenos
    if (!userInputs.firstName.trim()) {
      toastHandler(ToastType.Error, 'First name is required');
      return;
    }

    if (!userInputs.email.trim()) {
      toastHandler(ToastType.Error, 'Email is required');
      return;
    }

    if (!userInputs.passwordMain.trim()) {
      toastHandler(ToastType.Error, 'Password is required');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInputs.email)) {
      toastHandler(ToastType.Error, 'Please enter a valid email address');
      return;
    }

    // Validar longitud de contraseña
    if (userInputs.passwordMain.length < 3) {
      toastHandler(ToastType.Error, 'Password must be at least 3 characters long');
      return;
    }

    if (userInputs.passwordMain !== userInputs.passwordConfirm) {
      toastHandler(
        ToastType.Error,
        'Password and Confirm Password inputs did not match!'
      );
      return;
    }

    const { email, firstName, lastName, passwordMain: password } = userInputs;

    setIsSignupFormLoading(true);

    try {
      const { user, token } = await signupService({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // update AuthContext with data
      updateUserAuth({ user, token });

      // store this data in localStorage
      setIntoLocalStorage(LOCAL_STORAGE_KEYS.User, user);
      setIntoLocalStorage(LOCAL_STORAGE_KEYS.Token, token);

      // show success toast
      toastHandler(ToastType.Success, `Welcome ${user.firstName}! Account created successfully`);

      // if user directly comes to '/signup' from url, so state will be null, after successful registration, user should be directed to home page
      navigate(signupPageLocation?.state?.from ?? '/');
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 'Signup failed. Please try again.';
      toastHandler(ToastType.Error, errorMessage);
      console.error('Signup error:', error.response?.data);
    }

    setIsSignupFormLoading(false);
  };

  //  if user is registered and trying to Signup '/signup' through url, show this and navigate to home using useNavigateIfRegistered().
  if (!!user) {
    return <main className='full-page'></main>;
  }

  return (
    <LoginAndSignupLayout>
      <Title>Signup</Title>

      <form onSubmit={handleCreateAccount}>
        <FormRow
          text='First Name'
          type='text'
          name='firstName'
          id='firstName'
          placeholder='Jethalal'
          value={userInputs.firstName}
          handleChange={handleInputChange}
          disabled={isSignupFormLoading}
        />
        <FormRow
          text='Last Name'
          type='text'
          name='lastName'
          id='lastName'
          placeholder='Gada'
          value={userInputs.lastName}
          handleChange={handleInputChange}
          disabled={isSignupFormLoading}
        />

        <FormRow
          text='Email Address'
          type='email'
          name='email'
          id='email'
          placeholder='jethalal.gada@gmail.com'
          value={userInputs.email}
          handleChange={handleInputChange}
          disabled={isSignupFormLoading}
        />

        <PasswordRow
          text='Enter Password'
          name='passwordMain'
          id='passwordMain'
          placeholder='babitaji1234'
          value={userInputs.passwordMain}
          handleChange={handleInputChange}
          disabled={isSignupFormLoading}
        />
        <PasswordRow
          text='Confirm Password'
          name='passwordConfirm'
          id='passwordConfirm'
          placeholder=''
          value={userInputs.passwordConfirm}
          handleChange={handleInputChange}
          disabled={isSignupFormLoading}
        />

        <button className='btn btn-block' type='submit'>
          {isSignupFormLoading ? (
            <span className='loader-2'></span>
          ) : (
            'Create New Account'
          )}
        </button>
      </form>

      <div>
        <span>
          Already Registered ?{' '}
          <Link
            to='/login'
            state={{ from: signupPageLocation?.state?.from ?? '/' }}
          >
            login
          </Link>
        </span>
      </div>
    </LoginAndSignupLayout>
  );
};

export default SignupPage;
