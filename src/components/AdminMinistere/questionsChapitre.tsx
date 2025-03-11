import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  styled,
  Typography,
  Box,
  Switch,
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import { QuestionChapitre, QuestionCour } from "../../types/auth";
import { useParams, useNavigate } from "react-router-dom";
import { addQuestionToQuizz, deleteQuestion, getQuestionsByQuizz, updateQuestion } from "../../services/questionchapitre";

// Style personnalisé pour le tableau
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

const QuestionsChapitre = () => {
  const { QuizzId } = useParams<{ QuizzId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionChapitre[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const [open, setOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<QuestionChapitre>({
    title: '',
    op1: '',
    op2: '',
    op3: '',
    op4: '',
    rep: '',
    imagecour: '',
    quizz: 0,
  });

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, rowsPerPage, searchTerm]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const quizzIdNumber = parseInt(QuizzId!, 10);
      if (isNaN(quizzIdNumber)) {
        setError("Invalid course ID");
        return;
      }

      const response = await getQuestionsByQuizz(quizzIdNumber);
      if (Array.isArray(response)) {
        console.log("ooo",response)
        setQuestions(response);
      } else {
        setError("Les questions ne sont pas au bon format.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des questions:", error);
      setError("Erreur lors du chargement des questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id: number | undefined) => {
            if (!id) {
              console.error("Erreur : ID du cours est undefined !");
              setError("Impossible de supprimer : ID invalide.");
              return;
            }
          
          
              try {
                console.log("Suppression du Question avec ID :", id);
                await deleteQuestion(id);
                setMessage("Suppression du Question avec succes ");
                fetchQuestions();
              } catch (error) {
                console.error("Erreur lors de la suppression :", error);
               
              }
            
          };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleSave = async () => {
    try {
      if (newQuestion.id) {
        await updateQuestion(newQuestion.id, newQuestion);
        setMessage("Question modifiée avec succès !");
      } else {
        if (QuizzId) {
          await addQuestionToQuizz(QuizzId, newQuestion);
        } else {
          setError("Quizz ID is undefined.");
        }
        setMessage("Question ajoutée avec succès !");
      }
      fetchQuestions(); // Recharger les questions après ajout/modification
      setNewQuestion({
        title: '',
        op1: '',
        op2: '',
        op3: '',
        op4: '',
        rep: '',
        imagecour: '',
        quizz: 0,
      });
      setOpen(false); // Fermer la modal
    } catch (err) {
      setError("Une erreur s'est produite lors de l'enregistrement de la question.");
    }
  };

  const filteredQuestions = questions.filter((q) =>
    Object.values(q).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" className="text-3xl font-bold text-gray-900">
          Liste des Questions du Quizz {QuizzId}
        </Typography>
        <div className="flex gap-4">
          <Button
            variant="contained"
            color="primary"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setOpen(true)}
          >
            Ajouter une Question
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
      </Box>

      <div className="flex gap-4 mb-4">
        <TextField
          variant="outlined"
          placeholder="Rechercher des questions..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <Search className="text-gray-400 mr-2" />,
          }}
        />
      </div>

      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
            <HeaderCell>image</HeaderCell>
              <HeaderCell>Question</HeaderCell>
              <HeaderCell>Options</HeaderCell>
              <HeaderCell align="center">Réponse Correcte</HeaderCell>
              <HeaderCell align="center">Quiz</HeaderCell>
              <HeaderCell align="center">Actions</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((question) => (
              <TableRow key={question.id}>
                  <TableCell>
          <img 
            src={question.imagecour} 
            alt={`Image de ${question.title}`} 
            style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "5px" }} 
          />
        </TableCell>
                <TableCell>{question.title}</TableCell>
                <TableCell>{`${question.op1}, ${question.op2}, ${question.op3}, ${question.op4}`}</TableCell>
                <TableCell align="center">{question.rep}</TableCell>
                <TableCell align="center">{question.quizz}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => {
                    setNewQuestion(question);
                    setOpen(true);
                  }}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(question.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredQuestions.length}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{newQuestion.id ? "Modifier" : "Ajouter"} une Question</DialogTitle>
        <DialogContent>
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
            value={newQuestion.quizz}
            onChange={(e) => setNewQuestion({ ...newQuestion, quizz: Number(e.target.value) })}
          />
           <TextField
                   label="image"
                   fullWidth
                   value={newQuestion?.imagecour}
                   onChange={(e) => setNewQuestion({ ...newQuestion, imagecour: e.target.value })}
                   margin="normal"
                 />
             
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} color="primary">
            {newQuestion.id ? "Modifier" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
        <Alert onClose={() => setMessage('')} severity="success">{message}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">{error}</Alert>
      </Snackbar>
    </div>
  );
};

export default QuestionsChapitre;
