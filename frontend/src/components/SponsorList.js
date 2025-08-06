import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Alert,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Box,
} from "@mui/material";
import { sponsorService } from "../services/api";
import { motion } from "framer-motion";

const SponsorList = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSponsors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sponsorService.getAll(auctionId);
      setSponsors(data);
    } catch (err) {
      setError("Failed to load sponsors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadSponsors();
  }, [auctionId, loadSponsors]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      try {
        await sponsorService.delete(auctionId, id);
        loadSponsors();
      } catch (err) {
        setError("Failed to delete sponsor");
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const tableVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring" },
    },
  };

  return (
    <Container maxWidth="md">
      <motion.div initial="hidden" animate="visible" variants={tableVariants}>
        <Paper
          elevation={0}
          sx={{ p: 4, mt: 4, bgcolor: "background.paper", borderRadius: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Sponsors
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/auctions/${auctionId}/sponsors/new`)}
            >
              Add Sponsor
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid #e0e0e0" }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="sponsors table">
              <TableHead sx={{ bgcolor: "primary.light" }}>
                <TableRow>
                  <TableCell
                    sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                  >
                    Logo
                  </TableCell>
                  <TableCell
                    sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                  >
                    Website
                  </TableCell>
                  <TableCell
                    sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sponsors.map((sponsor) => (
                  <TableRow
                    key={sponsor.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {sponsor.name}
                    </TableCell>
                    <TableCell>
                      {sponsor.logoUrl && (
                        <Avatar
                          src={sponsor.logoUrl}
                          alt={sponsor.name}
                          sx={{ width: 50, height: 50 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {sponsor.website}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() =>
                          navigate(
                            `/auctions/${auctionId}/sponsors/${sponsor.id}/edit`
                          )
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(sponsor.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default SponsorList;
