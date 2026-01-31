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
      .map((item) => `ID: ${item.id} | ${item.text}`)
      .join("\n");

    const systemPrompt = `You are a strict compliance checker for sales call transcripts. Your task is to verify which checklist items have been COMPLETELY and ACCURATELY communicated to the customer.

CRITICAL RULES - DO NOT MARK AS COMPLETE UNLESS ALL CONDITIONS ARE MET:

1. **Numbers/Amounts are MANDATORY**: If a checklist item contains ANY number, amount, percentage, or quantity (like "70 AED", "20%", "5 days", etc.), the same must have been conveyed in the transcript. 
   - :x: WRONG: Checklist says "Tourism fee 70 AED" → Transcript says "Tourism fee payable" → DO NOT MARK COMPLETE
   - :white_check_mark: CORRECT: Checklist says "Tourism fee 70 AED" → Transcript says "tourism fee is 70 AED" or "seventy dirhams tourism fee" (Basically any sort of number / rate mentioned in transcript) → MARK COMPLETE

2. **Partial Credit**: If only part of the information was conveyed, understand if the seller has conveyed it in some other manner also. There are always a million ways of addressing the same.
3. **Exact Facts Required**: All key facts in the checklist item must be mentioned, not just the topic.

4. **Be Strict, Not Lenient**: When in doubt, mark as complete only after understanding the meaning and if they conveyed the point in some other way.

IMPORTANT: Return ONLY the numeric ID values (like "6", "12"), NOT "id: 6" or "ID: 6". Just the plain number.

Respond in JSON format only:
{
  "completedItems": ["6", "12"],
  "reasoning": {
    "6": "Brief explanation of how this was covered",
    "12": "Brief explanation of how this was covered"
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
