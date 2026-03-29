/**
 * Test Script for Translation API
 * Run this: node scripts/testTranslation.js
 */
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api/v1/translate`;

const testTranslation = async () => {
    console.log('--- Testing Single Translation ---');
    try {
        const res = await axios.post(`${BASE_URL}/translate`, {
            text: 'Hello, how are you?',
            targetLang: 'hi',
            sourceLang: 'en'
        });
        console.log('Original Text: Hello, how are you?');
        console.log('Translated Text (Hindi):', res.data.data.translation);
        console.log('SUCCESS✅');
    } catch (error) {
        console.error('Single translation failed:', error.message);
    }

    console.log('\n--- Testing Batch Translation ---');
    try {
        const res = await axios.post(`${BASE_URL}/batch`, {
            texts: ['Home', 'About', 'Contact Us'],
            targetLang: 'hi',
            sourceLang: 'en'
        });
        console.log('Original Texts:', ['Home', 'About', 'Contact Us']);
        console.log('Translated Texts (Hindi):', res.data.data.translations);
        console.log('SUCCESS✅');
        console.log('\n--- Caching Check ---');
        console.log('Note: Re-running the script will fetch from memory cache on server.');
    } catch (error) {
        console.error('Batch translation failed:', error.message);
    }
};

testTranslation();
