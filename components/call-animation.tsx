"use client";

import { useEffect, useState } from "react";
import { Phone, PhoneOff, Mic, MicOff, Loader2, Gauge } from "lucide-react";
import { useCallRecording, ChecklistItem } from "@/lib/useCallRecording";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpeechSpeedData {
  wpm: number;
  status: "slow" | "good" | "fast" | "too-fast";
  message: string;
}

interface CallAnimationProps {
  onComplete: () => void;
  callId: string;
  checklistItems: ChecklistItem[];
  onChecklistUpdate?: (items: ChecklistItem[]) => void;
}

export function CallAnimation({
  onComplete,
  callId,
  checklistItems,
  onChecklistUpdate,
}: CallAnimationProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<"connecting" | "active" | "ending">("connecting");
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeedData | null>(null);

  const {
    isRecording,
    isProcessing,
    transcripts,
    error,
    startRecording,
    stopRecording,
  } = useCallRecording({
    callId,
    checklistItems,
    onChecklistUpdate,
  });

  // Calculate speech speed from the latest transcript
  useEffect(() => {
    if (transcripts.length === 0) return;
    
    const latestTranscript = transcripts[transcripts.length - 1];
    const wordCount = latestTranscript.text.split(/\s+/).filter(w => w.length > 0).length;
    
    const chunkDurationSeconds = 10;
    const wpm = Math.round((wordCount / chunkDurationSeconds) * 60);
    
    let speedStatus: SpeechSpeedData["status"];
    let message: string;
    
    if (wpm < 100) {
      speedStatus = "slow";
      message = "Clear pace";
    } else if (wpm < 140) {
      speedStatus = "good";
      message = "Good pace";
    } else if (wpm < 170) {
      speedStatus = "fast";
      message = "Slightly fast";
    } else {
      speedStatus = "too-fast";
      message = "Too fast";
    }
    
    setSpeechSpeed({ wpm, status: speedStatus, message });
  }, [transcripts]);

  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setStatus("active");
      startRecording();
    }, 1000);

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(interval);
    };
  }, [startRecording]);

  const handleEndCall = async () => {
    setStatus("ending");
    await stopRecording();
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSpeedColor = (status: SpeechSpeedData["status"]) => {
    switch (status) {
      case "slow": return "text-slate-600 dark:text-slate-400";
      case "good": return "text-slate-900 dark:text-white";
      case "fast": return "text-amber-600 dark:text-amber-400";
      case "too-fast": return "text-red-600 dark:text-red-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Call Status - Clean & Professional */}
      <div className="text-center">
        {/* Minimal Call Icon */}
        <div className="mb-4 inline-flex items-center justify-center">
          <div className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 ${
            status === "ending" 
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950" 
              : status === "active"
              ? "border-slate-900 bg-slate-900 dark:border-white dark:bg-white"
              : "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
          }`}>
            {status === "ending" ? (
              <PhoneOff className="h-8 w-8 text-red-600 dark:text-red-400" />
            ) : (
              <Phone className={`h-8 w-8 ${
                status === "active" 
                  ? "text-white dark:text-slate-900" 
                  : "text-slate-400"
              }`} />
            )}
            {/* Subtle recording indicator */}
            {status === "active" && isRecording && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-2">
          <span className="font-mono text-3xl font-light tracking-tight text-slate-900 dark:text-white">
            {formatDuration(callDuration)}
          </span>
        </div>

        {/* Status */}
        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-500">
          {status === "connecting" && "Connecting..."}
          {status === "active" && (
            <>
              {isRecording ? (
                <span className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-red-500" />
                  Recording
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <MicOff className="h-3.5 w-3.5" />
                  Paused
                </span>
              )}
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing
                </span>
              )}
            </>
          )}
          {status === "ending" && "Ending call..."}
        </div>

        {/* End Call Button */}
        {status === "active" && (
          <button
            onClick={handleEndCall}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            <PhoneOff className="h-4 w-4" />
            End Call
          </button>
        )}
      </div>

      {/* Live Transcript */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Transcript
          </span>
          <span className="text-xs text-slate-400">
            {transcripts.length} segments
          </span>
        </div>
        <ScrollArea className="h-[180px]">
          <div className="p-4">
            {transcripts.length === 0 ? (
              <p className="text-center text-sm text-slate-400">
                {status === "connecting" ? "Connecting..." : "Listening..."}
              </p>
            ) : (
              <div className="space-y-3">
                {transcripts.map((line, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="text-slate-700 dark:text-slate-300">{line.text}</p>
                    <span className="text-xs text-slate-400">
                      {new Date(line.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Speech Speed - Minimal */}
      {speechSpeed && status === "active" && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500">
            <Gauge className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Speed</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${getSpeedColor(speechSpeed.status)}`}>
              {speechSpeed.message}
            </span>
            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
              {speechSpeed.wpm} <span className="text-xs text-slate-400">wpm</span>
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
