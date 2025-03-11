import { useState, useEffect, SetStateAction } from "react";
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
  Button,
  Checkbox
} from '@mui/material';
import { Check, X, Trash2, Edit, Search, Delete } from 'lucide-react';
import { styled } from '@mui/system';
import { fetchUsers, approveUser, rejectUser, deleteUser } from "../../services/users.services";
import { User } from "../../types/auth";

const StyledTableContainer = styled(TableContainer)(({ }) => ({
  borderRadius: '12px',
  boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  overflowX: 'auto',
  '& .MuiTableCell-root': {
    padding: '16px 24px',
  },
}));

const HeaderCell = styled(TableCell)(({ }) => ({
  fontWeight: 600,
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  borderBottom: '2px solid #e2e8f0',
}));

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    fetchUsersData();
  }, [currentPage]);

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const response = await fetchUsers(currentPage);
      console.log("Full API Response:", response); // Log pour observer la structure
      if (Array.isArray(response)) { // Vérifier si la réponse est un tableau
        setUsers(response); // Assigner directement le tableau d'utilisateurs
        setTotalPages(Math.ceil(response.length / rowsPerPage)); // Calculer le nombre total de pages
      } else {
        console.error("Unexpected API response structure:", response);
        setUsers([]); // Si la réponse n'est pas un tableau, définir les utilisateurs comme vide
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // En cas d'erreur, définir les utilisateurs comme vide
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleApprove = async (id: number) => {
    try {
      // Faire l'appel API pour approuver l'utilisateur
      await approveUser(id);
  
      // Mettre à jour l'état local de l'utilisateur en approuvé
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, is_approved: true } : user // Passer l'état à 'approuvé'
        )
      );
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      // Faire l'appel API pour rejeter l'utilisateur
      await rejectUser(id);
  
      // Mettre à jour l'état local de l'utilisateur en rejeté
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, is_approved: false } : user // Passer l'état à 'rejeté'
        )
      );
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };
  
  

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      fetchUsersData();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleChangePage = (event: any, newPage: number) => {
    setCurrentPage(newPage + 1); // MUI paginates from 0
  };

  const handleSearchChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSearchTerm(e.target.value);
  };

  
  const filteredUsers = (searchTerm.trim() === '' ? users : users.filter(user =>
    [user.first_name, user.last_name, user.email].some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )) || []; // Fallback to an empty array if undefined

  console.log("Filtered users:", filteredUsers); // Debugging filtered users

  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Loader here */}
      </div>
    );
  }

  const handleDeleteSelected = async () => {
    if (confirm(`Supprimer ${selected.length} cours sélectionnés ?`)) {
      try {
        await Promise.all(selected.map(id => deleteUser(id)));
        setSelected([]);
        fetchUsersData();
        alert(`${selected.length} cours supprimés avec succès !`);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Sélectionne tous les cours s'ils ne sont pas déjà sélectionnés
      setSelected(users.map(c => c.id ?? 0)); // Assure que c.id est toujours un nombre
    } else {
      // Désélectionne tous les cours
      setSelected([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen  margin-top">
            <div className="w-full flex flex-col">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
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

        <div className="mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={handleSearchChange}
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

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                 <HeaderCell>
                      <Checkbox
                  indeterminate={selected.length > 0 && selected.length < users.length} // Sélection partielle
                  checked={selected.length === users.length && users.length > 0} // Sélection totale
                  onChange={handleSelectAll}
                />
                
                </HeaderCell>
                <HeaderCell>Matricule</HeaderCell>
                <HeaderCell>Nom Complet</HeaderCell>
                <HeaderCell>Courriel</HeaderCell>
                <HeaderCell>Genre</HeaderCell>
                <HeaderCell>Entreprise</HeaderCell>
                <HeaderCell>Num Tel</HeaderCell>
                <HeaderCell>Date Naissance</HeaderCell>
                <HeaderCell>Opération</HeaderCell>
                <HeaderCell>État</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              
            {filteredUsers
  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  .map((user) => (
    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
      <TableCell>
          <Checkbox
            checked={selected.includes(user.id)}
            onChange={() => handleSelect(user.id)}
          />
        </TableCell>
                    <TableCell>{user.cin}</TableCell>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.company_id || '-'}</TableCell>
                    <TableCell>{user.phone_number || '-'}</TableCell>
                    <TableCell>{user.dob}</TableCell>
                    <TableCell className="flex space-x-2">
    {user.is_approved ? (
      <IconButton onClick={() => handleReject(user.id)} className="text-red-600 hover:bg-red-50">
        <X size={16} className="text-red-600" /> 
      </IconButton>
    ) : (
      <IconButton onClick={() => handleApprove(user.id)} className="text-green-600 hover:bg-green-50">
       <Check size={16} className="text-green-600" />
      </IconButton>
    )}
  </TableCell>


                    <TableCell>{user.is_approved ? 'Approuvé' : 'En attente'}</TableCell>
                    <TableCell className="flex space-x-2">
                     
                        <IconButton 
    onClick={() => console.log("Edit user", user.id)}
    className="text-blue-600 hover:bg-blue-50"
  >
    <Edit fontSize="small" className="text-blue-600" />  {/* Edit icon in blue */}
  </IconButton>
  <IconButton 
    onClick={() => handleDelete(user.id)}
    className="text-red-600 hover:bg-red-50"
  >
    <Trash2 size={16} className="text-red-600" />  {/* Trash icon in red */}
  </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
  rowsPerPageOptions={[5, 10, 25]}
  component="div"
  count={filteredUsers.length} // Total number of filtered users
  rowsPerPage={5}
  page={currentPage - 1}
  onPageChange={handleChangePage}
  onRowsPerPageChange={(e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page when changing rows per page
  }}
/>



        </StyledTableContainer>
      </div>
    </div>
  );
};

export default Users;
