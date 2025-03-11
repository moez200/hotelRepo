import React, { useEffect, useState } from 'react';
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
import { FaTrophy } from 'react-icons/fa6';
import { createGrade, deleteGrade, getGrades, updateGrade } from '../../services/grade.service';
import {  GradeType } from '../../types/auth';


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





const GradesE = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
 const [grades, setGrades] = useState<GradeType[]>([]); 

  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
    const [currentGrade, setCurrentGrade] = useState<Partial<GradeType>>({
        name: '',
        description: ''
      });
      

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const data = await getGrades();
      setGrades(data);
    } catch (error) {
      console.error("Erreur lors du chargement des grades", error);
    }
    setLoading(false);
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredGrades = grades.filter(g=>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const handleOpenGradeDialog = (Grade?: GradeType) => {
      setCurrentGrade(Grade || { 
          
          name: "", 
          description: ""
       
        });
        setOpenGradeDialog(true);
      };
  
    
  

        return (
          <div className="p-6 bg-gray-50 min-h-screen ">
            <div className="w-full flex flex-col">
              <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <FaTrophy className="text-4xl text-purple-600" />
                  <h1 className="text-3xl font-bold text-gray-900">Gestion des Grades</h1>
                </div>
               
              </div>
        
              <div className="mb-6">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher un grade..."
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
        
              <StyledTableContainer sx={{ width: '100%' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <HeaderCell>Grade</HeaderCell>
                      <HeaderCell>Description</HeaderCell>
                    
                    </TableRow>
                  </TableHead>
        
                  <TableBody>
                    {filteredGrades
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((grade) => (
                        <TableRow
                          key={grade.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-semibold text-purple-600">
                            {grade.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {grade.description}
                          </TableCell>
                         
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
        
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredGrades.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  className="border-t border-gray-200"
                />
              </StyledTableContainer>
            </div>
        
          
        
            {/* Snackbar */}
            <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
              <Alert onClose={() => setMessage('')} severity="success">
                {message}
              </Alert>
            </Snackbar>
        
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
              <Alert onClose={() => setError('')} severity="error">
                {error}
              </Alert>
            </Snackbar>
          </div>
        );
};

export default GradesE;