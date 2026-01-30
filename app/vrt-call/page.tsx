"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { CheckCircle2, Circle, Phone, ListChecks, FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CallAnimation } from "@/components/call-animation";
import { ShimmerLoader } from "@/components/shimmer-loader";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

const preCallChecklist: ChecklistItem[] = [
  {
    id: "1",
    text: "Vouchers are live and ready on the Pickyourtrail app",
    completed: false,
  },
  {
    id: "2",
    text: "Documents to carry: Original passports with printed copies, flight tickets, hotel vouchers, colored visa printouts, travel insurance if opted",
    completed: false,
  },
  {
    id: "3",
    text: "Emirates Airlines baggage: 30 kg checked baggage and 7 kg cabin baggage per person",
    completed: false,
  },
  {
    id: "4",
    text: "Hotel check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in and late checkout usually not available",
    completed: false,
  },
  {
    id: "5",
    text: "Tourism Dirham Fee: AED 7 to AED 20 per room per night, payable on arrival at hotel, non-refundable",
    completed: false,
  },
  {
    id: "6",
    text: "Activity timings will be shared 1 day in advance. Driver numbers shared 1 hour before pickup time",
    completed: false,
  },
  {
    id: "7",
    text: "All transfers are on shared basis unless upgraded to private at extra cost",
    completed: false,
  },
  {
    id: "8",
    text: "Desert Safari and Dhow Cruise: Vegetarian food options are limited. Dune bashing not recommended for infants, senior citizens, or pregnant women",
    completed: false,
  },
  {
    id: "9",
    text: "Burj Khalifa combo ticket: Redeem at Burj Khalifa counter in Dubai Mall. Arrive 30 minutes before your slot time",
    completed: false,
  },
  {
    id: "10",
    text: "BAPS Mandir: Register online 1 day prior at mandir.ae/visit. Carry passport for verification. Closed on Mondays",
    completed: false,
  },
  {
    id: "11",
    text: "Airport arrival: Driver will be in arrivals hall with placard showing your name",
    completed: false,
  },
  {
    id: "12",
    text: "Transfer waiting time: 5 minutes for shared transfers, 10 minutes for private transfers. No stops in between",
    completed: false,
  },
  {
    id: "13",
    text: "24/7 live chat support on app starts 3 days before your trip. No WhatsApp support available",
    completed: false,
  },
  {
    id: "14",
    text: "Contact hours: Available 10 AM to 7 PM for any assistance",
    completed: false,
  },
  {
    id: "15",
    text: "Daywise itinerary flow: Explained the trip in chronological order following the voucher's day-by-day structure",
    completed: false,
  },
];

const voucherDetails = {
  customerName: "Sarah Johnson",
};

function VrtCallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callId = searchParams.get("callId") || `call-${Date.now()}`;
  const [checklist, setChecklist] = useState<ChecklistItem[]>(preCallChecklist);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeTab, setActiveTab] = useState<"checklist" | "voucher">("checklist");

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleCallComplete = () => {
    setIsCallActive(false);
    setIsRedirecting(true);
    
    // Pass checklist data to analysis page
    const checklistData = encodeURIComponent(JSON.stringify(checklist));
    
    setTimeout(() => {
      router.push(`/call-analysis?checklist=${checklistData}`);
    }, 1500);
  };

  const handleChecklistUpdate = (updatedItems: ChecklistItem[]) => {
    setChecklist(updatedItems);
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;

  return (
    <div className="flex h-screen flex-col">
      <AppHeader
        pageTitle="VRT Call"
        actionButton={
          !isCallActive ? (
            <button
              onClick={handleStartCall}
              className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Phone className="h-4 w-4" />
              Start Call
            </button>
          ) : null
        }
      />

      <div className="flex flex-1 overflow-hidden bg-slate-50">
        {/* Left: Checklist (40%) */}
        <div className="flex w-[40%] flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900">
                <ListChecks className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Points to Cover</h3>
                <p className="text-xs text-slate-600">
                  {completedCount}/{totalCount} completed
                </p>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-4">
              {checklist.map((item, index) => (
                <Card
                  key={item.id}
                  className={`border p-3 transition-colors ${
                    item.completed
                      ? "border-green-200 bg-green-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {item.completed ? (
                      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-600">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500">
                        <span className="text-[9px] font-medium">{index + 1}</span>
                      </div>
                    )}
                    <span
                      className={`text-[13px] leading-relaxed ${
                        item.completed
                          ? "text-green-900 font-medium"
                          : "text-slate-700"
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Middle: Voucher (40%) */}
        <div className="flex w-[40%] flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900">
                <FileText className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Travel Voucher</h3>
                <p className="text-xs text-slate-600">Customer details & itinerary</p>
              </div>
            </div>
          </div>
          <div className="flex-1 p-5">
            <embed
              src="https://plato-documents-bak.s3.ap-south-1.amazonaws.com/115715/final_voucher_115715.pdf?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4OK42ESOUT55CDPH%2F20260130%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260130T195927Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=92e16059e02ed5ee1dd450cf8cca85dafe73f775cebb28f7a792972cb8d5944c#toolbar=0&navpanes=0&scrollbar=0"
              type="application/pdf"
              className="h-full w-full rounded-lg border border-slate-200"
            />
          </div>
        </div>

        {/* Right: Call Status (20%) */}
        <div className="flex w-[20%] flex-col bg-white">
          {isRedirecting ? (
            <div className="flex flex-1 items-center justify-center bg-slate-50">
              <ShimmerLoader />
            </div>
          ) : isCallActive ? (
            <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
              <div className="w-full max-w-md">
                <CallAnimation 
                  onComplete={handleCallComplete}
                  callId={callId}
                  checklistItems={checklist}
                  onChecklistUpdate={handleChecklistUpdate}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-6">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <Phone className="h-8 w-8 text-slate-700" />
              </div>
              <p className="mb-2 text-center text-sm font-semibold text-slate-900">
                Ready to call
              </p>
              <p className="mb-1 text-center text-sm text-slate-700">
                {voucherDetails.customerName}
              </p>
              <p className="mb-6 text-center text-xs text-slate-500">
                Review checklist & voucher before starting
              </p>
              <button
                onClick={handleStartCall}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                <Phone className="h-4 w-4" />
                Start Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VrtCallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      }
    >
      <VrtCallContent />
    </Suspense>
  );
}
