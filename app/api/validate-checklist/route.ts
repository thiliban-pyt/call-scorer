import { NextRequest, NextResponse } from "next/server";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ValidationResult {
  completedItems: string[]; // IDs of items that have been covered
  reasoning: Record<string, string>; // ID -> explanation for why it's considered covered
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checklistItems,
      transcriptHistory,
      callId,
    }: {
      checklistItems: ChecklistItem[];
      transcriptHistory: string;
      callId: string;
    } = body;

    if (!checklistItems || !transcriptHistory) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Filter only uncompleted items to check
    const uncompleted = checklistItems.filter((item) => !item.completed);

    if (uncompleted.length === 0) {
      return NextResponse.json({
        completedItems: [],
        reasoning: {},
        callId,
      });
    }

    // Build the prompt for GPT-4o-mini
    const checklistForPrompt = uncompleted
      .map((item, idx) => `${idx + 1}. [ID: ${item.id}] ${item.text}`)
      .join("\n");

    const systemPrompt = `You are a strict compliance checker for sales call transcripts. Your task is to verify which checklist items have been COMPLETELY and ACCURATELY communicated to the customer.

CRITICAL RULES - DO NOT MARK AS COMPLETE UNLESS ALL CONDITIONS ARE MET:

1. **Numbers/Amounts are MANDATORY**: If a checklist item contains ANY number, amount, percentage, or quantity (like "70 AED", "20%", "5 days", etc.), the EXACT same number must appear in the transcript. 
   - ❌ WRONG: Checklist says "Tourism fee 70 AED" → Transcript says "Tourism fee payable" → DO NOT MARK COMPLETE
   - ✅ CORRECT: Checklist says "Tourism fee 70 AED" → Transcript says "tourism fee is 70 AED" or "seventy dirhams tourism fee" → MARK COMPLETE

2. **No Partial Credit**: If only part of the information was conveyed, mark as NOT complete.
   - ❌ WRONG: Checklist says "Visa fee 500 AED, payable on arrival" → Transcript says "visa fee payable on arrival" → DO NOT MARK COMPLETE

3. **Exact Facts Required**: All key facts in the checklist item must be mentioned, not just the topic.

4. **Be Strict, Not Lenient**: When in doubt, DO NOT mark as complete.

Respond in JSON format only:
{
  "completedItems": ["id1", "id2"],
  "reasoning": {
    "id1": "Brief explanation of how this was covered",
    "id2": "Brief explanation of how this was covered"
  }
}

If no items were covered, respond with:
{
  "completedItems": [],
  "reasoning": {}
}`;

    const userPrompt = `Here is the transcript of the call so far:
---
${transcriptHistory}
---

Here are the checklist items to verify (only check uncompleted ones):
${checklistForPrompt}

Determine which items have been FULLY and ACCURATELY conveyed. Remember: if a checklist item contains any specific numbers, prices, percentages, or quantities, those EXACT values must be present in the transcript.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: response.status }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        completedItems: [],
        reasoning: {},
        callId,
      });
    }

    try {
      const parsed: ValidationResult = JSON.parse(content);
      return NextResponse.json({
        ...parsed,
        callId,
      });
    } catch {
      console.error("Failed to parse OpenAI response:", content);
      return NextResponse.json({
        completedItems: [],
        reasoning: {},
        callId,
      });
    }
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
