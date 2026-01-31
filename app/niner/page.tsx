"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Check, Send, Settings2 } from "lucide-react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Mock data structure for niner checks
const mockNinerData = {
  genericChecks: [
    { id: 1, text: 'Check Passports, Custom Cards etc', checked: false, notApplicable: false },
    { id: 2, text: '2 adults 0 child 0 infant', checked: false, notApplicable: false },
  ],
  hotels: [
    {
      id: 1,
      name: 'Auckland | The Grand at SkyCity',
      checkIn: '2026-02-05 15:00 PM',
      checkOut: '2026-02-06 10:00 AM',
      nights: 1,
      room: 'standard room',
      booked: true,
      checks: [
        { id: 1, text: 'Does the itinerary planning and city routing need additional / unnecessary travel by the customer?', checked: false, notApplicable: false },
        { id: 2, text: 'Check for Amenities - Breakfast / Wifi / Elevator / Air conditioning', checked: false, notApplicable: false },
        { id: 3, text: 'Twin beds should not be given for couples. Check and place email request for Double beds', checked: false, notApplicable: false },
        { id: 4, text: 'If room size lesser than 190 Sq ft - To be communicated and proof of sign off from customer to be provided in HOD', checked: false, notApplicable: false },
        { id: 5, text: 'Hotel check-in dates to be checked with Flight booking and itinerary.', checked: false, notApplicable: false },
        { id: 6, text: 'If hotel is not in city centre - Booking to be amended or communicated to the customer (convo details in HOD).', checked: false, notApplicable: false },
        { id: 7, text: 'If bathroom type is shared - Booking to be amended or communicated to the customer (convo details in HOD).', checked: false, notApplicable: false },
        { id: 8, text: 'City tax / Caution deposit communicated to Customer.', checked: false, notApplicable: false },
      ]
    }
  ],
  flights: [],
  pass: [],
  visa: [],
  insurance: [],
  custom: []
};

const TabButton = ({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-3 text-sm font-medium transition-colors ${
      active 
        ? 'border-b-2 border-blue-500 text-blue-600' 
        : 'text-slate-600 hover:text-slate-900'
    }`}
  >
    {children}
    {count !== undefined && count > 0 && (
      <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs">{count}</span>
    )}
  </button>
);

const CheckboxItem = ({ 
  checked, 
  notApplicable, 
  text, 
  onChange, 
  onNotApplicableChange,
  onInternal,
  onCommunicate
}: { 
  checked: boolean; 
  notApplicable: boolean; 
  text: string; 
  onChange: () => void;
  onNotApplicableChange: () => void;
  onInternal: () => void;
  onCommunicate: () => void;
}) => {
  const [selectedAction, setSelectedAction] = React.useState<string>("");

  const handleActionChange = (value: string) => {
    setSelectedAction(value);
    if (value === "na") {
      onNotApplicableChange();
    } else if (value === "internal") {
      onInternal();
    } else if (value === "communicate") {
      onCommunicate();
    }
  };

  const getDropdownStyle = () => {
    switch (selectedAction) {
      case 'na':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'internal':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'communicate':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-white border-slate-300 text-slate-600';
    }
  };

  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className={`flex-1 text-sm ${notApplicable ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
        {text}
      </span>
      <select
        value={selectedAction}
        onChange={(e) => handleActionChange(e.target.value)}
        className={`rounded-md px-3 py-2 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${getDropdownStyle()}`}
      >
        <option value="">Select Action</option>
        <option value="na">Mark N/A</option>
        <option value="internal">Internal Note</option>
        <option value="communicate">Communicate</option>
      </select>
    </div>
  );
};

const HotelCard = ({ 
  hotel, 
  onCheckChange,
  onInternal,
  onCommunicate
}: { 
  hotel: any; 
  onCheckChange: (hotelId: number, checkId: number, field: 'checked' | 'notApplicable') => void;
  onInternal: (section: string, id: number) => void;
  onCommunicate: (section: string, id: number) => void;
}) => {
  const totalChecks = hotel.checks.length;
  const markedChecks = hotel.checks.filter((c: any) => c.checked || c.notApplicable).length;
  const allChecked = markedChecks === totalChecks;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start gap-4 border-b border-slate-200 bg-slate-50 p-4">
        {/* Left side - Hotel info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {hotel.booked ? '✓ Booked' : 'Not Booked'}
            </span>
            <span className="text-xs text-slate-500">
              {markedChecks}/{totalChecks} Checks Marked
            </span>
            {allChecked && (
              <span className="text-xs font-medium text-green-600">✓ All Checks Done</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{hotel.name}</h3>
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <div className="flex gap-4">
              <span>Check-in: {hotel.checkIn}</span>
              <span>Check-out: {hotel.checkOut}</span>
            </div>
            <div>
              <span className="font-medium">{hotel.nights} night{hotel.nights > 1 ? 's' : ''}</span> • {hotel.room}
            </div>
          </div>
        </div>

        {/* Right side - Voucher button */}
        <div>
          <button className="rounded border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
            Voucher
          </button>
        </div>
      </div>

      {/* Always show checks */}
      <div className="p-4">
        <div className="rounded-lg bg-white">
          {hotel.checks.map((check: any) => (
            <CheckboxItem
              key={check.id}
              checked={check.checked}
              notApplicable={check.notApplicable}
              text={check.text}
              onChange={() => onCheckChange(hotel.id, check.id, 'checked')}
              onNotApplicableChange={() => onCheckChange(hotel.id, check.id, 'notApplicable')}
              onInternal={() => onInternal('hotel', check.id)}
              onCommunicate={() => onCommunicate('hotel', check.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function NinerPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('gen_checks');
  const [ninerData, setNinerData] = useState(mockNinerData);
  const [emailContent, setEmailContent] = useState("");

  const handleCheckChange = (hotelId: number, checkId: number, field: 'checked' | 'notApplicable') => {
    setNinerData(prev => ({
      ...prev,
      hotels: prev.hotels.map(hotel => 
        hotel.id === hotelId 
          ? {
              ...hotel,
              checks: hotel.checks.map(check =>
                check.id === checkId
                  ? { 
                      ...check, 
                      [field]: !check[field],
                      ...(field === 'notApplicable' && !check.notApplicable ? { checked: false } : {}),
                      ...(field === 'checked' && !check.checked ? { notApplicable: false } : {})
                    }
                  : check
              )
            }
          : hotel
      )
    }));
  };
console.log(emailContent);

  const handleGenericCheckChange = (checkId: number, field: 'checked' | 'notApplicable') => {
    setNinerData(prev => ({
      ...prev,
      genericChecks: prev.genericChecks.map(check =>
        check.id === checkId
          ? { 
              ...check, 
              [field]: !check[field],
              ...(field === 'notApplicable' && !check.notApplicable ? { checked: false } : {}),
              ...(field === 'checked' && !check.checked ? { notApplicable: false } : {})
            }
          : check
      )
    }));
  };

  const handleInternal = (section: string, id: number) => {
    console.log(`Internal note for ${section} item ${id}`);
  };

  const handleCommunicate = (section: string, id: number) => {
    console.log(`Communicate with customer about ${section} item ${id}`);
  };

  const handleSendEmail = () => {
    console.log("Email sent successfully!");
    router.push("/ao-dashboard");
  };

  const scrollToSection = (sectionId: string) => {
    setSelectedTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/email-template.html');
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const images = doc.querySelectorAll('img');
        images.forEach((img) => {
          const alt = img.getAttribute('alt');
          if (alt) {
            const emoji = document.createElement('span');
            emoji.innerHTML = alt;
            emoji.style.fontSize = '1em';
            img.replaceWith(emoji);
          }
        });
        
        const firstPara = doc.querySelector('p.c21');
        if (firstPara) {
          const h1 = document.createElement('h1');
          h1.innerHTML = firstPara.innerHTML;
          h1.style.fontWeight = 'bold';
          h1.style.fontSize = '1.5em';
          h1.style.marginBottom = '1em';
          firstPara.replaceWith(h1);
        }
        
        const bodyContent = doc.body.innerHTML;
        setEmailContent(bodyContent);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    };
    
    loadTemplate();
  }, []);

  const totalGenericChecks = ninerData.genericChecks.length;
  const markedGenericChecks = ninerData.genericChecks.filter(c => c.checked || c.notApplicable).length;

  // Calculate total checks across all sections
  const allChecks = [
    ...ninerData.genericChecks,
    ...ninerData.hotels.flatMap(hotel => hotel.checks)
  ];
  const totalChecks = allChecks.length;
  const markedChecks = allChecks.filter(c => c.checked || c.notApplicable).length;

  return (
    <div className="flex h-screen flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
          font-weight: bold;
        }
        .ql-editor strong, .ql-editor b {
          font-weight: bold;
        }
        .ql-container {
          height: calc(100% - 42px) !important;
        }
        .ql-editor {
          height: 100% !important;
        }
      `}} />
      <AppHeader 
        pageTitle="Niner - Draft Email" 
        actionButton={
          <button
            onClick={() => router.push("/ao-dashboard")}
            className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        }
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left: All Niner Checks (50%) */}
        <div className="flex w-1/2 flex-col border-r border-slate-200 bg-white">
          {/* Tabs - Click to scroll to section */}
          <div className="flex overflow-x-auto border-b border-slate-200 px-4">
            <TabButton active={selectedTab === 'gen_checks'} onClick={() => scrollToSection('gen_checks')} count={ninerData.genericChecks.length}>
              Gen Checks
            </TabButton>
            <TabButton active={selectedTab === 'hotel'} onClick={() => scrollToSection('hotel')} count={ninerData.hotels.length}>
              Hotel
            </TabButton>
            <TabButton active={selectedTab === 'flight'} onClick={() => scrollToSection('flight')} count={ninerData.flights.length}>
              Flight
            </TabButton>
            <TabButton active={selectedTab === 'pass'} onClick={() => scrollToSection('pass')} count={ninerData.pass.length}>
              Pass
            </TabButton>
            <TabButton active={selectedTab === 'visa'} onClick={() => scrollToSection('visa')} count={ninerData.visa.length}>
              Visa
            </TabButton>
            <TabButton active={selectedTab === 'insurance'} onClick={() => scrollToSection('insurance')} count={ninerData.insurance.length}>
              Insurance
            </TabButton>
            <TabButton active={selectedTab === 'custom'} onClick={() => scrollToSection('custom')} count={ninerData.custom.length}>
              Custom
            </TabButton>
          </div>

          {/* Scrollable Content area with all sections */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
            <div className="space-y-6">
              {/* Generic Checks Section */}
              <div id="gen_checks" className="scroll-mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Generic Checks</h3>
                  <span className="text-xs text-slate-500">
                    {markedGenericChecks}/{totalGenericChecks} marked
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  {ninerData.genericChecks.map((check) => (
                    <CheckboxItem
                      key={check.id}
                      checked={check.checked}
                      notApplicable={check.notApplicable}
                      text={check.text}
                      onChange={() => handleGenericCheckChange(check.id, 'checked')}
                      onNotApplicableChange={() => handleGenericCheckChange(check.id, 'notApplicable')}
                      onInternal={() => handleInternal('generic', check.id)}
                      onCommunicate={() => handleCommunicate('generic', check.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Hotels Section */}
              {ninerData.hotels.length > 0 && (
                <div id="hotel" className="scroll-mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Hotels</h3>
                  {ninerData.hotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onCheckChange={handleCheckChange}
                      onInternal={handleInternal}
                      onCommunicate={handleCommunicate}
                    />
                  ))}
                </div>
              )}

              {/* Placeholder sections */}
              <div id="flight" className="scroll-mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Flights</h3>
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-400">No flight data available</p>
                </div>
              </div>

              <div id="pass" className="scroll-mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Pass</h3>
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-400">No pass data available</p>
                </div>
              </div>

              <div id="visa" className="scroll-mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Visa</h3>
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-400">No visa data available</p>
                </div>
              </div>

              <div id="insurance" className="scroll-mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Insurance</h3>
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-400">No insurance data available</p>
                </div>
              </div>

              <div id="custom" className="scroll-mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Custom</h3>
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-400">No custom data available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Email Draft Editor (50%) */}
        <div className="flex w-1/2 flex-col bg-white">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Email Preview & Editor</h2>
            <p className="mt-1 text-xs text-slate-500">Edit your email before sending</p>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <ReactQuill
              theme="snow"
              value={emailContent}
              onChange={setEmailContent}
              className="h-full"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link"],
                  ["clean"],
                ],
              }}
            />
          </div>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleSendEmail}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Send className="h-4 w-4" />
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
