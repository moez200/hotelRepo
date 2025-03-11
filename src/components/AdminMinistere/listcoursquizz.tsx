import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  IconButton,
  TablePagination,

  Chip,
  InputAdornment,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Add, Search, Article } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import {   CourType, GradeType } from "../../types/auth";
import { CoursService } from "../../services/cours.service";
import { ListIcon } from "lucide-react";



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



const ListCours = () => {




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
    setCurrentCours(cours || { 
      title: "", 
      description: "", 
      logo: "", 
      grades: grades[0]?.id || 0, // Initialiser avec le premier grade
    });
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
          id: 0, // Valeur par défaut pour un nouvel ID
          title: currentCours.title!,
          description: currentCours.description!,
          logo: currentCours.logo!,
          grades: currentCours.grades!,
        };
        await CoursService.addCours(newCours);
        setMessage('Cours créé avec succès !');
      }
      setOpenCoursDialog(false);
      // Recharger la liste des cours
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
    // Sélectionne tous les cours s'ils ne sont pas déjà sélectionnés
    setSelected(cours.map(c => c.id ?? 0)); // Assure que c.id est toujours un nombre
  } else {
    // Désélectionne tous les cours
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
   
       // Recharge la liste après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
     
    }
  }
};



 




  

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
            <div className="w-full flex flex-col">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Article className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Cours</h1>
          </div>
          <ActionButton
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenCoursDialog()}
            sx={{
              bgcolor: '#6d28d9',
              '&:hover': { bgcolor: '#5b21b6' },
              boxShadow: '0px 4px 12px rgba(109, 40, 217, 0.2)'
            }}
          >
            Nouveau Cours
          </ActionButton>
          <Button
  variant="contained"
  color="error"
  disabled={selected.length === 0}
  onClick={handleDeleteSelected} // <--- Vérifiez que la fonction est bien appelée ici
  startIcon={<Delete />}
>
  Supprimer sélection
</Button>
        </div>
        <div className="flex items-center space-x-4">
     
</div>


        

        {/* Search Bar */}
        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
              className: 'bg-white rounded-lg',
              sx: { borderRadius: '12px' }
            }}
          />
        </div>
         
        {/* Cours Table */}
        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)', overflowX: 'auto' }}>
  <Table>
    {/* En-tête du tableau */}
    <TableHead>
      <TableRow>
      <HeaderCell>
      <Checkbox
  indeterminate={selected.length > 0 && selected.length < cours.length} // Sélection partielle
  checked={selected.length === cours.length && cours.length > 0} // Sélection totale
  onChange={handleSelectAll}
/>

</HeaderCell>

        <HeaderCell>Image</HeaderCell> 
        <HeaderCell>Titre</HeaderCell>
     
      
        <HeaderCell>Liste Quizzs</HeaderCell>
    
        <HeaderCell align="center">Actions</HeaderCell>
      </TableRow>
    </TableHead>
    
    {/* Corps du tableau */}
    <TableBody>
    {filteredCours
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((c) => (
      <TableRow key={c.id} className="hover:bg-gray-50 transition-colors">
        {/* Colonne Checkbox */}
        <TableCell>
          <Checkbox
            checked={selected.includes(c.id)}
            onChange={() => handleSelect(c.id)}
          />
        </TableCell>

        {/* Colonne Image */}
        <TableCell>
          {typeof c.logo === 'string' && (
            <img
              src={c.logo}
              alt="Course"
              className="w-16 h-16 rounded-xl object-cover"
            />
          )}
        </TableCell>

        {/* Autres colonnes */}
        <TableCell className="text-gray-600 line-clamp-2">{c.title}</TableCell>
       

       
<TableCell>
  <IconButton
    onClick={() => navigate(`/cours/${c.id}/Quizz`)}
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

              


     
        <TableCell align="center">
  <div className="flex justify-center space-x-3">
    <IconButton
      onClick={() => handleOpenCoursDialog(c)}
      className="text-purple-600 hover:bg-purple-50"
    >
      <Edit fontSize="small"  color="primary"/>
    </IconButton>

    {/* Bouton de suppression */}
    <IconButton
      onClick={() => handleDeleteCours(c.id)} // Passer l'ID du cours
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

  {/* Pagination */}
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


        {/* Course Dialog */}
          <Dialog open={openCoursDialog} onClose={() => setOpenCoursDialog(false)}>
             <DialogTitle>{currentCours?.id ? "Modifier un Cours" : "Ajouter un Cours"}</DialogTitle>
               <DialogContent>
                 <TextField
                   label="title"
                   fullWidth
                   value={currentCours?.title}
                   onChange={(e) => setCurrentCours({ ...currentCours, title: e.target.value })}
                   margin="normal"
                 />
                 <TextField
                   label="description"
                   fullWidth
                   value={currentCours?.description}
                   onChange={(e) => setCurrentCours({ ...currentCours, description: e.target.value })}
                   margin="normal"
                 />
               
                 <TextField
                   label="logo"
                   fullWidth
                   value={currentCours?.logo}
                   onChange={(e) => setCurrentCours({ ...currentCours, logo: e.target.value })}
                   margin="normal"
                 />
             
                 <TextField
                   label="Grade (ID)"
                   fullWidth
                   type="number"
                   value={currentCours?.grades}
                   onChange={(e) => setCurrentCours({ ...currentCours, grades: +e.target.value })}
                   margin="normal"
                 />
               </DialogContent>
               <DialogActions>
                 <Button onClick={() => setOpenCoursDialog(false)} color="primary">
                   Annuler
                 </Button>
                   <Button
                      onClick={handleSaveCours} // Appel de la même fonction pour l'ajout et la modification
                      color="primary"
                    >
                      {currentCours?.id ? "Modifier" : "Enregistrer"}
                   
                    </Button>
               </DialogActions>
             </Dialog>
      </div>
    
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

export default ListCours;


