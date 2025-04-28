import React, { useEffect, useState, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, TextField, Snackbar, Alert, Dialog, DialogActions, DialogContent,
  DialogTitle, Button, styled, Typography, Box, FormControl, InputLabel, MenuItem,
  Select, RadioGroup, FormControlLabel, Radio, Checkbox,
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import { Outz, QuestionCour, ClickableZone, InteractionResponse2 } from '../../types/auth';
import questionService from '../../services/questions.service';
import { useParams, useNavigate } from 'react-router-dom';
import { getOutzs } from '../../services/quizzCours.service';
import VideoPlayer from '../Apprenant/videoPlayer2';

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

const QuestionList = () => {
  const { QuizzId, coursId } = useParams<{ QuizzId: string; coursId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionCour[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Outz[]>([]);
  const [open, setOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [hasMultipleChoice, setHasMultipleChoice] = useState(true);
  const [newQuestion, setNewQuestion] = useState<QuestionCour>({
    title: '',
    op1: '',
    op2: '',
    op3: '',
    op4: '',
    rep: '',
    imagecour: '',
    video: '',
    quizzecur: 0,
    clickable_regions: [],
    clickable_zones: [],
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [markedZones, setMarkedZones] = useState<ClickableZone[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, [currentPage, rowsPerPage, searchTerm]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const quizzIdNumber = parseInt(QuizzId!, 10);
      if (isNaN(quizzIdNumber)) {
        setError('Invalid quiz ID');
        return;
      }

      const response = await questionService.getAllQuestions(quizzIdNumber);
      if (Array.isArray(response)) {
        setQuestions(response);
      } else {
        setError('Les questions ne sont pas au bon format.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setError('Erreur lors du chargement des questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      if (!coursId || isNaN(Number(coursId))) {
        setError('Invalid course ID');
        return;
      }

      const coursIdNumber = parseInt(coursId, 10);
      const data = await getOutzs(coursIdNumber);
      if (Array.isArray(data)) {
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Error fetching quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) {
      setError('Impossible de supprimer : ID invalide.');
      return;
    }
    try {
      await questionService.deleteQuestionCour(id);
      setMessage('Question supprimée avec succès !');
      fetchQuestions();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      setError('Erreur lors de la suppression de la question.');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'imagecour' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'imagecour' && !file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide (JPG, PNG, etc.).');
        return;
      }
      if (field === 'video' && !file.type.startsWith('video/')) {
        setError('Veuillez sélectionner une vidéo valide (MP4, WebM, etc.).');
        return;
      }
      console.log('File uploaded:', file);
      setNewQuestion({ ...newQuestion, [field]: file });
      if (field === 'video') {
        setMarkedZones([]);
        setIsPlaying(false);
        setCanPlay(false);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.muted = true;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (videoRef.current) {
            videoRef.current.muted = false;
          }
        })
        .catch((error) => {
          console.error('Erreur lors de la lecture de la vidéo :', error);
          setError('Impossible de démarrer la vidéo. Veuillez réessayer.');
        });
    }
  };

  const handleCanPlay = () => {
    setCanPlay(true);
    if (videoRef.current && !isPlaying) {
      videoRef.current.muted = true;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (videoRef.current) {
            videoRef.current.muted = false;
          }
        })
        .catch((error) => {
          console.error('Erreur lors de l’autoplay de la vidéo :', error);
          setError('Autoplay bloqué. Veuillez utiliser le bouton Play.');
        });
    }
  };

  const handleSave = async () => {
    try {
      if ((newQuestion.imagecour && newQuestion.video) ||
          (newQuestion.imagecour instanceof File && newQuestion.video instanceof File)) {
        setError('Une question ne peut pas avoir à la fois une image et une vidéo.');
        return;
      }

      if (!newQuestion.title) {
        setError('Le titre de la question est requis.');
        return;
      }

      if (hasMultipleChoice && (!newQuestion.op1 || !newQuestion.op2 || !newQuestion.rep)) {
        setError('Veuillez fournir au moins deux options et une réponse correcte pour les questions à choix multiple.');
        return;
      }

      if (mediaType === 'video' && !hasMultipleChoice && markedZones.length === 0) {
        setError('Veuillez marquer au moins une zone cliquable pour une question vidéo sans choix multiple.');
        return;
      }

      const questionToSave: QuestionCour = {
        ...newQuestion,
        clickable_zones: mediaType === 'video' ? markedZones : [],
        op1: hasMultipleChoice ? newQuestion.op1 : '',
        op2: hasMultipleChoice ? newQuestion.op2 : '',
        op3: hasMultipleChoice ? newQuestion.op3 : '',
        op4: hasMultipleChoice ? newQuestion.op4 : '',
        rep: hasMultipleChoice ? newQuestion.rep : '',
      };

      if (newQuestion.id) {
        await questionService.updateQuestion(newQuestion.id, questionToSave);
        setMessage('Question modifiée avec succès !');
      } else {
        await questionService.addQuestion(questionToSave);
        setMessage('Question ajoutée avec succès !');
      }

      console.log('Question enregistrée:', { ...questionToSave, clickable_zones: markedZones });

      fetchQuestions();
      setNewQuestion({
        title: '',
        op1: '',
        op2: '',
        op3: '',
        op4: '',
        rep: '',
        imagecour: '',
        video: '',
        quizzecur: 0,
        clickable_regions: [],
        clickable_zones: [],
      });
      setMediaType('none');
      setHasMultipleChoice(true);
      setMarkedZones([]);
      setIsPlaying(false);
      setCanPlay(false);
      setOpen(false);
    } catch (err: any) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        'Une erreur s’est produite lors de l’enregistrement de la question.'
      );
    }
  };

  const filteredQuestions = questions.filter((q) =>
    Object.values(q).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" className="text-3xl font-bold text-gray-900">
          Liste des Questions du Quizz {QuizzId}
        </Typography>
        <div className="flex gap-4">
          <Button
            variant="contained"
            sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}
            onClick={() => setOpen(true)}
          >
            Ajouter une Question
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#6b7280', '&:hover': { backgroundColor: '#4b5563' } }}
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
          fullWidth
          sx={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </div>

      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <HeaderCell>Média</HeaderCell>
              <HeaderCell>Question</HeaderCell>
              <HeaderCell>Options</HeaderCell>
              <HeaderCell align="center">Réponse Correcte</HeaderCell>
              <HeaderCell align="center">Quiz</HeaderCell>
              <HeaderCell align="center">Actions</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions
              .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
              .map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    {question.imagecour ? (
                      <img
                        src={
                          typeof question.imagecour === 'string'
                            ? question.imagecour
                            : URL.createObjectURL(question.imagecour)
                        }
                        alt={`Image de ${question.title}`}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '5px' }}
                      />
                    ) : question.video ? (
                      <VideoPlayer
                        videoUrl={
                          typeof question.video === 'string'
                            ? question.video
                            : URL.createObjectURL(question.video)
                        }
                        clickable_regions={question.clickable_regions || []}
                        clickable_zones={question.clickable_zones || []}
                        role="Admin Ministère"
                        width="400px" // Largeur explicite
                        height="auto" // Hauteur automatique (rapport 16:9)
                      />
                    ) : (
                      'Aucun média'
                    )}
                  </TableCell>
                  <TableCell>{question.title}</TableCell>
                  <TableCell>
                    {question.op1 || question.op2 || question.op3 || question.op4
                      ? `${question.op1 || ''}, ${question.op2 || ''}, ${question.op3 || ''}, ${question.op4 || ''}`
                      : 'Aucune option (vidéo interactive)'}
                  </TableCell>
                  <TableCell align="center">{question.rep || 'N/A'}</TableCell>
                  <TableCell align="center">{question.quizzecur}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => {
                        setNewQuestion(question);
                        setMediaType(question.imagecour ? 'image' : question.video ? 'video' : 'none');
                        setHasMultipleChoice(!!question.op1 || !!question.op2 || !!question.op3 || !!question.op4);
                        setMarkedZones(question.clickable_zones || []);
                        setOpen(true);
                      }}
                    >
                      <Edit sx={{ color: '#3b82f6' }} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(question.id)}>
                      <Delete sx={{ color: '#ef4444' }} />
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{newQuestion.id ? 'Modifier' : 'Ajouter'} une Question</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Titre"
            value={newQuestion.title}
            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
            variant="outlined"
            required
            sx={{ backgroundColor: 'white' }}
          />
          <FormControl component="fieldset" margin="normal">
            <Typography variant="subtitle1" className="text-gray-800">Type de média</Typography>
            <RadioGroup
              row
              value={mediaType}
              onChange={(e) => {
                const value = e.target.value as 'image' | 'video' | 'none';
                setMediaType(value);
                setNewQuestion({
                  ...newQuestion,
                  imagecour: value === 'image' ? newQuestion.imagecour : '',
                  video: value === 'video' ? newQuestion.video : '',
                  clickable_regions: value === 'video' ? newQuestion.clickable_regions : [],
                  clickable_zones: value === 'video' ? newQuestion.clickable_zones : [],
                });
                setMarkedZones(value === 'video' ? newQuestion.clickable_zones || [] : []);
                if (value !== 'video') {
                  setHasMultipleChoice(true);
                }
              }}
            >
              <FormControlLabel value="none" control={<Radio sx={{ color: '#3b82f6' }} />} label="Aucun" />
              <FormControlLabel value="image" control={<Radio sx={{ color: '#3b82f6' }} />} label="Image" />
              <FormControlLabel value="video" control={<Radio sx={{ color: '#3b82f6' }} />} label="Vidéo" />
            </RadioGroup>
          </FormControl>
          {mediaType === 'video' && (
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasMultipleChoice}
                    onChange={(e) => {
                      setHasMultipleChoice(e.target.checked);
                      console.log('hasMultipleChoice:', e.target.checked);
                    }}
                    sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' } }}
                  />
                }
                label="Inclure des questions à choix multiple"
              />
            </Box>
          )}
          {(mediaType !== 'video' || hasMultipleChoice) && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Option 1"
                value={newQuestion.op1}
                onChange={(e) => setNewQuestion({ ...newQuestion, op1: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: 'white' }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Option 2"
                value={newQuestion.op2}
                onChange={(e) => setNewQuestion({ ...newQuestion, op2: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: 'white' }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Option 3"
                value={newQuestion.op3}
                onChange={(e) => setNewQuestion({ ...newQuestion, op3: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: 'white' }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Option 4"
                value={newQuestion.op4}
                onChange={(e) => setNewQuestion({ ...newQuestion, op4: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: 'white' }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Réponse correcte"
                value={newQuestion.rep}
                onChange={(e) => setNewQuestion({ ...newQuestion, rep: e.target.value })}
                variant="outlined"
                required
                sx={{ backgroundColor: 'white' }}
              />
            </>
          )}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="quiz-select-label">Quizz</InputLabel>
            <Select
              labelId="quiz-select-label"
              label="Quizz"
              value={newQuestion.quizzecur || ''}
              onChange={(e) => setNewQuestion({ ...newQuestion, quizzecur: Number(e.target.value) })}
              required
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value="" disabled>
                Sélectionner un quizz
              </MenuItem>
              {quizzes.map((quiz) => (
                <MenuItem key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {mediaType === 'image' && (
            <Box mt={2}>
              <Button variant="contained" component="label" sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}>
                Choisir une image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'imagecour')}
                />
              </Button>
              {newQuestion.imagecour && (
                <Typography variant="body2" mt={1} className="text-gray-600">
                  Fichier sélectionné :{' '}
                  {typeof newQuestion.imagecour === 'string'
                    ? newQuestion.imagecour
                    : newQuestion.imagecour.name}
                </Typography>
              )}
            </Box>
          )}
          {mediaType === 'video' && (
  <Box mt={2}>
    <Button variant="contained" component="label" sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}>
      Choisir une vidéo
      <input
        type="file"
        hidden
        accept="video/*"
        onChange={(e) => handleFileChange(e, 'video')}
      />
    </Button>
    {newQuestion.video && (
      <>
        <Typography variant="body2" mt={1} className="text-gray-600">
          Fichier sélectionné :{' '}
          {typeof newQuestion.video === 'string'
            ? newQuestion.video
            : newQuestion.video.name}
        </Typography>
        <Box mt={2} position="relative">
          <div className="relative bg-black rounded-xl overflow-hidden max-w-3xl w-full mx-auto">
            <VideoPlayer
              videoUrl={
                typeof newQuestion.video === 'string'
                  ? newQuestion.video
                  : URL.createObjectURL(newQuestion.video)
              }
              clickable_regions={newQuestion.clickable_regions || []}
              clickable_zones={markedZones}
              role="Admin Ministère"
              width="768px" // Largeur explicite
              height="auto" // Hauteur automatique (rapport 16:9)
              onInteraction={(responses: InteractionResponse2[]) => {
                const newZones = responses
                  .filter((r) => 'radius' in r.region)
                  .map((r) => r.region as ClickableZone);
                setMarkedZones(newZones);
                console.log('Updated markedZones:', newZones);
              }}
            />
          </div>
          <Box mt={1}>
            <Button
              variant="contained"
              color={isPlaying ? 'secondary' : 'primary'}
              onClick={togglePlay}
              disabled={!canPlay}
              aria-label={isPlaying ? 'Pause la vidéo' : 'Démarrer la vidéo'}
              sx={{ backgroundColor: isPlaying ? '#ef4444' : '#3b82f6', '&:hover': { backgroundColor: isPlaying ? '#dc2626' : '#2563eb' } }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </Box>
          <Typography variant="body2" mt={1} className="text-gray-600">
            Cliquez et faites glisser pour marquer des zones cliquables (x, y, rayon, temps).
          </Typography>
        </Box>
      </>
    )}
  </Box>
)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ color: '#6b7280' }}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}
            disabled={
              !newQuestion.title || 
              !newQuestion.quizzecur || 
              (hasMultipleChoice && (!newQuestion.op1 || !newQuestion.op2 || !newQuestion.rep)) || 
              (mediaType === 'video' && !hasMultipleChoice && markedZones.length === 0)
            }
          >
            {newQuestion.id ? 'Modifier' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
        <Alert onClose={() => setMessage('')} severity="success">
          {message}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default QuestionList;