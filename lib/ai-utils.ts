/**
 * AI utility functions for generating call coaching guidance
 * These functions process email and chat context into natural spoken guidance
 */

export interface ChatSummary {
  trip_overview: string;
  known_preferences: string[];
  concerns_raised: string[];
  processing_time_seconds: number;
  timestamp: string;
}

export interface CallCoachingGuidance {
  narrative: string[];
  chatSummary: ChatSummary;
}

/**
 * Generate call coaching narrative from email and chat context
 * In production, this would call an AI service (OpenAI, Claude, etc.)
 */
export function generateCallGuidance(
  emailContent: string,
  chatMessages?: Array<{ sender: string; content: string; timestamp?: string }>
): CallCoachingGuidance {
  // Mock AI coaching generation - In production, replace with actual AI API call
  const text = stripHtml(emailContent);
  const chatContext = chatMessages 
    ? chatMessages.map(m => `${m.sender}: ${m.content}`).join('\n')
    : '';
  
  // Generate natural coaching narrative
  const narrative = generateCoachingNarrative(text, chatContext);
  
  // Generate chat summary from team messages
  const chatSummary = generateChatSummary(chatMessages || []);
  
  return {
    narrative,
    chatSummary,
  };
}

// Helper functions

function stripHtml(html: string): string {
  // Simple HTML stripping - in production use a proper library
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateCoachingNarrative(emailText: string, chatContext: string): string[] {
  // Mock coaching narrative generation
  // In production, this would use AI to generate natural guidance
  
  const isDubaiTrip = emailText.toLowerCase().includes('dubai') || 
                       emailText.toLowerCase().includes('emirates');
  
  if (isDubaiTrip) {
    // These are the MUST CONVEY points from the reference document
    // Each item must be conveyed with exact numbers/details to be marked complete
    return [
      "Vouchers are live and ready on the Pickyourtrail app",
      "Documents to carry: Original passports with printed copies, flight tickets, hotel vouchers, colored visa printouts, travel insurance if opted",
      "Emirates Airlines baggage: 30 kg checked baggage and 7 kg cabin baggage per person",
      "Hotel check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in and late checkout usually not available",
      "Tourism Dirham Fee: AED 7 to AED 20 per room per night, payable on arrival at hotel, non-refundable",
      "Activity timings will be shared 1 day in advance. Driver numbers shared 1 hour before pickup time",
      "All transfers are on shared basis unless upgraded to private at extra cost",
      "Desert Safari and Dhow Cruise: Vegetarian food options are limited. Dune bashing not recommended for infants, senior citizens, or pregnant women",
      "Burj Khalifa combo ticket: Redeem at Burj Khalifa counter in Dubai Mall. Arrive 30 minutes before your slot time",
      "BAPS Mandir: Register online 1 day prior at mandir.ae/visit. Carry passport for verification. Closed on Mondays",
      "Airport arrival: Driver will be in arrivals hall with placard showing your name",
      "Abu Dhabi Airport shuttle: Driver meets at XNB Etihad Travel Mall in Dubai",
      "Transfer waiting time: 5 minutes for shared transfers, 10 minutes for private transfers. No stops in between",
      "24/7 live chat support on app starts 3 days before your trip. No WhatsApp support available",
      "Contact hours: Available 10 AM to 7 PM for any assistance"
    ];
  }
  
  // Fallback generic coaching
  return [
    "Begin by confirming the customer's booking details and ensuring they have access to their vouchers. Speak clearly and warmly to set a positive tone for the call.",
    
    "Walk through any essential information they need to know before their trip. Focus on practical details they can act on immediately.",
    
    "If there are any time-sensitive items or specific requirements, highlight these early in the conversation. Make sure they understand what's required from their side.",
    
    "Address any special conditions or limitations proactively. It's better to set clear expectations now than deal with confusion later.",
    
    "Provide contact information for ongoing support. Make sure they know how to reach you or the support team if questions come up later.",
    
    "End by asking if they have any questions and confirming they feel prepared. Close with a warm send-off that reflects your company's values."
  ];
}

function generateChatSummary(chatMessages: Array<{ sender: string; content: string; timestamp?: string }>): ChatSummary {
  // Mock chat summary generation
  // In production, this would use AI to analyze chat history
  
  const startTime = Date.now();
  
  const trip_overview = chatMessages.length > 0
    ? "Dubai family trip (5 days, 4 nights). All vouchers verified and active. Customer confirmation call scheduled. Shared transfers assigned, no upgrade requested yet."
    : "No prior team discussion available. Standard voucher confirmation required.";
  
  const known_preferences = chatMessages.length > 0
    ? [
        "Family traveling with children - ensure child-friendly activities are highlighted",
        "Vegetarian food preferences mentioned for desert safari",
        "Interested in cultural experiences (BAPS Mandir, traditional souks)"
      ]
    : [
        "No specific preferences documented yet",
        "Confirm dietary requirements during call"
      ];
  
  const concerns_raised = chatMessages.length > 0
    ? [
        "Tourism Dirham Fee payment process unclear to customer",
        "BAPS Mandir advance registration requirement - customer may not be aware",
        "Shared transfer timing concerns - emphasize 5-minute waiting policy"
      ]
    : [
        "Verify all concerns during the call",
        "Document any special requests in CRM"
      ];
  
  const processingTime = (Date.now() - startTime) / 1000;
  
  return {
    trip_overview,
    known_preferences,
    concerns_raised,
    processing_time_seconds: parseFloat(processingTime.toFixed(2)),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
}
