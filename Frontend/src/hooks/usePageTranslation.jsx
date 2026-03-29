import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import * as translationService from '../services/translationService';

/**
 * Hook for Page-level Static Text Translation
 * Collects a list of texts and translates them in a single batch
 */
export const usePageTranslation = (staticTexts = [], sourceLang = 'en') => {
    const { currentCode } = useLanguage();
    const [translations, setTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);

    /**
     * Initial Translation Fetch
     */
    useEffect(() => {
        const fetchTranslations = async () => {
            if (currentCode === sourceLang || !staticTexts || staticTexts.length === 0) {
                setTranslations({});
                return;
            }

            try {
                setIsTranslating(true);
                const results = await translationService.translateBatch(staticTexts, currentCode, sourceLang);
                
                const translationMap = staticTexts.reduce((acc, text, index) => {
                    acc[text] = results[index];
                    return acc;
                }, {});

                setTranslations(translationMap);
            } catch (err) {
                console.error('[usePageTranslation] Error:', err);
                setTranslations({});
            } finally {
                setIsTranslating(false);
            }
        };

        fetchTranslations();
    }, [currentCode, sourceLang, JSON.stringify(staticTexts)]);

    /**
     * Get translated text or return original
     */
    const getTranslatedText = useCallback((text) => {
        if (currentCode === sourceLang) return text;
        return translations[text] || text;
    }, [currentCode, sourceLang, translations]);

    return { getTranslatedText, isTranslating, translations };
};
