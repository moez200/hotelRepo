import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,

  TextField,
 
  TablePagination,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Add, Search, Article, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { CourType, GradeType } from "../../types/auth";
import { CoursService } from "../../services/cours.service";






const CoursA = () => {

 
  const [cours, setCours] = useState<CourType[]>([]);
  const [grades, setGrades] = useState<GradeType[]>([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

 
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

    loadCours();
   
  }, []);




  const filteredCours = cours.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

 




   


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full flex flex-col">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Article className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">List des cours</h1>
          </div>
       
       
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

        {/* Cours Cards */}
        <Grid container spacing={4}>
          {filteredCours
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((c) => (
              <Grid item key={c.id} xs={12} sm={6} md={4} lg={3}>
<Card 
  sx={{ borderRadius: '16px', boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)', cursor: 'pointer' }} 
  onClick={() => navigate(`/course/${c.id}/`)}
>                  <CardMedia
                    component="img"
                    height="140"
                    image={c.logo}
                    alt={c.title}
                    sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {c.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {c.description}
                    </Typography>
                    
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>

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
      </div>

     

    </div>
  );
};

export default CoursA;