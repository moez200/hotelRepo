import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthStore } from '../../store/auth';
import { AuthResponse } from '../../types/auth';
import { authService } from '../../services/Auth';


export function useAuth() {
  const navigate = useNavigate();
  const { setUser, setTokens, logout: clearAuth  , role} = getAuthStore();

  const storetoken = useCallback(async (authResponse: AuthResponse) => {
  
    setTokens({
      access: authResponse.access_token,
      refresh: authResponse.refresh_token,
    });
    setUser(authResponse.user, authResponse.role,authResponse.user.first_name);

    authService.setAuthHeader(authResponse.access_token); // Mettez à jour les en-têtes axios avec le nouveau token
   
  }, [setUser, setTokens]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  return { storetoken, logout, setUser, role };
}