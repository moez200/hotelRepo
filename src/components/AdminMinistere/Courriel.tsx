import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  Button,
  TextField,
  Paper,
  Grid,
} from "@mui/material";
import { AttachFile, Send, Delete } from "@mui/icons-material";

const Courriel = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <Paper
        sx={{
          padding: "24px",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Titre */}
        <Typography variant="h5" sx={{ color: "#333333", marginBottom: "16px" }}>
          Courriel
        </Typography>

        {/* Description principale */}
        <Box sx={{ marginBottom: "24px" }}>
          <Typography variant="subtitle1" sx={{ color: "#555555" }}>
            Main description
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Checkbox sx={{ color: "#4caf50" }} />
            <Typography variant="body1" sx={{ color: "#555555" }}>
              Envoyé
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Checkbox sx={{ color: "#f44336" }} />
            <Typography variant="body1" sx={{ color: "#555555" }}>
              Corbeille
            </Typography>
          </Box>
        </Box>

        {/* Dictionnaires */}
        <Box sx={{ marginBottom: "24px" }}>
          <Typography variant="subtitle1" sx={{ color: "#555555" }}>
            Dictionnaires *
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Checkbox sx={{ color: "#2196f3" }} />
            <Typography variant="body1" sx={{ color: "#555555" }}>
              Errodi
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Checkbox sx={{ color: "#2196f3" }} />
            <Typography variant="body1" sx={{ color: "#555555" }}>
              Sujet**
            </Typography>
          </Box>
        </Box>

        {/* Pièce jointe */}
        <Box sx={{ marginBottom: "24px" }}>
          <Typography variant="subtitle1" sx={{ color: "#555555" }}>
            Pièce jointe
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFile />}
            sx={{
              color: "#2196f3",
              borderColor: "#2196f3",
              "&:hover": { borderColor: "#1976d2" },
            }}
          >
            Choisir un fichier
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          <Typography variant="body2" sx={{ color: "#777777", marginTop: "8px" }}>
            {file ? file.name : "Aucun fichier choisi"}
          </Typography>
        </Box>

        {/* Message */}
        <Box sx={{ marginBottom: "24px" }}>
          <Typography variant="subtitle1" sx={{ color: "#555555" }}>
            Message *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Écrivez votre message ici..."
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                borderColor: "#cccccc",
              },
            }}
          />
        </Box>

        {/* Boutons d'action */}
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Send />}
              sx={{
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#388e3c" },
              }}
            >
              Envoyer
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Delete />}
              sx={{
                backgroundColor: "#f44336",
                "&:hover": { backgroundColor: "#d32f2f" },
              }}
            >
              Annuler
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Courriel;