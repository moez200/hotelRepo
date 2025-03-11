import { useState, useEffect, SetStateAction } from "react";
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
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Alert,
  Snackbar,
 
} from '@mui/material';
import { Check, X, Trash2, Edit, Search, Delete, Ban, Pause, PowerOff, StopCircle } from 'lucide-react';
import { styled } from '@mui/system';

import { Add } from "@mui/icons-material";
import { apprenantService, deactivateApprenant } from "../../services/apprenent.service";
import { getCompanies } from "../../services/companyService";
import { CoursService } from "../../services/cours.service";
import { approveUser, rejectUser } from "../../services/users.services";
import { GradeType, Company } from "../../types/auth";
import  type { Apprenant} from "../../types/auth";

 // Adjust the path as necessary

const StyledTableContainer = styled(TableContainer)(({ }) => ({
  borderRadius: '12px',
  boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  overflowX: 'auto',
  '& .MuiTableCell-root': {
    padding: '16px 24px',
  },
}));

const HeaderCell = styled(TableCell)(({ }) => ({
  fontWeight: 600,
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  borderBottom: '2px solid #e2e8f0',
}));

const Apprenant = () => {
  const [Apprenant, setApprenant] = useState<Apprenant[]>([]);
   const [grades, setGrades] = useState<GradeType[]>([]); 
   const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<number[]>([]);
    const [openApprenantDialog, setOpenApprenantDialog] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>();
      const [currentApprenant, setCurrentApprenant] = useState<Partial<Apprenant>>({
      
        cin: '',
        first_name: '',
        last_name: '',
        email:'' ,
        gender: '',
        company_id:   1,
        grades: 1,
        phone_number:   null,
        dob: '',
        
        });


         useEffect(() => {
          fetchApprenantData();
          loadGrades();
          loadCompany();
        }, []);
            const fetchApprenantData = async () => {
              try {
                const response = await apprenantService.getAll();
                console.log("Full API Response:", response); // Log pour observer la structure
                if (Array.isArray(response)) { // Vérifier si la réponse est un tableau
                  setApprenant(response); // Assigner directement le tableau d'utilisateurs
                  setTotalPages(Math.ceil(response.length / rowsPerPage)); // Calculer le nombre total de pages
                } else {
                  console.error("Unexpected API response structure:", response);
                  setApprenant([]); // Si la réponse n'est pas un tableau, définir les utilisateurs comme vide
                  setTotalPages(1);
                }
              } catch (error) {
                console.error("Error fetching users:", error);
                setApprenant([]); // En cas d'erreur, définir les utilisateurs comme vide
                setTotalPages(1);
              } finally {
                setLoading(false);
              }
            };
        
            const loadGrades = async () => {
              try {
                const res = await CoursService.getGrades();
                setGrades(res) ;
              } catch (error) {
                console.error("Erreur lors du chargement des grades :", error);
                setError("Erreur lors du chargement des grades.");
              }
            };

            const loadCompany = async () => {
              try {
                const res = await getCompanies();
                console.log("moez:",res)
                setCompanies(res);
              } catch (error) {
                console.error("Erreur lors du chargement des grades :", error);
                setError("Erreur lors du chargement des grades.");
              }
            };
        
          
 
  
  
  
  const handleApprove = async (id: number) => {
    try {
      // Faire l'appel API pour approuver l'utilisateur
      await approveUser(id);
      setMessage(` Apprenant approuvée avec succès !`);
  
      // Mettre à jour l'état local de l'utilisateur en approuvé
      setApprenant((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, is_approved: true } : user // Passer l'état à 'approuvé'
        )
      );
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      // Faire l'appel API pour rejeter l'utilisateur
      await rejectUser(id);
      setMessage(` Apprenant rejeté avec succès !`);
  
      // Mettre à jour l'état local de l'utilisateur en rejeté
      setApprenant((prevUsers) =>
        prevUsers.map((Apprenant) =>
            Apprenant.id === id ? { ...Apprenant, is_approved: false } : Apprenant // Passer l'état à 'rejeté'
        )
      );
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };
  
  


  const handleChangePage = (event: any, newPage: number) => {
    setCurrentPage(newPage + 1); // MUI paginates from 0
  };

  const handleSearchChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSearchTerm(e.target.value);
  };

  
  const filteredApprenant = (searchTerm.trim() === '' ? Apprenant : Apprenant.filter(Apprenant =>
    [Apprenant.first_name, Apprenant.last_name, Apprenant.email].some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )) || []; // Fallback to an empty array if undefined

 // Debugging filtered users




  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Sélectionne tous les cours s'ils ne sont pas déjà sélectionnés
      setSelected(Apprenant.map(c => c.id ?? 0)); // Assure que c.id est toujours un nombre
    } else {
      // Désélectionne tous les cours
      setSelected([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

 
  
  const handleOpenApprenantDialog = (Apprenant?: Apprenant) => {
    setCurrentApprenant(Apprenant || { 
          
        cin: '',
        first_name: '',
        last_name: '',
        email:'' ,
        gender: '',
        company_id:1,
        grades:1,
        phone_number:   null,
        dob: '',
        password:'',
        is_apprenant:true,
        });
        setOpenApprenantDialog(true);
      };
  
      const handleSaveApprenant = async () => {
          // Vérifier que les champs nom et description sont remplis
          if (!currentApprenant?.cin || !currentApprenant?.first_name || !currentApprenant?.last_name || !currentApprenant?.email|| !currentApprenant?.gender || !currentApprenant?.company_id || !currentApprenant?.grades || !currentApprenant?.phone_number || !currentApprenant?.dob  || !currentApprenant?.password ) {
            setError("Veuillez remplir tous les champs !");
            return;
          }
        
          try {
            // Si un ID existe, on fait une mise à jour
            if (currentApprenant.id) {
              await apprenantService.update(currentApprenant.id, currentApprenant);
              fetchApprenantData(); 
              setMessage('Apprenant mis à jour avec succès !');
            } else {
              // Sinon, on crée un nouveau domaine
              const newApprenant: Apprenant = {
                  id: 0, // Valeur par défaut pour un nouvel ID
                  cin: currentApprenant.cin!,
                  first_name: currentApprenant.first_name!,
                  last_name: currentApprenant.last_name!,
                  email: currentApprenant.email!,
                  gender: currentApprenant.gender!,
                  company_id: currentApprenant.company_id!,
                  grades: currentApprenant.grades!,
                  phone_number: currentApprenant.phone_number!,
                  dob: currentApprenant.dob!,
                  password: currentApprenant.password!,
                
                  is_apprenant:true,
                  profile_complet: false ,
                
                  is_approved: false
              };
              await apprenantService.create(newApprenant);
              fetchApprenantData(); 
              setMessage('Apprenant créé avec succès !');
            }
        
            setOpenApprenantDialog(false);
            fetchApprenantData(); // Fermer le dialogue après l'opération
            // Vous pouvez aussi recharger la liste des domaines ici si nécessaire
        
          } catch (error) {
            console.error('Erreur:', error);
            setMessage("Erreur lors de l'opération");
          }
        };

          
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Loader here */}
      </div>
    );
  }

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateApprenant(id);
      setApprenant((prev) => prev.map(apprenant => 
        apprenant.id === id ? { ...apprenant, is_active: false } : apprenant
      ));
      setMessage("Apprenant désactivé avec succès !");
      fetchApprenantData(); 
    } catch (error) {
      console.error("Erreur lors de la désactivation :", error);
      setError("Une erreur est survenue.");
    }
  };
  const handleDeactivateMultiple = async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => deactivateApprenant(id)));
      setApprenant((prev) => prev.map(apprenant => 
        ids.includes(apprenant.id) ? { ...apprenant, is_active: false } : apprenant
      ));
      setMessage("Apprenants désactivés avec succès !");
      fetchApprenantData();
    } catch (error) {
      console.error("Erreur lors de la désactivation :", error);
      setError("Une erreur est survenue.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
            <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Apprenants</h1>

            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => handleOpenApprenantDialog()}
                              
                              sx={{
                                bgcolor: '#6d28d9',
                                '&:hover': { bgcolor: '#5b21b6' },
                                boxShadow: '0px 4px 12px rgba(109, 40, 217, 0.2)'
                              }}
                            >
                              Nouveau Apprenant
                            </Button>
                            <button
  onClick={() => selected.length > 0 && handleDeactivateMultiple(selected)}
  disabled={selected.length === 0}
  className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
>
  Désactiver Apprenant
</button>

     
        </div>

        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={handleSearchChange}
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
                  indeterminate={selected.length > 0 && selected.length < Apprenant.length} // Sélection partielle
                  checked={selected.length === Apprenant.length && Apprenant.length > 0} // Sélection totale
                  onChange={handleSelectAll}
                />
                
                </HeaderCell>
                <HeaderCell>Matricule</HeaderCell>
                <HeaderCell>Nom Complet</HeaderCell>
                <HeaderCell>Courriel</HeaderCell>
                <HeaderCell>Genre</HeaderCell>
                <HeaderCell>Entreprise</HeaderCell>
                <HeaderCell>Grade</HeaderCell>
                <HeaderCell>Num Tel</HeaderCell>
                <HeaderCell>Date Naissance</HeaderCell>
                <HeaderCell>Opération</HeaderCell>
                <HeaderCell>État</HeaderCell>
                <HeaderCell>Désaactiver</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              
            {filteredApprenant
  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  .map((Apprenant) => (
    <TableRow key={Apprenant.id} className="hover:bg-gray-50 transition-colors">
      <TableCell>
          <Checkbox
            checked={selected.includes(Apprenant.id)}
            onChange={() => handleSelect(Apprenant.id)}
          />
        </TableCell>
                    <TableCell>{Apprenant.cin}</TableCell>
                    <TableCell>{`${Apprenant.first_name} ${Apprenant.last_name}`}</TableCell>
                    <TableCell>{Apprenant.email}</TableCell>
                    <TableCell>{Apprenant.gender}</TableCell>
                    <TableCell>
                                         <Chip
                                           label={companies.find((g) => g.id === Apprenant.company_id)?.name || "Inconnu"}
                                           sx={{
                                             bgcolor: '#f5f3ff',
                                             color: '#6d28d9',
                                           }}
                                         />
                                       </TableCell>
                     <TableCell>
                                          <Chip
                                            label={grades.find((g) => g.id === Apprenant.grades)?.name || "Inconnu"}
                                            sx={{
                                              bgcolor: '#f5f3ff',
                                              color: '#6d28d9',
                                            }}
                                          />
                                        </TableCell>
                    <TableCell>{Apprenant.phone_number || '-'}</TableCell>
                    <TableCell>{Apprenant.dob}</TableCell>
                    <TableCell className="flex space-x-2">
    {Apprenant.is_approved ? (
      <IconButton onClick={() => handleReject(Apprenant.id)} className="text-red-600 hover:bg-red-50">
        <X size={16} className="text-red-600" /> 
      </IconButton>
    ) : (
      <IconButton onClick={() => handleApprove(Apprenant.id)} className="text-green-600 hover:bg-green-50">
       <Check size={16} className="text-green-600" />
      </IconButton>
    )}
  </TableCell>


                    <TableCell>{Apprenant.is_approved ? 'Approuvé' : 'En attente'}</TableCell>
                    <TableCell className="flex space-x-2">
                    <IconButton 
    onClick={() => handleDeactivate(Apprenant.id)}
    className="text-yellow-600 hover:bg-yellow-50"
  >
    <Ban size={16} className="text-yellow-600" /> 
    <Ban size={16} className="text-red-600" />
    <StopCircle size={16} className="text-red-600" />
    <Pause size={16} className="text-yellow-600" />
    <PowerOff size={16} className="text-red-600" />
   
  </IconButton>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                 
                        <IconButton 
   
    className="text-blue-600 hover:bg-blue-50"
    onClick={() => handleOpenApprenantDialog(Apprenant)}
  >
    <Edit fontSize="small" className="text-blue-600" />  {/* Edit icon in blue */}
  </IconButton>
 
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
  rowsPerPageOptions={[5, 10, 25]}
  component="div"
  count={filteredApprenant.length} // Total number of filtered users
  rowsPerPage={5}
  page={currentPage - 1}
  onPageChange={handleChangePage}
  onRowsPerPageChange={(e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page when changing rows per page
  }}
/>



        </StyledTableContainer>
      </div>

      <Dialog open={openApprenantDialog} onClose={() => setOpenApprenantDialog(false)}>
      <DialogTitle>{currentApprenant?.id ? 'Modifier un Apprenant' : 'Ajouter un Apprenant'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Nom"
          name="first_name"
          value={currentApprenant?.first_name || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, first_name: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Prénom"
          name="last_name"
          value={currentApprenant?.last_name || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, last_name: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          value={currentApprenant?.email || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, email: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Téléphone"
          name="phone_number"
          value={currentApprenant?.phone_number || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, phone_number: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          margin="normal"
          label=""
          type="date"
          name="dob"
          value={currentApprenant?.dob || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, dob: e.target.value })
          }
          sx={{ mb: 2 }}
        />
             <TextField
          fullWidth
          margin="normal"
          label="password"
         
          name="password"
          value={currentApprenant?.password || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, password: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Genre"
          name="gender"
          value={currentApprenant?.gender || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, gender: e.target.value })
          }
          sx={{ mb: 2 }}
        />
          <TextField
          fullWidth
          margin="normal"
          label="cin"
          name="cin"
          value={currentApprenant?.cin || ''}
          onChange={(e) =>
            setCurrentApprenant({ ...currentApprenant, cin: e.target.value })
          }
          sx={{ mb: 2 }}
        />
           <TextField
                    label="Company (ID)"
                    fullWidth
                    type="number"
                    value={currentApprenant.company_id}
                    onChange={(e) => setCurrentApprenant({ ...currentApprenant, company_id: +e.target.value })}
                    margin="normal"
                  />
            <TextField
                     label="Grade (ID)"
                     fullWidth
                     type="number"
                     value={currentApprenant.grades}
                     onChange={(e) => setCurrentApprenant({ ...currentApprenant, grades: +e.target.value })}
                     margin="normal"
                   />         
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenApprenantDialog(false)} disabled={loading}>Annuler</Button>
        <Button onClick={handleSaveApprenant} color="primary" disabled={loading}>
          {currentApprenant?.id ? 'Modifier' : 'Enregistrer'}
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

export default Apprenant;


