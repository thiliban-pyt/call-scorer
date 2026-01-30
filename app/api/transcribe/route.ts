import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const callId = formData.get("callId") as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Log file info for debugging
    console.log("Audio file received:", {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // Check if file has content
    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: "Audio file is empty" },
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

    // Convert to buffer and create new file with correct type
    const buffer = await audioFile.arrayBuffer();
    const blob = new Blob([buffer], { type: "audio/webm" });
    
    // Create form data for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append("file", blob, "audio.webm");
    openaiFormData.append("model", "whisper-1");
    openaiFormData.append("language", "en");
    openaiFormData.append("response_format", "json");

    // Call OpenAI Whisper API
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: openaiFormData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "Transcription failed", details: error },
        { status: response.status }
      );
    }

    const result = await response.json();
    const transcript = result.text || "";

    return NextResponse.json({
      transcript,
      timestamp: new Date().toISOString(),
      callId,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
