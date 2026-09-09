import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const BuildingsTab = () => {
  const [buildings, setBuildings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', project: '', description: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, pRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/properties/buildings`),
        axios.get(`${import.meta.env.VITE_API_URL}/properties/projects`)
      ]);
      setBuildings(bRes.data.data);
      setProjects(pRes.data.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/properties/buildings/${editingId}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/properties/buildings`, formData);
      }
      setIsModalOpen(false);
      setFormData({ name: '', project: '', description: '' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving building');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this building?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/properties/buildings/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete building');
    }
  };

  const openEdit = (building) => {
    setFormData({ name: building.name, project: building.project?._id || building.project, description: building.description });
    setEditingId(building._id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buildings</h2>
        <button
          onClick={() => { setFormData({ name: '', project: '', description: '' }); setEditingId(null); setIsModalOpen(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Building
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading buildings...</div>
      ) : buildings.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center flex flex-col items-center">
          <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No buildings found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Building Name</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Created Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {buildings.map((building) => (
                  <tr key={building._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{building.name}</td>
                    <td className="px-6 py-4">{building.project?.name || '-'}</td>
                    <td className="px-6 py-4">{format(new Date(building.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEdit(building)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(building._id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800 bg-opacity-75">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Building' : 'Add Building'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project *</label>
                <select required value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="input-field">
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field resize-none" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Save Building</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingsTab;
