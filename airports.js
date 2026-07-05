// Airport dataset for the searchable From/To picker on the Add Watch page.
// Deliberately mirrors the airport codes in worker/src/email-parser.js
// (AIRPORT_CODES) so that whatever you select here is guaranteed to be a
// code the Worker's matcher actually recognizes. If you add routes to the
// Worker's list, add the matching entry here too so the picker stays in
// sync - and vice versa.

window.FLIGHTDROP_AIRPORTS = [
  // Australia / New Zealand / Pacific
  { code: "SYD", city: "Sydney" }, { code: "MEL", city: "Melbourne" },
  { code: "BNE", city: "Brisbane" }, { code: "PER", city: "Perth" },
  { code: "ADL", city: "Adelaide" }, { code: "CBR", city: "Canberra" },
  { code: "OOL", city: "Gold Coast" }, { code: "CNS", city: "Cairns" },
  { code: "HBA", city: "Hobart" }, { code: "DRW", city: "Darwin" },
  { code: "AKL", city: "Auckland" }, { code: "WLG", city: "Wellington" },
  { code: "CHC", city: "Christchurch" }, { code: "ZQN", city: "Queenstown" },
  { code: "NAN", city: "Nadi (Fiji)" }, { code: "VLI", city: "Port Vila (Vanuatu)" },
  { code: "NOU", city: "Noumea (New Caledonia)" }, { code: "HIR", city: "Honiara (Solomon Islands)" },
  { code: "PPT", city: "Papeete (Tahiti)" }, { code: "APW", city: "Apia (Samoa)" },
  { code: "TBU", city: "Nuku'alofa (Tonga)" }, { code: "RAR", city: "Rarotonga (Cook Islands)" },
  { code: "GUM", city: "Guam" }, { code: "POM", city: "Port Moresby (PNG)" },
  { code: "NLK", city: "Norfolk Island" },
  // Asia
  { code: "SHA", city: "Shanghai (Hongqiao)" }, { code: "PVG", city: "Shanghai (Pudong)" },
  { code: "PEK", city: "Beijing" }, { code: "CAN", city: "Guangzhou" },
  { code: "SZX", city: "Shenzhen" }, { code: "CTU", city: "Chengdu" },
  { code: "SIN", city: "Singapore" }, { code: "HKG", city: "Hong Kong" },
  { code: "NRT", city: "Tokyo (Narita)" }, { code: "HND", city: "Tokyo (Haneda)" },
  { code: "KIX", city: "Osaka" }, { code: "NGO", city: "Nagoya" },
  { code: "FUK", city: "Fukuoka" }, { code: "CTS", city: "Sapporo" },
  { code: "OKA", city: "Okinawa" }, { code: "ICN", city: "Seoul (Incheon)" },
  { code: "GMP", city: "Seoul (Gimpo)" }, { code: "TPE", city: "Taipei" },
  { code: "BKK", city: "Bangkok" }, { code: "CNX", city: "Chiang Mai" },
  { code: "DPS", city: "Bali (Denpasar)" }, { code: "CGK", city: "Jakarta" },
  { code: "KUL", city: "Kuala Lumpur" }, { code: "SGN", city: "Ho Chi Minh City" },
  { code: "HAN", city: "Hanoi" }, { code: "DAD", city: "Da Nang" },
  { code: "MNL", city: "Manila" }, { code: "CEB", city: "Cebu" },
  { code: "RGN", city: "Yangon" }, { code: "PNH", city: "Phnom Penh" },
  { code: "VTE", city: "Vientiane" }, { code: "KTM", city: "Kathmandu" },
  { code: "DAC", city: "Dhaka" }, { code: "CMB", city: "Colombo" },
  { code: "MLE", city: "Malé (Maldives)" }, { code: "BOM", city: "Mumbai" },
  { code: "DEL", city: "Delhi" }, { code: "BLR", city: "Bangalore" },
  { code: "MAA", city: "Chennai" },
  // Europe
  { code: "LHR", city: "London (Heathrow)" }, { code: "LGW", city: "London (Gatwick)" },
  { code: "MAN", city: "Manchester" }, { code: "EDI", city: "Edinburgh" },
  { code: "DUB", city: "Dublin" }, { code: "CDG", city: "Paris" },
  { code: "NCE", city: "Nice" }, { code: "AMS", city: "Amsterdam" },
  { code: "FRA", city: "Frankfurt" }, { code: "MUC", city: "Munich" },
  { code: "BER", city: "Berlin" }, { code: "VIE", city: "Vienna" },
  { code: "ZRH", city: "Zurich" }, { code: "GVA", city: "Geneva" },
  { code: "CPH", city: "Copenhagen" }, { code: "ARN", city: "Stockholm" },
  { code: "OSL", city: "Oslo" }, { code: "HEL", city: "Helsinki" },
  { code: "MAD", city: "Madrid" }, { code: "BCN", city: "Barcelona" },
  { code: "LIS", city: "Lisbon" }, { code: "BRU", city: "Brussels" },
  { code: "PRG", city: "Prague" }, { code: "BUD", city: "Budapest" },
  { code: "WAW", city: "Warsaw" }, { code: "FCO", city: "Rome" },
  { code: "MXP", city: "Milan" }, { code: "VCE", city: "Venice" },
  { code: "ATH", city: "Athens" }, { code: "IST", city: "Istanbul" },
  { code: "KEF", city: "Reykjavik" },
  // Middle East / Americas
  { code: "DXB", city: "Dubai" }, { code: "DOH", city: "Doha" },
  { code: "JFK", city: "New York" }, { code: "LAX", city: "Los Angeles" },
  { code: "SFO", city: "San Francisco" }, { code: "ORD", city: "Chicago" },
  { code: "YVR", city: "Vancouver" }, { code: "YYZ", city: "Toronto" },
  { code: "DEN", city: "Denver" }, { code: "LAS", city: "Las Vegas" },
  { code: "HNL", city: "Honolulu" },
];
