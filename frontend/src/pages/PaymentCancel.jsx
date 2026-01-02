import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { XCircle } from 'lucide-react';

export default function PaymentCancel({ user, logout }) {
  const navigate = useNavigate();

  return (
    <div className="payment-cancel-page" data-testid="payment-cancel-page">
      <Navbar user={user} logout={logout} />
      
      <div className="payment-container">
        <div className="payment-status cancelled" data-testid="payment-cancelled">
          <XCircle className="payment-icon" size={80} />
          <h1>Payment Cancelled</h1>
          <p>You cancelled the payment process. No charges were made.</p>
          <div className="payment-actions">
            <Button 
              data-testid="back-to-courses-btn"
              onClick={() => navigate('/courses')}
              size="lg"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}