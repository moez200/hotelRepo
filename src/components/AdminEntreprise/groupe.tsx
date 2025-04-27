import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Box,
  List,
  ListItem,
  ListItemText as MuiListItemText,
  IconButton as MuiIconButton,
} from '@mui/material';
import { Edit, Delete, Search, Add, ArrowForward, ArrowBack, PersonAdd } from '@mui/icons-material';
import { styled } from '@mui/system';
import { FaUserFriends } from 'react-icons/fa';
import { getAuthStore } from '../../store/auth';
import axios from 'axios';
import { api } from '../../services/api';

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

interface Permission {
  id: number;
  codename: string;
  name: string;
}

interface Groupe {
  id: number;
  name: string;
  permissions: string[];
  member_count: number; // New field
}

type GroupInputType = {
  name: string;
  permissions: string[];
};

const API_URL = 'http://127.0.0.1:8000/users/groups/';
const PERMISSIONS_API_URL = 'http://127.0.0.1:8000/users/permissions/';
const ADD_USER_TO_GROUP_API_URL = 'http://127.0.0.1:8000/users/groups/';

const GestionGroupesE = () => {
  const [groups, setGroups] = useState<Groupe[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Groupe | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [filteredAvailablePermissions, setFilteredAvailablePermissions] = useState<Permission[]>([]);
  const [chosenPermissions, setChosenPermissions] = useState<string[]>([]);
  const [filteredChosenPermissions, setFilteredChosenPermissions] = useState<string[]>([]);
  const [availableFilter, setAvailableFilter] = useState('');
  const [chosenFilter, setChosenFilter] = useState('');
  const [newGroup, setNewGroup] = useState<GroupInputType>({
    name: '',
    permissions: [],
  });
  const [editGroup, setEditGroup] = useState<Groupe | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);
  const [addUserGroupId, setAddUserGroupId] = useState<number | null>(null);
  const [firstNameToAdd, setFirstNameToAdd] = useState('');
  const [lastNameToAdd, setLastNameToAdd] = useState('');
  const accessToken = getAuthStore((state) => state.accessToken);

  // Configuration des headers pour toutes les requêtes
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  // Récupérer les groupes
  const fetchGroups = async () => {
    try {
      const response = await api.get<Groupe[]>(API_URL, axiosConfig);
      setGroups(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des groupes');
    }
  };

  // Récupérer toutes les permissions disponibles
  const fetchPermissions = async () => {
    try {
      const response = await api.get<Permission[]>(PERMISSIONS_API_URL, axiosConfig);
      setAvailablePermissions(response.data);
      setFilteredAvailablePermissions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des permissions');
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchPermissions();
  }, [accessToken]);

  // Créer un groupe
  const createGroup = async (group: GroupInputType) => {
    try {
      const response = await axios.post<Groupe>(API_URL, group, axiosConfig);
      setGroups([...groups, { ...response.data, member_count: 0 }]); // New groups start with 0 members
      setMessage('Groupe créé avec succès !');
      setOpenCreateDialog(false);
      setNewGroup({ name: '', permissions: [] });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du groupe');
    }
  };

  // Mettre à jour les permissions d'un groupe
  const updateGroupPermissions = async (groupId: number, permissions: string[]) => {
    try {
      const response = await axios.patch(`${API_URL}${groupId}/permissions/`, { permissions }, axiosConfig);
      setGroups(groups.map((g) => (g.id === groupId ? response.data as Groupe : g)));
      setMessage('Permissions mises à jour avec succès !');
      setOpenPermissionsDialog(false);
      setSelectedGroup(null);
      setChosenPermissions([]);
      setFilteredChosenPermissions([]);
      setAvailableFilter('');
      setChosenFilter('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour des permissions');
    }
  };

  // Mettre à jour un groupe (nom uniquement)
  const updateGroup = async (id: number, group: Partial<GroupInputType>) => {
    try {
      const response = await axios.patch<Groupe>(`${API_URL}${id}/`, group, axiosConfig);
      setGroups(groups.map((g) => (g.id === id ? response.data as Groupe : g)));
      setMessage('Groupe modifié avec succès !');
      setOpenEditDialog(false);
      setEditGroup(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la modification du groupe');
    }
  };

  // Supprimer un groupe
  const deleteGroup = async (id: number) => {
    try {
      await axios.delete(`${API_URL}${id}/`, axiosConfig);
      setGroups(groups.filter((g) => g.id !== id));
      setMessage('Groupe supprimé avec succès !');
      setOpenDeleteDialog(false);
      setDeleteGroupId(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression du groupe');
    }
  };

  // Ajouter un utilisateur à un groupe
  const handleAddUserToGroup = async () => {
    if (!addUserGroupId || !firstNameToAdd.trim() || !lastNameToAdd.trim()) {
      setError('Les champs prénom et nom sont requis.');
      return;
    }
    try {
      const response = await axios.post<{ detail: string }>(
        `${ADD_USER_TO_GROUP_API_URL}${addUserGroupId}/add-user/`,
        {
          first_name: firstNameToAdd.trim(),
          last_name: lastNameToAdd.trim(),
        },
        axiosConfig
      );
      setMessage(response.data.detail);
      // Update member count for the group
      setGroups(groups.map((g) =>
        g.id === addUserGroupId ? { ...g, member_count: g.member_count + 1 } : g
      ));
      setOpenAddUserDialog(false);
      setAddUserGroupId(null);
      setFirstNameToAdd('');
      setLastNameToAdd('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de l'ajout de l'utilisateur au groupe";
      setError(errorMessage);
    }
  };

  // Filtrer les groupes dans la table
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer les permissions disponibles
  const handleAvailableFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setAvailableFilter(value);
    setFilteredAvailablePermissions(
      availablePermissions.filter(
        (perm) =>
          perm.name.toLowerCase().includes(value) || perm.codename.toLowerCase().includes(value)
      )
    );
  };

  // Filtrer les permissions choisies
  const handleChosenFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setChosenFilter(value);
    setFilteredChosenPermissions(
      chosenPermissions.filter((codename) => {
        const perm = availablePermissions.find((p) => p.codename === codename);
        return (
          perm &&
          (perm.name.toLowerCase().includes(value) || perm.codename.toLowerCase().includes(value))
        );
      })
    );
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      setError('Le nom du groupe est requis.');
      return;
    }
    createGroup(newGroup);
  };

  const handleEditGroup = () => {
    if (!editGroup || !editGroup.name.trim()) {
      setError('Le nom du groupe est requis.');
      return;
    }
    updateGroup(editGroup.id, { name: editGroup.name });
  };

  const handleDeleteGroup = () => {
    if (!deleteGroupId) return;
    deleteGroup(deleteGroupId);
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
    setFirstNameToAdd('');
    setLastNameToAdd('');
  };

  const openEditDialogForGroup = (group: Groupe) => {
    setEditGroup(group);
    setOpenEditDialog(true);
  };

  const openDeleteDialogForGroup = (id: number) => {
    setDeleteGroupId(id);
    setOpenDeleteDialog(true);
  };

  const openPermissionsDialogForGroup = (group: Groupe) => {
    setSelectedGroup(group);
    setChosenPermissions(group.permissions);
    setFilteredChosenPermissions(group.permissions);
    setFilteredAvailablePermissions(availablePermissions);
    setAvailableFilter('');
    setChosenFilter('');
    setOpenPermissionsDialog(true);
  };

  const openAddUserDialogForGroup = (id: number) => {
    setAddUserGroupId(id);
    setOpenAddUserDialog(true);
  };

  const addPermission = (codename: string) => {
    if (!chosenPermissions.includes(codename)) {
      const newChosen = [...chosenPermissions, codename];
      setChosenPermissions(newChosen);
      setFilteredChosenPermissions(newChosen.filter((c) => {
        const perm = availablePermissions.find((p) => p.codename === c);
        return (
          perm &&
          (perm.name.toLowerCase().includes(chosenFilter) || perm.codename.toLowerCase().includes(chosenFilter))
        );
      }));
    }
  };

  const removePermission = (codename: string) => {
    const newChosen = chosenPermissions.filter((perm) => perm !== codename);
    setChosenPermissions(newChosen);
    setFilteredChosenPermissions(newChosen.filter((c) => {
      const perm = availablePermissions.find((p) => p.codename === c);
      return (
        perm &&
        (perm.name.toLowerCase().includes(chosenFilter) || perm.codename.toLowerCase().includes(chosenFilter))
      );
    }));
  };

  const chooseAllPermissions = () => {
    const allPermissions = availablePermissions.map((perm) => perm.codename);
    setChosenPermissions(allPermissions);
    setFilteredChosenPermissions(allPermissions.filter((c) => {
      const perm = availablePermissions.find((p) => p.codename === c);
      return (
        perm &&
        (perm.name.toLowerCase().includes(chosenFilter) || perm.codename.toLowerCase().includes(chosenFilter))
      );
    }));
  };

  const removeAllPermissions = () => {
    setChosenPermissions([]);
    setFilteredChosenPermissions([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mr-12">
      <div className="w-full flex flex-col mr-64">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FaUserFriends className="text-4xl text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Groupes</h1>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Créer Groupe
          </Button>
        </div>

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

        <StyledTableContainer as={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell>ID</HeaderCell>
                <HeaderCell>Nom</HeaderCell>
                <HeaderCell>Permissions</HeaderCell>
                <HeaderCell>Nombre de membres</HeaderCell> {/* New column */}
                <HeaderCell>Actions</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((group) => (
                <TableRow key={group.id} hover>
                  <TableCell>{group.id}</TableCell>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell
                    onClick={() => openPermissionsDialogForGroup(group)}
                    style={{ cursor: 'pointer', color: '#1976d2' }}
                  >
                    {group.permissions.join(', ') || 'Aucune'}
                  </TableCell>
                  <TableCell>{group.member_count}</TableCell> {/* Display member count */}
                  <TableCell>
                    <div className="flex space-x-2">
                      <IconButton
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => openEditDialogForGroup(group)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => openDeleteDialogForGroup(group.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <IconButton
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => openAddUserDialogForGroup(group.id)}
                      >
                        <PersonAdd fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredGroups.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </StyledTableContainer>

        {/* Dialog pour créer un groupe */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
          <DialogTitle>Créer un nouveau groupe</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nom du groupe"
              fullWidth
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              error={!newGroup.name.trim()}
              helperText={!newGroup.name.trim() ? 'Ce champ est requis' : ''}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={newGroup.permissions}
                onChange={(e) => setNewGroup({ ...newGroup, permissions: e.target.value as string[] })}
                renderValue={(selected) =>
                  selected
                    .map((codename) => availablePermissions.find((p) => p.codename === codename)?.name)
                    .filter(Boolean)
                    .join(', ')
                }
              >
                {availablePermissions.map((perm) => (
                  <MenuItem key={perm.codename} value={perm.codename}>
                    <Checkbox checked={newGroup.permissions.includes(perm.codename)} />
                    <ListItemText primary={perm.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)} color="secondary">
              Annuler
            </Button>
            <Button onClick={handleCreateGroup} color="primary" disabled={!newGroup.name.trim()}>
              Créer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog pour modifier un groupe */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Modifier le groupe</DialogTitle>
          <DialogContent>
            {editGroup && (
              <TextField
                autoFocus
                margin="dense"
                label="Nom du groupe"
                fullWidth
                value={editGroup.name}
                onChange={(e) => setEditGroup({ ...editGroup, name: e.target.value })}
                error={!editGroup.name.trim()}
                helperText={!editGroup.name.trim() ? 'Ce champ est requis' : ''}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} color="secondary">
              Annuler
            </Button>
            <Button
              onClick={handleEditGroup}
              color="primary"
              disabled={!editGroup || !editGroup.name.trim()}
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog pour gérer les permissions */}
        <Dialog open={openPermissionsDialog} onClose={() => setOpenPermissionsDialog(false)} maxWidth="md">
          <DialogTitle>Gérer les permissions du groupe {selectedGroup?.name}</DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="space-between" gap={2}>
              {/* Available permissions */}
              <Box flex={1} border={1} borderColor="grey.300" p={2}>
                <MuiListItemText primary="Available permissions" primaryTypographyProps={{ fontWeight: 'bold' }} />
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Filter"
                  size="small"
                  margin="dense"
                  value={availableFilter}
                  onChange={handleAvailableFilterChange}
                />
                <List dense style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {filteredAvailablePermissions.map((perm) => (
                    <ListItem
                      key={perm.codename}
                      secondaryAction={
                        <MuiIconButton edge="end" onClick={() => addPermission(perm.codename)}>
                          <ArrowForward />
                        </MuiIconButton>
                      }
                    >
                      <MuiListItemText primary={perm.name} />
                    </ListItem>
                  ))}
                </List>
                <Button onClick={chooseAllPermissions} color="primary" size="small">
                  Choose all
                </Button>
              </Box>

              {/* Chosen permissions */}
              <Box flex={1} border={1} borderColor="grey.300" p={2}>
                <MuiListItemText primary="Chosen permissions" primaryTypographyProps={{ fontWeight: 'bold' }} />
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Filter"
                  size="small"
                  margin="dense"
                  value={chosenFilter}
                  onChange={handleChosenFilterChange}
                />
                <List dense style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {filteredChosenPermissions.map((codename) => {
                    const perm = availablePermissions.find((p) => p.codename === codename);
                    return (
                      <ListItem
                        key={codename}
                        secondaryAction={
                          <MuiIconButton edge="end" onClick={() => removePermission(codename)}>
                            <ArrowBack />
                          </MuiIconButton>
                        }
                      >
                        <MuiListItemText primary={perm?.name || codename} />
                      </ListItem>
                    );
                  })}
                </List>
                <Button onClick={removeAllPermissions} color="secondary" size="small">
                  Remove all
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPermissionsDialog(false)} color="secondary">
              Annuler
            </Button>
            <Button
              onClick={() => selectedGroup && updateGroupPermissions(selectedGroup.id, chosenPermissions)}
              color="primary"
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog pour ajouter un utilisateur */}
        <Dialog open={openAddUserDialog} onClose={handleCloseAddUserDialog}>
          <DialogTitle>Ajouter un utilisateur au groupe</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Prénom"
              fullWidth
              value={firstNameToAdd}
              onChange={(e) => setFirstNameToAdd(e.target.value)}
              error={!firstNameToAdd.trim()}
              helperText={!firstNameToAdd.trim() ? 'Ce champ est requis' : ''}
            />
            <TextField
              margin="dense"
              label="Nom"
              fullWidth
              value={lastNameToAdd}
              onChange={(e) => setLastNameToAdd(e.target.value)}
              error={!lastNameToAdd.trim()}
              helperText={!lastNameToAdd.trim() ? 'Ce champ est requis' : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddUserDialog} color="secondary">
              Annuler
            </Button>
            <Button
              onClick={handleAddUserToGroup}
              color="primary"
              variant="contained"
              disabled={!firstNameToAdd.trim() || !lastNameToAdd.trim()}
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog pour confirmer la suppression */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
              Annuler
            </Button>
            <Button onClick={handleDeleteGroup} color="error">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
          <Alert onClose={() => setMessage('')} severity="success">
            {message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default GestionGroupesE;