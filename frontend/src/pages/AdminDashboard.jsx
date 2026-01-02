import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CouponManager from '@/components/CouponManager';
import UserManagement from '@/components/admin/UserManagement';
import InstructorApprovals from '@/components/admin/InstructorApprovals';
import PlatformAnalytics from '@/components/admin/PlatformAnalytics';
import CourseModeration from '@/components/admin/CourseModeration';
import { Users, UserCheck, BarChart3, Tag, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard({ user, logout }) {
  const [stats, setStats] = useState({ pendingInstructors: 0, totalUsers: 0 });

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const [instructorsRes, usersRes] = await Promise.all([
        axios.get(`${API}/instructors`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const pending = instructorsRes.data.filter(i => i.verification_status === 'pending').length;
      setStats({
        pendingInstructors: pending,
        totalUsers: usersRes.data.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div data-testid="admin-dashboard" className="dashboard-page">
      <Navbar user={user} logout={logout} />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage and monitor your learning platform</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="admin-quick-stats" data-testid="admin-stats">
          <div className="quick-stat-card">
            <Users className="stat-icon" size={24} />
            <div>
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="quick-stat-card pending">
            <UserCheck className="stat-icon" size={24} />
            <div>
              <h3>{stats.pendingInstructors}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="dashboard-tabs">
          <TabsList>
            <TabsTrigger value="analytics" data-testid="analytics-tab">
              <BarChart3 size={18} className="mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="courses" data-testid="courses-tab">
              <BookOpen size={18} className="mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="instructors" data-testid="instructors-tab">
              <UserCheck size={18} className="mr-2" />
              Instructors {stats.pendingInstructors > 0 && `(${stats.pendingInstructors})`}
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">
              <Users size={18} className="mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="coupons" data-testid="coupons-tab">
              <Tag size={18} className="mr-2" />
              Coupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <PlatformAnalytics />
          </TabsContent>

          <TabsContent value="courses">
            <CourseModeration />
          </TabsContent>

          <TabsContent value="instructors">
            <InstructorApprovals />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}