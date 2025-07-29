// src/components/ActiveUsers.js
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const logsRef = collection(db, 'loginLogs');

    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
      const now = Date.now();
      const activeSet = new Set();

      snapshot.forEach(doc => {
        const log = doc.data();
        if (log.type === 'login' && log.timestamp) {
          const logDate = log.timestamp.toDate();
          if ((now - logDate.getTime()) < 5 * 60 * 1000) {
            activeSet.add(log.uid);
          }
        }
      });

      setActiveUsers(activeSet.size);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h3>Active Users (Last 5 mins): {activeUsers}</h3>
    </div>
  );
}
