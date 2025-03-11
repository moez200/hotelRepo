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
import { createGrade, deleteGrade, getGrades, updateGrade } from '../../services/grade.service';
import {  GradeType } from '../../types/auth';


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





const Grades = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
 const [grades, setGrades] = useState<GradeType[]>([]); 

  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
    const [currentGrade, setCurrentGrade] = useState<Partial<GradeType>>({
        name: '',
        description: ''
      });
      

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const data = await getGrades();
      setGrades(data);
    } catch (error) {
      console.error("Erreur lors du chargement des grades", error);
    }
    setLoading(false);
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredGrades = grades.filter(g=>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const handleOpenGradeDialog = (Grade?: GradeType) => {
      setCurrentGrade(Grade || { 
          
          name: "", 
          description: ""
       
        });
        setOpenGradeDialog(true);
      };
  
      const handleSaveGrade = async () => {
          // Vérifier que les champs nom et description sont remplis
          if (!currentGrade?.name || !currentGrade?.description) {
            setMessage("Veuillez remplir tous les champs !");
            return;
          }
        
          try {
            // Si un ID existe, on fait une mise à jour
            if (currentGrade.id) {
              await updateGrade(currentGrade.id, currentGrade);
              setMessage('Grade mis à jour avec succès !');
            } else {
              // Sinon, on crée un nouveau domaine
              const newGrade: GradeType = {
                id: 0, // Valeur par défaut pour un nouvel ID
                name: currentGrade.name!,
                description: currentGrade.description!,
              };
              await createGrade(newGrade);
              setMessage('Grade créé avec succès !');
            }
        
            
            setOpenGradeDialog(false);
            fetchGrades(); // Fermer le dialogue après l'opération
            // Vous pouvez aussi recharger la liste des domaines ici si nécessaire
        
          } catch (error) {
            console.error('Erreur:', error);
            setMessage("Erreur lors de l'opération");
          }
        };
  
        const handleDeleteGrade = async (id: number | undefined) => {
          if (!id) {
            console.error("Erreur : ID du cours est undefined !");
            setError("Impossible de supprimer : ID invalide.");
            return;
          }
        
        
            try {
              console.log("Suppression du grade avec ID :", id);
              await deleteGrade(id);
              setMessage("Suppression du grade avec succes ");
              fetchGrades();
               // Recharge la liste après suppression
            } catch (error) {
              console.error("Erreur lors de la suppression :", error);
             
            }
          
        };
  

        return (
          <div className="p-6 bg-gray-50 min-h-screen ">
            <div className="w-full flex flex-col">
              <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <FaTrophy className="text-4xl text-purple-600" />
                  <h1 className="text-3xl font-bold text-gray-900">Gestion des Grades</h1>
                </div>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenGradeDialog()}
                  sx={{
                    bgcolor: '#6d28d9',
                    '&:hover': { bgcolor: '#5b21b6' },
                    boxShadow: '0px 4px 12px rgba(109, 40, 217, 0.2)',
                  }}
                >
                  Nouveau Grade
                </Button>
              </div>
        
              <div className="mb-6">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher un grade..."
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
        
              <StyledTableContainer sx={{ width: '100%' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <HeaderCell>Grade</HeaderCell>
                      <HeaderCell>Description</HeaderCell>
                      <HeaderCell align="center">Opérations</HeaderCell>
                    </TableRow>
                  </TableHead>
        
                  <TableBody>
                    {filteredGrades
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((grade) => (
                        <TableRow
                          key={grade.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-semibold text-purple-600">
                            {grade.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {grade.description}
                          </TableCell>
                          <TableCell align="center">
                            <div className="flex justify-center space-x-2">
                              <IconButton
                                className="text-blue-600 hover:bg-blue-50"
                                aria-label="edit"
                                onClick={() => handleOpenGradeDialog(grade)}
                              >
                                <Edit fontSize="small" color="primary" />
                              </IconButton>
                              <IconButton
                                className="text-red-600 hover:bg-red-50"
                                aria-label="delete"
                                onClick={() => handleDeleteGrade(grade.id)}
                              >
                                <Delete fontSize="small" color="error" />
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
                  count={filteredGrades.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  className="border-t border-gray-200"
                />
              </StyledTableContainer>
            </div>
        
            {/* Dialog */}
            <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)}>
              <DialogTitle>{currentGrade.id ? 'Modifier un Grade' : 'Ajouter un Grade'}</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nom"
                  value={currentGrade.name}
                  onChange={(e) => setCurrentGrade({ ...currentGrade, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Description"
                  value={currentGrade.description || ''}
                  onChange={(e) => setCurrentGrade({ ...currentGrade, description: e.target.value })}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenGradeDialog(false)}>Annuler</Button>
                <Button onClick={handleSaveGrade} color="primary">
                  {currentGrade.id ? 'Modifier' : 'Enregistrer'}
                </Button>
              </DialogActions>
            </Dialog>
        
            {/* Snackbar */}
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
};

export default Grades;