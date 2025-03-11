import React, { useEffect, useState } from 'react';
import { FaQuestionCircle } from "react-icons/fa"; // FontAwesome
import { ListIcon } from "lucide-react"; // Lucide
import type { Chapitre, CourType, Outz, QuizzChapitre } from "../../types/auth";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  TextField,
  Chip,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { styled } from '@mui/system';
import { useNavigate, useParams } from 'react-router-dom';


import { getOutzs } from '../../services/quizzCours.service';
import { CoursService } from '../../services/cours.service';

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

const QuizzCourA = () => {
    const {  coursId } = useParams();
   
  const navigate = useNavigate();

   const [quizzes, setQuizzes] = useState<Outz[]>([]); 

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState("");
   const [cours, setCours] = useState<CourType[]>([]);


  useEffect(() => {
    if (coursId) {
      fetchQuizzes();
      loadCours();
    
    } else {
      setError("Chapitre ID is missing.");
    }
  }, [coursId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      if (!coursId || isNaN(Number(coursId))) {
        setError("Invalid chapitre ID");
        return;
      }
      
      const courIdNumber = parseInt(coursId, 10);
      const data = await getOutzs(courIdNumber);
      setQuizzes(data);
    } catch (error) {
      setError("Error fetching quizzes");
    } finally {
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
          
    

  const filteredQuizz = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) 
  
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FaQuestionCircle className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quizz pour le cour {coursId}</h1>
          </div>
          <Button
            variant="contained"
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
                <HeaderCell>cours</HeaderCell>
               
              </TableRow>
            </TableHead>

           <TableBody>
  {filteredQuizz.map((q) => (
    <TableRow 
      key={q.id} 
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/course/${coursId}/quizz/${q.id}/question`)}
    >
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
    </TableRow>
  ))}
</TableBody>

          </Table>
        </StyledTableContainer>
      </div>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error">{error}</Alert>
      </Snackbar>
    </div>
  );
};

export default QuizzCourA;