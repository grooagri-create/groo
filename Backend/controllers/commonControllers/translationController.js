const translationService = require('../../services/translationService');

/**
 * Controller for translation requests
 */
const translateText = async (req, res) => {
    try {
        const { text, targetLang, sourceLang = 'en' } = req.body;
        if (!text || !targetLang) {
            return res.status(400).json({
                success: false,
                message: 'Text and targetLang are required'
            });
        }

        const translation = await translationService.translateText(text, targetLang, sourceLang);
        res.status(200).json({
            success: true,
            data: {
                original: text,
                translation,
                sourceLang,
                targetLang
            }
        });
    } catch (error) {
        console.error('[TranslationController] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const translateBatch = async (req, res) => {
    try {
        const { texts, targetLang, sourceLang = 'en' } = req.body;
        if (!Array.isArray(texts) || texts.length === 0 || !targetLang) {
            return res.status(400).json({
                success: false,
                message: 'Texts (array) and targetLang are required'
            });
        }

        const translations = await translationService.translateBatch(texts, targetLang, sourceLang);
        res.status(200).json({
            success: true,
            data: {
                original: texts,
                translations,
                sourceLang,
                targetLang
            }
        });
    } catch (error) {
        if (error.response?.status === 429) {
            return res.status(429).json({ success: false, message: 'Too many requests' });
        }
        console.error('[TranslationController] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const translateObject = async (req, res) => {
    try {
        const { obj, targetLang, sourceLang = 'en', keysToTranslate = [] } = req.body;
        if (!obj || !targetLang) {
            return res.status(400).json({
                success: false,
                message: 'Object and targetLang are required'
            });
        }

        const translatedObj = await translationService.translateObject(obj, targetLang, sourceLang, keysToTranslate);
        res.status(200).json({
            success: true,
            data: {
                obj: translatedObj,
                sourceLang,
                targetLang
            }
        });
    } catch (error) {
        console.error('[TranslationController] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    translateText,
    translateBatch,
    translateObject
};
