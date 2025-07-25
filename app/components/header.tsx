"use client"
import React, { useState } from 'react';
import { Menu, X, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import Image from './image';
import { useRouter } from 'next/navigation';
import NonlogedHeader from './NonlogedHeader';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/disconnect", {
        method: "POST",
        credentials: "include",
      });
  
      if (response.ok) {
        router.push("/");
      } else {
        console.error("Failed to log out:", await response.text());
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };
  
  const t = useTranslations('menu');
  const menuItems = [
    { name: t('admin') , link:"/home/admin"},
    { name: t('search') ,link:"/home/search"},
    { name: t('add'),link:"/home/add" },
    { name: t('manage'),link:"/home/manage" },
    { name: t('print') ,link:"/home/print"},
    { name: t('statistic') ,link:"/home/statistic"}
  ];

 return (
    <div className="bg-slate-800 shadow-2xl">
      {/* Main Header */}
      <header className="border-b border-gray-700" dir="ltr">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="flex justify-between items-center">
            
            {/* French Text Section */}
            <div className="flex-1 text-white">
              <h1 className="text-xl md:text-3xl font-light tracking-wide mb-2">
                Wilaya de la <span className="font-normal">Région Oriental</span>
              </h1>
              <div className="w-12 md:w-16 h-0.5 bg-red-600 mb-2"></div>
              <h2 className="text-sm md:text-lg text-gray-300 font-light">
                Préfecture Oujda Angad
              </h2>
            </div>

            {/* Logo Section */}
            <div className="flex-shrink-0 mx-4 md:mx-12">
              <div className="bg-white rounded-lg p-2 md:p-4 shadow-lg">
                <Image 
                  src="/assets/logo.png" 
                  fallbackSrc="" 
                  className="w-16 h-16 md:w-24 md:h-24 object-contain"
                  alt="Logo of Wilaya Oriental"
                />
              </div>
            </div>

            {/* Arabic Text Section */}
            <div className="flex-1 text-right text-white" dir="rtl">
              <h1 className="text-xl md:text-3xl font-light tracking-wide mb-2">
                ولاية <span className="font-normal">جهة الشرق</span>
              </h1>
              <div className="w-12 md:w-16 h-0.5 bg-red-600 mb-2 ml-auto"></div>
              <h2 className="text-sm md:text-lg text-gray-300 font-light">
                عمالة وجدة أنجاد
              </h2>
            </div>

          </div>
        </div>
      </header>
      {/* Navigation Menu */}
      <nav className="bg-slate-700 border-b border-gray-600">
        <div className="container mx-auto px-4">
          
          {/* Desktop Navigation - Inline */}
          <div className="hidden md:flex items-center justify-between">
            <div className='flex items-center justify-center'>
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Link href={item.link} className="group px-4 py-3 text-white hover:text-red-400 transition-colors duration-200 relative">
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                    <div className="absolute bottom-[5px] left-0 w-full h-0.5 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                  </Link>
                  {index < menuItems.length - 1 && (
                    <div className="w-px h-4 bg-gray-500 mx-2"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button className="p-2 rounded-full">
                <HelpCircle className="h-5 w-5 text-white hover:text-red-400" />
              </button>
              <button className="p-2  rounded-full">
                <Settings className="h-5 w-5 text-white hover:text-red-400" />
              </button>
              <button 
                onClick={handleLogout} 
                className="px-3 py-2 hover:text-red-400 rounded-xl text-sm md:text-base text-white font-medium"
                >
                {t('disconnect')}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            {/* Mobile Menu Button */}
            <div className="flex items-center justify-between py-3">
              <span className="text-white font-medium">Navigation</span>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 rounded-md hover:bg-slate-600 transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className={`overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="pb-4 space-y-1">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 text-white hover:bg-slate-600 transition-colors duration-200 rounded-md"
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </nav>

      {/* Moroccan accent */}
      <div className="h-1 bg-gradient-to-r from-red-700 via-red-600 to-green-700"></div>
    </div>
  );
};

export default Header;