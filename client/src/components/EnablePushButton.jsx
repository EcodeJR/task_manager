import React, { useState, useEffect } from 'react';
import { registerServiceWorkerAndSubscribe } from '../utils/push';
import { useAuth } from '../lib/auth-context';

// Set your VAPID public key in .env: REACT_APP_PUSH_PUBLIC_KEY=your-vapid-public-key
const VAPID_PUBLIC_KEY = process.env.REACT_APP_PUSH_PUBLIC_KEY;

export default function EnablePushPopup() {
  const [enabled, setEnabled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    console.log(isDark);
    if (isDark === true) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setShowPopup(false);
      setEnabled(false);
      return;
    }
    const isEnabled = localStorage.getItem(`pushEnabled_${user.id}`) === 'true';
    setEnabled(isEnabled);
    if (!isEnabled) {
      const lastShown = localStorage.getItem(`pushPromptLastShown_${user.id}`);
      const now = Date.now();
      if (!lastShown || now - parseInt(lastShown, 10) > 12 * 60 * 60 * 1000) {
        setShowPopup(true);
        localStorage.setItem(`pushPromptLastShown_${user.id}`, now.toString());
      }
    }
  }, [user]);

  const handleEnablePush = async () => {
    setLoading(true);
    setError(null);
    try {
      const subscription = await registerServiceWorkerAndSubscribe(VAPID_PUBLIC_KEY);
      await fetch('/api/users/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
        credentials: 'include'
      });
      if (user) {
        localStorage.setItem(`pushEnabled_${user.id}`, 'true');
        setEnabled(true);
      }
      setShowPopup(false);
    } catch (err) {
      if (window.Notification && Notification.permission === 'denied') {
        setError('You have blocked notifications for this site. Please enable notifications in your browser settings to use this feature.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    setShowPopup(false);
  };


  if (enabled || !showPopup) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center  bg-opacity-70 z-50 ${isDarkMode ? 'dark bg-black' : 'bg-black'}`}>
      <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full text-center ${isDarkMode ? 'dark bg-black' : 'bg-white'}`}>
        <h2 className={`text-lg font-bold mb-2 ${isDarkMode ? 'dark text-black' : 'text-black'}`}>Enable Push Notifications</h2>
        <p className={`mb-4 ${isDarkMode ? 'dark text-white' : 'text-black'}`}>Stay up to date with important notifications. Would you like to enable push notifications?</p>
        {error && <div className={`text-red-500 mb-2 ${isDarkMode ? 'dark' : ''}`}>{error}</div>}
        <div className={`flex gap-2 justify-center ${isDarkMode ? 'dark' : ''}`}>
          <button className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${isDarkMode ? 'dark' : ''}`} onClick={handleEnablePush} disabled={loading}>
            {loading ? 'Enabling...' : 'Enable'}
          </button>
          <button className={`px-4 py-2  rounded hover:bg-gray-400 ${isDarkMode ? 'dark bg-gray-600 text-white' : 'bg-gray-300 text-white'}`} onClick={handleClose} disabled={loading}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}
