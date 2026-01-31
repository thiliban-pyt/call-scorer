import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { itinerary } = await request.json();

    if (!itinerary) {
      return NextResponse.json(
        { error: "Missing itinerary data" },
        { status: 400 }
      );
    }

    // Parse the itinerary to understand it better
    let itineraryData;
    try {
      itineraryData = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: `You are a travel operations expert. Analyze the provided itinerary and generate EXACTLY 5 critical "Niner Check" items - the most important points that MUST be communicated to the customer to avoid surprises, complaints, or issues during their trip.

Focus on the TOP 5 most critical items from:
1. Hotel policies (check-in times, deposits, taxes, amenities, room types, location)
2. Flight details (baggage allowance, layovers, meal inclusions)
3. Activity restrictions (age limits, fitness requirements, timing)
4. Documentation requirements (visas, passports, forms)
5. Hidden costs or fees
6. Cancellation policies
7. Service limitations (no WhatsApp support, waiting times, etc.)
8. Important dates and deadlines
9. Contact information and support hours
10. Special requirements or restrictions

Return ONLY a JSON array of EXACTLY 5 strings, each string being one check item. Be specific and actionable. Format: ["Check item 1", "Check item 2", "Check item 3", "Check item 4", "Check item 5"]`
        },
        {
          role: "user",
          content: `Analyze this itinerary and generate niner check items:\n\n${JSON.stringify(itineraryData, null, 2)}`
        }
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Extract JSON array from the response
    let items: string[];
    try {
      // Try to parse as JSON directly
      items = JSON.parse(content);
    } catch {
      // If that fails, try to extract JSON array from markdown code blocks
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        items = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and clean up
        items = content
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter((line: string) => line.length > 0);
      }
    }

    return NextResponse.json({
      items,
      model: "gpt-4o-mini",
      tokens: completion.usage?.total_tokens || 0,
    });

  } catch (error) {
    console.error("Generate niner error:", error);
    return NextResponse.json(
      { error: "Failed to generate niner items" },
      { status: 500 }
    );
  }
}
