import React, { useEffect, useState } from 'react';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  TablePagination,
  TextField,
  Chip, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Search, Add } from '@mui/icons-material';
import { styled } from '@mui/system';
import { FaTrophy } from 'react-icons/fa6';
import { createDomaine, deleteDomaine, getDomaines, updateDomaine } from '../../services/domaine.service';
import { Domaines } from '../../types/auth';

// Style personnalisé
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





const Domaine = () => {
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [domaines, setDomaines] = useState<Domaines[]>([]);
  const [openDomaineDialog, setOpenDomaineDialog] = useState(false);
  const [message, setMessage] = useState<string>('');
  
    const [currentDomaine, setCurrentDomaine] = useState<Partial<Domaines>>({
        nom: '',
        description: ''
      });
      

  useEffect(() => {
    fetchDomaines();
  }, []);

  const fetchDomaines = async () => {
    try {
      const data = await getDomaines();
      setDomaines(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des domaines :", error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  
  const filteredDomaine = domaines.filter(d =>
    d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const handleOpenDomaineDialog = (domaine?: Domaines) => {
    setCurrentDomaine(domaine || { 
        
        nom: "", 
        description: ""
     
      });
      setOpenDomaineDialog(true);
    };

    const handleSaveDomaine = async () => {
        // Vérifier que les champs nom et description sont remplis
        if (!currentDomaine?.nom || !currentDomaine?.description) {
          alert("Veuillez remplir tous les champs !");
          return;
        }
      
        try {
          // Si un ID existe, on fait une mise à jour
          if (currentDomaine.id) {
            await updateDomaine(currentDomaine.id, currentDomaine);
            fetchDomaines();
            setMessage('Domaine mis à jour avec succès !');
          } else {
            // Sinon, on crée un nouveau domaine
            const newDomaine: Domaines = {
              id: 0, // Valeur par défaut pour un nouvel ID
              nom: currentDomaine.nom!,
              description: currentDomaine.description!,
            };
            await createDomaine(newDomaine);
            fetchDomaines();
            setMessage('Domaine créé avec succès !');
          }
      
          setOpenDomaineDialog(false);
          fetchDomaines(); // Fermer le dialogue après l'opération
          // Vous pouvez aussi recharger la liste des domaines ici si nécessaire
      
        } catch (error) {
          console.error('Erreur:', error);
          setMessage("Erreur lors de l'opération");
        }
      };

      const handleDeleteDomaine = async (id: number | undefined) => {
        if (!id) {
          console.error("Erreur : ID du cours est undefined !");
          alert("Impossible de supprimer : ID invalide.");
          return;
        }
      
        if (confirm("Supprimer ce cours ?")) {
          try {
            console.log("Suppression du cours avec ID :", id);
            await deleteDomaine(id);
            
            fetchDomaines();
             // Recharge la liste après suppression
          } catch (error) {
            console.error("Erreur lors de la suppression :", error);
           
          }
        }
      };

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
            <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
                            <FaTrophy className="text-4xl text-purple-600" />
                              <h1 className="text-3xl font-bold text-gray-900">Gestion des Domaines</h1>
                            </div>
         <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDomaineDialog()}
                    
                    sx={{
                      bgcolor: '#6d28d9',
                      '&:hover': { bgcolor: '#5b21b6' },
                      boxShadow: '0px 4px 12px rgba(109, 40, 217, 0.2)'
                    }}
                  >
                    Nouveau Domaine
                  </Button>
        </div>

        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un Domaine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search className="text-gray-400 mr-2" />
              ),
              className: 'bg-white rounded-lg',
            }}
          />
        </div>

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell>nom</HeaderCell>
                <HeaderCell>Description</HeaderCell>
                
                <HeaderCell align="center">Opérations</HeaderCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {filteredDomaine
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((d) => (
                  <TableRow 
                    key={d.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-semibold text-purple-600">
                      {d.nom}
                    </TableCell>
                    
                    <TableCell className="text-gray-600">
                      {d.description}
                    </TableCell>
                    
                  
                    
                    <TableCell align="center">
                      <div className="flex justify-center space-x-2">
                        <IconButton 
                          className="text-blue-600 hover:bg-blue-50"
                          aria-label="edit"
                          onClick={() => handleOpenDomaineDialog(d)}
                        >
                          <Edit fontSize="small" color="primary" />
                        </IconButton>
                    {/* Bouton de suppression */}
    <IconButton
      onClick={() => handleDeleteDomaine(d.id)} // Passer l'ID du cours
      className="text-red-600 hover:bg-red-50"
    >
      <Delete fontSize="small"  color="error"/>
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
            count={filteredDomaine.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="border-t border-gray-200"
          />
        </StyledTableContainer>
      </div>
      <Dialog open={openDomaineDialog} onClose={() => setOpenDomaineDialog(false)}>
  <DialogTitle>{currentDomaine.id ? "Modifier un Domaine" : "Ajouter un Domaine"}</DialogTitle>
  <DialogContent>
    <TextField
      fullWidth
      margin="normal"
      label="Nom"
      value={currentDomaine.nom}
      onChange={(e) => setCurrentDomaine({ ...currentDomaine, nom: e.target.value })}
    />
    <TextField
      fullWidth
      margin="normal"
      label="Description"
      value={currentDomaine.description || ""}
      onChange={(e) => setCurrentDomaine({ ...currentDomaine, description: e.target.value })}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDomaineDialog(false)}>Annuler</Button>
    <Button
      onClick={handleSaveDomaine} // Appel de la même fonction pour l'ajout et la modification
      color="primary"
    >
      {currentDomaine.id ? "Modifier" : "Enregistrer"}
    </Button>
  </DialogActions>
</Dialog>;
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

export default Domaine;