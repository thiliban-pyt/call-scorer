"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Phone, Check, Loader2, FileText, ListChecks, AlertTriangle } from "lucide-react";
import { generateCallGuidance } from "@/lib/ai-utils";
import { mockTravelEmail, mockChatHistory } from "@/lib/mock-data";
import { mockBriefingCalls } from "@/lib/mock-calls";
import { CallAnimation } from "@/components/call-animation";
import type { ChecklistItem } from "@/lib/useCallRecording";

function CallInProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callId = searchParams.get("callId") || `call-${Date.now()}`;
  const [guidance, setGuidance] = useState<any>(null);
  const [callActive, setCallActive] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [activeTab, setActiveTab] = useState<"checklist" | "voucher">("checklist");

  const selectedCall = mockBriefingCalls.find((call) => call.id === callId) || mockBriefingCalls[0];

  useEffect(() => {
    const coaching = generateCallGuidance(mockTravelEmail, mockChatHistory);
    setGuidance(coaching);

    // Convert narrative points to checklist items
    if (coaching?.narrative) {
      const items: ChecklistItem[] = coaching.narrative.map(
        (point: string, index: number) => ({
          id: `point-${index}`,
          text: point,
          completed: false,
        })
      );
      setChecklistItems(items);
    }
  }, []);

  const handleStartCall = () => {
    setCallActive(true);
  };

  const handleCallComplete = () => {
    router.push("/call-analysis");
  };

  const handleChecklistUpdate = (updatedItems: ChecklistItem[]) => {
    setChecklistItems(updatedItems);
  };

  if (!guidance || !selectedCall) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  const completedCount = checklistItems.filter((i) => i.completed).length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {selectedCall.customerName}
            </p>
            <p className="text-xs text-slate-500">Booking: {selectedCall.bookingId}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side: Tabbed Section - Checklist & Voucher */}
          <div>
            <div className="sticky top-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850">
              {/* Tab Headers */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "checklist"
                      ? "border-b-2 border-slate-900 text-slate-900 dark:border-white dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  <ListChecks className="h-4 w-4" />
                  Points to Cover
                  {callActive && (
                    <span className="ml-1 text-xs text-slate-400">
                      {completedCount}/{checklistItems.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("voucher")}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "voucher"
                      ? "border-b-2 border-slate-900 text-slate-900 dark:border-white dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Voucher Details
                </button>
              </div>

              {/* Tab Content */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
                {activeTab === "checklist" ? (
                  <div className="space-y-3">
                    {[...checklistItems]
                      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
                      .map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-500 ${
                            item.completed
                              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                              item.completed
                                ? "bg-green-500 text-white scale-110"
                                : "bg-slate-900 text-white dark:bg-slate-700"
                            }`}
                          >
                            {item.completed ? (
                              <Check className="h-3 w-3 animate-in zoom-in duration-300" />
                            ) : (
                              <span className="text-xs font-semibold">
                                {checklistItems.findIndex((i) => i.id === item.id) + 1}
                              </span>
                            )}
                          </div>
                          <p
                            className={`flex-1 text-sm leading-relaxed transition-all duration-300 ${
                              item.completed
                                ? "text-green-700 dark:text-green-300"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {item.text}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Voucher Details Section */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                        Booking Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Booking ID:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedCall.bookingId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Customer:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedCall.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Destination:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedCall.airport}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Travel Date:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedCall.callDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Overview */}
                    {guidance.chatSummary && (
                      <>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                            Trip Overview
                          </h3>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {guidance.chatSummary.trip_overview}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                            Known Preferences
                          </h3>
                          <ul className="space-y-1">
                            {guidance.chatSummary.known_preferences.map((pref: string, idx: number) => (
                              <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                                • {pref}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
                          <div className="mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                              Concerns to Address
                            </h3>
                          </div>
                          <ul className="space-y-1">
                            {guidance.chatSummary.concerns_raised.map((concern: string, idx: number) => (
                              <li key={idx} className="text-sm text-orange-800 dark:text-orange-200">
                                • {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Call Animation + Transcripts */}
          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-850">
              {!callActive ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-700">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    Ready to call {selectedCall.customerName}
                  </p>
                  <button
                    onClick={handleStartCall}
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    <Phone className="h-4 w-4" />
                    Start Call
                  </button>
                </div>
              ) : (
                <CallAnimation
                  onComplete={handleCallComplete}
                  callId={callId}
                  checklistItems={checklistItems}
                  onChecklistUpdate={handleChecklistUpdate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallInProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      }
    >
      <CallInProgressContent />
    </Suspense>
  );
}
