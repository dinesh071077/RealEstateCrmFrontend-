import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Filter, MoreVertical, X, Calendar, Phone, Mail, Building, MapPin, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const STAGES = ['NEW', 'CONTACTED', 'SITE_VISIT', 'INTERESTED', 'NEGOTIATION', 'BOOKED', 'LOST'];
const STAGE_COLORS = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-purple-100 text-purple-800',
  SITE_VISIT: 'bg-yellow-100 text-yellow-800',
  INTERESTED: 'bg-orange-100 text-orange-800',
  NEGOTIATION: 'bg-indigo-100 text-indigo-800',
  BOOKED: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
};

const Leads = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', source: 'Other' });

  // Lead Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (statusFilter) query.append('status', statusFilter);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/leads?${query.toString()}`);
      setLeads(res.data.data.leads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic debounce implementation
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  const fetchLeadDetails = async (id) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/leads/${id}`);
      setLeadDetails(res.data.data.lead);
      setActivities(res.data.data.activities);
      setIsDetailsOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/leads`, formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', source: 'Other' });
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating lead');
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/leads/${id}/status`, { status });
      fetchLeadDetails(id);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/leads/${leadDetails._id}/notes`, { note: newNote });
      setNewNote('');
      fetchLeadDetails(leadDetails._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding note');
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track your potential customers</p>
        </div>
        <button
          onClick={() => { setIsCreateMode(true); setIsModalOpen(true); }}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:from-primary-700 hover:to-indigo-700 flex items-center transition-all shadow-md shadow-primary-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Lead
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: '100ms'}}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-gray-900 dark:text-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            {STAGES.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden flex-1 flex flex-col animate-slide-up" style={{animationDelay: '200ms'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-dark-surface/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Lead Info</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Assigned To</th>
                <th className="px-6 py-4 font-semibold">Follow-up</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-1">No leads found</p>
                      <button onClick={() => { setIsCreateMode(true); setIsModalOpen(true); }} className="text-primary-600 font-medium hover:underline">
                        Create your first lead
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4">{lead.source}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      {lead.followUpDate ? format(new Date(lead.followUpDate), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => fetchLeadDetails(lead._id)}
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-slide-up border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-bg/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} className="input-field">
                  {['Website', 'Facebook', 'Instagram', 'Referral', 'Walk-in', 'Advertisement', 'Other'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Details Drawer/Modal */}
      {isDetailsOpen && leadDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-5 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-500" />
                Lead Details
              </h2>
              <button onClick={() => setIsDetailsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{leadDetails.name}</h3>
                    <span className={`inline-block mt-3 px-3 py-1 rounded-md text-xs font-bold border ${STAGE_COLORS[leadDetails.status].replace('bg-', 'bg-').replace('text-', 'text-').replace('-100', '-50 dark:bg-opacity-20 border-opacity-50')}`}>
                      {leadDetails.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  {leadDetails.status !== 'BOOKED' && leadDetails.status !== 'LOST' && (
                    <button
                      onClick={() => navigate(`/book-property?leadId=${leadDetails._id}`)}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Book Property
                    </button>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    {leadDetails.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    {leadDetails.email || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    Created on {format(new Date(leadDetails.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              {/* Stage Progression UI */}
              {leadDetails.status !== 'BOOKED' && leadDetails.status !== 'LOST' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Update Stage</h4>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.filter(s => s !== 'BOOKED').map(stage => (
                      <button
                        key={stage}
                        onClick={() => updateLeadStatus(leadDetails._id, stage)}
                        disabled={leadDetails.status === stage}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${leadDetails.status === stage
                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Note */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Add Note</h4>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Type a note..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">Add</button>
                </form>
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Activity Timeline</h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {activities.map((act, i) => (
                    <div key={act._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {act.type === 'CREATED' ? <Users className="w-4 h-4" /> : act.type === 'NOTE' ? <Mail className="w-4 h-4" /> : act.type === 'BOOKED' ? <Calendar className="w-4 h-4" /> : <ActivityIcon />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm ml-4 md:ml-0">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-900">{act.type}</span>
                          <span className="text-xs text-gray-500">{format(new Date(act.createdAt), 'MMM dd')}</span>
                        </div>
                        <p className="text-sm text-gray-600">{act.message}</p>
                        <p className="text-xs text-gray-400 mt-2">By {act.createdBy?.name}</p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No activity found.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityIcon = () => <div className="w-2 h-2 bg-blue-500 rounded-full" />;

export default Leads;
