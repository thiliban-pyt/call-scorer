"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, CheckCircle, AlertTriangle, Heart, Loader2, Smile, Frown, Meh } from "lucide-react";
import type { ChatSummary } from "@/lib/ai-utils";

interface ChatSummaryProps {
  summary: ChatSummary;
}

const dummyData: ChatSummary = {
  trip_overview: "Customer is planning a 7-day romantic getaway to Dubai with their partner. They're looking for a luxury experience with a mix of adventure activities and relaxation. Budget is flexible for premium experiences.",
  known_preferences: [
    "Prefers luxury 5-star hotels with beach access",
    "Interested in desert safari and hot air balloon rides",
    "Enjoys fine dining experiences",
    "Partner is vegetarian",
    "Wants private transfers throughout the trip"
  ],
  concerns_raised: [
    "Worried about extreme heat in August - needs climate-appropriate planning",
    "Partner has mobility concerns - requires accessible hotel rooms",
    "Concerned about halal food availability for vegetarian options"
  ],
  processing_time_seconds: 2.3,
  timestamp: new Date().toLocaleString()
};

const sentimentData = {
  overall: "Positive",
  score: 8.5,
  tone: "Enthusiastic and engaged",
  keyMoments: [
    { sentiment: "positive", text: "Customer was excited about luxury hotel options", time: "2:15" },
    { sentiment: "neutral", text: "Asked several clarifying questions about weather", time: "5:30" },
    { sentiment: "positive", text: "Partner joined call and showed high interest", time: "8:45" }
  ]
};

export function ChatSummaryComponent({ summary }: ChatSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChatSummary | null>(null);
  const [sentiment, setSentiment] = useState<typeof sentimentData | null>(null);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setData(dummyData);
      setSentiment(sentimentData);
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getSentimentIcon = (overall: string) => {
    if (overall === "Positive") return <Smile className="h-5 w-5 text-green-600" />;
    if (overall === "Negative") return <Frown className="h-5 w-5 text-red-600" />;
    return <Meh className="h-5 w-5 text-yellow-600" />;
  };

  const getSentimentColor = (overall: string) => {
    if (overall === "Positive") return "text-green-600 bg-green-50 border-green-200";
    if (overall === "Negative") return "text-red-600 bg-red-50 border-red-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Chat History Summary</CardTitle>
            <Badge variant="outline" className="animate-pulse border-blue-300 bg-blue-50 text-blue-700 text-xs">
              Processing...
            </Badge>
          </div>
          <CardDescription>
            Analyzing team discussions and customer sentiment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
              <p className="mt-4 text-sm text-slate-500">Analyzing chat history...</p>
              <p className="mt-1 text-xs text-slate-400">This usually takes 2-3 seconds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !sentiment) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <CardTitle>Chat History Summary</CardTitle>
        </div>
        <CardDescription>
          Key insights from team discussions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-6">
            {/* Customer Sentiment */}
            <div className={`space-y-3 rounded-lg border p-4 ${getSentimentColor(sentiment.overall)}`}>
              <div className="flex items-center gap-2">
                {getSentimentIcon(sentiment.overall)}
                <h3 className="font-semibold text-lg">Customer Sentiment</h3>
                <Badge variant="outline" className="border-current">
                  {sentiment.score}/10
                </Badge>
              </div>
              <p className="pl-7 text-sm font-medium">
                {sentiment.tone}
              </p>
              <div className="pl-7 space-y-2 mt-3">
                {sentiment.keyMoments.map((moment, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <Badge variant="outline" className="border-current text-[10px] px-1 py-0">
                      {moment.time}
                    </Badge>
                    <span className="leading-relaxed">{moment.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trip Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Trip Overview</h3>
              </div>
              <p className="pl-7 text-sm leading-relaxed text-slate-700">
                {data.trip_overview}
              </p>
            </div>

            {/* Known Preferences */}
            {data.known_preferences.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Known Preferences</h3>
                  <Badge variant="secondary">{data.known_preferences.length}</Badge>
                </div>
                <ul className="space-y-2 pl-7">
                  {data.known_preferences.map((pref, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 text-blue-600">•</span>
                      <span className="leading-relaxed">{pref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns Raised */}
            {data.concerns_raised.length > 0 && (
              <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-lg text-orange-900">Concerns to Address</h3>
                  <Badge variant="outline" className="border-orange-300 bg-orange-100">
                    {data.concerns_raised.length}
                  </Badge>
                </div>
                <ul className="space-y-2 pl-7">
                  {data.concerns_raised.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 text-orange-600">!</span>
                      <span className="leading-relaxed text-orange-900">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Processing Info */}
            <div className="text-xs text-slate-400">
              Processed in {data.processing_time_seconds}s • {data.timestamp}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
