import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { Chapitre, CourType, Pause } from "../../types/auth";
import { ChapitreService, updateChapitrePauses } from "../../services/chapitres.service";
import { CoursService } from "../../services/cours.service";
import VideoPlayer from "./videoPlayer";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import {
  Box, Typography, IconButton, Button, TextField, TablePagination, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Snackbar, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { ListIcon } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import axios from "axios";
import { getAuthStore } from "../../store/auth";
import WebViewer from '@pdftron/webviewer'; // Import de WebViewer

const StyledTableContainer = styled(TableContainer)({
  borderRadius: "12px",
  boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)",
  overflowX: "auto",
  "& .MuiTableCell-root": { padding: "16px 24px" },
});

const HeaderCell = styled(TableCell)({
  fontWeight: 600,
  backgroundColor: "#f8fafc",
  color: "#0f172a",
  borderBottom: "2px solid #e2e8f0",
});

const ChapitreComponent = () => {
  const [chapitre, setChapitre] = useState<Chapitre | null>(null);
  const { role } = useAuth() || { role: '' };
  const userRole = role || 'Admin Ministère';
  const { coursId } = useParams<{ coursId: string }>();
  const navigate = useNavigate();
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [newChapitre, setNewChapitre] = useState<Partial<Chapitre> | null>(null);
  const [cours, setCours] = useState<CourType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [openChapitreDialog, setOpenChapitreDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [pauses, setPauses] = useState<Pause[]>([{ tempsPause: "", information: "", correctGrid: undefined }]);
  const viewerRef = useRef<HTMLDivElement>(null); // Référence pour le conteneur WebViewer
  const [viewerInstance, setViewerInstance] = useState<any>(null); // Instance de WebViewer

  const isVideo = file && file.name.toLowerCase().endsWith(".mp4");
  const isPptx = file && file.name.toLowerCase().endsWith(".pptx");
  const isAdmin = userRole === 'Admin Ministère';
  const token = getAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (coursId) {
      fetchChapitres();
      loadCours();
    }
  }, [coursId]);

  useEffect(() => {
    // Initialiser WebViewer une seule fois au montage du composant
    if (viewerRef.current && !viewerInstance) {
      WebViewer({
        path: '/webviewer/lib', // Chemin vers les fichiers statiques de WebViewer (doit être copié dans public)
        licenseKey: 'your_license_key_here', // Remplacez par une clé de licence valide ou laissez vide pour la version d'essai
      }, viewerRef.current).then((instance) => {
        setViewerInstance(instance);
        instance.UI.setTheme('dark'); // Optionnel : personnaliser l'apparence
      }).catch((err) => {
        console.error('[WebViewer] Erreur d’initialisation :', err);
        setError('Erreur lors de l’initialisation du visualiseur PPTX');
      });
    }
  }, [viewerRef, viewerInstance]);

  const fetchChapitres = async () => {
    try {
      setLoading(true);
      const coursIdNumber = parseInt(coursId!, 10);
      if (isNaN(coursIdNumber)) {
        setError("Invalid course ID");
        return;
      }
      const data = await ChapitreService.getChapitresForCours(coursIdNumber);
      console.log('Raw API Response:', data);
      if (Array.isArray(data)) {
        setChapitres(data);
      }
    } catch (error) {
      setError("Error fetching chapters");
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
      toast.error("Erreur lors du chargement des grades.");
    }
  };

  const handleDeleteChapitre = async (chapitreId: number) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer ce chapitre ?")) {
      try {
        await ChapitreService.deleteChapitre(parseInt(coursId!, 10), chapitreId);
        setMessage("Chapitre supprimé avec succès !");
        fetchChapitres();
      } catch (error) {
        toast.error("Erreur lors de la suppression du chapitre.");
      }
    }
  };

  const handlePreviewChapitre = (chapitre: Chapitre) => {
    setMessage(`Aperçu du chapitre : ${chapitre.title}\n${chapitre.description}`);
  };

  const handleOpenChapitreDialog = (chapitre?: Chapitre) => {
    if (chapitre) {
      setNewChapitre(chapitre);
      setPauses(chapitre.pauses || [{ tempsPause: "", information: "", correctGrid: undefined }]);
    } else {
      setNewChapitre({ title: '', description: '', video: null, pdf: null, pptx: null, cours: parseInt(coursId!, 10) });
      setPauses([{ tempsPause: "", information: "", correctGrid: undefined }]);
    }
    setFile(null);
    setFileUrl('');
    setOpenChapitreDialog(true);
  };

  const handleAddPause = () => {
    setPauses([...pauses, { tempsPause: "", information: "", correctGrid: undefined }]);
  };

  const handleRemovePause = (index: number) => {
    setPauses(pauses.filter((_, i) => i !== index));
  };

  const handlePauseChange = (index: number, field: keyof Pause, value: string | number | undefined | { row: number; col: number }) => {
    const updatedPauses = pauses.map((pause, i) =>
      i === index ? { ...pause, [field]: value } : pause
    );
    setPauses(updatedPauses);
  };

  const handleGridSelect = async (
    _tempsPause: number,
    _row: number,
    _col: number,
    updatedPauses: Pause[],
    chapitreId: number
  ) => {
    try {
      const coursIdNumber = parseInt(coursId!, 10);
      if (isNaN(coursIdNumber)) {
        throw new Error("Invalid coursId");
      }
      const responseData = await updateChapitrePauses(coursIdNumber, chapitreId, updatedPauses);
      if (responseData && typeof responseData === 'object' && 'id' in responseData) {
        setChapitre(responseData);
        setChapitres((prev) =>
          prev.map((c) => (c.id === chapitreId ? { ...c, ...responseData } : c))
        );
      } else {
        throw new Error("Invalid response data from API");
      }
    } catch (error) {
      console.error("Failed to update pauses:", error);
      setError("Erreur lors de la mise à jour des pauses.");
    }
  };

  const handleSaveOrUpdateChapitre = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!newChapitre || !newChapitre.title || !newChapitre.description) {
      setError("Le titre et la description sont requis.");
      setLoading(false);
      return;
    }

    const coursIdNumber = parseInt(coursId!, 10);
    if (isNaN(coursIdNumber)) {
      setError("Cours ID invalide");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", newChapitre.title || "");
    formData.append("description", newChapitre.description || "");
    formData.append("cours", coursIdNumber.toString());

    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "mp4") {
        formData.append("video", file);
        const validPauses = pauses
          .filter((p) => p.tempsPause !== "" && p.information !== "")
          .map((p) => ({
            temps_pause: Number(p.tempsPause),
            information: p.information,
            correct_grid_row: isAdmin ? null : (p.correctGrid?.row ?? null),
            correct_grid_col: isAdmin ? null : (p.correctGrid?.col ?? null),
          }));
        if (validPauses.length > 0) {
          formData.append("pauses", JSON.stringify(validPauses));
        }
      } else if (fileExtension === "pdf") {
        formData.append("pdf", file);
      } else if (fileExtension === "pptx") {
        formData.append("pptx", file);
      }
    }

    try {
      let responseData;
      if (newChapitre.id) {
        responseData = await ChapitreService.updateChapitre(newChapitre.id, formData, coursIdNumber);
      } else {
        responseData = await ChapitreService.ajouterChapitre(formData, coursIdNumber);
      }
      if (responseData && typeof responseData === 'object' && 'fileUrl' in responseData) {
        setFileUrl(responseData.fileUrl as string);
        setMessage(`Chapitre ${newChapitre.id ? 'modifié' : 'ajouté'} avec succès ! URL: ${responseData.fileUrl}`);
      } else {
        setMessage(`Chapitre ${newChapitre.id ? 'modifié' : 'ajouté'} avec succès !`);
      }
      fetchChapitres();
      setNewChapitre(null);
      setOpenChapitreDialog(false);
      setFile(null);
      setPauses([{ tempsPause: "", information: "", correctGrid: undefined }]);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPPTXInApp = async (chapitre: Chapitre) => {
    if (!chapitre.pptx) {
      console.log(`[PPTX] Aucun fichier PPTX disponible pour chapitre ${chapitre.id}`);
      setError('No PPTX file available');
      return;
    }

    if (!viewerInstance) {
      console.log('[PPTX] WebViewer n’est pas encore initialisé');
      setError('Visualiseur non prêt, veuillez réessayer');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log(`[PPTX] Début de la récupération pour cours=${coursId}, chapitre=${chapitre.id}`);

      const response = await axios.get<ArrayBuffer>(
        `http://localhost:8000/cours/cours/${coursId}/chapitre/${chapitre.id}/pptx/`,
        {
          responseType: 'arraybuffer',
          headers: {
            'Authorization': `Bearer ${token || ''}`,
          },
        }
      );

      console.log(`[PPTX] Réponse reçue : statut=${response.status}, taille=${response.data.byteLength} octets`);
      if (!response.data) {
        console.error('[PPTX] Aucun contenu dans la réponse');
        throw new Error('No PPTX content received');
      }

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      console.log(`[PPTX] Blob créé : taille=${blob.size}, type=${blob.type}`);
      const url = URL.createObjectURL(blob);
      console.log(`[PPTX] URL Blob générée : ${url}`);

      // Charger le PPTX dans WebViewer
      viewerInstance.UI.loadDocument(url, { filename: `chapitre_${chapitre.id}.pptx` });
      console.log('[PPTX] PPTX chargé dans WebViewer');

      setFileUrl(url);

    } catch (error) {
      console.error(`[PPTX] Erreur lors du chargement : ${(error as any).message}`, error);
      setError(`Failed to load PPTX: ${(error as any).message}`);
    } finally {
      setLoading(false);
      console.log('[PPTX] Chargement terminé');
    }
  };

  const filteredChapitres = chapitres
    .filter((chapitre) => (chapitre.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  const ondragend = (result: DropResult) => {
    if (!result.destination || !filteredChapitres.some(chap => chap.id.toString() === result.draggableId)) {
      return;
    }
    const newChapitres = Array.from(chapitres);
    const [moved] = newChapitres.splice(result.source.index, 1);
    newChapitres.splice(result.destination.index, 0, moved);
    setChapitres(newChapitres);
  };

  return (
    <DragDropContext onDragEnd={ondragend}>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error">{error}</Alert>
      </Snackbar>
      <Droppable droppableId="chapitres">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef} mt={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Chapitres du cours {coursId}</Typography>
              <div className="flex gap-4">
                <Button variant="contained" color="primary" onClick={() => handleOpenChapitreDialog()}>
                  Ajouter un Chapitre
                </Button>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                  Retour
                </Button>
              </div>
            </Box>
            <Box display="flex" gap={2} mb={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Rechercher un chapitre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </Box>
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <HeaderCell>Titre</HeaderCell>
                    <HeaderCell>Description</HeaderCell>
                    <HeaderCell>PDF/Pptx/Video</HeaderCell>
                    <HeaderCell>Cours</HeaderCell>
                    <HeaderCell>Liste Quizz</HeaderCell>
                    <HeaderCell>Actions</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredChapitres
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((chapitre, index) => (
                      <Draggable key={chapitre.id} draggableId={chapitre.id.toString()} index={index}>
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TableCell>
                              {editingId === chapitre.id ? (
                                <TextField
                                  value={chapitre.title}
                                  onChange={(e) =>
                                    setChapitres((prev) =>
                                      prev.map((c) =>
                                        c.id === chapitre.id ? { ...c, title: e.target.value } : c
                                      )
                                    )
                                  }
                                />
                              ) : (
                                <span onClick={() => setEditingId(chapitre.id)}>{chapitre.title}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <ReactMarkdown>{chapitre.description}</ReactMarkdown>
                            </TableCell>
                            <TableCell>
                              {chapitre.video ? (
                                <VideoPlayer
                                  videoUrl={chapitre.video}
                                  pauses={chapitre.pauses || []}
                                  role={userRole}
                                  onGridSelect={(tempsPause, row, col, updatedPauses) =>
                                    handleGridSelect(tempsPause, row, col, updatedPauses, chapitre.id)
                                  }
                                />
                              ) : chapitre.pdf ? (
                                <a href={chapitre.pdf} target="_blank" rel="noopener noreferrer">
                                  Ouvrir PDF
                                </a>
                              ) : chapitre.pptx ? (
                                <Button
                                  onClick={() => handleOpenPPTXInApp(chapitre)}
                                  variant="outlined"
                                  size="small"
                                  disabled={loading}
                                >
                                  {loading ? 'Chargement...' : 'Ouvrir PPTX'}
                                </Button>
                              ) : (
                                <span>Aucun fichier disponible</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={cours.find((g) => g.id === chapitre.cours)?.title || "Inconnu"}
                                sx={{ bgcolor: '#f5f3ff', color: '#6d28d9' }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => navigate(`/cours/${coursId}/chapitre/${chapitre.id}/QuizzChapitre`)}>
                                <ListIcon />
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => handlePreviewChapitre(chapitre)}>
                                <VisibilityIcon fontSize="small" color="primary" />
                              </IconButton>
                              <IconButton onClick={() => handleOpenChapitreDialog(chapitre)}>
                                <EditIcon fontSize="small" color="success" />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteChapitre(chapitre.id)}>
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredChapitres.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Box>
        )}
      </Droppable>
      <Dialog open={openChapitreDialog} onClose={() => setOpenChapitreDialog(false)}>
        <DialogTitle>{newChapitre?.id ? "Modifier" : "Ajouter"} un Chapitre</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Titre"
            value={newChapitre?.title || ""}
            onChange={(e) => setNewChapitre({ ...newChapitre, title: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={newChapitre?.description || ""}
            onChange={(e) => setNewChapitre({ ...newChapitre, description: e.target.value })}
          />
          <input
            type="file"
            accept=".mp4,.pdf,.pptx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
          {fileUrl && isPptx && (
            <Box mt={2}>
              <Typography>File URL: {fileUrl}</Typography>
              <Button
                onClick={() => viewerInstance?.UI.loadDocument(fileUrl, { filename: 'new_pptx.pptx' })}
                variant="contained"
                color="success"
                sx={{ mt: 1 }}
              >
                Ouvrir PPTX
              </Button>
            </Box>
          )}
          {isVideo && !isAdmin && (
            <Box sx={{ mt: 2 }}>
              <h4>Pauses spécifiques</h4>
              {pauses.map((pause, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TextField
                    sx={{ mr: 2 }}
                    label="Temps de pause (en secondes)"
                    type="number"
                    value={pause.tempsPause}
                    onChange={(e) => handlePauseChange(index, "tempsPause", e.target.value ? parseInt(e.target.value) : "")}
                  />
                  <TextField
                    sx={{ mr: 2 }}
                    label="Information (popup)"
                    value={pause.information}
                    onChange={(e) => handlePauseChange(index, "information", e.target.value)}
                  />
                  <TextField
                    sx={{ mr: 2, width: 80 }}
                    label="Ligne (0-7)"
                    type="number"
                    value={pause.correctGrid?.row ?? ""}
                    onChange={(e) => {
                      const row = parseInt(e.target.value) || 0;
                      handlePauseChange(index, "correctGrid", { row, col: pause.correctGrid?.col || 0 });
                    }}
                    inputProps={{ min: 0, max: 7 }}
                  />
                  <TextField
                    sx={{ mr: 2, width: 80 }}
                    label="Colonne (0-7)"
                    type="number"
                    value={pause.correctGrid?.col ?? ""}
                    onChange={(e) => {
                      const col = parseInt(e.target.value) || 0;
                      handlePauseChange(index, "correctGrid", { row: pause.correctGrid?.row || 0, col });
                    }}
                    inputProps={{ min: 0, max: 7 }}
                  />
                  <IconButton onClick={() => handleRemovePause(index)} disabled={pauses.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<AddIcon />} onClick={handleAddPause} variant="outlined" sx={{ mt: 1 }}>
                Ajouter une pause
              </Button>
            </Box>
          )}
          {isVideo && isAdmin && (
            <Box sx={{ mt: 2 }}>
              <h4>Pauses spécifiques (Grille définie dans le lecteur vidéo)</h4>
              {pauses.map((pause, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TextField
                    sx={{ mr: 2 }}
                    label="Temps de pause (en secondes)"
                    type="number"
                    value={pause.tempsPause}
                    onChange={(e) => handlePauseChange(index, "tempsPause", e.target.value ? parseInt(e.target.value) : "")}
                  />
                  <TextField
                    sx={{ mr: 2 }}
                    label="Information (popup)"
                    value={pause.information}
                    onChange={(e) => handlePauseChange(index, "information", e.target.value)}
                  />
                  <IconButton onClick={() => handleRemovePause(index)} disabled={pauses.length === 1}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<AddIcon />} onClick={handleAddPause} variant="outlined" sx={{ mt: 1 }}>
                Ajouter une pause
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChapitreDialog(false)}>Annuler</Button>
          <Button onClick={handleSaveOrUpdateChapitre} color="primary" disabled={loading}>
            {newChapitre?.id ? "Modifier" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
      <Box mt={4}>
        <Typography variant="h6">Visualiseur PPTX</Typography>
        <div ref={viewerRef} style={{ height: '600px', width: '100%' }} />
      </Box>
      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")}>
        <Alert onClose={() => setMessage("")} severity="success">{message}</Alert>
      </Snackbar>
    </DragDropContext>
  );
};

export default ChapitreComponent;