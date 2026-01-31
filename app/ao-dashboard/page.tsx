"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MoreVertical, ChevronRight, FlaskConical, TrendingUp, Users, CheckCircle2, Clock } from "lucide-react";
import { mockBriefingCalls } from "@/lib/mock-calls";
import { useRouter } from "next/navigation";
import type { BriefingCall } from "@/lib/types";
import { AppHeader } from "@/components/app-header";

export default function AODashboardPage() {
  const router = useRouter();

  const getStatusColor = (status: BriefingCall["status"]) => {
    switch (status) {
      case "Todo":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "Won":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "Booked":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const handleNinerClick = (callId: string) => {
    router.push(`/niner?callId=${callId}`);
  };

  const handleCallClick = (callId: string) => {
    router.push(`/vrt-call?callId=${callId}`);
  };

  const isDueDatePassed = (dueDate: string) => {
    const today = new Date("2026-01-30");
    const targetDate = new Date(dueDate);
    return targetDate < today;
  };

  // Group calls into overdue and upcoming based on followUpDate
  const overdueCalls = mockBriefingCalls.filter(call => isDueDatePassed(call.followUpDate));
  const upcomingCalls = mockBriefingCalls.filter(call => !isDueDatePassed(call.followUpDate));

  // Stats calculation
  const totalTasks = mockBriefingCalls.length;
  const completedTasks = mockBriefingCalls.filter(call => call.status === "Won").length;
  const bookedTasks = mockBriefingCalls.filter(call => call.status === "Booked").length;
  const todoTasks = mockBriefingCalls.filter(call => call.status === "Todo").length;

  return (
    <>
      <AppHeader pageTitle="AO Dashboard" />
      
      <div className="flex h-screen flex-col bg-slate-50">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900">
                  AO Dashboard
                </h1>
                <Badge variant="outline" className="text-xs font-medium">
                  PYT Hacks - Team 5
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">Manage customer briefing calls and tasks</p>
            </div>
            <button
              onClick={() => router.push("/niner-playground")}
              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <FlaskConical className="h-4 w-4" />
              Niner Playground
            </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Tasks Overview</h2>
            <p className="text-sm text-slate-500">{totalTasks} total tasks • {todoTasks} pending • {completedTasks} completed</p>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Task Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Trail ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Subregion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Task Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Convert Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Departure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Trail Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockBriefingCalls.slice(0, 10).map((call, index) => {
                  const taskType = index < 3 ? "Niner Check" : "Brief Call";
                  return (
                    <tr key={call.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-900">{taskType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="cursor-pointer text-sm font-medium text-blue-600 hover:underline">
                          {call.bookingId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">{call.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.airport}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="whitespace-nowrap text-xs">Todo</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.callDate}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.followUpDate}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.callDate}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`whitespace-nowrap text-xs ${getStatusColor(call.status)}`}>
                          {call.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {taskType === "Brief Call" ? (
                            <button
                              onClick={() => handleCallClick(call.id)}
                              className="flex items-center gap-1.5 rounded-md border border-blue-600 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Call
                            </button>
                          ) : (
                            <button
                              onClick={() => handleNinerClick(call.id)}
                              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Niner
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
