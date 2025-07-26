'use client';

import { useTranslations } from 'next-intl';
import { getToken } from '@/utils/auth/token';
import { Mail } from 'lucide-react';
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

const backendUrlRest = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const MontakhibForm: React.FC = () => {
  const t = useTranslations('add');
  const token = getToken();

  const [jamaas, setJamaas] = useState<JamaaDTO[]>([]);
  const [selectedJamaa, setSelectedJamaa] = useState<JamaaDTO | null>(null);

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

  const [cinError, setCinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCinValidating, setIsCinValidating] = useState(false);

  useEffect(() => {
    const fetchJamaas = async () => {
      try {
        const res = await fetch(`${backendUrlRest}/jamaas`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        const data: JamaaDTO[] = await res.json();
        setJamaas(data);

        if (data.length > 0) {
          setFormData(prev => ({ ...prev, jamaaId: data[0].id }));
          setSelectedJamaa(data[0]);
        }
      } catch (err) {
        console.error('Error fetching Jamaas:', err);
      }
    };

    fetchJamaas();
  }, []);

  useEffect(() => {
    if (formData.cin.length < 5) {
      setCinError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCinValidating(true);
      try {
        const res = await fetch(`${backendUrlRest}/add/montakhibs/search?cin=${formData.cin}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = await res.json();
        setCinError(data.length > 0 ? t('cinExists') : null);
      } catch (err) {
        console.error('CIN validation error:', err);
        setCinError(t('cinValidationError'));
      } finally {
        setIsCinValidating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cin, t]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'jamaaId' ? Number(value) : value
    }));

    if (name === 'jamaaId') {
      const jamaa = jamaas.find(j => j.id === Number(value));
      setSelectedJamaa(jamaa || null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (cinError || isCinValidating) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrlRest}/add/montakhibs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
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
          jamaaId: jamaas[0]?.id || 0,
        });
        setSelectedJamaa(jamaas[0] || null);
        console.info(t('success'), data.id);
      } else {
        console.warn(t('creationFailed'));
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-slate-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">{t('formTitle')}</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 space-y-6">
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
                }`}
                required
                maxLength={20}
                placeholder={t('placeholder.cin')}
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  placeholder={t('placeholder.nom')}
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  placeholder={t('placeholder.prenom')}
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  placeholder={t('placeholder.birthPlace')}
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                required
                placeholder={t('placeholder.address')}
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  {jamaas.map(j => (
                    <option key={j.id} value={j.id}>
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

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !!cinError || isCinValidating}
                className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting || cinError || isCinValidating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500 border border-slate-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('creating')}
                  </span>
                ) : (
                  t('create')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MontakhibForm;
