import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentSuccess({ user, logout }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [courseId, setCourseId] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    } else {
      setStatus('failed');
      toast.error('No payment session found');
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    const maxAttempts = 5;
    let currentAttempt = 0;

    const pollStatus = async () => {
      try {
        currentAttempt++;
        setAttempts(currentAttempt);

        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        const paymentData = response.data;

        if (paymentData.payment_status === 'paid') {
          // Payment successful
          setStatus('success');
          const metadata = paymentData.metadata || {};
          setCourseId(metadata.course_id);
          toast.success('Payment successful! You are now enrolled in the course.');
          return true;
        } else if (paymentData.status === 'expired') {
          // Payment expired
          setStatus('failed');
          toast.error('Payment session expired');
          return true;
        } else if (currentAttempt >= maxAttempts) {
          // Max attempts reached
          setStatus('failed');
          toast.error('Unable to verify payment. Please contact support.');
          return true;
        }

        // Continue polling
        return false;
      } catch (error) {
        console.error('Payment check error:', error);
        if (currentAttempt >= maxAttempts) {
          setStatus('failed');
          toast.error('Payment verification failed');
          return true;
        }
        return false;
      }
    };

    // Start polling
    const poll = async () => {
      const done = await pollStatus();
      if (!done && currentAttempt < maxAttempts) {
        setTimeout(poll, 2000); // Poll every 2 seconds
      }
    };

    poll();
  };

  return (
    <div className="payment-success-page" data-testid="payment-success-page">
      <Navbar user={user} logout={logout} />
      
      <div className="payment-container">
        {status === 'checking' && (
          <div className="payment-status checking" data-testid="payment-checking">
            <Loader2 className="payment-icon spinning" size={80} />
            <h1>Verifying Payment...</h1>
            <p>Please wait while we confirm your payment (Attempt {attempts}/5)</p>
          </div>
        )}

        {status === 'success' && (
          <div className="payment-status success" data-testid="payment-success">
            <CheckCircle2 className="payment-icon" size={80} />
            <h1>Payment Successful!</h1>
            <p>Congratulations! You are now enrolled in the course.</p>
            <div className="payment-actions">
              <Button 
                data-testid="start-learning-btn"
                onClick={() => navigate(`/course/${courseId}/learn`)}
                size="lg"
              >
                Start Learning
              </Button>
              <Button 
                data-testid="view-dashboard-btn"
                onClick={() => navigate('/dashboard/student')}
                variant="outline"
                size="lg"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="payment-status failed" data-testid="payment-failed">
            <XCircle className="payment-icon" size={80} />
            <h1>Payment Verification Failed</h1>
            <p>We couldn't verify your payment. Please try again or contact support.</p>
            <div className="payment-actions">
              <Button 
                data-testid="back-to-courses-btn"
                onClick={() => navigate('/courses')}
                size="lg"
              >
                Back to Courses
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}