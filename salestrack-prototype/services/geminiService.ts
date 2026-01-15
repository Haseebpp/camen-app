import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

// Helper to initialize AI. 
// Note: In a real multi-user app, this key would be handled securely on a backend proxy.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSalesData = async (data: AppState): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Prepare a summarized context to avoid token limits on large datasets
    const context = {
      openingBalance: data.settings.openingBalance,
      totalProducts: data.products.length,
      lowStockItems: data.products.filter(p => p.stockQuantity < 5).map(p => p.name),
      topSellingItems: [...data.products].sort((a, b) => b.soldQuantity - a.soldQuantity).slice(0, 5).map(p => ({ name: p.name, sold: p.soldQuantity })),
      recentSalesTotal: data.sales.reduce((acc, curr) => acc + curr.totalAmount, 0),
      salesCount: data.sales.length
    };

    const prompt = `
      You are an expert Sales Analyst. Analyze the following sales context for a retail business:
      ${JSON.stringify(context, null, 2)}

      Please provide a concise analysis including:
      1. Financial Health (Revenue vs Opening Balance).
      2. Inventory Alerts (Low stock, high performers).
      3. A strategic recommendation for increasing sales (e.g., specific combo ideas based on top sellers).
      
      Keep the tone professional and encouraging. Format with clear headings in Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error connecting to AI service. Please ensure your API key is configured correctly.";
  }
};