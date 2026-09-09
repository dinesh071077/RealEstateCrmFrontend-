import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Users, UserPlus, PhoneForwarded, Building,
  CalendarCheck, IndianRupee, TrendingUp, AlertCircle, PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [stages, setStages] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, stagesRes, bookingsRes, followUpsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats`),
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/lead-stages`),
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/bookings`),
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/follow-ups`),
        ]);

        setStats(statsRes.data.data);
        setStages(stagesRes.data.data);
        setRecentBookings(bookingsRes.data.data);
        setFollowUps(followUpsRes.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ef4444'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name}</span>. Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={user?.role === 'ADMIN' ? "Total Leads" : "My Leads"}
          value={stats?.totalLeads || 0}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="New Leads"
          value={stats?.newLeads || 0}
          icon={<UserPlus className="w-6 h-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
        />
        <StatCard
          title="Follow-ups Today"
          value={stats?.followUpsToday || 0}
          icon={<PhoneForwarded className="w-6 h-6 text-orange-600" />}
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Available Units"
          value={stats?.availableUnits || 0}
          icon={<Building className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Total Units"
          value={stats?.totalUnits || 0}
          icon={<Building className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Booked Units"
          value={stats?.bookedUnits || 0}
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Blocked Units"
          value={stats?.blockedUnits || 0}
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          bgColor="bg-red-50"
        />
        <StatCard
          title={user?.role === 'ADMIN' ? "Total Bookings" : "My Bookings"}
          value={stats?.totalBookings || 0}
          icon={<CalendarCheck className="w-6 h-6 text-cyan-600" />}
          bgColor="bg-cyan-50"
        />
        <StatCard
          title="Booking Value"
          value={formatCurrency(stats?.totalBookingValue || 0)}
          icon={<IndianRupee className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-50"
          className="md:col-span-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary-500"/> Lead Stages Overview</h2>
          <div className="h-72">
            {stages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stages} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center"><PieChartIcon className="w-5 h-5 mr-2 text-indigo-500"/> Distribution</h2>
          <div className="h-64">
            {stages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stages}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {stages.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-bg px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow Ups */}
        <div className="glass-card overflow-hidden flex flex-col h-[450px]">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Follow-ups</h2>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {followUps.length} Pending
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto custom-scrollbar flex-1">
            {followUps.length > 0 ? (
              followUps.map(lead => (
                <div key={lead._id} className="p-5 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lead.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{lead.phone}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                      {lead.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg w-max px-2 py-1 rounded-md">
                    Scheduled for: <span className="ml-1 text-gray-900 dark:text-gray-300">{format(new Date(lead.followUpDate), 'h:mm a')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No follow-ups scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass-card overflow-hidden flex flex-col h-[450px]">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-bg/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto custom-scrollbar flex-1">
            {recentBookings.length > 0 ? (
              recentBookings.map(booking => (
                <div key={booking._id} className="p-5 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{booking.lead?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1" />
                        {booking.unit?.project?.name} - {booking.unit?.unitNumber}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/30">
                      {formatCurrency(booking.amount)}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg px-2 py-1.5 rounded-md">
                    <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1"/> By {booking.salesEmployee?.name}</span>
                    <span className="flex items-center"><CalendarCheck className="w-3.5 h-3.5 mr-1"/> {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No recent bookings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, className = "" }) => (
  <div className={`glass-card p-6 flex items-center space-x-4 ${className}`}>
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${bgColor} shadow-sm border border-white/40 dark:border-gray-700/50`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">{value}</p>
    </div>
  </div>
);

export default Dashboard;
