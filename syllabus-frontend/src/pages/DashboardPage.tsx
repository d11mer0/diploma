import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardActionArea, CircularProgress, Alert, Box, Button, Pagination } from '@mui/material';
import Grid from '@mui/material/Grid2'; // ВИПРАВЛЕНО
import AppNavbar from '../components/AppNavbar';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import UploadModal from '../components/UploadModal';

interface Syllabus {
  id: string;
  title: string;
  uploadedAt: string;
}

interface DashboardPageProps {
  onLogout: () => void;
  userRole: string | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, userRole }) => {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 6;

  const navigate = useNavigate();

  const fetchSyllabi = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/syllabus?page=${currentPage}&limit=${limit}`);
      setSyllabi(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      setError('Не вдалося завантажити список силабусів.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabi(page);
  }, [page]);

  const handleCardClick = (id: string) => {
    navigate(`/syllabus/${id}`);
  };

  const handleUploadSuccess = () => {
    setIsModalOpen(false);
    if (page === 1) {
      fetchSyllabi(1);
    } else {
      setPage(1);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <>
      <AppNavbar title="Особистий кабінет" onLogout={onLogout} userRole={userRole} />
      <Container sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ваші силабуси
          </Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>
            Додати новий
          </Button>
        </Box>

        {loading && <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {syllabi.length > 0 ? (
                syllabi.map((syllabus) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={syllabus.id}>
                    <Card>
                      <CardActionArea onClick={() => handleCardClick(syllabus.id)}>
                        <CardContent>
                          <Typography gutterBottom variant="h6" component="div" noWrap>
                            {syllabus.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Завантажено: {new Date(syllabus.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography sx={{ ml: 2, width: '100%' }}>У вас ще немає проаналізованих документів.</Typography>
              )}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
      <UploadModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess} 
      />
    </>
  );
};

export default DashboardPage;
