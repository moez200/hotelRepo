import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/responseQuizz'; // Ajustez le chemin selon votre structure
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Chip,
} from '@mui/material';
import { styled } from '@mui/system';
import { Search, Edit, Delete } from '@mui/icons-material';
import { Alert } from '@mui/material';
import { FaClipboardList } from 'react-icons/fa'; // Icône similaire à FaUserFriends
import { Chapitre, CourType, QuizResponse } from '../../types/auth';
import ChapitreService from '../../services/chapitres.service';
import { CoursService } from '../../services/cours.service';



// Styles personnalisés pour le tableau
const StyledTableContainer = styled(TableContainer)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
});

const HeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  color: '#374151',
  backgroundColor: '#f3f4f6',
});
const StatusChip = styled(Chip)({
    fontSize: '0.75rem',
    height: '24px',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  });
function QuizResponsesList() {
  const { coursId, chapterId } = useParams<{ coursId?: string; chapterId?: string }>();
  const navigate = useNavigate();

  // États pour gérer les données, la recherche, la pagination et les messages
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
    const [chapitres, setChapitres] = useState<Chapitre[]>([]);
    const [cours, setCours] = useState<CourType[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState(true);

  // Récupérer les réponses au montage ou changement des paramètres
  const fetchQuizResponses = async () => {
    try {
      const courseIdNum = coursId ? parseInt(coursId) : undefined;
      const chapterIdNum = chapterId ? parseInt(chapterId) : undefined;
      const responses = await quizService.getQuizChapterResponses(chapterIdNum, courseIdNum);
      setQuizResponses(responses);
    } catch (err: any) {
      setError('Erreur lors de la récupération des réponses aux quiz');
      console.error('Erreur:', err);
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
          const res = await ChapitreService.getChapitresForCours(coursIdNumber) 
          setChapitres(res as Chapitre[]);
        } catch (error) {
          console.error("Erreur lors du chargement des chapitre :", error);
          alert("Erreur lors du chargement des chapitres.");
        }
      };

         const loadCours = async () => {
            try {
              const res = await CoursService.getAllCours();
             
              setCours(res.data);
            } catch (error) {
              console.error("Erreur lors du chargement des cours :", error);
              alert("Erreur lors du chargement des cours.");
            }
          };

  useEffect(() => {
    fetchQuizResponses();
    loadChapitres();
    loadCours();
  }, [coursId, chapterId]);

  // Filtrer les réponses selon le terme de recherche
  const filteredResponses = quizResponses.filter((response) =>
    response.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.course.toString().includes(searchTerm) ||
    response.chapter.toString().includes(searchTerm)
  );

  // Gestion de la pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mr-12">
      <div className="w-full flex flex-col mr-64">
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FaClipboardList className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Réponses aux Quiz</h1>
          </div>
          
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher une réponse..."
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

        {/* Tableau */}
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell> Cours</HeaderCell>
                <HeaderCell> Chapitre</HeaderCell>
                <HeaderCell>Titre</HeaderCell>
                <HeaderCell>Score</HeaderCell>
                <HeaderCell>Statut</HeaderCell>
             
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResponses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((response, index) => (
                  <TableRow key={index} hover>

                     <TableCell>
                                                           <StatusChip
                                                             label={cours.find((g) => g.id === response.course)?.title || "Inconnu"}
                                                             sx={{
                                                               bgcolor: '#f5f3ff',
                                                               color: '#6d28d9',
                                                             }}
                                                           />
                                                         </TableCell>
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
                                         {chapitres.find((g) => g.id === response.chapter)?.title || "Inconnu"}
                                       </span>
                                     </TableCell>
                    <TableCell className="font-medium">{response.title}</TableCell>
                    <TableCell>{response.score}%</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-md text-sm ${
                          response.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {response.status}
                      </span>
                    </TableCell>
                  
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredResponses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </StyledTableContainer>

        {/* Notifications */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!message}
          autoHideDuration={6000}
          onClose={() => setMessage('')}
        >
          <Alert onClose={() => setMessage('')} severity="success">
            {message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default QuizResponsesList;