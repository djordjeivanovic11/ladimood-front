import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '../public/locales/en/common.json';
import commonSr from '../public/locales/sr/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
        en: {
            common: commonEn,
        },
        sr: {
            common: commonSr,
        },
    },
    fallbackLng: 'sr',
    debug: true,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;