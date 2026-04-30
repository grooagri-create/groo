const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ success: false, message: "Chatbot API key is not configured." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Read the project knowledge base file
    const fs = require('fs');
    const path = require('path');
    let projectKnowledge = "";
    try {
      const kbPath = path.join(__dirname, '../utils/chatbot_knowledge.txt');
      projectKnowledge = fs.readFileSync(kbPath, 'utf8');
    } catch (err) {
      console.warn("Knowledge base file not found or couldn't be read.");
    }

    // System Instruction to customize the bot for GrooAgri
    const systemInstruction = `
      तुम 'GrooAgri' नाम की एक एग्रीकल्चर (कृषि) कंपनी के एक एक्सपर्ट AI असिस्टेंट हो। 
      तुम्हारा काम सिर्फ खेती, फसलों, किसानों की मदद, और GrooAgri के प्रोडक्ट्स/सर्विसेज से जुड़े सवालों के जवाब देना है। 
      
      यहाँ GrooAgri कंपनी की पूरी जानकारी (Knowledge Base) दी गई है:
      """
      ${projectKnowledge}
      """
      
      नियम:
      1. ऊपर दी गई "Knowledge Base" की जानकारी के आधार पर ही सटीक जवाब दो।
      2. अगर कोई यूज़र खेती या GrooAgri के अलावा कुछ और पूछता है (जैसे राजनीति, फ़िल्में, कोडिंग, आदि), तो नम्रता से मना कर दो और कहो: "मैं GrooAgri का AI असिस्टेंट हूँ, मैं केवल कृषि और खेती से जुड़े सवालों के जवाब दे सकता हूँ।"
      3. अगर किसी सवाल का जवाब Knowledge Base में नहीं है, तो कहो कि "माफ़ करें, मुझे इसकी पक्की जानकारी नहीं है, कृपया support टीम से संपर्क करें।" अपनी तरफ से गलत जानकारी मत देना।
      4. तुम्हारे जवाब हिंदी और इंग्लिश (Hinglish) में, छोटे और आसानी से समझ आने वाले होने चाहिए।
      5. हमेशा प्यार से और मददगार तरीके से बात करो।
      6. अपने जवाब को मार्कडाउन फॉर्मेट में मत देना, प्लेन टेक्स्ट या सिंपल पैराग्राफ इस्तेमाल करना ताकि UI में पढ़ने में आसानी हो।
    `;

    let text;
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: systemInstruction 
      });
      const result = await model.generateContent(message);
      text = result.response.text();
    } catch (error) {
      console.warn("Primary model 'gemini-flash-latest' failed, trying fallback...", error.message);
      try {
        const fallbackModel = genAI.getGenerativeModel({ 
          model: "gemini-pro",
        });
        // gemini-pro does not officially support systemInstruction in the same way, but we can prepend the prompt
        // Or we can just use gemini-1.5-flash-latest
        const fallbackResult = await fallbackModel.generateContent(`${systemInstruction}\n\nUser Question: ${message}`);
        text = fallbackResult.response.text();
      } catch (fallbackError) {
        throw fallbackError; // If fallback also fails, throw to main catch block
      }
    }

    res.status(200).json({ 
      success: true,
      reply: text 
    });

  } catch (error) {
    console.error("Chatbot API Error:", error);
    res.status(500).json({ success: false, message: "Chatbot service is currently unavailable. Please try again later." });
  }
};
