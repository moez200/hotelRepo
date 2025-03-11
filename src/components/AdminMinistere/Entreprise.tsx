import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  TablePagination,
  TextField,
  InputAdornment,
  DialogActions,
  DialogContent,
  Button,
  Dialog,
  DialogTitle,
  Checkbox,
  Alert,
  Snackbar,
  ButtonBase
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import { styled } from '@mui/system';
import { FaBuilding } from 'react-icons/fa';
import { createCompany, deleteCompany, getCompanies, updateCompany } from '../../services/companyService';
import { Company } from '../../types/auth';
import { Domaines } from '../../types/auth';
import { getDomaines } from '../../services/domaine.service';
import { adminEntrepriseService } from '../../services/admin_entreprise';
import { EyeOff, Eye } from 'lucide-react';

// Style personnalisé avec Tailwind et MUI
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  overflowX: 'auto',
  '& .MuiTableCell-root': {
    padding: '16px 24px',
  },
}));

const HeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  borderBottom: '2px solid #e2e8f0',
}));

const Entreprises = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [domaine, setDomaine] = useState<Domaines[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCompanyDialog, setOpenCompanyDialog] = useState(false); 
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');

  const [adminEntreprise, setAdminEntreprise] = useState({
    email: "",
    password: ""
  });
  
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({
    name: '',
    adresse: '',
    phone_number: '',
    nb_emp: 0,
    domaine: 1,  // Assure-toi que l'ID domaine est valide
  });

  useEffect(() => {
    fetchCompanies();
    loadDomaine();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      setError("Erreur lors du chargement des entreprises.");
    } finally {
      setLoading(false);
    }
  };

  const loadDomaine = async () => {
    try {
      const res = await getDomaines();
      setDomaine(res);
    } catch (error) {
      console.error("Erreur lors du chargement des grades :", error);
      alert("Erreur lors du chargement des grades.");
    }
  };

  const handleOpenDomaineDialog = (Company?: Company) => {
    setCurrentCompany(Company || { 
      name: '',
      adresse: '',
      phone_number: '',
      nb_emp: 0,
      domaine: 1,  
    });
    setAdminEntreprise({
      email: generateAdminEmail(Company?.name),
      password: generateRandomPassword()
    });
    setOpenCompanyDialog(true);
  };

  const handleSaveCompany = async () => {
    if (!currentCompany?.name || !currentCompany?.adresse || 
        !currentCompany?.phone_number || !currentCompany?.nb_emp || !currentCompany?.domaine) {
      setError("Veuillez remplir tous les champs !");
      return;
    }
  
    try {
      if (currentCompany.id) {
        await updateCompany(currentCompany.id, currentCompany);
        fetchCompanies();
        setMessage("Entreprise mise à jour avec succès !");
      } else {
        const newCompany: Company = {
          id: 0,
          name: currentCompany.name!,
          adresse: currentCompany.adresse!,
          phone_number: currentCompany.phone_number!,
          nb_emp: currentCompany.nb_emp!,
          domaine: currentCompany.domaine!,
        };
  
        const createdCompany = await createCompany(newCompany);
  
        if (createdCompany && createdCompany.id) {
          try {
            await adminEntrepriseService.create({
              email: adminEntreprise.email,
              password: adminEntreprise.password,
              company_id: createdCompany.id,
              is_admin_enterprise: true,
              id: 0,
              cin: '',
              first_name: '',
              last_name: '',
              gender: '',
              profile_complet: false,
              grades: 0,
              phone_number: null,
              dob: '',
              is_approved: false,
          
            });
  
            setMessage("Entreprise et Admin Entreprise créés avec succès !");
          } catch (adminError) {
            console.error("Erreur lors de la création de l'Admin Entreprise :", adminError);
            setError("L'entreprise a été créée, mais l'Admin Entreprise n'a pas pu être ajouté.");
          }
        }
      }
  
      setOpenCompanyDialog(false);
      fetchCompanies();
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise :", error);
      setError("Erreur lors de l'opération. Veuillez réessayer.");
    }
  };

  const filteredEntreprises = companies.filter(c =>
    (c.name && typeof c.name === 'string' && c.name.toLowerCase().includes(searchTerm.toLowerCase())) 
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(companies.map(c => c.id ?? 0));
    } else {
      setSelected([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (confirm(`Supprimer ${selected.length} company sélectionnés ?`)) {
      try {
        await Promise.all(selected.map(id => deleteCompany(id)));
        setSelected([]);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  const handleDeleteCompany = async (id: number | undefined) => {
    if (!id) {
      console.error("Erreur : ID du cours est undefined !");
      setError("Impossible de supprimer : ID invalide.");
      return;
    }
  
    try {
      await deleteCompany(id);
      setMessage("Suppression du cours avec success");
      fetchCompanies();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const generateRandomPassword = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const generateAdminEmail = (companyName: string | undefined) => {
    return companyName ? `${companyName.replace(/\s+/g, '').toLowerCase()}@gmail.com` : "";
  };

  const handleGenerateAdminCredentials = () => {
    const generatedEmail = generateAdminEmail(currentCompany.name);
    const generatedPassword = generateRandomPassword();
    setAdminEntreprise({ email: generatedEmail, password: generatedPassword });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center top-0">
          <div className="flex items-center space-x-4">
            <FaBuilding className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Entreprises</h1>
          </div>
          <button 
            onClick={() => handleOpenDomaineDialog()} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Ajouter Entreprise
          </button>
          <Button
            variant="contained"
            color="error"
            disabled={selected.length === 0}
            onClick={handleDeleteSelected}
            startIcon={<Delete />}
          >
            Supprimer sélection
          </Button>
        </div>

        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
              className: 'bg-white rounded-lg',
            }}
          />
        </div>

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < companies.length}
                    checked={selected.length === companies.length && companies.length > 0}
                    onChange={handleSelectAll}
                  />
                </HeaderCell>
                <HeaderCell>name</HeaderCell>
                <HeaderCell>adresse</HeaderCell>
                <HeaderCell>phone_number</HeaderCell>
                <HeaderCell>nb_emp</HeaderCell>
                <HeaderCell>domaine</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntreprises
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((Company, index) => (
                  <TableRow 
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(Company.id)}
                        onChange={() => handleSelect(Company.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{Company.name}</TableCell>
                    <TableCell>{Company.adresse}</TableCell>
                    <TableCell>{Company.phone_number}</TableCell>
                    <TableCell>{Company.nb_emp}</TableCell>
                    <TableCell>
                      <span
                        style={{
                          backgroundColor: "#f5f3ff",
                          color: "#6d28d9",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        {domaine.find((g) => g.id === Company.domaine)?.nom || "Inconnu"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <IconButton 
                          className="text-blue-600 hover:bg-blue-50"
                          aria-label="edit"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteCompany(Company.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Delete fontSize="small" color="error"/>
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredEntreprises.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="border-t border-gray-200"
          />
        </StyledTableContainer>
      </div>
      <Dialog open={openCompanyDialog} onClose={() => setOpenCompanyDialog(false)}>
        <DialogTitle>{currentCompany.id ? "Modifier une entreprise" : "Ajouter une entreprise et un administrateur"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom de l'entreprise"
            fullWidth
            value={currentCompany.name}
            onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Adresse"
            fullWidth
            value={currentCompany.adresse}
            onChange={(e) => setCurrentCompany({ ...currentCompany, adresse: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Numéro de téléphone"
            fullWidth
            value={currentCompany.phone_number}
            onChange={(e) => setCurrentCompany({ ...currentCompany, phone_number: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Nombre d'employés"
            fullWidth
            type="number"
            value={currentCompany.nb_emp}
            onChange={(e) => setCurrentCompany({ ...currentCompany, nb_emp: +e.target.value })}
            margin="normal"
          />
          <TextField
            label="Domaine (ID)"
            fullWidth
            type="number"
            value={currentCompany.domaine}
            onChange={(e) => setCurrentCompany({ ...currentCompany, domaine: +e.target.value })}
            margin="normal"
          />

          {!currentCompany.id && (
            <ButtonBase
              onClick={handleGenerateAdminCredentials}
              sx={{
                padding: '10px 20px',
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              Générer les informations de l'administrateur
            </ButtonBase>
          )}

          {!currentCompany.id && (
            <>
              <TextField
                placeholder="Email de l'administrateur"
                fullWidth
                value={adminEntreprise.email}
                onChange={(e) => setAdminEntreprise({ ...adminEntreprise, email: e.target.value })}

                margin="normal"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={adminEntreprise.password}
                  onChange={(e) => setAdminEntreprise({ ...adminEntreprise, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder=" your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompanyDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleSaveCompany} color="primary">
            {currentCompany.id ? "Modifier" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

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
};

export default Entreprises;