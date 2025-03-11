import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { FaQuestionCircle } from "react-icons/fa"; // FontAwesome
import { HelpCircle, ListIcon } from "lucide-react"; // Lucide
import type { CourType, Outz, QuestionCour } from "../../types/auth"; // Change Domaine to Outz (Quizz)
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


import { useNavigate, useParams } from 'react-router-dom';
import { CoursService } from '../../services/cours.service';
import questionService from '../../services/questions.service';
import { createOutz, deleteOutz, getOutzs, updateOutz } from '../../services/quizzCours.service';
 // Update service imports

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
const StatusChip = styled(Chip)({
  fontSize: '0.75rem',
  height: '24px',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
});

const QuizzCour = () => {
const { coursId } = useParams<{ coursId: string }>();
  const navigate = useNavigate();
    const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizzes, setQuizzes] = useState<Outz[]>([]); // Rename Domaine to Quizz (Outz)
  const [openQuizzDialog, setOpenQuizzDialog] = useState(false);
  const [message, setMessage] = useState<string>('');
   const [cours, setCours] = useState<CourType[]>([]);
     const [loading, setLoading] = useState(true);
       const [newQuestion, setNewQuestion] = useState<QuestionCour>({
         title: '',
         op1: '',
         op2: '',
         op3: '',
         op4: '',
         rep: '',
         imagecour: '',
         quizzecur: 0, // Exemple : vous devrez peut-être ajuster la manière dont vous gérez quizzecur
       });
  const [currentQuizz, setCurrentQuizz] = useState<Partial<Outz>>({
    title: '',
    cours: 0,
  });

  useEffect(() => {
    if (coursId) {
      fetchQuizzes();
      loadCours();
    } else {
      setError("Course ID is missing.");
    }
  }, [coursId]);
  
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // Vérifie si coursId est une valeur valide avant de le convertir
      if (!coursId || isNaN(Number(coursId))) {
        console.log(coursId);
        setError("Invalid course ID");
        return;
      }
      
      const coursIdNumber = parseInt(coursId, 10);
      console.log(coursIdNumber); // Devrait afficher un nombre valide
      
      // Appeler le service de quizz
      const data = await getOutzs(coursIdNumber);
      if (Array.isArray(data)) {
        setQuizzes(data);
      }
     } catch (error) {
        
            console.error("Error fetching quizzes:", error); // Affiche l'erreur complète
            setError("Error fetching quizzes");
      }
      
    finally {
      setLoading(false);
    }
  };

  
      const loadCours = async () => {
          try {
            const res = await CoursService.getAllCours();
            setCours(res.data);
          } catch (error) {
            console.error("Erreur lors du chargement des grades :", error);
            alert("Erreur lors du chargement des grades.");
          }
        };
        
  
  
        const handleSave = async () => {
          try {
            await questionService.addQuestion(newQuestion);
            setMessage("Question added successfully!" );
         // Reload questions after addition
            setNewQuestion({
              title: '',
              op1: '',
              op2: '',
              op3: '',
              op4: '',
              rep: '',
              imagecour: '',
              quizzecur: 0,
            });
            setOpenQuizzDialog(false); // Close modal
          } catch (err) {
            setError("An error occurred while saving the question." );
          }
        };
      
      

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredQuizz = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(q.cours).includes(searchTerm)
  );

  const handleOpenQuizzDialog = (quizz?: Outz) => {
    setCurrentQuizz(quizz || { title: "", cours: 0 });
    setOpenQuizzDialog(true);
  };

  const handleSaveQuizz = async () => {
    if (!currentQuizz.title || currentQuizz.cours === 0) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    try {
      if (currentQuizz.id) {
        await updateOutz(currentQuizz.id, currentQuizz.cours!,currentQuizz);
        fetchQuizzes();
        setMessage('Quizz mis à jour avec succès !');
      } else {
        const newQuizz: Outz = {
          id: 0,
          title: currentQuizz.title!,
          cours: currentQuizz.cours!,
        };
        await createOutz(currentQuizz.cours!,newQuizz);
        fetchQuizzes();
        setMessage('Quizz créé avec succès !');
      }
      
      setOpenQuizzDialog(false);
      fetchQuizzes();
    } catch (error) {
      console.error('Erreur:', error);
      setMessage("Erreur lors de l'opération");
    }
  };

  const handleDeleteQuizz = async (id: number | undefined) => {
    if (!id) {
      console.error("Erreur : ID du quizz est undefined !");
      alert("Impossible de supprimer : ID invalide.");
      return;
    }
    
    if (confirm("Supprimer ce quizz ?")) {
      try {
        await deleteOutz(id,parseInt(coursId!));
        fetchQuizzes();
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
            <FaQuestionCircle className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quizz pour le Cours {coursId}</h1>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenQuizzDialog()}
            sx={{
              bgcolor: '#6d28d9',
              '&:hover': { bgcolor: '#5b21b6' },
              boxShadow: '0px 4px 12px rgba(109, 40, 217, 0.2)',
            }}
          >
            Nouveau Quizz
          </Button>
             <Button
                      variant="contained"
                      color="primary"
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                      onClick={() => navigate(-1)}
                    >
                      Retour
                    </Button>
        </div>

        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un Quizz..."
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
                <HeaderCell>Title</HeaderCell>
                <HeaderCell>Cours</HeaderCell>
                <HeaderCell>liste Questions</HeaderCell>
                <HeaderCell align="center">Opérations</HeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredQuizz
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((q) => (
                  <TableRow key={q.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-semibold text-purple-600">{q.title}</TableCell>
                     <TableCell>
                                         <StatusChip
                                           label={cours.find((g) => g.id === q.cours)?.title || "Inconnu"}
                                           sx={{
                                             bgcolor: '#f5f3ff',
                                             color: '#6d28d9',
                                           }}
                                         />
                                       </TableCell>
                                       <TableCell>
  <IconButton
    onClick={() => navigate(`/ListCours/Quizz/${q.id}/QuestionList`)}
    sx={{
      color: '#6d28d9',
      '&:hover': {
        bgcolor: '#f5f3ff',
      }
    }}
  >
    <ListIcon />
  </IconButton>
</TableCell>



                    <TableCell>
  <IconButton onClick={() => setOpen(true)}>
  <AddIcon sx={{ color: 'green' }} />
  </IconButton>
</TableCell>
                    <TableCell align="center">
                      <div className="flex justify-center space-x-2">
                        <IconButton 
                          className="text-blue-600 hover:bg-blue-50"
                          aria-label="edit"
                          onClick={() => handleOpenQuizzDialog(q)}
                        >
                          <Edit fontSize="small" color="primary" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteQuizz(q.id)} 
                          className="text-red-600 hover:bg-red-50"
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
            count={filteredQuizz.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="border-t border-gray-200"
          />
        </StyledTableContainer>
      </div>

      <Dialog open={openQuizzDialog} onClose={() => setOpenQuizzDialog(false)}>
        <DialogTitle>{currentQuizz.id ? "Modifier un Quizz" : "Ajouter un Quizz"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            value={currentQuizz.title}
            onChange={(e) => setCurrentQuizz({ ...currentQuizz, title: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Cours"
            type="number"
            value={currentQuizz.cours}
            onChange={(e) => setCurrentQuizz({ ...currentQuizz, cours: +e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuizzDialog(false)}>Annuler</Button>
          <Button onClick={handleSaveQuizz} color="primary">
            {currentQuizz.id ? "Modifier" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>Ajouter une Question</DialogTitle>
              <DialogContent>
              <TextField
                         label="image"
                         fullWidth
                         value={newQuestion?.imagecour}
                         onChange={(e) => setNewQuestion({ ...newQuestion, imagecour: e.target.value })}
                         margin="normal"
                       />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Titre"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Option 1"
                  value={newQuestion.op1}
                  onChange={(e) => setNewQuestion({ ...newQuestion, op1: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Option 2"
                  value={newQuestion.op2}
                  onChange={(e) => setNewQuestion({ ...newQuestion, op2: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Option 3"
                  value={newQuestion.op3}
                  onChange={(e) => setNewQuestion({ ...newQuestion, op3: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Option 4"
                  value={newQuestion.op4}
                  onChange={(e) => setNewQuestion({ ...newQuestion, op4: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Réponse correcte"
                  value={newQuestion.rep}
                  onChange={(e) => setNewQuestion({ ...newQuestion, rep: e.target.value })}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Quizz ID"
                  value={newQuestion.quizzecur}
                  onChange={(e) => setNewQuestion({ ...newQuestion, quizzecur: Number(e.target.value) })}
                />
               
                   
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} color="primary">
                Enregistrer
                </Button>
              </DialogActions>
            </Dialog>

      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
        <Alert onClose={() => setMessage("")} severity="success">{message}</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error">{error}</Alert>
      </Snackbar>
    </div>
  );
};

export default QuizzCour;
