import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
jest.mock('../../services/supabase');
import Login from '../Login.tsx';
import { AuthProvider } from '../../contexts/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';

describe('Login Page', () => {
  function setup() {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );
  }

  it('renders login form', () => {
    setup();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('enables login button when email and password are entered', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled();
  });
}); 