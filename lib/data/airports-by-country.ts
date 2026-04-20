/**
 * ISO-3166-1 alpha-2 country code → primary international airport (IATA).
 *
 * For multi-airport countries we pick the largest international hub
 * (e.g. US → JFK, UK → LHR). Used to assign a reasonable airport code
 * to discovered destinations so flight pricing works without keys.
 *
 * If a city has its own well-known airport (e.g. Cape Town = CPT, not
 * Johannesburg = JNB), Nominatim's reverse lookup OR the user's
 * destination override should handle the per-city case. This map is the
 * country-level fallback.
 */
export const PRIMARY_AIRPORT_BY_COUNTRY: Record<string, string> = {
  // North America
  US: "JFK",
  CA: "YYZ",
  MX: "MEX",

  // Caribbean
  BS: "NAS", DO: "SDQ", JM: "KIN", PR: "SJU", CU: "HAV", BB: "BGI",
  TT: "POS", AW: "AUA", KY: "GCM", VG: "EIS",

  // Central America
  CR: "SJO", PA: "PTY", GT: "GUA", HN: "TGU", NI: "MGA", BZ: "BZE", SV: "SAL",

  // South America
  BR: "GRU", AR: "EZE", CL: "SCL", PE: "LIM", CO: "BOG", VE: "CCS",
  EC: "UIO", BO: "VVI", PY: "ASU", UY: "MVD", GY: "GEO", SR: "PBM",

  // Western Europe
  GB: "LHR", IE: "DUB", FR: "CDG", DE: "FRA", NL: "AMS", BE: "BRU",
  LU: "LUX", CH: "ZRH", AT: "VIE", IT: "FCO", ES: "MAD", PT: "LIS",
  IS: "KEF", NO: "OSL", SE: "ARN", DK: "CPH", FI: "HEL",

  // Central / Eastern Europe
  PL: "WAW", CZ: "PRG", SK: "BTS", HU: "BUD", RO: "OTP", BG: "SOF",
  HR: "ZAG", SI: "LJU", RS: "BEG", BA: "SJJ", AL: "TIA", MK: "SKP",
  ME: "TGD", MD: "KIV", UA: "KBP", BY: "MSQ", RU: "SVO", LT: "VNO",
  LV: "RIX", EE: "TLL",

  // Southern Europe / Mediterranean
  GR: "ATH", CY: "LCA", MT: "MLA", TR: "IST",

  // Middle East
  IL: "TLV", JO: "AMM", LB: "BEY", SA: "RUH", AE: "DXB", QA: "DOH",
  KW: "KWI", BH: "BAH", OM: "MCT", IR: "IKA", IQ: "BGW", YE: "SAH",
  SY: "DAM",

  // North Africa
  EG: "CAI", MA: "CMN", TN: "TUN", DZ: "ALG", LY: "TIP",

  // West Africa
  NG: "LOS", GH: "ACC", SN: "DKR", CI: "ABJ", CM: "DLA", BF: "OUA",
  ML: "BKO", BJ: "COO", TG: "LFW", LR: "ROB", SL: "FNA", GN: "CKY",
  MR: "NKC", GM: "BJL", CV: "RAI", NE: "NIM",

  // East Africa
  KE: "NBO", ET: "ADD", TZ: "DAR", UG: "EBB", RW: "KGL", BI: "BJM",
  SO: "MGQ", SS: "JUB", DJ: "JIB", ER: "ASM",

  // Central Africa
  CD: "FIH", AO: "LAD", CF: "BGF", GA: "LBV", CG: "BZV", TD: "NDJ",

  // Southern Africa
  ZA: "JNB", ZW: "HRE", ZM: "LUN", BW: "GBE", NA: "WDH", MW: "LLW",
  MZ: "MPM", LS: "MSU", SZ: "SHO", MG: "TNR", MU: "MRU", SC: "SEZ",

  // South Asia
  IN: "DEL", PK: "ISB", BD: "DAC", LK: "CMB", NP: "KTM", BT: "PBH",
  MV: "MLE", AF: "KBL",

  // Southeast Asia
  TH: "BKK", VN: "SGN", KH: "PNH", LA: "VTE", MM: "RGN", MY: "KUL",
  SG: "SIN", ID: "CGK", PH: "MNL", BN: "BWN", TL: "DIL",

  // East Asia
  CN: "PEK", HK: "HKG", MO: "MFM", TW: "TPE", JP: "HND", KR: "ICN",
  KP: "FNJ", MN: "ULN",

  // Central Asia
  KZ: "ALA", UZ: "TAS", KG: "FRU", TJ: "DYU", TM: "ASB", AZ: "GYD",
  GE: "TBS", AM: "EVN",

  // Oceania
  AU: "SYD", NZ: "AKL", FJ: "NAN", PG: "POM", NC: "NOU", PF: "PPT",
  WS: "APW", TO: "TBU", VU: "VLI", SB: "HIR",
};

/**
 * Special-case city → airport overrides for cities whose primary airport
 * differs from the country's primary hub. E.g., Cape Town isn't Joburg.
 *
 * Keys are normalized city slugs (lowercase, hyphenated).
 */
export const CITY_AIRPORT_OVERRIDES: Record<string, string> = {
  // South Africa
  "cape-town": "CPT",
  "durban": "DUR",

  // Brazil
  "rio-de-janeiro": "GIG",
  "salvador": "SSA",
  "fortaleza": "FOR",
  "recife": "REC",
  "brasilia": "BSB",

  // US (besides JFK)
  "los-angeles": "LAX",
  "san-francisco": "SFO",
  "chicago": "ORD",
  "miami": "MIA",
  "seattle": "SEA",
  "boston": "BOS",
  "washington": "DCA",
  "washington-dc": "DCA",
  "denver": "DEN",
  "atlanta": "ATL",
  "dallas": "DFW",
  "houston": "IAH",
  "phoenix": "PHX",
  "philadelphia": "PHL",
  "new-orleans": "MSY",
  "nashville": "BNA",
  "austin": "AUS",
  "portland": "PDX",
  "las-vegas": "LAS",
  "san-diego": "SAN",
  "honolulu": "HNL",

  // Canada
  "vancouver": "YVR",
  "montreal": "YUL",
  "calgary": "YYC",
  "ottawa": "YOW",

  // Mexico
  "cancun": "CUN",
  "cancún": "CUN",
  "guadalajara": "GDL",
  "monterrey": "MTY",
  "tulum": "CUN",
  "playa-del-carmen": "CUN",
  "puerto-vallarta": "PVR",
  "los-cabos": "SJD",
  "cabo": "SJD",

  // UK / Ireland
  "london": "LHR",
  "manchester": "MAN",
  "edinburgh": "EDI",
  "glasgow": "GLA",
  "belfast": "BFS",
  "dublin": "DUB",
  "cork": "ORK",

  // France
  "paris": "CDG",
  "nice": "NCE",
  "lyon": "LYS",
  "marseille": "MRS",
  "bordeaux": "BOD",
  "toulouse": "TLS",

  // Germany
  "berlin": "BER",
  "munich": "MUC",
  "hamburg": "HAM",
  "frankfurt": "FRA",
  "cologne": "CGN",
  "dusseldorf": "DUS",
  "düsseldorf": "DUS",

  // Spain
  "barcelona": "BCN",
  "madrid": "MAD",
  "valencia": "VLC",
  "seville": "SVQ",
  "malaga": "AGP",
  "bilbao": "BIO",
  "palma": "PMI",
  "ibiza": "IBZ",

  // Italy
  "rome": "FCO",
  "milan": "MXP",
  "florence": "FLR",
  "venice": "VCE",
  "naples": "NAP",
  "pisa": "PSA",
  "catania": "CTA",

  // Portugal
  "lisbon": "LIS",
  "porto": "OPO",
  "faro": "FAO",
  "funchal": "FNC",

  // Netherlands / Belgium
  "amsterdam": "AMS",
  "rotterdam": "RTM",
  "brussels": "BRU",

  // Greece
  "athens": "ATH",
  "thessaloniki": "SKG",
  "santorini": "JTR",
  "mykonos": "JMK",
  "crete": "HER",
  "heraklion": "HER",
  "rhodes": "RHO",

  // Turkey
  "istanbul": "IST",
  "ankara": "ESB",
  "antalya": "AYT",
  "izmir": "ADB",

  // Scandinavia
  "stockholm": "ARN",
  "gothenburg": "GOT",
  "oslo": "OSL",
  "bergen": "BGO",
  "copenhagen": "CPH",
  "helsinki": "HEL",
  "reykjavik": "KEF",

  // Eastern Europe
  "warsaw": "WAW",
  "krakow": "KRK",
  "kraków": "KRK",
  "prague": "PRG",
  "budapest": "BUD",
  "bucharest": "OTP",
  "sofia": "SOF",
  "belgrade": "BEG",
  "zagreb": "ZAG",
  "ljubljana": "LJU",
  "tallinn": "TLL",
  "riga": "RIX",
  "vilnius": "VNO",

  // Russia / Ukraine
  "moscow": "SVO",
  "st-petersburg": "LED",
  "saint-petersburg": "LED",
  "kyiv": "KBP",
  "kiev": "KBP",

  // Middle East
  "tel-aviv": "TLV",
  "jerusalem": "TLV",
  "dubai": "DXB",
  "abu-dhabi": "AUH",
  "doha": "DOH",
  "muscat": "MCT",
  "amman": "AMM",
  "beirut": "BEY",
  "riyadh": "RUH",
  "jeddah": "JED",

  // North Africa
  "cairo": "CAI",
  "marrakech": "RAK",
  "marrakesh": "RAK",
  "casablanca": "CMN",
  "fez": "FEZ",
  "tangier": "TNG",
  "tunis": "TUN",
  "sharm-el-sheikh": "SSH",
  "luxor": "LXR",

  // West / East / South Africa
  "lagos": "LOS",
  "abuja": "ABV",
  "accra": "ACC",
  "dakar": "DKR",
  "nairobi": "NBO",
  "mombasa": "MBA",
  "addis-ababa": "ADD",
  "kigali": "KGL",
  "kampala": "EBB",
  "dar-es-salaam": "DAR",
  "zanzibar": "ZNZ",
  "johannesburg": "JNB",
  "victoria-falls": "VFA",

  // South Asia
  "delhi": "DEL",
  "mumbai": "BOM",
  "bangalore": "BLR",
  "bengaluru": "BLR",
  "chennai": "MAA",
  "kolkata": "CCU",
  "hyderabad": "HYD",
  "goa": "GOI",
  "jaipur": "JAI",
  "kochi": "COK",
  "kathmandu": "KTM",
  "colombo": "CMB",
  "male": "MLE",
  "dhaka": "DAC",

  // Southeast Asia
  "bangkok": "BKK",
  "phuket": "HKT",
  "chiang-mai": "CNX",
  "krabi": "KBV",
  "koh-samui": "USM",
  "ho-chi-minh-city": "SGN",
  "saigon": "SGN",
  "hanoi": "HAN",
  "da-nang": "DAD",
  "siem-reap": "REP",
  "phnom-penh": "PNH",
  "vientiane": "VTE",
  "luang-prabang": "LPQ",
  "yangon": "RGN",
  "kuala-lumpur": "KUL",
  "penang": "PEN",
  "langkawi": "LGK",
  "singapore": "SIN",
  "jakarta": "CGK",
  "bali": "DPS",
  "denpasar": "DPS",
  "ubud": "DPS",
  "yogyakarta": "JOG",
  "manila": "MNL",
  "cebu": "CEB",
  "boracay": "MPH",

  // East Asia
  "tokyo": "HND",
  "osaka": "KIX",
  "kyoto": "KIX",
  "okinawa": "OKA",
  "sapporo": "CTS",
  "fukuoka": "FUK",
  "nagoya": "NGO",
  "seoul": "ICN",
  "busan": "PUS",
  "jeju": "CJU",
  "beijing": "PEK",
  "shanghai": "PVG",
  "guangzhou": "CAN",
  "chengdu": "CTU",
  "shenzhen": "SZX",
  "xi-an": "XIY",
  "hong-kong": "HKG",
  "macau": "MFM",
  "taipei": "TPE",

  // Oceania
  "sydney": "SYD",
  "melbourne": "MEL",
  "brisbane": "BNE",
  "perth": "PER",
  "adelaide": "ADL",
  "cairns": "CNS",
  "gold-coast": "OOL",
  "auckland": "AKL",
  "wellington": "WLG",
  "queenstown": "ZQN",
  "christchurch": "CHC",
  "nadi": "NAN",
  "papeete": "PPT",
  "tahiti": "PPT",

  // South America
  "buenos-aires": "EZE",
  "lima": "LIM",
  "cusco": "CUZ",
  "machu-picchu": "CUZ",
  "santiago": "SCL",
  "sao-paulo": "GRU",
  "são-paulo": "GRU",
  "bogota": "BOG",
  "bogotá": "BOG",
  "medellin": "MDE",
  "medellín": "MDE",
  "cartagena": "CTG",
  "quito": "UIO",
  "galapagos": "GPS",
  "la-paz": "LPB",
  "montevideo": "MVD",
  "asuncion": "ASU",

  // Caribbean
  "havana": "HAV",
  "punta-cana": "PUJ",
  "santo-domingo": "SDQ",
  "san-juan": "SJU",
  "nassau": "NAS",
  "barbados": "BGI",
  "antigua": "ANU",
  "st-lucia": "UVF",
  "aruba": "AUA",
  "curacao": "CUR",
  "grand-cayman": "GCM",
};
