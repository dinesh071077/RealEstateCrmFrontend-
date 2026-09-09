import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Home, Search, Filter } from 'lucide-react';

const UnitsTab = () => {
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    project: '', building: '', unitNumber: '', type: '2 BHK', floor: '', area: '', price: '', status: 'AVAILABLE'
  });
  const [error, setError] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const fetchFilters = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/properties/projects`),
        axios.get(`${import.meta.env.VITE_API_URL}/properties/buildings`)
      ]);
      setProjects(pRes.data.data);
      setBuildings(bRes.data.data);
    } catch (err) {
      console.error("Failed to load filter data", err);
    }
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedProject) query.append('project', selectedProject);
      if (selectedBuilding) query.append('building', selectedBuilding);
      if (statusFilter) query.append('status', statusFilter);
      if (typeFilter) query.append('type', typeFilter);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/units?${query.toString()}`);
      setUnits(res.data.data);
    } catch (err) {
      console.error("Failed to load units", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [selectedProject, selectedBuilding, statusFilter, typeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/properties/units/${editingId}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/properties/units`, formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchUnits();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving unit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/properties/units/${id}`);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete unit');
    }
  };

  const openEdit = (unit) => {
    setFormData({
      project: unit.project?._id || unit.project,
      building: unit.building?._id || unit.building,
      unitNumber: unit.unitNumber,
      type: unit.type,
      floor: unit.floor || '',
      area: unit.area || '',
      price: unit.price,
      status: unit.status
    });
    setEditingId(unit._id);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setFormData({
      project: '', building: '', unitNumber: '', type: '2 BHK', floor: '', area: '', price: '', status: 'AVAILABLE'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const filteredUnits = units.filter(u => 
    u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derived options for modal
  const modalBuildings = buildings.filter(b => b.project === formData.project || b.project?._id === formData.project);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Units Inventory</h2>
        <button onClick={openAdd} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 transition-colors">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search unit number..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setSelectedBuilding(''); }} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 outline-none">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={selectedBuilding} onChange={e => setSelectedBuilding(e.target.value)} disabled={!selectedProject} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 outline-none">
          <option value="">All Buildings</option>
          {buildings.filter(b => b.project === selectedProject || b.project?._id === selectedProject).map(b => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 outline-none">
          <option value="">All Types</option>
          {['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 outline-none">
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="BOOKED">Booked</option>
          <option value="BLOCKED">Blocked</option>
        </select>
        <button onClick={() => { setSearchTerm(''); setSelectedProject(''); setSelectedBuilding(''); setStatusFilter(''); setTypeFilter(''); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium px-2">
          Clear Filters
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex-1 flex flex-col min-h-[400px]">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading units...</div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <Home className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
            <p>No units found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-semibold">Unit</th>
                  <th className="px-6 py-4 font-semibold">Project & Building</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUnits.map((unit) => (
                  <tr key={unit._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{unit.unitNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-200">{unit.project?.name}</div>
                      <div className="text-xs text-gray-500">{unit.building?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      {unit.type} <br/>
                      <span className="text-xs text-gray-500">Flr {unit.floor} • {unit.area} sqft</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary-700 dark:text-primary-400">
                      {formatCurrency(unit.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        unit.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        unit.status === 'BOOKED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEdit(unit)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(unit._id)} className="text-red-600 dark:text-red-400 hover:text-red-800 transition-colors">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800 bg-opacity-75 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl my-8 transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Unit' : 'Add Unit'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project *</label>
                  <select required value={formData.project} onChange={e => setFormData({...formData, project: e.target.value, building: ''})} className="input-field">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building *</label>
                  <select required disabled={!formData.project} value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} className="input-field disabled:opacity-50">
                    <option value="">{formData.project ? 'Select Building' : 'Select Project First'}</option>
                    {modalBuildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Number *</label>
                  <input required type="text" value={formData.unitNumber} onChange={e => setFormData({...formData, unitNumber: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type *</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field">
                    {['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
                  <input type="text" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area (sq.ft)</label>
                  <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability *</label>
                  <select 
                    required 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    disabled={formData.status === 'BOOKED'}
                    className={`input-field ${formData.status === 'BOOKED' ? 'opacity-50' : ''}`}
                  >
                    {formData.status === 'BOOKED' ? (
                      <option value="BOOKED">BOOKED (Managed by Booking System)</option>
                    ) : (
                      <>
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </>
                    )}
                  </select>
                  {formData.status === 'BOOKED' && <p className="text-xs text-orange-500 mt-1">Booked units cannot be changed back manually.</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Save Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsTab;
