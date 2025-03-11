import React, { useState } from 'react';
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
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import { styled } from '@mui/system';
import { FaUserFriends } from 'react-icons/fa';

// Styles personnalisés
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

// Données fictives pour les groupes
const groupes = [
  {
    id: 1,
    nom: 'Équipe Marketing',
    description: 'Gestion des campagnes publicitaires',
    membres: 8,
    coursAssocies: 'Marketing Digital',
    dateCreation: '2023-01-15',
    etat: 'Actif',
  },
  {
    id: 2,
    nom: 'Projet Alpha',
    description: 'Développement logiciel',
    membres: 5,
    coursAssocies: 'Informatique',
    dateCreation: '2023-03-20',
    etat: 'Archivé',
  },
  // Ajoutez plus de groupes ici...
];

const GestionGroupes = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

  const filteredGroupes = groupes.filter((groupe) =>
    Object.values(groupe).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleChangePage = (event: any, newPage: React.SetStateAction<number>) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: { target: { value: string; }; }) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen  mr-12">
            <div className="w-full flex flex-col mr-64">
        <div className="mb-8 flex justify-between items-center">
           <div className="flex items-center space-x-4">
                             <FaUserFriends className="text-4xl text-purple-600" />
                               <h1 className="text-3xl font-bold text-gray-900">Gestion des Groupes</h1>
                             </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            + Créer Groupe
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un groupe..."
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
                <HeaderCell>ID</HeaderCell>
                <HeaderCell>Nom</HeaderCell>
                <HeaderCell>Description</HeaderCell>
                <HeaderCell>Membres</HeaderCell>
                <HeaderCell>Cours Associés</HeaderCell>
                <HeaderCell>Date de Création</HeaderCell>
                <HeaderCell>État</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredGroupes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((groupe) => (
                  <TableRow key={groupe.id} hover>
                    <TableCell>{groupe.id}</TableCell>
                    <TableCell className="font-medium">{groupe.nom}</TableCell>
                    <TableCell>{groupe.description}</TableCell>
                    <TableCell>{groupe.membres}</TableCell>
                    <TableCell>{groupe.coursAssocies}</TableCell>
                    <TableCell>{groupe.dateCreation}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-md text-sm ${
                          groupe.etat === 'Actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {groupe.etat}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <IconButton className="text-blue-600 hover:bg-blue-50">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton className="text-red-600 hover:bg-red-50">
                          <Delete fontSize="small" />
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
            count={filteredGroupes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </StyledTableContainer>
         <Snackbar
         open={!!error}
         autoHideDuration={6000}
         onClose={() => setError("")}
       >
         <Alert onClose={() => setError("")} severity="error">
           {error}
         </Alert>
       </Snackbar>   
       <Snackbar
         open={!!message}
         autoHideDuration={6000}
         onClose={() => setMessage("")}
       >
         <Alert onClose={() => setMessage("")} severity="success">
           {message}
         </Alert>
       </Snackbar>                          

                                   
      </div>
    </div>
  );
};

export default GestionGroupes;