import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  TablePagination, 
  TextField, 
  InputAdornment, 
  Chip, 
  Button 
} from '@mui/material';
import { Search, Eye, Clock } from 'lucide-react';
import { styled } from '@mui/system';

// Mock API service (replace with your actual service)

import { getConsultedCourses } from '../../services/Auth';
import { ConsultedCourse } from '../../types/auth';



// Styled Components
const StyledTableContainer = styled(TableContainer)({
  borderRadius: '12px',
  boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  overflowX: 'auto',
  '& .MuiTableCell-root': {
    padding: '16px 24px',
  },
});

const HeaderCell = styled(TableCell)({
  fontWeight: 600,
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  borderBottom: '2px solid #e2e8f0',
});

const StatusChip = styled(Chip)({
  fontSize: '0.75rem',
  height: '24px',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
});

const ConsultedCourses = () => {
  const [courses, setCourses] = useState<ConsultedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5); // Fixed rows per page, can be made dynamic
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  // Fetch consulted courses on mount
  useEffect(() => {
    const fetchConsultedCourses = async () => {
      try {
        setLoading(true);
        const response = await getConsultedCourses(); // Replace with your API call
        if (Array.isArray(response)) {
          setCourses(response);
          setTotalPages(Math.ceil(response.length / rowsPerPage));
        } else {
          console.error('Unexpected API response:', response);
          setCourses([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching consulted courses:', error);
        setCourses([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultedCourses();
  }, []);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1); // MUI pagination starts at 0
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) =>
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.chapter_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  
  );

  // Handle viewing course details (placeholder)
  const handleViewCourse = (id: number) => {
    console.log(`Viewing course with id: ${id}`);
    // Add navigation or modal logic here
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Cours Consultés</h1>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#6d28d9',
              '&:hover': { bgcolor: '#5b21b6' },
              boxShadow: '0px 4px 12px rgba(109, 40, 217, 0.2)',
            }}
          >
            Exporter en PDF
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" size={20} />
                </InputAdornment>
              ),
              className: 'bg-white rounded-lg',
            }}
            sx={{ maxWidth: '500px' }}
          />
        </div>

        {/* Table */}
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell>Nom du Cours</HeaderCell>
                <HeaderCell>Chapitre</HeaderCell>
                <HeaderCell>Date Consultée</HeaderCell>
                <HeaderCell>Durée (min)</HeaderCell>
                <HeaderCell>Statut</HeaderCell>
                <HeaderCell>Score</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                .map((course) => (
                  <TableRow key={`${course.course_id}-${course.type}-${course.date_consulted}`} className="hover:bg-gray-50 transition-colors">
                    <TableCell>{course.course_name}</TableCell>
                    <TableCell>{course.chapter_name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(course.date_consulted).toLocaleString('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-500" />
                        {course.duration || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={course.status === 'Completed' ? 'Terminé' : course.status}
                        sx={{
                          bgcolor: course.status === 'Completed' ? '#d1fae5' : '#fef3c7',
                          color: course.status === 'Completed' ? '#059669' : '#d97706',
                        }}
                      />
                    </TableCell>
                    <TableCell>{course.score.toFixed(1)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewCourse(course.course_id)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={filteredCourses.length}
            rowsPerPage={rowsPerPage}
            page={currentPage - 1}
            onPageChange={handleChangePage}
            labelRowsPerPage="Lignes par page :"
          />
        </StyledTableContainer>
      </div>
    </div>
  );
};

export default ConsultedCourses;