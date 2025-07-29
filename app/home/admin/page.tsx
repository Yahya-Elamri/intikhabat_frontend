"use client"
import { getToken } from '@/utils/auth/token';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

// Define role types
type Role = 'Admin' | 'Search' | 'Add' | 'Manage' | 'Print' | 'Statistic';
const ALL_ROLES: Role[] = ['Admin', 'Search', 'Add', 'Manage', 'Print', 'Statistic'];

interface EmployerInputDTO {
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  telephone: string;
  username: string;
  password: string;
  roles: string; // Comma-separated string for backend
}

interface EmployerDTO {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  telephone: string;
  username: string;
  roles: Role[]; // Array of roles
}

const backendUrlGraphQL = process.env.NEXT_PUBLIC_API_GraphQL_URL || '';
const backendUrlRest = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function EmployersAdminPage() {
  const t = useTranslations('admin');
  const [employers, setEmployers] = useState<EmployerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployerInputDTO>({
    nom: '',
    prenom: '',
    cin: '',
    dateNaissance: '',
    telephone: '',
    username: '',
    password: '',
    roles: '',
  });
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      const response = await fetch(backendUrlGraphQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          query: `
            query {
              getAllEmployers {
                id
                nom
                prenom
                cin
                dateNaissance
                telephone
                username
                roles
              }
            }
          `,
        }),
      });
      
      const { data, errors } = await response.json();
      
      if (!response.ok || errors) {
        throw new Error(errors?.[0]?.message || t('fetchError'));
      }
      
      setEmployers(data.getAllEmployers);
    } catch (err: any) {
      setError(err.message || t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: Role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    const token = getToken();
    const endpoint = editMode && currentId 
      ? `${backendUrlRest}/admin/employers/${currentId}` 
      : `${backendUrlRest}/admin/employers`;
    
    const method = editMode ? 'PUT' : 'POST';
    
    // Prepare data with roles as comma-separated string
    const dataToSend = {
      ...formData,
      roles: selectedRoles.join(','),
    };
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('operationFailed'));
      }
      
      const result: EmployerDTO = await response.json();
      
      if (editMode) {
        setEmployers(prev => prev.map(emp => emp.id === currentId ? result : emp));
        setSuccess(t('updateSuccess'));
      } else {
        setEmployers(prev => [result, ...prev]);
        setSuccess(t('createSuccess'));
      }
      
      resetForm();
    } catch (err: any) {
      setError(err.message || t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('Are'))) return;
    
    setError(null);
    setSuccess(null);
    const token = getToken();
    
    try {
      const response = await fetch(`${backendUrlRest}/admin/employers/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(t('deleteFailed'));
      }
      
      setEmployers(prev => prev.filter(emp => emp.id !== id));
      setSuccess(t('deleteSuccess'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (employer: EmployerDTO) => {
    setFormData({
      nom: employer.nom,
      prenom: employer.prenom,
      cin: employer.cin,
      dateNaissance: employer.dateNaissance.split('T')[0],
      telephone: employer.telephone,
      username: employer.username,
      password: '',
      roles: '', // We don't need this for display
    });
    setSelectedRoles(employer.roles);
    setEditMode(true);
    setCurrentId(employer.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      cin: '',
      dateNaissance: '',
      telephone: '',
      username: '',
      password: '',
      roles: '',
    });
    setSelectedRoles([]);
    setEditMode(false);
    setCurrentId(null);
    setSuccess(null);
  };

  const filteredEmployers = employers.filter(emp =>
    emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
        {t('Employer')}
      </h1>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          <p>{success}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editMode ? t('EditEmployer') : t('Add')}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'nom', label: t('Nom'), type: 'text' },
            { name: 'prenom', label: t('Prenom'), type: 'text' },
            { name: 'cin', label: t('Cin'), type: 'text' },
            { name: 'dateNaissance', label: t('DateNaissance'), type: 'date' },
            { name: 'telephone', label: t('Telephone'), type: 'tel' },
            { name: 'username', label: t('Username'), type: 'text' },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} *
              </label>
              <input
                type={field.type}
                name={field.name}
                value={(formData as any)[field.name]}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('Password')} {editMode && <span className="text-sm text-gray-500">{t('leaveblank')}</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!editMode}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2 border p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Roles')} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_ROLES.map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`role-${role}`}
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`role-${role}`} className="ml-2 text-sm text-gray-700">
                    {t(`menu.${role}`)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2 flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || selectedRoles.length === 0}
              className={`px-4 py-2 text-white rounded-md flex items-center ${
                isSubmitting || selectedRoles.length === 0
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {editMode ? t('Update') : t('Create')}
            </button>
            
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400"
              >
                {t('Cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Employer List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-700">
            {t('List')}
          </h2>
          
          <div className="w-full md:w-64">
            <div className="relative">
              <input
                type="text"
                placeholder={t('Search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEmployers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('Notfound')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[t('Name'), t('CIN'), t('Birth Date'), t('Phone'), t('Username'), t('Roles')].map((label) => (
                    <th 
                      key={label}
                      className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployers.map((employer) => (
                  <tr key={employer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-1">
                      <div className="text-sm text-gray-500">{employer.nom}</div>
                      <div className="text-sm text-gray-500">{employer.prenom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employer.cin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employer.dateNaissance).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employer.telephone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employer.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {employer.roles.map((role, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                      <button
                        onClick={() => handleEdit(employer)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none"
                      >
                        {t('Edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(employer.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none"
                      >
                        {t('Delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}