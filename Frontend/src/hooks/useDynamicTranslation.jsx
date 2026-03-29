import { useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import * as translationService from '../services/translationService';

/**
 * Hook for Dynamic Translation (API Data, Product Lists)
 */
export const useDynamicTranslation = (config = { sourceLang: 'en' }) => {
    const { currentCode } = useLanguage();
    const [isTranslating, setIsTranslating] = useState(false);

    /**
     * Single string translation
     */
    const translate = useCallback(async (text) => {
        if (!text || currentCode === config.sourceLang) return text;
        try {
            setIsTranslating(true);
            return await translationService.translateText(text, currentCode, config.sourceLang);
        } finally {
            setIsTranslating(false);
        }
    }, [currentCode, config.sourceLang]);

    /**
     * Batch translation
     */
    const translateBatch = useCallback(async (texts) => {
        if (!Array.isArray(texts) || texts.length === 0 || currentCode === config.sourceLang) return texts;
        try {
            setIsTranslating(true);
            return await translationService.translateBatch(texts, currentCode, config.sourceLang);
        } finally {
            setIsTranslating(false);
        }
    }, [currentCode, config.sourceLang]);

    /**
     * Object property translation
     */
    const translateObject = useCallback(async (obj, keysToTranslate = []) => {
        if (!obj || currentCode === config.sourceLang) return obj;
        try {
            setIsTranslating(true);
            return await translationService.translateObject(obj, currentCode, config.sourceLang, keysToTranslate);
        } finally {
            setIsTranslating(false);
        }
    }, [currentCode, config.sourceLang]);

    return { translate, translateBatch, translateObject, isTranslating };
};
