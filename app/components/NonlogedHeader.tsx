import React from 'react';
import Image from './image';

const NonlogedHeader = () => {
    return (
                <header className="bg-slate-800 shadow-2xl border-b border-gray-700" dir="ltr">
          <div className="container mx-auto px-8 py-6">
            <div className="flex justify-between items-center">
              
              {/* French Text Section */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl font-light tracking-wide mb-2">
                  Wilaya de la <span className="font-normal">Région Oriental</span>
                </h1>
                <div className="w-16 h-0.5 bg-red-600 mb-2"></div>
                <h2 className="text-lg text-gray-300 font-light">
                  Préfecture Oujda Angad
                </h2>
              </div>

              {/* Logo Section */}
              <div className="flex-shrink-0 mx-12">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <Image 
                    src="/assets/logo.png" 
                    fallbackSrc="" 
                    className="w-24 h-24 object-contain"
                    alt="Logo of Wilaya Oriental"
                  />
                </div>
              </div>

              {/* Arabic Text Section */}
              <div className="flex-1 text-right text-white" dir="rtl">
                <h1 className="text-3xl font-light tracking-wide mb-2">
                  ولاية <span className="font-normal">جهة الشرق</span>
                </h1>
                <div className="w-16 h-0.5 bg-red-600 mb-2 ml-auto"></div>
                <h2 className="text-lg text-gray-300 font-light">
                  عمالة وجدة أنجاد
                </h2>
              </div>

            </div>
          </div>

          {/* Subtle Moroccan accent */}
          <div className="h-1 bg-gradient-to-r from-red-700 via-red-600 to-green-700"></div>
        </header>
    )
}

export default NonlogedHeader;