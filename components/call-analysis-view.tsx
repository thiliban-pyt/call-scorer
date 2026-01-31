"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertTriangle, ListTodo, TrendingUp, Clock, ArrowLeft, Loader2 } from "lucide-react";
import type { CallAnalysis } from "@/lib/types";
import Link from "next/link";

interface CallAnalysisViewProps {
  analysis: CallAnalysis;
}

export function CallAnalysisView({ analysis }: CallAnalysisViewProps) {
  const complianceColor = 
    analysis.compliance_score.percentage >= 90 ? "text-green-600" :
    analysis.compliance_score.percentage >= 70 ? "text-orange-600" :
    "text-red-600";

  // Determine call quality based on compliance percentage
  const getCallQuality = (percentage: number) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Very Good";
    if (percentage >= 70) return "Good";
    if (percentage >= 50) return "Fair";
    return "Poor";
  };

  const callQuality = getCallQuality(analysis.compliance_score.percentage);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ao-dashboard">
            <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Call Analysis Report</h1>
            <p className="text-xs text-slate-500">{analysis.timestamp}</p>
          </div>
        </div>
        <Badge className="text-xs" variant="secondary">
          {analysis.processing_time_seconds}s
        </Badge>
      </div>

      {/* Compliance Score - Hero Section */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Compliance Score</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-4xl font-semibold ${complianceColor}`}>
                  {analysis.compliance_score.percentage}%
                </span>
                <span className="text-sm text-slate-500">
                  {analysis.compliance_score.items_conveyed}/{analysis.compliance_score.total_mandatory_items} items
                </span>
              </div>
              <Badge className="mt-2" variant="outline">
                {analysis.compliance_score.rating}
              </Badge>
            </div>
            <div className="text-right">
              <div className="mb-1 text-xs font-medium text-slate-500">Call Quality</div>
              <div className="text-lg font-semibold">{callQuality}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {analysis.insights.customer_sentiment} Sentiment
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Conveyed Items */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm font-semibold">Successfully Conveyed</CardTitle>
              <Badge variant="secondary" className="text-xs">{analysis.conveyed_items.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-2">
                {analysis.conveyed_items.map((item, index) => (
                  <div key={index} className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                    <div className="mb-1 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <p className="mb-1 text-xs font-medium">{item.item}</p>
                    <p className="text-xs italic text-slate-600 dark:text-slate-400">"{item.quote}"</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Missed Items */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm font-semibold">Missed Items</CardTitle>
              <Badge variant="destructive" className="text-xs">{analysis.missed_items.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-2">
                {analysis.missed_items.map((item, index) => (
                  <div key={index} className="rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950/30">
                    <div className="mb-1 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <Badge 
                        variant={item.importance === "High" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {item.importance}
                      </Badge>
                    </div>
                    <p className="mb-1 text-xs font-medium">{item.item}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold">Action Items</CardTitle>
            <Badge variant="secondary" className="text-xs">{analysis.tasks.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.tasks.map((task, index) => (
              <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {task.owner}
                    </Badge>
                    <span className="text-xs text-slate-500">{task.deadline}</span>
                  </div>
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="mb-1 text-xs font-medium">{task.task}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{task.context}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm font-semibold">Call Insights</CardTitle>
            <Badge variant="secondary" className="text-xs">{analysis.insights.call_quality}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-md border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950/30">
              <p className="text-xs font-medium text-purple-900 dark:text-purple-100">Overall Summary</p>
              <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{analysis.insights.overall_summary}</p>
            </div>

            {/* Positive Highlights */}
            <div>
              <p className="mb-2 text-xs font-semibold text-green-700 dark:text-green-400">✓ Positive Highlights</p>
              <div className="space-y-1">
                {analysis.insights.positive_highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2 rounded-md bg-green-50 px-3 py-1.5 dark:bg-green-950/30">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                    <p className="text-xs text-slate-700 dark:text-slate-300">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas of Concern */}
            <div>
              <p className="mb-2 text-xs font-semibold text-orange-700 dark:text-orange-400">⚠ Areas of Concern</p>
              <div className="space-y-1">
                {analysis.insights.areas_of_concern.map((concern, index) => (
                  <div key={index} className="flex items-start gap-2 rounded-md bg-orange-50 px-3 py-1.5 dark:bg-orange-950/30">
                    <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-600" />
                    <p className="text-xs text-slate-700 dark:text-slate-300">{concern}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diarized Conversation */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-sm font-semibold">Conversation Transcript</CardTitle>
            <Badge variant="secondary" className="text-xs">Diarized</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <div className="space-y-3">
              {/* Agent messages */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  A
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Agent</span>
                    <span className="text-xs text-slate-400">00:00:05</span>
                  </div>
                  <p className="text-sm text-slate-700">Good morning! This is Sarah from PickYourTrail. Am I speaking with Mr. Sharma?</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                  C
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Customer</span>
                    <span className="text-xs text-slate-400">00:00:12</span>
                  </div>
                  <p className="text-sm text-slate-700">Yes, speaking. Hi Sarah.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  A
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Agent</span>
                    <span className="text-xs text-slate-400">00:00:15</span>
                  </div>
                  <p className="text-sm text-slate-700">Thank you for booking your Dubai trip with us! I'm calling to walk you through your complete itinerary. Do you have about 10-15 minutes?</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                  C
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Customer</span>
                    <span className="text-xs text-slate-400">00:00:25</span>
                  </div>
                  <p className="text-sm text-slate-700">Yes, of course! I'm actually quite excited about this trip.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  A
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Agent</span>
                    <span className="text-xs text-slate-400">00:00:32</span>
                  </div>
                  <p className="text-sm text-slate-700">Wonderful! Let me start with your hotel details. You'll be staying at the Rove Downtown for 4 nights. Please note that the standard check-in time is 3 PM and check-out is at 12 PM noon. Early check-in is subject to availability.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                  C
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Customer</span>
                    <span className="text-xs text-slate-400">00:00:48</span>
                  </div>
                  <p className="text-sm text-slate-700">Got it. Our flight lands at 8 AM, so we might reach the hotel by 10. Can we request early check-in?</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  A
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Agent</span>
                    <span className="text-xs text-slate-400">00:01:02</span>
                  </div>
                  <p className="text-sm text-slate-700">We can definitely put in a request for early check-in, but I must mention that it's not guaranteed and the hotel may charge an additional fee if rooms are available early. I'll add this note to your booking.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                  C
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Customer</span>
                    <span className="text-xs text-slate-400">00:01:18</span>
                  </div>
                  <p className="text-sm text-slate-700">Okay, that works. What about the activities we booked?</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  A
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Agent</span>
                    <span className="text-xs text-slate-400">00:01:24</span>
                  </div>
                  <p className="text-sm text-slate-700">Great question! You have the Burj Khalifa At The Top on Day 2 at 6 PM. Very important - you must carry a printed copy of your voucher and a valid photo ID. Children must be accompanied by adults.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                  C
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Customer</span>
                    <span className="text-xs text-slate-400">00:01:42</span>
                  </div>
                  <p className="text-sm text-slate-700">Noted. I'll make sure to print everything. What about the desert safari?</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  A
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Agent</span>
                    <span className="text-xs text-slate-400">00:01:48</span>
                  </div>
                  <p className="text-sm text-slate-700">The desert safari is scheduled for Day 3. Pick-up will be between 3-4 PM from your hotel. One important point - if anyone in your group is pregnant, has back problems, or heart conditions, they should not participate in the dune bashing activity.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                  C
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Customer</span>
                    <span className="text-xs text-slate-400">00:02:08</span>
                  </div>
                  <p className="text-sm text-slate-700">We're all good on that front. This is very helpful, thank you!</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
