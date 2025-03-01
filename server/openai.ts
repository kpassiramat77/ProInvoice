import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateInvoiceDescription(details: {
  clientName: string;
  amount: number;
  services: string[];
}): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a clear, professional invoice description based on the client name, amount, and any services provided. Keep it concise but detailed.",
        },
        {
          role: "user",
          content: `Generate an invoice description for client "${details.clientName}" for amount $${details.amount}${details.services.length ? ` for services: ${details.services.join(", ")}` : ""}.`,
        },
      ],
    });

    const description = response.choices[0].message.content;
    if (!description) {
      throw new Error("Failed to generate description");
    }

    return description;
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Return a default description instead of throwing
    return `Professional services provided to ${details.clientName}`;
  }
}

export interface ExpenseCategory {
  mainCategory: string;
  subCategory: string;
  confidence: number;
  explanation: string;
}

export async function categorizeExpense(description: string): Promise<ExpenseCategory> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the expense description and categorize it in detail. Consider the following main categories:
            - Office Supplies (e.g., stationery, printer supplies)
            - Travel (e.g., flights, hotels, meals)
            - Software (e.g., subscriptions, licenses)
            - Hardware (e.g., computers, phones)
            - Marketing (e.g., advertising, events)
            - Professional Services (e.g., consulting, legal)
            - Utilities (e.g., internet, phone)
            - Other

            Provide:
            1. The most appropriate main category
            2. A specific sub-category
            3. Confidence score (0-1)
            4. Brief explanation of the categorization

            Return the result as a JSON object with properties:
            {
              "mainCategory": string,
              "subCategory": string,
              "confidence": number,
              "explanation": string
            }`,
        },
        {
          role: "user",
          content: description,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Validate and normalize the response
    return {
      mainCategory: result.mainCategory || "Other",
      subCategory: result.subCategory || "Miscellaneous",
      confidence: Math.min(1, Math.max(0, result.confidence || 0)),
      explanation: result.explanation || "No explanation provided",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      mainCategory: "Other",
      subCategory: "Miscellaneous",
      confidence: 0,
      explanation: "Failed to categorize expense",
    };
  }
}