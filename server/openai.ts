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
          content: "You are a professional invoice writer. Create a clear, detailed, and professional description for an invoice based on the provided details. The description should be concise but comprehensive.",
        },
        {
          role: "user",
          content: JSON.stringify(details),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.description;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate invoice description");
  }
}

export async function categorizeExpense(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Categorize the expense into one of these categories: 'Office Supplies', 'Travel', 'Software', 'Hardware', 'Marketing', 'Other'. Return only the category name.",
        },
        {
          role: "user",
          content: description,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.category;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Other";
  }
}
