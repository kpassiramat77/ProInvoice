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
    });

    const category = response.choices[0].message.content;
    if (!category || !["Office Supplies", "Travel", "Software", "Hardware", "Marketing", "Other"].includes(category)) {
      return "Other";
    }

    return category;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Other";
  }
}