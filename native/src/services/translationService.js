
/**
 * Simple translation service using Google Translate free API.
 * NOTE: This is for demonstration/light usage. For production with high volume,
 * use a paid API key or a backend proxy.
 */

export const translateText = async (text, targetLang) => {
    if (!text) return '';
    // If target is same as source (assuming Hebrew source), return
    if (targetLang === 'he') return text;

    try {
        // Split text into chunks if too long (simple split by newline for now if needed, 
        // but the API handles decent length. Max is usually around 5k chars)
        // We'll just try the whole text.

        // Using the 'gtx' client which is often used for free access
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=he&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        const data = await response.json();

        // The structure returned is typically [[["translated text", "original", ...], ...], ...]
        if (data && data[0]) {
            // Join all segments
            return data[0].map(segment => segment[0]).join('');
        }

        return text;
    } catch (error) {
        console.warn('Translation failed:', error);
        return text; // Fallback to original
    }
};
