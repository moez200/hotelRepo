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
import { Check, Search,  ShieldCheck, Key, Play, Sun } from 'lucide-react';
import { styled } from '@mui/system';

import type { Apprenant, Company, GradeType } from "../../types/auth";
import { activateAndChangeCompany,  getInactiveApprenants } from "../../services/apprenent.service";
import { CoursService } from "../../services/cours.service";
import { getCompanies } from "../../services/companyService";
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

const EffectifsM = () => {
  const [Apprenant, setApprenant] = useState<Apprenant[]>([]);
   const [grades, setGrades] = useState<GradeType[]>([]); 
   const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<number[]>([]);
    const [openApprenantDialog, setOpenApprenantDialog] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [openActivateDialog, setOpenActivateDialog] = useState(false);
    const [selectedApprenantId, setSelectedApprenantId] = useState<number | null>(null);
    const [newCompanyId, setNewCompanyId] = useState<number>(1);
    
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
                const response = await getInactiveApprenants();
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
                setGrades(res);
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

 
  
 

          
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Loader here */}
      </div>
    );
  }

  const handleActivate = async (id: number, company_id: number) => {
    try {
      await activateAndChangeCompany(id, company_id);
      setMessage("Apprenant activé avec succès !");
      fetchApprenantData();
    } catch (error) {
      console.error("Erreur lors de l'activation :", error);
      setError("Une erreur est survenue lors de l'activation.");
    }
  };

  const handleOpenActivateDialog = (id: number) => {
    setSelectedApprenantId(id);
    setOpenActivateDialog(true);
  };

  const handleCloseActivateDialog = () => {
    setOpenActivateDialog(false);
    setSelectedApprenantId(null);
    setNewCompanyId(1);
  };

  const handleActivateConfirm = async () => {
    if (selectedApprenantId !== null) {
      await handleActivate(selectedApprenantId, newCompanyId);
      handleCloseActivateDialog();
    }
  };

  const handleActivateMultiple = async (ids: number[], company_id: number) => {
    try {
      await Promise.all(ids.map(id => activateAndChangeCompany(id, company_id)));
      setMessage(`${ids.length} Apprenants activés avec succès !`);
      fetchApprenantData();
    } catch (error) {
      console.error("Erreur lors de l'activation multiple :", error);
      setError("Une erreur est survenue lors de l'activation multiple.");
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
            <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des apprenants en activité</h1>
        

       
          <Button
            variant="contained"
            color="success"
            disabled={selected.length === 0}
            onClick={() => handleActivateMultiple(selected, newCompanyId)}
            startIcon={<Check />}
          >
            Activer sélection
          </Button>
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
             
                <HeaderCell>État</HeaderCell>
                <HeaderCell>Activer</HeaderCell>
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
                   


                    <TableCell>{Apprenant.is_approved ? 'Approuvé' : 'En attente'}</TableCell>
                    <TableCell className="flex space-x-2">
                    <IconButton 
    onClick={() => handleOpenActivateDialog(Apprenant.id)}
    className="text-yellow-600 hover:bg-yellow-50"
  >
    <ShieldCheck size={16} className="text-green-600" />
    <Key size={16} className="text-green-600" />
    <Sun size={16} className="text-yellow-600" /> 
    <Play size={16} className="text-green-600" />
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

    
    
    <Dialog open={openActivateDialog} onClose={handleCloseActivateDialog}>
          <DialogTitle>Activer Apprenant</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Nouvelle Entreprise (ID)"
              type="number"
              value={newCompanyId}
              onChange={(e) => setNewCompanyId(Number(e.target.value))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseActivateDialog}>Annuler</Button>
            <Button onClick={handleActivateConfirm} color="primary">
              Activer
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

export default EffectifsM;


