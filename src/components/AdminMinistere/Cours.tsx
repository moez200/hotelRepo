import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, IconButton, TablePagination, Chip, InputAdornment, Checkbox,
  Snackbar, Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Edit, Delete, Add, Search, Article } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import { CourType, GradeType } from "../../types/auth";
import { CoursService } from "../../services/cours.service";
import { ChapitreService } from "../../services/chapitres.service";
import { ListIcon } from "lucide-react";
import { Box } from "@mui/material";

const HeaderCell = styled(TableCell)({
  fontWeight: 600,
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  borderBottom: '2px solid #e2e8f0',
  fontSize: '0.875rem',
});

const ActionButton = styled(Button)({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  transition: 'all 0.2s ease',
});

const StatusChip = styled(Chip)({
  fontSize: '0.75rem',
  height: '24px',
  '& .MuiChip-label': { padding: '0 8px' },
});

const CoursComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(''); // For PPTX URL
  const [filePath, setFilePath] = useState<string>(''); // For local PPTX path
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cours, setCours] = useState<CourType[]>([]);
  const [grades, setGrades] = useState<GradeType[]>([]);
  const [openCoursDialog, setOpenCoursDialog] = useState(false);
  const [currentCours, setCurrentCours] = useState<Partial<CourType> | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();
  const [openChapitreDialog, setOpenChapitreDialog] = useState(false);
  const [newChapitre, setNewChapitre] = useState({
    title: '',
    description: '',
    video: '',
    pdf: '',
    pptx: '',
    cours: 1,
  });

  useEffect(() => {
    const loadCours = async () => {
      try {
        const res = await CoursService.getAllCours();
        setCours(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des cours :", error);
        alert("Erreur lors du chargement des cours.");
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
    loadCours();
    loadGrades();
  }, []);

  const handleOpenCoursDialog = (cours?: CourType) => {
    setCurrentCours(cours || { title: "", description: "", logo: "", grades: grades[0]?.id || 0 });
    setOpenCoursDialog(true);
  };

  const handleSaveCours = async () => {
    if (!currentCours?.title || !currentCours?.description || !currentCours?.grades || !currentCours?.logo) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    try {
      if (currentCours.id) {
        await CoursService.updateCours(currentCours.id, currentCours);
        setMessage('Cours mis à jour avec succès !');
      } else {
        const newCours: CourType = {
          id: 0,
          title: currentCours.title!,
          description: currentCours.description!,
          logo: currentCours.logo!,
          grades: currentCours.grades!,
        };
        await CoursService.addCours(newCours);
        setMessage('Cours créé avec succès !');
      }
      setOpenCoursDialog(false);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage("Erreur lors de l'opération");
    }
  };

  const filteredCours = cours.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(cours.map(c => c.id ?? 0));
    } else {
      setSelected([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (confirm(`Supprimer ${selected.length} cours sélectionnés ?`)) {
      try {
        await Promise.all(selected.map(id => CoursService.deleteCours(id)));
        setSelected([]);
        alert(`${selected.length} cours supprimés avec succès !`);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  const handleDeleteCours = async (id: number | undefined) => {
    if (!id) {
      console.error("Erreur : ID du cours est undefined !");
      alert("Impossible de supprimer : ID invalide.");
      return;
    }
    if (confirm("Supprimer ce cours ?")) {
      try {
        console.log("Suppression du cours avec ID :", id);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  const handleOpenChapitreDialog = (coursId: number) => {
    setNewChapitre((prev) => ({ ...prev, cours: coursId }));
    setFile(null);
    setFileUrl('');
    setFilePath('');
    setOpenChapitreDialog(true);
  };

  const handleSaveChapitre = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!newChapitre.title || !newChapitre.description) {
      setError("Le titre et la description sont requis.");
      setLoading(false);
      return;
    }

    if (file && !["mp4", "pdf", "pptx"].includes(file.name.split('.').pop()?.toLowerCase() || "")) {
      setError("Veuillez télécharger un fichier de type mp4, pdf ou pptx.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", newChapitre.title);
    formData.append("description", newChapitre.description);
    formData.append("cours", newChapitre.cours.toString());

    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === "mp4") {
        formData.append("video", file);
      } else if (fileExtension === "pdf") {
        formData.append("pdf", file);
      } else if (fileExtension === "pptx") {
        formData.append("pptx", file);
      }
    }

    try {
      const responseData = await ChapitreService.ajouterChapitre(formData, newChapitre.cours) as { fileUrl: string, filePath: string };
      if (file?.name.toLowerCase().endsWith('.pptx')) {
        setFileUrl((responseData as { fileUrl: string }).fileUrl);
        setFilePath(responseData.filePath);
        setMessage(`Chapitre ajouté avec succès ! PPTX URL: ${responseData.fileUrl}`);
      } else {
        setMessage("Chapitre ajouté avec succès !");
      }
      setOpenChapitreDialog(false);
      setNewChapitre({ title: "", description: "", pdf: "", video: "", pptx: "", cours: 0 });
      setFile(null);
    } catch (err) {
      console.error("Erreur lors de l'ajout du chapitre", err);
      setError("Erreur lors de l'ajout du chapitre.");
    } finally {
      setLoading(false);
    }
  };

  const openPPTXLocally = (filePath: string) => {
    if (filePath) {
      const localUrl = `file://${filePath.replace(/\\/g, '/')}`;
      window.open(localUrl);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Article className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Cours</h1>
          </div>
          <ActionButton
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenCoursDialog()}
            sx={{ bgcolor: '#6d28d9', '&:hover': { bgcolor: '#5b21b6' }, boxShadow: '0px 4px 12px rgba(109, 40, 217, 0.2)' }}
          >
            Nouveau Cours
          </ActionButton>
          <Button
            variant="contained"
            color="error"
            disabled={selected.length === 0}
            onClick={handleDeleteSelected}
            startIcon={<Delete />}
          >
            Supprimer sélection
          </Button>
        </div>

        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><Search className="text-gray-400" /></InputAdornment>),
              className: 'bg-white rounded-lg',
              sx: { borderRadius: '12px' }
            }}
          />
        </div>

        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell><Checkbox indeterminate={selected.length > 0 && selected.length < cours.length} checked={selected.length === cours.length && cours.length > 0} onChange={handleSelectAll} /></HeaderCell>
                <HeaderCell>Image</HeaderCell>
                <HeaderCell>Titre</HeaderCell>
                <HeaderCell>Description</HeaderCell>
                <HeaderCell>Grade</HeaderCell>
                <HeaderCell>Liste chapitres</HeaderCell>
                <HeaderCell>Ajout chapitres</HeaderCell>
                <HeaderCell align="center">Actions</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCours.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell><Checkbox checked={selected.includes(c.id)} onChange={() => handleSelect(c.id)} /></TableCell>
                  <TableCell>{typeof c.logo === 'string' && (<img src={c.logo} alt="Course" className="w-16 h-16 rounded-xl object-cover" />)}</TableCell>
                  <TableCell className="text-gray-600 line-clamp-2">{c.title}</TableCell>
                  <TableCell className="text-gray-600 line-clamp-2">{c.description}</TableCell>
                  <TableCell><StatusChip label={grades.find((g) => g.id === c.grades)?.name || "Inconnu"} sx={{ bgcolor: '#f5f3ff', color: '#6d28d9' }} /></TableCell>
                  <TableCell><IconButton onClick={() => navigate(`/cours/${c.id}/chapitres`)} sx={{ color: '#6d28d9', '&:hover': { bgcolor: '#f5f3ff' } }}><ListIcon /></IconButton></TableCell>
                  <TableCell><IconButton onClick={() => handleOpenChapitreDialog(c.id!)}><AddIcon sx={{ color: 'green' }} /></IconButton></TableCell>
                  <TableCell align="center">
                    <div className="flex justify-center space-x-3">
                      <IconButton onClick={() => handleOpenCoursDialog(c)} className="text-purple-600 hover:bg-purple-50"><Edit fontSize="small" color="primary" /></IconButton>
                      <IconButton onClick={() => handleDeleteCours(c.id)} className="text-red-600 hover:bg-red-50"><Delete fontSize="small" color="error" /></IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCours.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="border-t border-gray-200"
          />
        </TableContainer>

        <Dialog open={openCoursDialog} onClose={() => setOpenCoursDialog(false)}>
          <DialogTitle>{currentCours?.id ? "Modifier un Cours" : "Ajouter un Cours"}</DialogTitle>
          <DialogContent>
            <TextField 
              label="Titre" 
              fullWidth 
              value={currentCours?.title || ''} 
              onChange={(e) => setCurrentCours({ ...currentCours, title: e.target.value })} 
              margin="normal" 
            />
            <TextField 
              label="Description" 
              fullWidth 
              value={currentCours?.description || ''} 
              onChange={(e) => setCurrentCours({ ...currentCours, description: e.target.value })} 
              margin="normal" 
            />
            <TextField 
              label="Logo URL" 
              fullWidth 
              value={currentCours?.logo || ''} 
              onChange={(e) => setCurrentCours({ ...currentCours, logo: e.target.value })} 
              margin="normal" 
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="grade-select-label">Grade</InputLabel>
              <Select
                labelId="grade-select-label"
                label="Grade"
                value={currentCours?.grades || ''}
                onChange={(e) => setCurrentCours({ ...currentCours, grades: +e.target.value })}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCoursDialog(false)} color="primary">Annuler</Button>
            <Button onClick={handleSaveCours} color="primary">{currentCours?.id ? "Modifier" : "Enregistrer"}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openChapitreDialog} onClose={() => setOpenChapitreDialog(false)} PaperProps={{ sx: { borderRadius: '16px', width: '600px' } }}>
          <DialogTitle className="bg-purple-100 text-purple-800 p-6"><Typography variant="h6">Ajouter un Chapitre</Typography></DialogTitle>
          <DialogContent className="p-6 space-y-4">
            <TextField fullWidth variant="outlined" label="Titre du chapitre" value={newChapitre.title} onChange={(e) => setNewChapitre({ ...newChapitre, title: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth multiline rows={3} variant="outlined" label="Description" value={newChapitre.description} onChange={(e) => setNewChapitre({ ...newChapitre, description: e.target.value })} sx={{ mb: 2 }} />
            <input type="file" accept=".mp4,.pdf,.pptx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded" />
            {fileUrl && file?.name.toLowerCase().endsWith('.pptx') && (
              <Box mt={2}>
                <Typography>File URL: <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl}</a></Typography>
                <Button onClick={() => openPPTXLocally(filePath)} variant="contained" color="success" sx={{ mt: 1 }}>Open PPTX Locally</Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions className="p-4 border-t border-gray-200">
            <ActionButton onClick={() => setOpenChapitreDialog(false)} sx={{ color: '#6b7280' }}>Annuler</ActionButton>
            <ActionButton variant="contained" onClick={handleSaveChapitre} sx={{ bgcolor: '#6d28d9', '&:hover': { bgcolor: '#5b21b6' }, ml: 2 }}>Ajouter le Chapitre</ActionButton>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
          <Alert onClose={() => setMessage("")} severity="success">{message}</Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
          <Alert onClose={() => setError("")} severity="error">{error}</Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default CoursComponent;