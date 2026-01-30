"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface TranscriptLine {
  text: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface UseCallRecordingOptions {
  callId: string;
  checklistItems: ChecklistItem[];
  onTranscriptUpdate?: (transcripts: TranscriptLine[]) => void;
  onChecklistUpdate?: (items: ChecklistItem[]) => void;
  chunkDurationMs?: number;
}

export function useCallRecording({
  callId,
  checklistItems,
  onTranscriptUpdate,
  onChecklistUpdate,
  chunkDurationMs = 10000, // 10 seconds default
}: UseCallRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const [currentChecklist, setCurrentChecklist] =
    useState<ChecklistItem[]>(checklistItems);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptsRef = useRef<TranscriptLine[]>([]);
  const checklistRef = useRef<ChecklistItem[]>(checklistItems);
  const isRecordingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  useEffect(() => {
    checklistRef.current = currentChecklist;
  }, [currentChecklist]);

  useEffect(() => {
    setCurrentChecklist(checklistItems);
    checklistRef.current = checklistItems;
  }, [checklistItems]);

  // Process chunk in background - doesn't block recording
  const processChunkInBackground = useCallback(
    async (audioBlob: Blob) => {
      if (audioBlob.size === 0) return;

      setIsProcessing(true);

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");
        formData.append("callId", callId);

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Transcription failed");
        }

        const data = await response.json();
        const transcript = data.transcript?.trim();
        console.log("[Transcription] Received:", transcript?.substring(0, 100) || "(empty)");

        if (transcript) {
          const newLine: TranscriptLine = {
            text: transcript,
            timestamp: data.timestamp,
          };

          // Update state
          setTranscripts((prev) => {
            const updated = [...prev, newLine];
            onTranscriptUpdate?.(updated);
            return updated;
          });

          // Store transcript in temp folder (fire and forget)
          fetch("/api/transcript-storage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "append",
              callId,
              transcript,
              timestamp: data.timestamp,
            }),
          }).catch(console.error);

          // Validate checklist after each transcription (fire and forget)
          const fullTranscript = [...transcriptsRef.current, newLine]
            .map((t) => t.text)
            .join(" ");
          
          validateChecklistInBackground(fullTranscript);
        }
      } catch (err) {
        console.error("Transcription error:", err);
        setError(err instanceof Error ? err.message : "Transcription failed");
      } finally {
        setIsProcessing(false);
      }
    },
    [callId, onTranscriptUpdate]
  );

  const validateChecklistInBackground = useCallback(
    async (fullTranscript: string) => {
      try {
        console.log("[Checklist] Validating with transcript:", fullTranscript.substring(0, 200));
        console.log("[Checklist] Items to check:", checklistRef.current.map(i => ({ id: i.id, completed: i.completed })));
        
        const response = await fetch("/api/validate-checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checklistItems: checklistRef.current,
            transcriptHistory: fullTranscript,
            callId,
          }),
        });

        if (!response.ok) {
          console.error("[Checklist] Validation request failed:", response.status);
          return;
        }

        const data = await response.json();
        console.log("[Checklist] Validation response:", data);
        const completedIds = data.completedItems || [];

        if (completedIds.length > 0) {
          console.log("[Checklist] Marking completed:", completedIds);
          setCurrentChecklist((prev) => {
            const updated = prev.map((item) =>
              completedIds.includes(item.id)
                ? { ...item, completed: true }
                : item
            );
            console.log("[Checklist] Calling onChecklistUpdate with:", updated.filter(i => i.completed).length, "completed items");
            onChecklistUpdate?.(updated);
            return updated;
          });
        }
      } catch (err) {
        console.error("Checklist validation error:", err);
      }
    },
    [callId, onChecklistUpdate]
  );

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      isRecordingRef.current = true;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Function to create and start a new MediaRecorder
      const startNewRecording = () => {
        if (!streamRef.current || !isRecordingRef.current) return;
        
        const recorder = new MediaRecorder(streamRef.current, {
          mimeType: "audio/webm;codecs=opus",
        });
        
        const localChunks: Blob[] = [];
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            localChunks.push(event.data);
          }
        };
        
        recorder.onstop = () => {
          if (localChunks.length > 0 && isRecordingRef.current) {
            // Create a complete WebM blob
            const audioBlob = new Blob(localChunks, { type: "audio/webm" });
            // Process in background
            processChunkInBackground(audioBlob);
          }
          
          // Start next recording immediately if still recording
          if (isRecordingRef.current) {
            startNewRecording();
          }
        };
        
        recorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setError("Recording error occurred");
        };
        
        mediaRecorderRef.current = recorder;
        recorder.start();
        
        // Stop after chunk duration to get complete WebM file
        setTimeout(() => {
          if (recorder.state === "recording" && isRecordingRef.current) {
            recorder.stop();
          }
        }, chunkDurationMs);
      };

      // Start first recording
      startNewRecording();
      setIsRecording(true);

    } catch (err) {
      console.error("Recording error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
      isRecordingRef.current = false;
    }
  }, [chunkDurationMs, processChunkInBackground]);

  const stopRecording = useCallback(async () => {
    isRecordingRef.current = false;

    // Stop media recorder
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // Clear any remaining chunks from memory
    chunksRef.current = [];

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);

    // Finalize transcript - move from temp to history
    try {
      await fetch("/api/transcript-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finalize",
          callId,
        }),
      });
    } catch (err) {
      console.error("Failed to finalize transcript:", err);
    }
  }, [callId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      chunksRef.current = [];
    };
  }, []);

  const getFullTranscript = useCallback(() => {
    return transcripts.map((t) => t.text).join(" ");
  }, [transcripts]);

  return {
    isRecording,
    isProcessing,
    transcripts,
    currentChecklist,
    error,
    startRecording,
    stopRecording,
    getFullTranscript,
  };
}
