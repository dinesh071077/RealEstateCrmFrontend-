import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Search, Filter, AlertCircle, CalendarCheck, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useSearchParams, useNavigate } from 'react-router-dom';

const BookProperty = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialLeadId = searchParams.get('leadId') || '';

  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({ lead: initialLeadId, amount: '', notes: '' });
  const [availableLeads, setAvailableLeads] = useState([]);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [projectsRes, buildingsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/properties/projects`),
          axios.get(`${import.meta.env.VITE_API_URL}/properties/buildings`)
        ]);
        setProjects(projectsRes.data.data);
        setBuildings(buildingsRes.data.data);

        // Also fetch leads for booking dropdown
        const leadsRes = await axios.get(`${import.meta.env.VITE_API_URL}/leads?status=NEW&status=INTERESTED&status=NEGOTIATION&status=CONTACTED&status=SITE_VISIT&limit=100`);
        setAvailableLeads(leadsRes.data.data.leads);
      } catch (err) {
        console.error("Failed to load property data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (selectedProject) query.append('project', selectedProject);
        if (selectedBuilding) query.append('building', selectedBuilding);
        if (statusFilter) query.append('status', statusFilter);

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/units?${query.toString()}`);
        setUnits(res.data.data);
      } catch (err) {
        console.error("Failed to load units");
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, [selectedProject, selectedBuilding, statusFilter]);

  const handleBookClick = (unit) => {
    setSelectedUnit(unit);
    setBookingError('');
    setBookingFormData({ lead: initialLeadId, amount: (unit.price * 0.1).toString(), notes: '' });
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, {
        unit: selectedUnit._id,
        lead: bookingFormData.lead,
        amount: Number(bookingFormData.amount),
        notes: bookingFormData.notes
      });
      setIsBookingModalOpen(false);
      
      alert('Booking Successful!');
      navigate('/leads');
      
    } catch (err) {
      // Specifically catch 409 Conflict for race condition demo
      if (err.response?.status === 409) {
        setBookingError("This unit was just booked by another sales employee. Please select another unit.");
        // Refresh unit status
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/units/${selectedUnit._id}`);
        const updatedUnit = res.data.data;
        setUnits(units.map(u => u._id === updatedUnit._id ? updatedUnit : u));
      } else {
        setBookingError(err.response?.data?.message || 'Error processing booking');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 h-full flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Book Property</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a unit to book for lead</p>
      </div>

      <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{animationDelay: '100ms'}}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project</label>
          <select
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 outline-none"
            value={selectedProject}
            onChange={(e) => { setSelectedProject(e.target.value); setSelectedBuilding(''); }}
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Building</label>
          <select
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-50"
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            disabled={!selectedProject}
          >
            <option value="">All Buildings</option>
            {buildings.filter(b => b.project === selectedProject || b.project._id === selectedProject).map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/50 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading units...</div>
        ) : units.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <Home className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No properties found matching criteria</p>
          </div>
        ) : (
          units.map((unit, idx) => (
            <div key={unit._id} className="glass-card overflow-hidden group animate-slide-up" style={{animationDelay: `${200 + (idx * 50)}ms`}}>
              <div className="p-5">
                <div className={`flex justify-between items-start`}>
                  <h3 className="text-xl font-bold text-gray-900">{unit.unitNumber}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${unit.status === 'AVAILABLE' ? 'bg-emerald-200 text-emerald-800' :
                      unit.status === 'BOOKED' ? 'bg-red-200 text-red-800' :
                        'bg-gray-200 text-gray-800'
                    }`}>
                    {unit.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">{unit.type} • {unit.area} sq.ft</p>
                  <p className="text-lg font-bold text-primary-600">{formatCurrency(unit.price)}</p>
                </div>
                {unit.status === 'AVAILABLE' && (
                  <button
                    onClick={() => handleBookClick(unit)}
                    className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-xl transition-colors shadow-sm"
                  >
                    Book Unit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-slide-up border border-gray-200 dark:border-gray-800">
            <div className="bg-primary-50 p-6 border-b border-primary-100">
              <h2 className="text-xl font-bold text-primary-900">Confirm Booking</h2>
              <p className="text-sm text-primary-700 mt-1">
                {selectedUnit.project?.name}, {selectedUnit.building?.name} - Unit {selectedUnit.unitNumber}
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">
              {bookingError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  {bookingError}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
                <span className="text-gray-600">Property Price:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedUnit.price)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Lead <span className="text-red-500">*</span></label>
                <select
                  required
                  value={bookingFormData.lead}
                  onChange={e => setBookingFormData({ ...bookingFormData, lead: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">-- Choose a lead --</option>
                  {availableLeads.map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Only your assigned leads in active stages are shown.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Amount (₹) <span className="text-red-500">*</span></label>
                <input
                  required
                  type="number"
                  min="0"
                  value={bookingFormData.amount}
                  onChange={e => setBookingFormData({ ...bookingFormData, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  rows="2"
                  value={bookingFormData.notes}
                  onChange={e => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookProperty;
