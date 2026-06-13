import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/AuthContext';

export function LoginButton() {
  const { login } = useAuth();

  return (
    <GoogleLogin
      onSuccess={(response) => {
        if (response.credential) {
          login(response.credential);
        }
      }}
      onError={() => {
        console.error('Google login failed');
      }}
    />
  );
}
