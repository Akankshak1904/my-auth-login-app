import { Container, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <Container sx={{ mt: 6 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', p: 4, background: '#f2f4f6', borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to MiNi
          </Typography>
          <Typography variant="body1">
            Secure sign in with Google or Outlook. Only Admin can see login history.
          </Typography>
        </Box>
      </motion.div>
    </Container>
  );
}

