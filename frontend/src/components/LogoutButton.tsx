import { googleLogout } from '@react-oauth/google';
import { useAuth } from '../auth/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();

  function handleLogout() {
    googleLogout();
    logout();
  }

  return <button onClick={handleLogout}>Logout</button>;
}
