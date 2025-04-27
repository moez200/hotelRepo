import React, { useEffect, useState } from 'react';

import { FaQuestionCircle } from "react-icons/fa"; // FontAwesome

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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { Edit, Delete, Search, Add } from '@mui/icons-material';
import { styled } from '@mui/system';
import { useNavigate, useParams } from 'react-router-dom';

import type { QuizzChapitre } from '../../types/auth'; 

import { Chapitre } from '../../types/auth';
import { getQuizzByChapitre, updateQuizz, addQuizzToChapitre, deleteQuizz } from '../../services/quizzchapitre';
import { ListIcon } from 'lucide-react';
import ChapitreService from '../../services/chapitres.service';


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
const QuizzChapitre = () => {
  const { chapitreId ,coursId } = useParams();
   
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizzes, setQuizzes] = useState<QuizzChapitre[]>([]); // Using QuizzChapitre
  const [openQuizzDialog, setOpenQuizzDialog] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [cours, setCours] = useState([]);

   const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [currentQuizz, setCurrentQuizz] = useState<Partial<QuizzChapitre>>({
    title: '',
    chapitres: 0,
  });

  useEffect(() => {
    if (chapitreId) {
      fetchQuizzes();
      loadChapitres();
    
    } else {
      setError("Chapitre ID is missing.");
    }
  }, [chapitreId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      if (!chapitreId || isNaN(Number(chapitreId))) {
        setError("Invalid chapitre ID");
        return;
      }
      
      const chapitreIdNumber = parseInt(chapitreId, 10);
      const data = await getQuizzByChapitre(chapitreIdNumber);
      setQuizzes(data);
    } catch (error) {
      setError("Error fetching quizzes");
    } finally {
      setLoading(false);
    }
  };

    const loadChapitres = async () => {
      try {
        setLoading(true);
        if (!coursId || isNaN(Number(coursId))) {
          setError("Invalid cours ID");
          return;
        }
        const coursIdNumber = parseInt(coursId, 10);
          const res = await ChapitreService.getChapitresForCours(coursIdNumber) ;
          setChapitres(res as Chapitre[]);
        } catch (error) {
          console.error("Erreur lors du chargement des grades :", error);
          alert("Erreur lors du chargement des grades.");
        }
      };


  const handleSaveQuizz = async () => {
    if (!currentQuizz.title || currentQuizz.chapitres === 0) {
        setError("Veuillez remplir tous les champs !");
      return;
    }

    try {
      if (currentQuizz.id) {
        await updateQuizz(currentQuizz.id,currentQuizz);
        setMessage('Quizz mis à jour avec succès !');
      } else {
        const newQuizz: QuizzChapitre = {
          id: 0,
          title: currentQuizz.title!,
          chapitres: currentQuizz.chapitres!,
        };
        await addQuizzToChapitre(currentQuizz.chapitres!,newQuizz);
        setMessage('Quizz créé avec succès !');
      }

      setOpenQuizzDialog(false);
      fetchQuizzes();
    } catch (error) {
      setError("Erreur lors de l'opération");
    }
  };

  const handleDeleteQuizz = async (id: number | undefined) => {
    if (!id) {
      alert("Impossible de supprimer : ID invalide.");
      return;
    }
    
    if (confirm("Supprimer ce quizz ?")) {
      try {
        await deleteQuizz(id);
        fetchQuizzes();
      } catch (error) {
        setError("Erreur lors de la suppression");
      }
    }
  };

  const handleOpenQuizzDialog = (quizz?: QuizzChapitre) => {
    setCurrentQuizz(quizz || { title: "", chapitres: 0 });
    setOpenQuizzDialog(true);
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
    String(q.chapitres).includes(searchTerm)
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
      <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FaQuestionCircle className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quizz pour le Chapitre {chapitreId}</h1>
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
                <HeaderCell>Chapitre</HeaderCell>
                <HeaderCell>List Questions</HeaderCell>
                <HeaderCell>Operations</HeaderCell>
              </TableRow>
            </TableHead>
                        
            <TableBody>
              {filteredQuizz
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((q) => (
                  <TableRow key={q.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>{q.title}</TableCell>
                     <TableCell>
                           {/* Vérification de l'existence de chapitres avant d'utiliser find */}
                           <StatusChip
                             label={
                               chapitres.length > 0 && q.chapitres 
                                 ? chapitres.find((g) => g.id === q.chapitres)?.title || "Inconnu"
                                 : "Chargement..."
                             }
                             sx={{
                               bgcolor: '#f5f3ff',
                               color: '#6d28d9',
                             }}
                           />
                         </TableCell>
                    <TableCell>
  <IconButton
    onClick={() => navigate(`/ListChapitres/${q.chapitres}/Quizz/${q.id}/Questionschapitre`)}
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
                      <IconButton onClick={() => handleOpenQuizzDialog(q)}>
                        <Edit fontSize="small" color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteQuizz(q.id)}>
                        <Delete fontSize="small" color="error" />
                      </IconButton>
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
          />
        </StyledTableContainer>
      </div>
      <Dialog open={openQuizzDialog} onClose={() => setOpenQuizzDialog(false)}>
  <DialogTitle>{currentQuizz.id ? "Modifier un Quizz" : "Ajouter un Quizz"}</DialogTitle>
  <DialogContent>
    <TextField
      fullWidth
      margin="normal"
      label="Titre du Quizz"
      value={currentQuizz.title}
      onChange={(e) => setCurrentQuizz({ ...currentQuizz, title: e.target.value })}
      variant="outlined"
      required
    />
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel id="chapter-select-label">Chapitre</InputLabel>
      <Select
        labelId="chapter-select-label"
        label="Chapitre"
        value={currentQuizz.chapitres || ''}
        onChange={(e) => setCurrentQuizz({ ...currentQuizz, chapitres: +e.target.value })}
        required
      >
        <MenuItem value="" disabled>
          Sélectionner un chapitre
        </MenuItem>
        {chapitres.map((chapter) => (
          <MenuItem key={chapter.id} value={chapter.id}>
            {chapter.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenQuizzDialog(false)} color="secondary">
      Annuler
    </Button>
    <Button
      onClick={handleSaveQuizz}
      color="primary"
      variant="contained"
      disabled={!currentQuizz.title || !currentQuizz.chapitres}
    >
      {currentQuizz.id ? "Modifier" : "Enregistrer"}
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

export default QuizzChapitre;
