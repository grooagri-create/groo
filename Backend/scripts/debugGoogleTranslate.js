/**
 * Debug Google Translate API Directly
 * This script hits the Google API directly via axios to see the EXACT error message.
 * Run this: node scripts/debugGoogleTranslate.js
 */
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

if (!apiKey) {
    console.error('❌ Error: GOOGLE_TRANSLATE_API_KEY not found in .env file');
    process.exit(1);
}

const debugAPI = async () => {
    console.log('--- Debugging Google Translate API Directly ---');
    console.log('Using API Key starts with:', apiKey.substring(0, 10) + '...');
    
    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        const response = await axios.post(url, {
            q: 'Hello, how are you?',
            target: 'hi',
            source: 'en',
            format: 'text'
        });

        console.log('\n✅ SUCCESS! Google API responded correctly.');
        console.log('Original: Hello, how are you?');
        console.log('Translated:', response.data.data.translations[0].translatedText);
        
    } catch (error) {
        console.error('\n❌ FAILED! Google API returned an error:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.message);
        
        if (error.response?.data) {
            console.log('\n--- Full Error Data from Google ---');
            console.log(JSON.stringify(error.response.data, null, 2));
            console.log('-----------------------------------');
            
            const reason = error.response.data.error?.message;
            if (reason && reason.includes('API has not been used in project')) {
                console.log('\n💡 HO GAYA! Problem mil gayi: Aapko Google Cloud Console mein "Cloud Translation API" enable karni hogi.');
            } else if (reason && reason.includes('Billing')) {
                console.log('\n💡 Problem: Google Cloud account mein Billing (Credit Card) link nahi hai.');
            }
        } else {
            console.log('Check your internet connection or API key format.');
        }
    }
};

debugAPI();
