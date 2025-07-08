// src/pages/info.js
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';

export default function Info() {
  const [logs, setLogs] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(
        collection(db, 'loginLogs'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const logData = snapshot.docs.map((doc) => doc.data());
      setLogs(logData);
    };

    fetchLogs();
  }, []);

  const adminEmails = [
    'akankshakadam.k@gmail.com',
    'sgundavade@gmail.com',
  ];
  
  if (userEmail && !adminEmails.includes(userEmail)) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h6" color="error" align="center">
          🚫 You do not have permission to view this page.
        </Typography>
      </Container>
    );
  }
  

  return (
    <Container sx={{ mt: 5 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h5" sx={{ mb: 3 }} textAlign="center">
          Login & Logout Logs
        </Typography>

        {logs.length === 0 && (
          <Typography>No login/logout history found.</Typography>
        )}

        {logs.map((log, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography><strong>{log.type?.toUpperCase()}</strong></Typography>
                <Typography><strong>Name:</strong> {log.name || '(No Name)'}</Typography>
                <Typography><strong>Email:</strong> {log.email}</Typography>
                <Typography><strong>Provider:</strong> {log.provider}</Typography>
              </Box>
              <Box>
                <Avatar
                  sx={{ bgcolor: log.type === 'login' ? 'green' : 'red' }}
                >
                  {log.type?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption">
              <strong>Time:</strong>{' '}
              {log.timestamp?.toDate
                ? log.timestamp.toDate().toLocaleString()
                : 'Time not available'}
            </Typography>
          </Paper>
        ))}
      </motion.div>
    </Container>
  );
}
