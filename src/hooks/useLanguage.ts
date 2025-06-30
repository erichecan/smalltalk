import { useTranslation } from 'react-i18next';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const supportedLanguages: SupportedLanguage[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文'
  }
];

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getCurrentLanguage = (): SupportedLanguage => {
    const currentCode = i18n.language;
    return supportedLanguages.find(lang => lang.code === currentCode) || supportedLanguages[0];
  };

  return {
    currentLanguage: i18n.language,
    currentLanguageInfo: getCurrentLanguage(),
    supportedLanguages,
    changeLanguage,
    isReady: i18n.isInitialized
  };
};