import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('footer');
    return (
        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-8 py-12">

            {/* Main Footer Content */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">

              {/* Company Info */}
              <div>
                <h3 className="text-xl font-medium mb-4">
                  {t('footertitle')}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  {t('footerdescription')}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-medium mb-4">{t('footernavtitle')}</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {t('footernavhome')}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {t('footernavregister')}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {t('footernavconsult')}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {t('footernavhelp')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-medium mb-4">{t('footercontacttitle')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">{t('footercontactlocation')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">{t('footercontactphone')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">{t('footercontactemail')}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-gray-400 text-sm">
                    {t('footerbottomcopyright')}
                  </p>

                  {/* Language Switcher */}
                  <LanguageSwitcher />
                </div>

                <div className="flex gap-6">
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    {t('footerbottomprivacy')}
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    {t('footerbottomterms')}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </footer>
    )
}