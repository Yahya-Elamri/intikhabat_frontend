'use client';

import { useTranslations } from 'next-intl';
import { getToken } from '@/utils/auth/token';
import { Mail, Search, Trash2, Pencil, X, Save } from 'lucide-react';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

enum Sex {
  Homme = 'Homme',
  Femme = 'Femme'
}

enum SituationFamiliale {
  MARIE = 'MARIE',
  DIVORCE = 'DIVORCE',
  CELIBATAIRE = 'CELIBATAIRE',
  VEUF = 'VEUF'
}

enum Education {
  SANS = 'SANS',
  PRIMAIRE = 'PRIMAIRE',
  COLLEGE = 'COLLEGE',
  LYCEE = 'LYCEE',
  UNIVERSITAIRE = 'UNIVERSITAIRE'
}

interface JamaaDTO {
  id: number;
  nom: string;
  lastId: number;
}

interface MontakhibInputDTO {
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  sex: Sex;
  education: Education;
  situationFamiliale: SituationFamiliale;
  jamaaId: number;
}

interface MontakhibDTO extends MontakhibInputDTO {
  id: number;
}

const backendUrlRest = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const MontakhibManager: React.FC = () => {
  const t = useTranslations('manage');
  const token = getToken();

  const [jamaas, setJamaas] = useState<JamaaDTO[]>([]);
  const [selectedJamaa, setSelectedJamaa] = useState<JamaaDTO | null>(null);
  const [searchCin, setSearchCin] = useState<string>('');
  const [foundMontakhib, setFoundMontakhib] = useState<MontakhibDTO | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [cinError, setCinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCinValidating, setIsCinValidating] = useState<boolean>(false);

  // Initialize formData with proper jamaaId handling
  const [formData, setFormData] = useState<MontakhibInputDTO>({
    nom: '',
    prenom: '',
    cin: '',
    dateNaissance: '',
    lieuNaissance: '',
    adresse: '',
    sex: Sex.Homme,
    education: Education.SANS,
    situationFamiliale: SituationFamiliale.CELIBATAIRE,
    jamaaId: 0
  });

  // Fetch Jamaas on component mount
  useEffect(() => {
    const fetchJamaas = async () => {
      try {
        const res = await fetch(`${backendUrlRest}/jamaas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch Jamaas');
        
        const data: JamaaDTO[] = await res.json();
        setJamaas(data);

        // Set initial jamaaId if Jamaas are available
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, jamaaId: data[0].id }));
          setSelectedJamaa(data[0]);
        }
      } catch (err) {
        console.error('Error fetching Jamaas:', err);
      }
    };

    fetchJamaas();
  }, [token]);

  // Handle CIN validation for updates
  useEffect(() => {
    if (formData.cin === foundMontakhib?.cin) {
      setCinError(null);
      return;
    }
    
    if (formData.cin.length < 5) {
      setCinError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCinValidating(true);
      try {
        const res = await fetch(`${backendUrlRest}/add/montakhibs/search?cin=${formData.cin}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (!res.ok) throw new Error('CIN validation failed');
        
        const data: MontakhibDTO[] = await res.json();
        
        // Check if found CIN belongs to current record or another
        const exists = data.some(m => m.cin === formData.cin && m.id !== foundMontakhib?.id);
        setCinError(exists ? t('cinExists') : null);
      } catch (err) {
        console.error('CIN validation error:', err);
        setCinError(t('cinValidationError'));
      } finally {
        setIsCinValidating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cin, foundMontakhib, t, token]);

  // Search for Montakhib by CIN
  const handleSearch = async () => {
    if (!searchCin) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const res = await fetch(`${backendUrlRest}/add/montakhibs/search?cin=${searchCin}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!res.ok) throw new Error('Search failed');
      
      const data: MontakhibDTO[] = await res.json();
      
      if (data.length > 0) {
        const montakhib = data[0];
        setFoundMontakhib(montakhib);
        
        // Find corresponding Jamaa
        const jamaa = jamaas.find(j => j.id === montakhib.jamaaId);
        
        // Update form data with Jamaa ID
        setFormData({
          nom: montakhib.nom,
          prenom: montakhib.prenom,
          cin: montakhib.cin,
          dateNaissance: montakhib.dateNaissance,
          lieuNaissance: montakhib.lieuNaissance,
          adresse: montakhib.adresse,
          sex: montakhib.sex,
          education: montakhib.education,
          situationFamiliale: montakhib.situationFamiliale,
          jamaaId: montakhib.jamaaId
        });
        
        if (jamaa) {
          setSelectedJamaa(jamaa);
        } else {
          console.warn('Jamaa not found for ID:', montakhib.jamaaId);
          // If Jamaa not found, select the first one as fallback
          if (jamaas.length > 0) {
            setSelectedJamaa(jamaas[0]);
          }
        }
      } else {
        setSearchError(t('notFound'));
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(t('searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  // Handle form field changes - FIXED jamaaId handling
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Convert to number for jamaaId
    const newValue = name === 'jamaaId' ? Number(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Update selected Jamaa immediately
    if (name === 'jamaaId') {
      const jamaaId = Number(value);
      const jamaa = jamaas.find(j => j.id === jamaaId);
      setSelectedJamaa(jamaa || null);
    }
  };

  // Update existing Montakhib
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!foundMontakhib || cinError || isCinValidating) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${backendUrlRest}/add/montakhibs/${foundMontakhib.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const updated: MontakhibDTO = await res.json();
        setFoundMontakhib(updated);
        setIsEditing(false);
        console.info(t('updateSuccess'));
      } else {
        const errorData = await res.json();
        console.error('Update failed:', errorData);
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Montakhib
  const handleDelete = async () => {
    if (!foundMontakhib || !confirm(t('confirmDelete'))) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${backendUrlRest}/add/montakhibs/${foundMontakhib.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (res.ok) {
        resetForm();
        console.info(t('deleteSuccess'));
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state with proper jamaaId
  const resetForm = () => {
    setSearchCin('');
    setFoundMontakhib(null);
    setIsEditing(false);
    setSearchError(null);
    setCinError(null);
    
    const initialJamaaId = jamaas[0]?.id || 0;
    
    setFormData({
      nom: '',
      prenom: '',
      cin: '',
      dateNaissance: '',
      lieuNaissance: '',
      adresse: '',
      sex: Sex.Homme,
      education: Education.SANS,
      situationFamiliale: SituationFamiliale.CELIBATAIRE,
      jamaaId: initialJamaaId
    });
    
    if (jamaas.length > 0) {
      setSelectedJamaa(jamaas[0]);
    } else {
      setSelectedJamaa(null);
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (!foundMontakhib) return;
    
    if (isEditing) {
      // Reset to original values when canceling edit
      setFormData({
        nom: foundMontakhib.nom,
        prenom: foundMontakhib.prenom,
        cin: foundMontakhib.cin,
        dateNaissance: foundMontakhib.dateNaissance,
        lieuNaissance: foundMontakhib.lieuNaissance,
        adresse: foundMontakhib.adresse,
        sex: foundMontakhib.sex,
        education: foundMontakhib.education,
        situationFamiliale: foundMontakhib.situationFamiliale,
        jamaaId: foundMontakhib.jamaaId
      });
      
      // Reset selected Jamaa to the user's actual Jamaa
      const originalJamaa = jamaas.find(j => j.id === foundMontakhib.jamaaId);
      setSelectedJamaa(originalJamaa || jamaas[0] || null);
    }
    
    setIsEditing(!isEditing);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-slate-600" />
              <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{t('searchTitle')}</h2>
            
            <div className="flex gap-2">
              <div className="flex-grow">
                <input
                  type="text"
                  value={searchCin}
                  onChange={(e) => setSearchCin(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={t('placeholder.searchCin')}
                  disabled={isSearching}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchCin}
                className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isSearching || !searchCin
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSearching ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('searching')}
                  </span>
                ) : (
                  <>
                    <Search size={16} />
                    {t('search')}
                  </>
                )}
              </button>
            </div>
            
            {searchError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {searchError}
              </div>
            )}
          </div>
        </div>

        {/* Management Section */}
        {foundMontakhib && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 space-y-6">
              {/* Header with actions */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  {t('manageTitle')} <span className="text-blue-600">#{foundMontakhib.id}</span>
                </h2>
                
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={toggleEdit}
                      className="px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md text-sm flex items-center gap-1"
                    >
                      <Pencil size={16} />
                      {t('edit')}
                    </button>
                  ) : (
                    <button
                      onClick={toggleEdit}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm flex items-center gap-1"
                    >
                      <X size={16} />
                      {t('cancel')}
                    </button>
                  )}
                  
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {t('delete')}
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleUpdate} className="space-y-6">
                {/* CIN */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('cin')} <span className="text-red-500">*</span>
                    {isCinValidating && (
                      <span className="ml-2 text-sm text-blue-600">{t('validating')}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      cinError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                    } ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    maxLength={20}
                    readOnly={!isEditing}
                  />
                  {cinError && <p className="text-sm text-red-600">{cinError}</p>}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('nom')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('prenom')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                {/* Birth Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('birthDate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={formData.dateNaissance}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('birthPlace')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lieuNaissance"
                      value={formData.lieuNaissance}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('address')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2.5 border rounded-md text-sm resize-none ${
                      !isEditing 
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                        : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    required
                    readOnly={!isEditing}
                  />
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('sex')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      disabled={!isEditing}
                    >
                      {Object.values(Sex).map(val => (
                        <option key={val} value={val}>{t(`${val}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('situation')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="situationFamiliale"
                      value={formData.situationFamiliale}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      disabled={!isEditing}
                    >
                      {Object.values(SituationFamiliale).map(val => (
                        <option key={val} value={val}>{t(`${val}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Education and Community */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('education')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      disabled={!isEditing}
                    >
                      {Object.values(Education).map(val => (
                        <option key={val} value={val}>{t(`${val}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('jamaa')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="jamaaId"
                      value={formData.jamaaId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-md text-sm ${
                        !isEditing 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                      disabled={!isEditing}
                    >
                      {jamaas.map(j => (
                        <option 
                          key={j.id} 
                          value={j.id}
                          // Highlight the user's Jamaa in the dropdown
                          className={j.id === foundMontakhib.jamaaId ? "font-semibold bg-blue-50" : ""}
                        >
                          {j.nom} (ID: {j.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Last ID Display */}
                {selectedJamaa && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{t('lastId')}</label>
                    <input
                      type="text"
                      value={selectedJamaa.lastId}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                )}

                {/* Update Button */}
                {isEditing && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting || !!cinError || isCinValidating}
                      className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isSubmitting || cinError || isCinValidating
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border border-green-600'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('updating')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Save size={16} />
                          {t('update')}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!foundMontakhib && !searchError && (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('emptyTitle')}</h3>
            <p className="text-gray-500">{t('emptyDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MontakhibManager;