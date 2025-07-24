"use client"
import React, { useState } from 'react';
import { Search, User, CreditCard, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SearchResult {
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  adresse: string;
  sex: string;
}

export default function SearchPage() {
  const [searchType, setSearchType] = useState('cin');
  const [searchQuery, setSearchQuery] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('search');

  const handleSearch = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    // Validate inputs
    if (searchType === 'cin' && !searchQuery.trim()) {
      setError(t('cinRequired'));
      return;
    }
    
    if (searchType === 'name' && !nom.trim() && !prenom.trim()) {
      setError(t('nameRequired'));
      return;
    }
    
    setIsSearched(true);
    setIsLoading(true);
    setError(null);
    
    try {
      let query = '';
      let variables = {};
      
      if (searchType === 'cin') {
        // CIN search query
        query = `
          query SearchByCin($cin: String!) {
            searchMontakhibs(cin: $cin) {
              cin
              nom
              prenom
              dateNaissance
              adresse
              sex
            }
          }
        `;
        variables = { cin: searchQuery };
      } else {
        // Name search query
        query = `
          query SearchByName($nom: String!, $prenom: String!) {
            searchMontakhibByNomAndPrenom(nom: $nom, prenom: $prenom) {
              cin
              nom
              prenom
              dateNaissance
              adresse
              sex
            }
          }
        `;
        variables = { 
          nom: nom.trim(), 
          prenom: prenom.trim() 
        };
      }
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables })
      });

      const { data, errors } = await response.json();
      
      if (errors) {
        throw new Error(errors[0]?.message || 'API error');
      }
      
      // Set results based on search type
      const searchResults = searchType === 'cin' 
        ? data.searchMontakhibs 
        : data.searchMontakhibByNomAndPrenom;
      
      setResults(searchResults || []);
      
      if (!searchResults || searchResults.length === 0) {
        setError(t('noResults.title'));
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(t('searchError'));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setNom('');
    setPrenom('');
    setResults([]);
    setIsSearched(false);
    setError(null);
  };

  return (
    <div className="container mx-auto">
      <div className="px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-2">
          <Search className="h-8 w-8 text-blue-600" />
          <h1 className="ml-3 text-2xl font-bold text-gray-900">{t('advancedSearch')}</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('searchCriteria')}</h2>

            <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setSearchType('cin')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  searchType === 'cin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                {t('byCIN')}
              </button>
              <button
                type="button"
                onClick={() => setSearchType('name')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  searchType === 'name'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="h-4 w-4" />
                {t('byName')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {searchType === 'cin' ? (
              <div>
                <label htmlFor="cin" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cinLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cin"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('cinPlaceholder')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('nomLabel')}
                  </label>
                  <input
                    type="text"
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder={t('nomPlaceholder')}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('prenomLabel')}
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder={t('prenomPlaceholder')}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {error && !isSearched && (
              <div className="text-red-500 text-sm py-2">
                {error}
              </div>
            )}

            <div className="flex space-x-4 gap-3">
              <button
                type="submit"
                onClick={handleSearch}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors gap-2 disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('searching')}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    {t('searchButton')}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetSearch}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-75"
              >
                {t('resetButton')}
              </button>
            </div>
          </div>
        </div>

        {isSearched && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('resultsTitle')}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Filter className="h-4 w-4 mr-1" />
                  {results.length} {t('resultsCount')}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">{t('searching')}</p>
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 text-lg font-medium">
                  {error}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {t('tryAgain')}
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">{t('noResults.title')}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {t('noResults.subtitle')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('table.cin')}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('table.nom')}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('table.prenom')}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('table.birthDate')}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('table.adresse')}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('table.sex')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.cin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(result.dateNaissance).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.adresse}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.sex}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}