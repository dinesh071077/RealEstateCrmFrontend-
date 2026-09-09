import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarCheck, Search, Filter, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings?${query.toString()}`);
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will free up the unit.')) {
      return;
    }
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/bookings/${id}/cancel`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage property bookings</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4" style={{animationDelay: '100ms'}}>
        <div className="flex items-center space-x-2">
          <div className="bg-gray-100 dark:bg-dark-bg p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <Filter className="text-gray-500 dark:text-gray-400 w-5 h-5" />
          </div>
          <select
            className="bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-gray-100"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden flex-1 flex flex-col" style={{animationDelay: '200ms'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-dark-surface/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Lead Info</th>
                <th className="px-6 py-4 font-semibold">Property</th>
                <th className="px-6 py-4 font-semibold">Booking Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CalendarCheck className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-1">No bookings found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{booking.lead?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{booking.lead?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{booking.unit?.project?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{booking.unit?.building?.name} - {booking.unit?.unitNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(booking.bookingDate), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Ban className="w-3 h-3 mr-1" /> Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
