"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

interface DebriefEmailViewerProps {
  htmlContent: string;
}

// Simple HTML sanitization - strips dangerous tags but keeps basic formatting
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

export function DebriefEmailViewer({ htmlContent }: DebriefEmailViewerProps) {
  const sanitized = sanitizeHtml(htmlContent);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Debrief Email</CardTitle>
          </div>
          <Badge variant="secondary">Raw Content</Badge>
        </div>
        <CardDescription>
          Original email content with case details and instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
