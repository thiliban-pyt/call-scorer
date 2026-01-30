import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const TRANSCRIPTS_DIR = path.join(process.cwd(), "transcripts");
const TEMP_DIR = path.join(TRANSCRIPTS_DIR, "temp");
const HISTORY_DIR = path.join(TRANSCRIPTS_DIR, "history");

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.mkdir(HISTORY_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();
    
    const body = await request.json();
    const { action, callId, transcript, timestamp } = body;

    if (!callId) {
      return NextResponse.json(
        { error: "Missing callId" },
        { status: 400 }
      );
    }

    const tempFilePath = path.join(TEMP_DIR, `${callId}.json`);
    const historyFilePath = path.join(HISTORY_DIR, `${callId}.json`);

    switch (action) {
      case "clear": {
        // Clear all history files
        try {
          const files = await fs.readdir(HISTORY_DIR);
          await Promise.all(
            files.map(file => fs.unlink(path.join(HISTORY_DIR, file)))
          );
          
          // Also clear temp files
          const tempFiles = await fs.readdir(TEMP_DIR);
          await Promise.all(
            tempFiles.map(file => fs.unlink(path.join(TEMP_DIR, file)))
          );
          
          return NextResponse.json({
            success: true,
            message: "All transcript files cleared",
          });
        } catch (error) {
          console.error("Error clearing files:", error);
          return NextResponse.json({
            success: true,
            message: "Files cleared (or none existed)",
          });
        }
      }

      case "append": {
        if (!transcript) {
          return NextResponse.json(
            { error: "Missing transcript" },
            { status: 400 }
          );
        }

        // Read existing data or create new
        let existingData: { transcripts: Array<{ text: string; timestamp: string }> } = {
          transcripts: [],
        };

        try {
          const fileContent = await fs.readFile(tempFilePath, "utf-8");
          existingData = JSON.parse(fileContent);
        } catch {
          // File doesn't exist yet, use default
        }

        // Append new transcript
        existingData.transcripts.push({
          text: transcript,
          timestamp: timestamp || new Date().toISOString(),
        });

        // Save back to temp file
        await fs.writeFile(tempFilePath, JSON.stringify(existingData, null, 2));

        return NextResponse.json({
          success: true,
          totalSegments: existingData.transcripts.length,
        });
      }

      case "finalize": {
        // Move from temp to history
        try {
          const fileContent = await fs.readFile(tempFilePath, "utf-8");
          const data = JSON.parse(fileContent);
          
          // Add metadata
          data.finalizedAt = new Date().toISOString();
          data.callId = callId;
          
          // Save to history
          await fs.writeFile(historyFilePath, JSON.stringify(data, null, 2));
          
          // Delete temp file
          await fs.unlink(tempFilePath);
          
          return NextResponse.json({
            success: true,
            message: "Transcript finalized and moved to history",
          });
        } catch {
          return NextResponse.json({
            success: false,
            message: "No temp transcript found to finalize",
          });
        }
      }

      case "get": {
        // Try to get from history first, then temp
        try {
          const fileContent = await fs.readFile(historyFilePath, "utf-8");
          return NextResponse.json(JSON.parse(fileContent));
        } catch {
          try {
            const fileContent = await fs.readFile(tempFilePath, "utf-8");
            return NextResponse.json(JSON.parse(fileContent));
          } catch {
            return NextResponse.json({
              transcripts: [],
              message: "No transcript found",
            });
          }
        }
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: clear, append, finalize, or get" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Transcript storage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
