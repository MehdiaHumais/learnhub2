import React from 'react';
import Navbar from '@/components/Navbar';

export default function ProfilePage({ user, logout }) {
  return (
    <div data-testid="profile-page">
      <Navbar user={user} logout={logout} />
      <div className="dashboard-container">
        <h1>Profile</h1>
        <p>Profile management coming soon...</p>
      </div>
    </div>
  );
}