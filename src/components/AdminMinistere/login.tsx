import  { useState } from 'react';
import { ToggleLeft as Google, Apple, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/Auth';
import { useAuth } from '.././hook/useAuth';

import { AuthResponse } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { getAuthStore } from '../../store/auth';




function login() {                                    
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { storetoken  } = useAuth();
 
  const navigate = useNavigate();
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
   
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
    
      if (!email || !password) {
        setError('Email et mot de passe requis.');
        return;
      }
    
      try {
        const response = await authService.login(email, password) as AuthResponse;
        console.log("Réponse API:", response);
    
        // Vérifier si la réponse contient une erreur spécifique
        if (response?.error) {
          console.log("Erreur API détectée:", response.error);
    
          if (response?.user) {
            if (response.user.is_approved === false) {
              setError("Votre compte est en attente d'approbation.");
              return;
            }
          }
          setError(response.error);
          return;
        }
    
        // Vérifier la validité de la réponse
        if (!response?.access_token || !response?.refresh_token || !response.user || !response.role) {
          setError('Erreur d’authentification.');
          return;
        }
    
        const { user, role } = response;
    
        if (user.profile_complet === false) {
          await storetoken(response);
          console.log("Rôle stocké après storetoken:", role);
          navigate('/signup', {
            state: {
              user: {
                email: user.email,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                dob: user.dob || '',
                gender: user.gender || '',
                phone_number: user.phone_number || '',
                role: response.role,
              },
            },
          });
          return;
        }
    
        if (!user.is_approved) {
          setError("Votre compte est en attente d'approbation.");
          return;
        }
    
        await storetoken(response);
        console.log("Données stockées:", getAuthStore.getState());
    
        switch (role) {
          case 'Admin Ministère':
            navigate('/acceuil');
            break;
          case 'Admin Entreprise':
            navigate('/utilisateursE');
            break;
          case 'Sous Admin':
            navigate('/utilisateursE');
            break;
          case 'Apprenant':
            navigate('/Tableau');
            break;
          default:
            setError('Rôle inconnu.');
        }
      } catch (error) {
        console.error('Erreur de connexion:', {
          message: (error as any).message,
          status: (error as any).response?.status,
          data: (error as any).response?.data,
        });
    
        if ((error as any).response?.status === 403) {
          if ((error as any).response?.data?.user?.is_approved === false) {
            setError("Votre compte est en attente d'approbation.");
          } else {
            setError((error as any).response?.data?.error || 'Erreur d’accès.');
          }
        } else {
          setError('Identifiants incorrects.');
        }
      }
    };
  
  return (
    <div className="flex min-h-screen pt-0">
      {/* Left Section - Tunisia Image */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1590846083693-f23fdede3a7e?auto=format&fit=crop&q=80"
          alt="Sidi Bou Said, Tunisia"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <h2 className="text-5xl font-bold mb-4">TUNISIA</h2>
            <p className="text-xl text-blue-50">
              Discover the beauty of Mediterranean architecture and culture
            </p>
          </div>
          </div>
          </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-24 flex flex-col justify-between bg-white">
        <div>
          <h1 className="text-3xl font-bold mb-8">Get Started Now</h1>
          <p className="text-gray-600 mb-8">Enter your credentials to access your account</p>

          {/* OAuth Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
              <Google className="w-5 h-5" />
              <span>Log in with Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
              <Apple className="w-5 h-5" />
              <span>Log in with Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
  <div>
    
  </div>

  <div>
    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
      Email address
    </label>
    <input
      type="email"
      id="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
      placeholder="Enter your email"
    />
  </div>

  <div>
    <div className="flex justify-between mb-2">
      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
        Password
      </label>
      <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
        Forgot password?
      </a>
    </div>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        placeholder="Enter your password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>

  <div className="flex items-center">
    <input
      type="checkbox"
      id="terms"
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
      I agree to the Terms & Privacy
    </label>
  </div>

  <button
    type="submit"
    className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors"
  >
    Login
  </button>
</form>

 
        
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          © 2024 All rights reserved
        </div>
      </div>
         <Snackbar
                open={!!message}
                autoHideDuration={6000}
                onClose={() => setMessage("")}
              >
                <Alert onClose={() => setMessage("")} severity="success">
                  {message}
                </Alert>
              </Snackbar>
      
               
                     <Snackbar
                        open={!!error}
                        autoHideDuration={6000}
                        onClose={() => setError("")}
                      >
                        <Alert onClose={() => setError("")} severity="error">
                          {error}
                        </Alert>
                      </Snackbar>
    </div>
  );
}

export default login;