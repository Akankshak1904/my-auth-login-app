import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase';
import { Typography, Container, CircularProgress } from '@mui/material';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ActiveUsers from '../components/ActiveUsers';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dailyArray, setDailyArray] = useState([]);
  const [weeklyArray, setWeeklyArray] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.email !== "akankshakadam.k@gmail.com") return;

    const logsRef = collection(db, 'loginLogs');

    const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
      const rawData = [];
      snapshot.forEach((doc) => rawData.push(doc.data()));

      const dailyCount = {};
      const weeklyCount = {};

      rawData.forEach(log => {
        if (!log.timestamp) return;

        const logDate = log.timestamp.toDate();
        const logDay = logDate.toISOString().split('T')[0];
        const weekStart = new Date(logDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        dailyCount[logDay] = (dailyCount[logDay] || 0) + 1;
        weeklyCount[weekKey] = (weeklyCount[weekKey] || 0) + 1;
      });

      const dailyArrayFormatted = Object.entries(dailyCount).map(([date, count]) => ({ date, count }));
      const weeklyArrayFormatted = Object.entries(weeklyCount).map(([week, count]) => ({ week, count }));

      setDailyArray(dailyArrayFormatted);
      setWeeklyArray(weeklyArrayFormatted);
    });

    return () => unsubscribeLogs();
  }, [user]);

  if (loading) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (user.email !== "akankshakadam.k@gmail.com") {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h5">Access Denied: Admins Only</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body1">Logged in as: {user.email}</Typography>
      
      <ActiveUsers />
      <BarChart data={dailyArray} />
      <LineChart data={weeklyArray} />
    </Container>
  );
}
