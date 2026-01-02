import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import CertificateCard from '@/components/student/CertificateCard';
import { BookOpen, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StudentDashboard({ user, logout }) {
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, certificatesRes] = await Promise.all([
        axios.get(`${API}/enrollments/my-courses`),
        axios.get(`${API}/certificates/my-certificates`)
      ]);
      setEnrollments(enrollmentsRes.data);
      setCertificates(certificatesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeCourses = enrollments.filter(e => e.status === 'active');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  return (
    <div className="dashboard-page" data-testid="student-dashboard">
      <Navbar user={user} logout={logout} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 data-testid="dashboard-title">Welcome back, {user?.name}!</h1>
            <p>Continue your learning journey</p>
          </div>
          <Button 
            data-testid="browse-courses-btn"
            onClick={() => navigate('/courses')}
          >
            Browse Courses
          </Button>
        </div>

        {/* Stats */}
        <div className="dashboard-stats" data-testid="dashboard-stats">
          <div className="stat-card">
            <BookOpen className="stat-icon" />
            <div>
              <h3 data-testid="active-courses-count">{activeCourses.length}</h3>
              <p>Active Courses</p>
            </div>
          </div>
          <div className="stat-card">
            <Award className="stat-icon" />
            <div>
              <h3 data-testid="certificates-count">{certificates.length}</h3>
              <p>Certificates Earned</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp className="stat-icon" />
            <div>
              <h3 data-testid="completion-rate">{completedCourses.length}</h3>
              <p>Completed Courses</p>
            </div>
          </div>
        </div>

        {/* Course Tabs */}
        <Tabs defaultValue="active" className="dashboard-tabs">
          <TabsList>
            <TabsTrigger value="active" data-testid="active-tab">Active Courses</TabsTrigger>
            <TabsTrigger value="completed" data-testid="completed-tab">Completed</TabsTrigger>
            <TabsTrigger value="certificates" data-testid="certificates-tab">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="active" data-testid="active-courses">
            {loading ? (
              <div>Loading...</div>
            ) : activeCourses.length === 0 ? (
              <div className="empty-state" data-testid="no-active-courses">
                <p>No active courses yet</p>
                <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
              </div>
            ) : (
              <div className="courses-list">
                {activeCourses.map((enrollment) => (
                  <div key={enrollment.id} className="enrollment-card" data-testid={`enrollment-${enrollment.id}`}>
                    <div className="enrollment-thumbnail">
                      <img src={enrollment.course?.thumbnail || '/placeholder-course.png'} alt={enrollment.course?.title} />
                    </div>
                    <div className="enrollment-content">
                      <h3>{enrollment.course?.title}</h3>
                      <p>{enrollment.course?.description?.substring(0, 100)}...</p>
                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span data-testid={`progress-${enrollment.id}`}>{Math.round(enrollment.progress)}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="mt-2" />
                      </div>
                      <Button 
                        data-testid={`continue-learning-${enrollment.id}`}
                        onClick={() => navigate(`/course/${enrollment.course_id}/learn`)}
                        className="mt-4"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" data-testid="completed-courses">
            {completedCourses.length === 0 ? (
              <div className="empty-state">No completed courses yet</div>
            ) : (
              <div className="courses-list">
                {completedCourses.map((enrollment) => (
                  <div key={enrollment.id} className="enrollment-card completed">
                    <div className="enrollment-thumbnail">
                      <img src={enrollment.course?.thumbnail || '/placeholder-course.png'} alt={enrollment.course?.title} />
                      <div className="completed-badge">Completed</div>
                    </div>
                    <div className="enrollment-content">
                      <h3>{enrollment.course?.title}</h3>
                      <p>{enrollment.course?.description?.substring(0, 100)}...</p>
                      <Button 
                        onClick={() => navigate(`/course/${enrollment.course_id}/learn`)}
                        className="mt-4"
                        variant="outline"
                      >
                        Review Course
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificates" data-testid="certificates-list">
            {certificates.length === 0 ? (
              <div className="empty-state">
                <Award size={64} className="empty-icon" />
                <p>No certificates earned yet</p>
                <p className="empty-hint">Complete courses and pass all quizzes to earn certificates!</p>
              </div>
            ) : (
              <div className="certificates-grid">
                {certificates.map((cert) => (
                  <CertificateCard key={cert.id} certificate={cert} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}