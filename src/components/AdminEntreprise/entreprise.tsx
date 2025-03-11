import React, { useEffect, useState } from 'react';


import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 


  TablePagination,
  TextField,
  InputAdornment,

  Checkbox,
  Alert,
  Snackbar
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { styled } from '@mui/system';
import { FaBuilding } from 'react-icons/fa';
import {  getCompanies} from '../../services/companyService';
import { Company } from '../../types/auth';
import { Domaines } from '../../types/auth';
import { getDomaines } from '../../services/domaine.service';



// Style personnalisé avec Tailwind et MUI
const StyledTableContainer = styled(TableContainer)(({  }) => ({
  borderRadius: '12px',
  boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  overflowX: 'auto',
  '& .MuiTableCell-root': {
    padding: '16px 24px',
  },
}));


const HeaderCell = styled(TableCell)(({  }) => ({
  fontWeight: 600,
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  borderBottom: '2px solid #e2e8f0',
}));




  // Ajoutez plus d'entreprises pour tester la pagination...


const EntreprisesE = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [domaine, setDomaine] = useState<Domaines[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');

  
 

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
              console.log(res)
              setDomaine(res);
            } catch (error) {
              console.error("Erreur lors du chargement des grades :", error);
              alert("Erreur lors du chargement des grades.");
            }
          };
       

  
    
   
  
  const filteredEntreprises = companies.filter(c=>
   
    (c.name && typeof c.name === 'string' && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  
 // Vérifie ce qui est affiché ici
  
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
      // Sélectionne tous les cours s'ils ne sont pas déjà sélectionnés
      setSelected(companies.map(c => c.id ?? 0)); // Assure que c.id est toujours un nombre
    } else {
      // Désélectionne tous les cours
      setSelected([]);
    }
  };

 
  

   
  
    
 
 
  

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
      
            <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center top-0 ">
           {/* Header Section */}
                  
                    <div className="flex items-center space-x-4">
                    <FaBuilding className="text-4xl text-purple-600" />
                      <h1 className="text-3xl font-bold text-gray-900">Gestion des Entreprises</h1>
                    </div>
                   
       
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
                  indeterminate={selected.length > 0 && selected.length < companies.length} // Sélection partielle
                  checked={selected.length === companies.length && companies.length > 0} // Sélection totale
                  onChange={handleSelectAll}
                />
                
                </HeaderCell>
              
                <HeaderCell>name</HeaderCell>
                <HeaderCell>email</HeaderCell>
                <HeaderCell>adresse</HeaderCell>
                <HeaderCell>phone_number</HeaderCell>
                <HeaderCell>nb_emp</HeaderCell>
                <HeaderCell>domaine</HeaderCell>
              
              </TableRow>
            </TableHead>
            
            <TableBody>
              {filteredEntreprises
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(( Company, index) => (
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
                   
                    <TableCell className="font-medium">{ Company.name}</TableCell>
                  
                    <TableCell>{ Company.adresse}</TableCell>
                    <TableCell>{ Company.phone_number}</TableCell>
                    <TableCell>{ Company.nb_emp}</TableCell>
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

export default EntreprisesE;