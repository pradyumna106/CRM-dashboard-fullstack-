import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, 
  Users, X, AlertCircle,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter,
  Target, BarChart3
} from 'lucide-react';

// --- REAL API FUNCTIONS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/leads';  //<-- Make sure to set this in your .env.local file

const api = {
  fetchLeads: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },
  createLead: async (leadData) => {
    const res = await axios.post(API_URL, leadData);
    return res.data;
  },
  updateLead: async (id, leadData) => {
    const res = await axios.put(`${API_URL}/${id}`, leadData);
    return res.data;
  },
  deleteLead: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
};

// Inject custom keyframes for animations
const injectStyles = () => {
  if (document.getElementById('crm-styles')) return;
  const style = document.createElement('style');
  style.id = 'crm-styles';
  style.innerHTML = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: .8; } }
    
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    .animate-slide-up-1 { animation: slideUp 0.6s ease-out 0.1s forwards; opacity: 0; }
    .animate-slide-up-2 { animation: slideUp 0.6s ease-out 0.2s forwards; opacity: 0; }
    .animate-slide-up-3 { animation: slideUp 0.6s ease-out 0.3s forwards; opacity: 0; }
    .animate-slide-up-4 { animation: slideUp 0.6s ease-out 0.4s forwards; opacity: 0; }
    
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    /* Elegant scrollbar for table */
    .custom-scrollbar::-webkit-scrollbar { height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `;
  document.head.appendChild(style);
};

// --- UTILITY COMPONENTS ---
const Badge = ({ status }) => {
  const styles = {
    New: 'bg-blue-100/80 text-blue-800 border-blue-200',
    Contacted: 'bg-amber-100/80 text-amber-800 border-amber-200',
    Qualified: 'bg-purple-100/80 text-purple-800 border-purple-200',
    Converted: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
    Lost: 'bg-rose-100/80 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm ${styles[status]}`}>
      {status}
    </span>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input 
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow" 
      {...props} 
    />
  </div>
);

// --- DASHBOARD COMPONENT ---
function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.fetchLeads();
        setLeads(data);
      } catch (error) { console.error("Failed to fetch leads", error); } 
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  // Derived State
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + itemsPerPage);

  // Statistics Calculation
  const totalLeadsCount = leads.length || 1;
  const statusCounts = {
    New: leads.filter(l => l.status === 'New').length,
    Contacted: leads.filter(l => l.status === 'Contacted').length,
    Qualified: leads.filter(l => l.status === 'Qualified').length,
    Converted: leads.filter(l => l.status === 'Converted').length,
    Lost: leads.filter(l => l.status === 'Lost').length,
  };

  const statusColors = {
    New: '#3b82f6', Contacted: '#f59e0b', Qualified: '#8b5cf6', Converted: '#10b981', Lost: '#f43f5e'
  };

  let cumulativePercent = 0;
  const conicGradientStops = Object.entries(statusCounts).map(([status, count]) => {
    const percent = (count / totalLeadsCount) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return `${statusColors[status]} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  // Handlers
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronDown className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-black ml-1" /> : <ChevronDown className="w-4 h-4 text-black ml-1" />;
  };

  const toggleExpand = (id) => setExpandedLeadId(expandedLeadId === id ? null : id);
  const handleOpenAddModal = () => { setCurrentLead(null); setIsFormModalOpen(true); };
  const handleOpenEditModal = (lead) => { setCurrentLead(lead); setIsFormModalOpen(true); };
  const handleOpenDeleteModal = (id) => { setLeadToDelete(id); setIsDeleteModalOpen(true); };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const leadData = Object.fromEntries(formData.entries());

    try {
      if (currentLead) {
        const updatedLead = await api.updateLead(currentLead._id, { ...currentLead, ...leadData });
        setLeads(leads.map(l => l._id === currentLead._id ? updatedLead : l));
      } else {
        const newLead = await api.createLead(leadData);
        setLeads([newLead, ...leads]);
      }
      setIsFormModalOpen(false);
    } catch (error) { console.error("Failed to save lead", error); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.deleteLead(leadToDelete);
      setLeads(leads.filter(l => l._id !== leadToDelete));
      setIsDeleteModalOpen(false);
    } catch (error) { console.error("Failed to delete lead", error); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-black selection:text-white animate-fade-in pb-12">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-md">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">NexaCRM</h1>
            </div>
            <div className="flex items-center space-x-4">
               <div className="hidden sm:flex items-center text-sm font-medium text-slate-500 mr-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                 System Online
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* --- REDESIGNED LEAD STATISTICS DASHBOARD --- */}
        <div className="animate-slide-up-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          {/* Background decorative element */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Lead Analytics</h2>
                    <p className="text-sm text-slate-500 font-medium">Real-time overview of your pipeline</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-sm font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  <span className="text-slate-500">Total Pipeline:</span>
                  <span className="text-black font-bold">{leads.length} Leads</span>
                </div>
             </div>
          </div>
          
          <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-10 items-center justify-center">
            
            {/* Left: Enhanced Donut Chart */}
            <div className="relative flex flex-col items-center justify-center">
              <div 
                className="w-56 h-56 rounded-full shadow-inner relative transition-transform duration-500 hover:scale-105" 
                style={{ 
                  background: leads.length > 0 ? `conic-gradient(${conicGradientStops})` : '#f1f5f9',
                  boxShadow: 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Inner cutout */}
                <div className="absolute inset-[18%] bg-white rounded-full flex flex-col items-center justify-center shadow-sm border border-slate-50">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{leads.length}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Total</span>
                </div>
              </div>
            </div>

            {/* Right: Modern Metric Cards */}
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-4">
               {Object.entries(statusCounts).map(([status, count]) => {
                 const percentage = leads.length > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
                 return (
                 <div key={status} className="relative p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                   {/* Hover accent line */}
                   <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: statusColors[status] }} />
                   
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center space-x-2">
                       <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: statusColors[status] }} />
                       <span className="text-sm font-bold text-slate-700">{status}</span>
                     </div>
                     <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                       {percentage}%
                     </span>
                   </div>
                   
                   <div className="flex items-end justify-between">
                     <span className="text-3xl font-black text-slate-900">{count}</span>
                     
                     {/* Mini visual indicator line */}
                     <div className="w-1/2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: statusColors[status] }} />
                     </div>
                   </div>
                 </div>
               )})}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-slide-up-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative z-10">
          
          {/* Table Toolbar */}
          <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                  placeholder="Search leads by name, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-8 py-2.5 border border-slate-300 rounded-xl leading-5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm appearance-none font-medium"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="w-full lg:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Lead
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white select-none border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center">Lead Details <SortIcon columnKey="name" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-50 transition-colors hidden sm:table-cell" onClick={() => handleSort('company')}>
                    <div className="flex items-center">Company <SortIcon columnKey="company" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">Added Date <SortIcon columnKey="createdAt" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-sm font-medium text-slate-500">Loading leads data...</td></tr>
                ) : paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Users className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="text-base font-medium text-slate-600">No leads found.</p>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <React.Fragment key={lead._id}>
                      <tr className="hover:bg-slate-50/80 transition-colors group">
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-slate-100/50 transition-colors"
                          onClick={() => toggleExpand(lead._id)}
                          title="Click to view notes"
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 transition-transform group-hover:scale-105 shadow-sm">
                              {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lead.name}</div>
                              <div className="text-sm font-medium text-slate-500">{lead.email}</div>
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-slate-100/50 transition-colors hidden sm:table-cell"
                          onClick={() => toggleExpand(lead._id)}
                          title="Click to view notes"
                        >
                          <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{lead.companyName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge status={lead.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 hidden md:table-cell">
                          {new Date(lead.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1 sm:space-x-2 transition-all duration-200">
                            <button onClick={() => handleOpenEditModal(lead)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 hover:scale-110 transition-all duration-200" title="Edit">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleOpenDeleteModal(lead._id)} className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 hover:scale-110 transition-all duration-200" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Notes Row */}
                      {expandedLeadId === lead._id && (
                        <tr className="bg-indigo-50/30">
                          <td colSpan="5" className="px-6 py-4 border-b border-indigo-100">
                            <div className="text-sm text-slate-700 animate-slide-up-1 flex items-start">
                              <div className="min-w-[4rem] font-bold text-slate-900 mr-2">Notes:</div>
                              <div className="flex-1 font-medium">{lead.notes ? lead.notes : <span className="text-slate-400 italic">No notes available.</span>}</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Showing <span className="font-bold text-slate-900">{sortedLeads.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(startIndex + itemsPerPage, sortedLeads.length)}</span> of <span className="font-bold text-slate-900">{sortedLeads.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${currentPage === idx + 1 ? 'z-10 bg-indigo-50 text-indigo-700 border-indigo-500' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                      {idx + 1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
            {/* Mobile Pagination */}
            <div className="flex items-center justify-between w-full sm:hidden gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 flex-1 justify-center shadow-sm">
                Prev
              </button>
              <span className="text-sm font-medium text-slate-700 px-2">
                <span className="font-bold">{currentPage}</span> / {totalPages === 0 ? 1 : totalPages}
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 flex-1 justify-center shadow-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      
      {/* Form Modal (Add/Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up-1">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                {currentLead ? 'Edit Lead Profile' : 'Create New Lead'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-1 rounded-md transition-colors border border-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input required label="Full Name" name="name" defaultValue={currentLead?.name} placeholder="e.g. Jane Doe" />
                <Input required type="email" label="Email Address" name="email" defaultValue={currentLead?.email} placeholder="jane@example.com" />
                <Input label="Phone Number" name="phoneNumber" defaultValue={currentLead?.phoneNumber} placeholder="+1 (555) 000-0000" />
                <Input required label="Company Name" name="companyName" defaultValue={currentLead?.companyName} placeholder="Acme Corp" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Pipeline Status</label>
                <select name="status" defaultValue={currentLead?.status || 'New'} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium">
                  <option value="New">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Notes & Context</label>
                <textarea name="notes" defaultValue={currentLead?.notes} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Add relevant details here..."></textarea>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 border border-transparent rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg">
                  {isSubmitting ? 'Saving...' : (currentLead ? 'Save Changes' : 'Create Lead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center animate-slide-up-1 border border-slate-100">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 mb-5 border-4 border-rose-50">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Lead?</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 px-4">
              This action cannot be undone. This lead will be permanently removed from your pipeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteConfirm} disabled={isSubmitting} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-rose-600 border border-transparent rounded-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 disabled:opacity-50 transition-colors shadow-md">
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- LANDING & AUTH PAGES ---

// --- MAIN APP ROUTER ---
export default function App() {
  useEffect(() => { injectStyles(); }, []);
  return <Dashboard />;
}
