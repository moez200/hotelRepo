import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { deleteAdminMinistere, getAdminMinistereProfile, updateAdminMinistere } from "../../services/admin_minister";
import { AdminMinistere } from "../../types/auth";
import profile from '../../assets/moez.jpg';
import { Snackbar, Alert } from "@mui/material";

function MinistereProfile() {
  const [adminData, setAdminData] = useState<AdminMinistere | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState("");
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState<AdminMinistere>({
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "", // Ensure phone_number is never null
    is_ministere: true, // Par défaut pour un admin du ministère
    cin: "",
    gender: "",
    company_id: 0,
    grades: 0,
   
    profile_complet: false ,
    is_approved: true,
    dob: "", // Add dob property
    password: "" // Add password property
  });

  const userId = getAuthStore.getState().user?.id;
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const result = await getAdminMinistereProfile();
      setAdminData(result);
      setFormData(result); // Remplir formData avec les données récupérées
    } catch (error) {
      console.error("Erreur de récupération des données admin", error);
      setError("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSave = async () => {
    if (!userId || !formData) return;

    try {
      const updatedProfile = await updateAdminMinistere(userId, formData);
      setAdminData(updatedProfile);
      setFormData(updatedProfile);
      setMessage("Modifications enregistrées avec succès");
      setEditable(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
      setError("Erreur lors de la sauvegarde des données");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
      try {
        if (userId) {
          await deleteAdminMinistere(userId);
          setMessage("Compte supprimé avec succès");
          getAuthStore.getState().logout();
          navigate("/login");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        setError("Erreur lors de la suppression du compte");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-400 to-blue-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/90 backdrop-blur-sm rounded-2xl text-white shadow-xl">
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button className="absolute right-4 top-4 hover:bg-white/10 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <img
                src={profile}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {adminData?.first_name} {adminData?.last_name}
              </h1>
              <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">Admin Ministère</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prénom</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Numéro de téléphone</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number || ""}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Gender</label>
            <input
              type="text"
              name="gender"
              value={formData.gender }
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5"
              onClick={() => setEditable(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100"
              onClick={handleSave}
            >
              Enregistrer
            </button>
          </div>
        </form>

        <div className="p-6">
          <button
            className="w-full text-red-400 hover:text-red-600"
            onClick={handleDeleteAccount}
          >
            Supprimer le compte
          </button>
        </div>
      </div>
        <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
                    <Alert onClose={() => setMessage('')} severity="success">
                      {message}
                    </Alert>
                  </Snackbar>
              
                  <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                    <Alert onClose={() => setError('')} severity="error">
                      {error}
                    </Alert>
                  </Snackbar>
    </div>
  );
}

export default MinistereProfile;
