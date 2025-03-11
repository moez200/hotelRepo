import React, { useEffect, useState } from 'react';
import { Apple, Eye, EyeOff } from 'lucide-react'; // Suppression des imports inutilisés (Google, Apple)
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hook/useAuth'; // Assurez-vous que ce chemin est correct
import { updateProfile } from '../../services/Auth'; // Service pour mettre à jour le profil
import { Google } from '@mui/icons-material';
import { signup } from '../../types/auth';




function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth(); // Rôle depuis le contexte d'authentification

  const [formData, setFormData] = useState<signup>({
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    phone_number: '',
    dob: '',
    cin: '',
    first_name: '',
    last_name: '',
    role: role || '',
  });

  // Pré-remplir les champs avec les données de l'utilisateur depuis location.state
  useEffect(() => {
    if (location.state?.user) {
      const { user } = location.state;
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        dob: user.dob || '',
        gender: user.gender || '',
        phone_number: user.phone_number || '',
        role: role || prev.role,// Pré-remplir avec le rôle du contexte ou laisser vide
      }));
    }
  }, [location.state, role]);// Ajout de 'role' comme dépendance

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation des champs requis
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Email et mot de passe requis.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!formData.first_name || !formData.last_name || !formData.dob) {
      setError('Prénom, nom et date de naissance sont requis.');
      return;
    }
  

    setLoading(true);

    try {
      const payload: signup = {
        ...formData,
        role: role,
      };
      delete payload.confirmPassword;
      console.log('Sending updateProfile request with data:', payload);      await updateProfile(payload);
      setMessage('Profil mis à jour avec succès !');
      navigate('/login'); // Rediriger vers la page de connexion après succès
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Section - Sidi Bou Said Image */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1590846083693-f23fdede3a7e?auto=format&fit=crop&q=80"
          alt="Sidi Bou Said, Tunisia"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <h2 className="text-5xl font-bold mb-4">TUNISIA</h2>
            <p className="text-xl text-blue-50">
              Join us to explore the Mediterranean's hidden gems
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-24 flex flex-col justify-between bg-white overflow-y-auto">
        <div>
          <h1 className="text-3xl font-bold mb-8">Create Your Account</h1>
          <p className="text-gray-600 mb-8">Join our community and start your journey</p>

          {/* OAuth Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
              <Google className="w-5 h-5" />
              <span>Sign up with Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
              <Apple className="w-5 h-5" />
              <span>Sign up with Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Min. 8 characters"
                  required
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Autres champs */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <input
                type="text"
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Gender"
                required
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="cin" className="block text-sm font-medium text-gray-700 mb-2">
                CIN
              </label>
              <input
                type="text"
                id="cin"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="CIN"
                required
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number ?? ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Phone Number"
                required
              />
            </div>

            {/* Error message */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <a href="login" className="text-blue-600 hover:text-blue-800">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          © 2024 All rights reserved
        </div>
      </div>
    </div>
  );
}

export default Signup;