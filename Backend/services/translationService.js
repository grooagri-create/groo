/**
 * Translation Service
 * Implements Google Cloud Translate API with 24-hour in-memory cache
 * Batching and Object translation support
 */
const axios = require('axios');
const { GOOGLE_TRANSLATE_API_KEY, languageCodeMap } = require('../config/googleCloud');

// Simple 24h TTL Cache
const translationCache = new Map();
const TTL = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Cleanup expired cache entries
 */
const cleanupCache = () => {
    const now = Date.now();
    for (const [key, value] of translationCache.entries()) {
        if (now - value.timestamp > TTL) {
            translationCache.delete(key);
        }
    }
};

// Interval cleanup every hour
setInterval(cleanupCache, 60 * 60 * 1000);

/**
 * Core Translation Function
 */
const translateText = async (text, targetLang, sourceLang = 'en') => {
    if (!text || text.trim() === '') return text;
    if (targetLang === sourceLang) return text;

    const cacheKey = `${sourceLang}_${targetLang}_${Buffer.from(text).toString('base64')}`;
    const cached = translationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < TTL)) {
        return cached.translation;
    }

    // Exponential Backoff Retry Logic
    let retries = 0;
    const maxRetries = 3;
    const delays = [1000, 2000, 4000];

    while (retries <= maxRetries) {
        try {
            const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
            const response = await axios.post(url, {
                q: text,
                target: targetLang,
                source: sourceLang,
                format: 'text'
            });

            const translation = response.data.data.translations[0].translatedText;

            // Never cache if translation is the same as original
            if (translation !== text) {
                translationCache.set(cacheKey, {
                    translation,
                    timestamp: Date.now()
                });
            }

            return translation;
        } catch (error) {
            if (error.response?.status === 429) {
                if (retries === maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, delays[retries]));
                retries++;
            } else {
                // DETAILED ERROR LOGGING FOR DEBUGGING
                console.error('[TranslationService] Error:', error.message);
                if (error.response?.data) {
                    console.error('[TranslationService] Google API Error Details:', JSON.stringify(error.response.data));
                }
                return text; // Fallback to original text
            }
        }
    }
    return text;
};

/**
 * Batch Translation
 */
const translateBatch = async (texts, targetLang, sourceLang = 'en') => {
    if (!Array.isArray(texts) || texts.length === 0) return [];
    
    // Process unique texts only
    const uniqueTexts = [...new Set(texts)];
    const translations = await Promise.all(
        uniqueTexts.map(text => translateText(text, targetLang, sourceLang))
    );

    const translationMap = uniqueTexts.reduce((acc, text, index) => {
        acc[text] = translations[index];
        return acc;
    }, {});

    return texts.map(text => translationMap[text]);
};

/**
 * Object Property Translation
 */
const translateObject = async (obj, targetLang, sourceLang = 'en', keysToTranslate = []) => {
    if (!obj || typeof obj !== 'object') return obj;

    const result = Array.isArray(obj) ? [...obj] : { ...obj };
    const itemsToTranslate = Array.isArray(obj) ? result : [result];

    for (const item of itemsToTranslate) {
        for (const key of keysToTranslate) {
            if (item[key] && typeof item[key] === 'string') {
                item[key] = await translateText(item[key], targetLang, sourceLang);
            }
        }
    }

    return result;
};

module.exports = {
    translateText,
    translateBatch,
    translateObject
};
