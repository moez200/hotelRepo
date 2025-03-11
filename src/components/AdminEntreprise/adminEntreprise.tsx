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
import { Check, X, Trash2, Edit, Search, Delete } from 'lucide-react';
import { styled } from '@mui/system';
import {  approveUser, rejectUser, } from "../../services/users.services";
import type { AdminEntreprise,  Company, GradeType } from "../../types/auth";
import { apprenantService } from "../../services/apprenent.service";
import { Add } from "@mui/icons-material";
import { CoursService } from "../../services/cours.service";
import { getCompanies } from "../../services/companyService";
import { adminEntrepriseService } from "../../services/admin_entreprise";
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

const AdminEntrepriseE = () => {
    const [adminEntreprises, setAdminEntreprises] = useState<AdminEntreprise[]>([]);
   const [grades, setGrades] = useState<GradeType[]>([]); 
   const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<number[]>([]);
    const [OpenAdminEntrepriseDialog, setOpenAdminEntrepriseDialog] = useState(false);
    const [message, setMessage] = useState<string>('');
    
      const [currentAdminEntreprise, setCurrentAdminEntreprise] = useState<Partial<AdminEntreprise>>({
      
      
        first_name: '',
        last_name: '',
        email:'' ,
        password:'',
      
       
      
    
        
        });


         useEffect(() => {
            fetchAdminEntrepriseData();
          loadGrades();
          loadCompany();
        }, []);
        const fetchAdminEntrepriseData = async () => {
            try {
              const response = await adminEntrepriseService.getAll();
              if (Array.isArray(response)) {
                setAdminEntreprises(response);
                setTotalPages(Math.ceil(response.length / rowsPerPage));
              } else {
                console.error("Unexpected API response structure:", response);
                setAdminEntreprises([]);
                setTotalPages(1);
              }
            } catch (error) {
              console.error("Error fetching admin entreprises:", error);
              setAdminEntreprises([]);
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
                alert("Erreur lors du chargement des grades.");
              }
            };

            const loadCompany = async () => {
              try {
                const res = await getCompanies();
                console.log("moez:",res)
                setCompanies(res);
              } catch (error) {
                console.error("Erreur lors du chargement des grades :", error);
                alert("Erreur lors du chargement des grades.");
              }
            };
        
          
 
  
              
              
  
  


  const handleChangePage = (event: any, newPage: number) => {
    setCurrentPage(newPage + 1); // MUI paginates from 0
  };

  const handleSearchChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSearchTerm(e.target.value);
  };

  
  const filteredAdminEntreprises = (searchTerm.trim() === '' ? adminEntreprises : adminEntreprises.filter((adminEntreprises: { first_name: any; last_name: any; email: any; }) =>
    [adminEntreprises.first_name, adminEntreprises.last_name, adminEntreprises.email].some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )) || []; // Fallback to an empty array if undefined

 // Debugging filtered users



  const handleDeleteSelected = async () => {
    if (confirm(`Supprimer ${selected.length} cours sélectionnés ?`)) {
      try {
        await Promise.all(selected.map(id => apprenantService.delete(id)));
      
      
      
        setSelected([]);
      
        setMessage(`${selected.length} Apprenant supprimés avec succès !`);
        fetchAdminEntrepriseData();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Sélectionne tous les cours s'ils ne sont pas déjà sélectionnés
      setSelected(adminEntreprises.map(admin => admin.id ?? 0)); // Assure que c.id est toujours un nombre
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

 
  
  const handleOpenAdminEntrepriseDialog = (AdminEntreprise?: AdminEntreprise) => {
    setCurrentAdminEntreprise(AdminEntreprise || { 
          
        
        first_name: '',
        last_name: '',
        email:'' ,
        company_id:0,
        password:''
       
        });
        setOpenAdminEntrepriseDialog(true);
      };
  
     
          
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Loader here */}
      </div>
    );
  }


  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
            <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Admin Entreprises</h1>

          
        
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
        indeterminate={selected.length > 0 && selected.length < adminEntreprises.length}
        checked={selected.length === adminEntreprises.length && adminEntreprises.length > 0}
        onChange={handleSelectAll}
      />
    </HeaderCell>
    <HeaderCell>Email</HeaderCell>
    <HeaderCell>Nom Complet</HeaderCell>
    <HeaderCell> Entreprise</HeaderCell>
  
    <HeaderCell>Etat</HeaderCell>
  
  </TableRow>
</TableHead>

            <TableBody>
  {filteredAdminEntreprises
    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    .map((admin) => (
      <TableRow key={admin.id} className="hover:bg-gray-50 transition-colors">
        <TableCell>
          <Checkbox
            checked={selected.includes(admin.id ?? 0)}
            onChange={() => handleSelect(admin.id ?? 0)}
          />
        </TableCell>
        <TableCell>{admin.email}</TableCell>
        <TableCell>{`${admin.first_name} ${admin.last_name}`}</TableCell>
       
        <TableCell>
                                         <Chip
                                           label={companies.find((g) => g.id === admin.company_id)?.name || "Inconnu"}
                                           sx={{
                                             bgcolor: '#f5f3ff',
                                             color: '#6d28d9',
                                           }}
                                         />
                                       </TableCell>
                                       <TableCell>{admin.is_approved ? 'Approuvé' : 'En attente'}</TableCell>
 
      </TableRow>
    ))}
</TableBody>
          </Table>

          <TablePagination
  rowsPerPageOptions={[5, 10, 25]}
  component="div"
  count={filteredAdminEntreprises.length} // Total number of filtered users
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

    
      <Snackbar
              open={!!message}
              autoHideDuration={6000}
              onClose={() => setMessage("")}
            >
              <Alert onClose={() => setMessage("")} severity="success">
                {message}
              </Alert>
            </Snackbar>
    
    </div>
  );
};

export default AdminEntrepriseE;


