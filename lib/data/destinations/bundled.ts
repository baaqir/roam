import type { Destination, Neighborhood } from "@/lib/types";
import {
  GLOBAL_FOOD_PER_DAY,
  GLOBAL_LODGING,
  GLOBAL_TRANSPORT_PER_DAY,
} from "../global-defaults";

/**
 * Bundled popular tourist cities — work fully offline (no API keys needed)
 * with real airport codes, region-correct flight pricing, and hand-picked
 * activity catalogs.
 *
 * Lodging / food / transport use global tier averages here; for accurate
 * city-specific lodging, set live-search keys (those override at runtime).
 *
 * Add more cities by appending to BUNDLED_CITIES below.
 */

const sharedNotes = [
  "Lodging, food, and transport use global tier averages — accurate to ~±25%. Set TAVILY_API_KEY for real listings.",
];

/** Tighten boilerplate when defining bundled cities. */
function bundle(
  partial: Pick<Destination, "key" | "name" | "airportCode" | "region" | "activities"> & {
    neighborhoods?: Neighborhood[];
    tips?: string[];
    airportTransfer?: { taxi: [number, number]; transit: [number, number] };
  },
): Destination {
  const { neighborhoods, tips, airportTransfer, ...rest } = partial;
  return {
    ...rest,
    lodging: GLOBAL_LODGING,
    foodPerDay: GLOBAL_FOOD_PER_DAY,
    transportPerDay: GLOBAL_TRANSPORT_PER_DAY,
    ...(neighborhoods ? { neighborhoods } : {}),
    ...(tips ? { tips } : {}),
    ...(airportTransfer ? { airportTransfer } : {}),
    notes: sharedNotes,
  };
}

export const BUNDLED_CITIES: Destination[] = [
  // ─── Europe ───────────────────────────────────────────────────────────
  bundle({
    key: "paris",
    name: "Paris, France",
    airportCode: "CDG",
    region: "transatlantic",
    neighborhoods: [
      { name: "Le Marais", vibe: "historic Jewish quarter and trendy boutiques", mealTip: "Falafel at L'As du Fallafel or brunch at Café Charlot" },
      { name: "Saint-Germain", vibe: "intellectual cafes and wine bars", mealTip: "Natural wine and charcuterie at a cave a manger" },
      { name: "Montmartre", vibe: "artist hilltop village", mealTip: "Crêpes near Place du Tertre or dinner at Le Coq Rico" },
      { name: "Latin Quarter", vibe: "student neighborhood and bookshops", mealTip: "Cheap bistro menus along Rue Mouffetard" },
      { name: "Champs-Élysées", vibe: "grand avenue and luxury shopping", mealTip: "Overpriced tourist traps — eat one street over" },
      { name: "Bastille", vibe: "lively nightlife and market streets", mealTip: "Thursday/Sunday market on Boulevard Richard-Lenoir" },
    ],
    tips: [
      "Tap water is safe to drink — ask for 'une carafe d'eau' (free) instead of bottled",
      "Most restaurants include service charge — tipping 5-10% extra is appreciated but not required",
      "The Metro is the fastest way around — buy a carnet of 10 tickets or a Navigo Decouverte weekly pass",
      "Many museums are free the first Sunday of each month",
      "Bakeries close Mondays — plan your croissant run accordingly",
      "Pickpockets are common on the Metro and at tourist sites — use a front pocket or crossbody bag",
    ],
    airportTransfer: {
      taxi: [55, 75],
      transit: [10, 12],
    },
    activities: [
      { id: "eiffel-tower", name: "Eiffel Tower (summit ticket)", cost: 32, durationHours: 2.5, tags: ["iconic", "culture"], description: "Lift to the summit — book online 2+ weeks ahead as walk-ups wait 90+ minutes. Go at sunset for both daylight and city-lights views in one visit. Pro tip: the stairs-to-2nd-floor option is cheaper and shorter wait.", recommended: true },
      { id: "louvre", name: "Louvre Museum", cost: 22, durationHours: 4, tags: ["iconic", "culture"], description: "World's largest museum — plan 3-4 hours minimum, or a full day to explore deeply. Enter via the Carrousel du Louvre underground entrance to skip the pyramid line. Pro tip: go Wednesday or Friday evening when it's open late and far less crowded.", recommended: true },
      { id: "musee-orsay", name: "Musée d'Orsay (Impressionists)", cost: 16, durationHours: 2.5, tags: ["culture"], description: "Best Impressionist collection in the world, in a converted Beaux-Arts train station." },
      { id: "seine-walk", name: "Seine riverbank walk + Notre-Dame exterior", cost: 0, durationHours: 2, tags: ["outdoor", "iconic", "free"], description: "Self-guided walk from Île de la Cité past Pont Neuf and the Tuileries.", recommended: true },
      { id: "montmartre", name: "Montmartre + Sacré-Cœur", cost: 0, durationHours: 3, tags: ["outdoor", "iconic", "culture", "free"], description: "Hilltop neighborhood with the basilica, artist square, and the city's best free skyline view. Best in early morning before the tour groups arrive. Pro tip: climb the dome of Sacre-Coeur for a 360-degree panorama that beats the basilica steps.", recommended: true },
      { id: "marais-food", name: "Le Marais food walk + falafel lunch", cost: 30, durationHours: 2.5, tags: ["foodie", "culture"], description: "Self-guided wander through the historic Jewish quarter — falafel at L'As du Fallafel + bakery stops." },
      { id: "versailles", name: "Day trip to Versailles", cost: 32, durationHours: 6, tags: ["iconic", "outdoor", "culture"], description: "RER C train + palace + gardens — plan a full day. Arrive at opening (9am) and start with the gardens to avoid the crush inside the palace. Pro tip: Tuesdays are the busiest day; go midweek if possible." },
      { id: "wine-bar-evening", name: "Evening at a Saint-Germain wine bar", cost: 55, durationHours: 2.5, tags: ["foodie", "nightlife"], description: "Glass + small plates at a natural-wine bar like Le Baron Rouge or Frenchie." },
    ],
  }),

  bundle({
    key: "london",
    name: "London, UK",
    airportCode: "LHR",
    region: "transatlantic",
    neighborhoods: [
      { name: "Soho", vibe: "theatre district and lively bars", mealTip: "Pre-theatre dinner at Barrafina or Bao" },
      { name: "Shoreditch", vibe: "street art and craft cocktails", mealTip: "Brick Lane curry or brunch at Dishoom" },
      { name: "South Bank", vibe: "riverside culture walk", mealTip: "Street food at Southbank Centre or Borough Market" },
      { name: "Covent Garden", vibe: "street performers and shopping", mealTip: "Flat Iron for steak or Homeslice for pizza" },
      { name: "Notting Hill", vibe: "pastel houses and Portobello Market", mealTip: "Saturday market snacks or brunch at Farm Girl" },
      { name: "Camden", vibe: "alternative markets and live music", mealTip: "Camden Market food stalls — Thai, Ethiopian, jerk chicken" },
    ],
    tips: [
      "Tap water is safe to drink — pubs will give you tap water for free",
      "Get an Oyster card or use contactless for the Tube — it's capped daily",
      "Tipping 10-12.5% is standard; check if service charge is already added",
      "Most major museums (British Museum, Tate, National Gallery) are free",
      "The Tube stops around midnight — night buses or the Night Tube (Fri/Sat) are alternatives",
      "Book West End shows on TodayTix for same-day discounts up to 50% off",
    ],
    airportTransfer: {
      taxi: [60, 100],
      transit: [7, 25],
    },
    activities: [
      { id: "british-museum", name: "British Museum", cost: 0, durationHours: 3, tags: ["iconic", "culture", "free"], description: "Free admission — plan 2-3 hours minimum (you could spend a full day). Book a free timed entry to skip the line. Pro tip: head straight to the Egyptian galleries and Rosetta Stone first, then explore outward as the crowds thin.", recommended: true },
      { id: "tower-of-london", name: "Tower of London + Crown Jewels", cost: 38, durationHours: 3, tags: ["iconic", "culture"], description: "Yeoman Warder tour included with ticket — plan 2-3 hours. Go on the first Warder tour at opening for the best experience. Pro tip: head to the Crown Jewels first while everyone else joins the tour, then circle back." },
      { id: "borough-market", name: "Borough Market food crawl", cost: 35, durationHours: 2, tags: ["foodie"], description: "Britain's best food market — arrive before 11am for easier browsing; lunchtime is packed. Try the Kappacasein cheese toastie and Bread Ahead doughnuts. Pro tip: skip Tuesdays (limited stalls) and Sundays (closed).", recommended: true },
      { id: "westminster-walk", name: "Westminster + Big Ben walk", cost: 0, durationHours: 2, tags: ["outdoor", "iconic", "free"], description: "Self-guided walk: Westminster Abbey exterior, Parliament, then cross Westminster Bridge for the classic Big Ben photo. Best in the morning or at golden hour for photography. Pro tip: the south side of the bridge gives the best unobstructed shot.", recommended: true },
      { id: "tate-modern", name: "Tate Modern + South Bank stroll", cost: 0, durationHours: 3, tags: ["culture", "outdoor", "free"], description: "Free contemporary art in a converted power station, then walk the South Bank to Tower Bridge.", recommended: true },
      { id: "west-end-show", name: "West End show", cost: 95, durationHours: 2.5, tags: ["culture", "nightlife"], description: "Mid-tier seat for a long-running musical. TodayTix has same-day deals." },
      { id: "pub-evening", name: "Evening at a historic pub", cost: 45, durationHours: 2.5, tags: ["nightlife", "foodie"], description: "Pint + Sunday roast or fish & chips. Try The Lamb in Bloomsbury or The Princess Louise." },
      { id: "hampstead-heath", name: "Hampstead Heath walk + Kenwood House", cost: 0, durationHours: 3, tags: ["outdoor", "free"], description: "Wild heath walk in north London with skyline view from Parliament Hill." },
    ],
  }),

  bundle({
    key: "rome",
    name: "Rome, Italy",
    airportCode: "FCO",
    region: "transatlantic",
    neighborhoods: [
      { name: "Trastevere", vibe: "cobblestone trattorias and nightlife", mealTip: "Dinner at Da Enzo al 29 or drinks at Freni e Frizioni" },
      { name: "Testaccio", vibe: "working-class foodie heaven", mealTip: "Supplì at Trapizzino or pasta at Flavio al Velavevodetto" },
      { name: "Centro Storico", vibe: "Pantheon and piazza life", mealTip: "Espresso standing at Sant'Eustachio Il Caffè" },
      { name: "Monti", vibe: "trendy boutiques and wine bars", mealTip: "Aperitivo at Ai Tre Scalini or La Carbonara" },
      { name: "Prati", vibe: "residential near the Vatican", mealTip: "Lunch at Sciascia Caffè or Pizzarium for pizza al taglio" },
    ],
    tips: [
      "Tap water is safe — fill your bottle at the free nasoni (drinking fountains) all over the city",
      "Sitting at a table in a cafe costs more than standing at the bar — locals stand",
      "Cover charge (coperto) of 1-3 EUR per person is normal at restaurants",
      "Tipping is not expected but rounding up is appreciated",
      "Many churches require covered shoulders and knees — carry a scarf",
      "The Roma Pass (48hr or 72hr) covers transit + museum entries — good value for 2+ days",
    ],
    airportTransfer: {
      taxi: [50, 60],
      transit: [8, 14],
    },
    activities: [
      { id: "colosseum", name: "Colosseum + Roman Forum + Palatine Hill (combo)", cost: 24, durationHours: 4, tags: ["iconic", "culture"], description: "One combo ticket covers all three — plan a full morning starting at 8:30am opening. Book online 2+ weeks ahead; walk-up tickets routinely sell out. Pro tip: enter the Forum from Via dei Fori Imperiali to avoid the Colosseum-side crush.", recommended: true },
      { id: "vatican", name: "Vatican Museums + Sistine Chapel + St. Peter's", cost: 32, durationHours: 4, tags: ["iconic", "culture"], description: "Book the earliest morning slot (7:30am) — the museums are huge, so plan 3-4 hours minimum. Pro tip: walk straight to the Sistine Chapel first, then backtrack through the quieter galleries while tour groups crowd the main route.", recommended: true },
      { id: "pantheon", name: "Pantheon + Piazza Navona walk", cost: 5, durationHours: 1.5, tags: ["iconic", "culture", "free"], description: "Pantheon entry now ticketed; nearby Piazza Navona is free.", recommended: true },
      { id: "trastevere-dinner", name: "Trastevere dinner + evening wander", cost: 50, durationHours: 3, tags: ["foodie", "nightlife"], description: "Cobblestone neighborhood across the Tiber — best after 8pm when the trattorias fill up and the streets come alive. Pro tip: skip the restaurants with picture menus on the main piazza; walk one block deeper for better food and lower prices.", recommended: true },
      { id: "trevi-spanish", name: "Trevi Fountain + Spanish Steps walk", cost: 0, durationHours: 1.5, tags: ["iconic", "outdoor", "free"], description: "Toss the coin at Trevi, then walk to the Spanish Steps — go after dark for dramatically fewer crowds and beautiful lighting. Pro tip: visit before 8am for nearly empty photos, or after 10pm for a magical atmosphere.", recommended: true },
      { id: "borghese-gallery", name: "Galleria Borghese (Bernini sculptures)", cost: 22, durationHours: 2, tags: ["culture"], description: "Tickets are timed and limited — book 2+ weeks ahead." },
      { id: "appia-antica", name: "Appian Way bike or e-bike", cost: 25, durationHours: 4, tags: ["outdoor", "adventure", "culture"], description: "Ancient Roman road outside the city — bike it with park rentals." },
      { id: "food-tour", name: "Testaccio market food tour", cost: 85, durationHours: 3, tags: ["foodie", "culture"], description: "Pasta, suppli, pizza al taglio in the Roman working-class neighborhood." },
    ],
  }),

  bundle({
    key: "barcelona",
    name: "Barcelona, Spain",
    airportCode: "BCN",
    region: "transatlantic",
    neighborhoods: [
      { name: "Eixample", vibe: "Gaudí architecture and wide boulevards", mealTip: "Tapas at Cervecería Catalana or brunch at Federal Café" },
      { name: "Gràcia", vibe: "bohemian local village feel", mealTip: "Vermouth and patatas bravas at a terrace on Plaça del Sol" },
      { name: "El Born", vibe: "medieval streets and cocktail bars", mealTip: "Tapas at Cal Pep or drinks at Paradiso speakeasy" },
      { name: "Gothic Quarter", vibe: "narrow medieval lanes and plazas", mealTip: "Pintxos crawl along Carrer de Blai (nearby Poble-sec)" },
      { name: "Barceloneta", vibe: "beachfront seafood", mealTip: "Paella at La Mar Salada or chiringuito drinks on the sand" },
      { name: "Raval", vibe: "multicultural and artsy", mealTip: "Cheap eats on Carrer de Joaquín Costa and craft beer at BierCaB" },
    ],
    tips: [
      "Tap water is safe to drink — skip the bottled water",
      "Buy a T-Casual card for 10 Metro/bus rides at a discount",
      "Pickpockets are very common on Las Ramblas and the Metro — stay alert",
      "Restaurants don't open for dinner until 9pm — locals eat at 10pm",
      "Many shops and smaller restaurants close 2-4pm for siesta",
      "Beach towels and swimsuits are fine at the beach but not for walking around the city",
    ],
    airportTransfer: {
      taxi: [40, 50],
      transit: [5, 7],
    },
    activities: [
      { id: "sagrada-familia", name: "Sagrada Família (with tower)", cost: 36, durationHours: 2, tags: ["iconic", "culture"], description: "Gaudi's masterpiece — book 2+ weeks ahead as walk-ups wait 90+ minutes. Visit mid-morning for the best stained-glass light inside. Pro tip: the Nativity tower has the best views.", recommended: true },
      { id: "park-guell", name: "Park Güell (monumental zone)", cost: 13, durationHours: 2, tags: ["iconic", "outdoor", "culture"], description: "Gaudi's mosaic park on a hilltop — the iconic terrace is a paid zone with timed tickets. Go at opening (9:30am) for the fewest crowds and best photos. Pro tip: walk up from Lesseps metro for free; the paid shuttle is unnecessary.", recommended: true },
      { id: "casa-batllo", name: "Casa Batlló", cost: 35, durationHours: 1.5, tags: ["iconic", "culture"], description: "The most playful of Gaudí's houses on Passeig de Gràcia." },
      { id: "gothic-quarter", name: "Gothic Quarter walking tour", cost: 0, durationHours: 2.5, tags: ["outdoor", "culture", "free"], description: "Free tip-based walking tour through the medieval old town — plan 2-3 hours to wander the narrow lanes. Best in late afternoon when the heat fades and the golden light hits the stone. Pro tip: duck into the cathedral cloister with the 13 geese.", recommended: true },
      { id: "boqueria", name: "La Boqueria market + tapas crawl", cost: 35, durationHours: 2, tags: ["foodie"], description: "Famous market off Las Ramblas — arrive before 11am for the best selection and fewer tourists. El Quim de la Boqueria is the must-eat counter. Pro tip: skip Tuesdays (partial closures) and Sundays (closed).", recommended: true },
      { id: "barceloneta", name: "Barceloneta Beach afternoon", cost: 0, durationHours: 3, tags: ["outdoor", "free"], description: "City beach, easy metro/walk from old town. Bring sunscreen." },
      { id: "flamenco", name: "Flamenco show", cost: 50, durationHours: 1.5, tags: ["culture", "nightlife"], description: "Tablao Cordobés or Palacio del Flamenco. Smaller venues = better experience." },
      { id: "montserrat", name: "Day trip to Montserrat monastery", cost: 70, durationHours: 7, tags: ["outdoor", "adventure", "culture"], description: "Train + cable car to a mountaintop Benedictine monastery 1 hour out of the city." },
    ],
  }),

  bundle({
    key: "amsterdam",
    name: "Amsterdam, Netherlands",
    airportCode: "AMS",
    region: "transatlantic",
    activities: [
      { id: "anne-frank", name: "Anne Frank House", cost: 17, durationHours: 1.5, tags: ["iconic", "culture"], description: "Tickets sell out 6 weeks in advance — book the second they open.", recommended: true },
      { id: "rijksmuseum", name: "Rijksmuseum (Vermeer + Rembrandt)", cost: 25, durationHours: 3, tags: ["iconic", "culture"], description: "Dutch Masters in a building that's worth visiting on its own.", recommended: true },
      { id: "van-gogh", name: "Van Gogh Museum", cost: 22, durationHours: 2, tags: ["iconic", "culture"], description: "World's largest Van Gogh collection. Book a timed slot." },
      { id: "canal-bike", name: "Canal-side bike rental day", cost: 18, durationHours: 4, tags: ["outdoor", "iconic"], description: "Bike rental for a day. The whole city is built for it. Avoid tram tracks.", recommended: true },
      { id: "jordaan-walk", name: "Jordaan neighborhood wander + Albert Cuyp", cost: 0, durationHours: 2, tags: ["outdoor", "culture", "free"], description: "Quiet canals, indie shops, and the city's best stroopwafel stand at Albert Cuyp Market.", recommended: true },
      { id: "canal-cruise", name: "Evening canal cruise", cost: 28, durationHours: 1.5, tags: ["iconic", "outdoor"], description: "Skip the daytime tourist boats — sunset cruise with a glass of wine." },
      { id: "vondelpark", name: "Vondelpark afternoon", cost: 0, durationHours: 2, tags: ["outdoor", "free", "family"], description: "The city's central park — bring a coffee and sit by the pond." },
      { id: "brown-cafe", name: "Evening at a brown café", cost: 35, durationHours: 2, tags: ["nightlife", "foodie"], description: "Dark-wood Dutch pub. Try Café Hoppe or 't Smalle for the canonical experience." },
    ],
  }),

  bundle({
    key: "lisbon",
    name: "Lisbon, Portugal",
    airportCode: "LIS",
    region: "transatlantic",
    activities: [
      { id: "tram-28", name: "Tram 28 + Alfama walk", cost: 4, durationHours: 3, tags: ["iconic", "culture"], description: "The vintage yellow tram through the old quarter. Get on at Martim Moniz to actually find a seat.", recommended: true },
      { id: "belem", name: "Belém (Jerónimos + Tower + pastéis)", cost: 18, durationHours: 4, tags: ["iconic", "culture", "foodie"], description: "Monastery + riverside tower + the OG Pastéis de Belém. Combo ticket saves money.", recommended: true },
      { id: "miradouro-sunset", name: "Sunset at Miradouro da Senhora do Monte", cost: 0, durationHours: 1.5, tags: ["outdoor", "iconic", "free"], description: "Highest free viewpoint in the city. Bring a beer.", recommended: true },
      { id: "lx-factory", name: "LX Factory afternoon", cost: 0, durationHours: 2, tags: ["culture", "foodie", "free"], description: "Converted industrial complex with shops, street art, restaurants." },
      { id: "sintra", name: "Day trip to Sintra (Pena Palace + Quinta da Regaleira)", cost: 35, durationHours: 8, tags: ["iconic", "outdoor", "culture", "adventure"], description: "Train from Rossio + Pena Palace + the spiral well at Quinta. Go early — buses get crammed.", recommended: true },
      { id: "fado", name: "Fado dinner show in Alfama", cost: 65, durationHours: 2.5, tags: ["culture", "nightlife", "foodie"], description: "Traditional Portuguese music with dinner. Tasca do Chico is small and authentic." },
      { id: "time-out-market", name: "Time Out Market dinner", cost: 35, durationHours: 1.5, tags: ["foodie"], description: "Curated food hall with the city's best chefs in one room." },
      { id: "biarritz-day", name: "Cascais beach day", cost: 10, durationHours: 6, tags: ["outdoor", "family"], description: "Train ride down the coast to a fishing-village beach town." },
    ],
  }),

  bundle({
    key: "athens",
    name: "Athens, Greece",
    airportCode: "ATH",
    region: "transatlantic",
    activities: [
      { id: "acropolis", name: "Acropolis + Parthenon (combo ticket)", cost: 22, durationHours: 3, tags: ["iconic", "culture"], description: "Combo ticket gets you Acropolis + Forum + 5 other sites for 5 days. Go at opening or late afternoon.", recommended: true },
      { id: "acropolis-museum", name: "Acropolis Museum", cost: 15, durationHours: 2, tags: ["iconic", "culture"], description: "The other half of the Parthenon experience. Walking through it is the right way to understand the site." },
      { id: "plaka", name: "Plaka + Anafiotika neighborhood walk", cost: 0, durationHours: 2.5, tags: ["outdoor", "culture", "free"], description: "Old town below the Acropolis with a hidden Greek-island-style village.", recommended: true },
      { id: "agora", name: "Ancient Agora + Temple of Hephaestus", cost: 10, durationHours: 2, tags: ["culture"], description: "Best-preserved ancient Greek temple. Included in the Acropolis combo." },
      { id: "lycabettus", name: "Lycabettus Hill at sunset", cost: 8, durationHours: 1.5, tags: ["outdoor", "iconic", "free"], description: "Funicular up the city's tallest hill. Free to walk; small fee to ride. Sunset = unbeatable.", recommended: true },
      { id: "central-market", name: "Central Market + Psiri tavernas", cost: 35, durationHours: 2, tags: ["foodie", "culture"], description: "Buzzing meat/fish market followed by lunch at a nearby taverna." },
      { id: "cape-sounion", name: "Day trip to Cape Sounion (Temple of Poseidon)", cost: 50, durationHours: 6, tags: ["outdoor", "iconic", "culture"], description: "Coastal drive 1.5h south to a clifftop temple, ideally for sunset." },
      { id: "rooftop-bar", name: "Rooftop bar overlooking the Acropolis", cost: 25, durationHours: 2, tags: ["nightlife"], description: "A for Athens or 360 Cocktail Bar — book ahead, especially Friday/Saturday." },
    ],
  }),

  // ─── Asia / Pacific ───────────────────────────────────────────────────
  bundle({
    key: "tokyo",
    name: "Tokyo, Japan",
    airportCode: "HND",
    region: "transpacific",
    neighborhoods: [
      { name: "Shibuya", vibe: "iconic crossing and youth culture", mealTip: "Ramen at Fuunji or conveyor belt sushi at Genki Sushi" },
      { name: "Shinjuku", vibe: "neon nightlife and izakayas", mealTip: "Yakitori at Memory Lane (Omoide Yokocho) or tiny bars in Golden Gai" },
      { name: "Asakusa", vibe: "traditional temples and old Tokyo charm", mealTip: "Street snacks along Nakamise-dori or tempura at Daikokuya" },
      { name: "Harajuku", vibe: "street fashion and crepe shops", mealTip: "Takeshita Street crepes or a trendy cafe on Cat Street" },
      { name: "Ginza", vibe: "luxury shopping and fine dining", mealTip: "Omakase sushi at the basement counters or department store food halls (depachika)" },
      { name: "Akihabara", vibe: "electronics and anime culture", mealTip: "Cheap ramen chains or themed maid cafes (for the experience)" },
    ],
    tips: [
      "Tap water is safe to drink everywhere in Japan",
      "Get a Suica or Pasmo IC card for all trains and buses — also works at convenience stores",
      "Tipping is not customary and can be considered rude — don't tip",
      "Convenience stores (7-Eleven, Lawson, FamilyMart) have excellent fresh food at low prices",
      "Most restaurants have plastic food displays or picture menus — pointing works fine",
      "Carry cash — many smaller restaurants and shops don't accept cards",
      "Trash cans are rare — carry your trash until you find one at a convenience store or station",
    ],
    airportTransfer: {
      taxi: [80, 200],
      transit: [10, 20],
    },
    activities: [
      { id: "shibuya-crossing", name: "Shibuya Crossing + Hachiko + Center Gai", cost: 0, durationHours: 2, tags: ["iconic", "outdoor", "free"], description: "Famous scramble crossing — best viewed from the Shibuya Sky observation deck or the Starbucks above. Go at evening rush hour for peak pedestrian chaos. Pro tip: the Mag's Park rooftop (free) above Shibuya 109 has the best unobstructed view.", recommended: true },
      { id: "senso-ji", name: "Senso-ji Temple + Asakusa walk", cost: 0, durationHours: 2, tags: ["iconic", "culture", "free"], description: "Tokyo's oldest temple — go before 8am for near-empty grounds and atmospheric incense. Walk Nakamise-dori for street snacks after the shops open at 10am. Pro tip: come back after dark when the temple is lit up and tourist-free.", recommended: true },
      { id: "tsukiji", name: "Tsukiji outer market sushi breakfast", cost: 35, durationHours: 2, tags: ["foodie", "iconic"], description: "Inner fish market moved to Toyosu, but Tsukiji outer market remains for street food." },
      { id: "teamlab", name: "teamLab Borderless or Planets", cost: 38, durationHours: 3, tags: ["iconic", "culture", "family"], description: "Immersive digital art — plan 2-3 hours to explore fully. Book timed tickets 2+ weeks ahead as slots sell out fast. Pro tip: wear shorts or a skirt you can roll up at Planets (you wade through water), and go on a weekday.", recommended: true },
      { id: "shinjuku-night", name: "Shinjuku Golden Gai + Omoide Yokocho dinner", cost: 60, durationHours: 3, tags: ["nightlife", "foodie", "iconic"], description: "Tiny postwar bars in Golden Gai, then yakitori under the train tracks at Memory Lane. Best after 8pm when the bars fill up. Pro tip: some Golden Gai bars charge a cover — check the sign before sitting down, and start at Memory Lane for a cheaper warmup.", recommended: true },
      { id: "meiji-shrine", name: "Meiji Shrine + Yoyogi Park morning", cost: 0, durationHours: 2.5, tags: ["outdoor", "culture", "free"], description: "Forest shrine in the middle of Tokyo. Sunday cosplay scene at Harajuku adjacent." },
      { id: "tokyo-tower", name: "Tokyo Skytree or Tokyo Tower", cost: 30, durationHours: 1.5, tags: ["iconic"], description: "Skytree is taller; Tower is more iconic. Sunset gives you both day + night views in one ticket." },
      { id: "day-nikko", name: "Day trip to Nikko or Kamakura", cost: 50, durationHours: 8, tags: ["outdoor", "culture", "iconic"], description: "Either: Nikko shrines + waterfalls 2hr north, or Kamakura Great Buddha + beach 1hr south." },
    ],
  }),

  bundle({
    key: "bangkok",
    name: "Bangkok, Thailand",
    airportCode: "BKK",
    region: "transpacific",
    activities: [
      { id: "grand-palace", name: "Grand Palace + Wat Phra Kaew", cost: 16, durationHours: 3, tags: ["iconic", "culture"], description: "Dress code strict — long pants/sleeves required. Go at opening to beat heat + tour buses.", recommended: true },
      { id: "wat-pho", name: "Wat Pho (Reclining Buddha) + Wat Arun ferry", cost: 9, durationHours: 2.5, tags: ["iconic", "culture"], description: "Reclining Buddha + cross the river by 5 baht ferry to Wat Arun.", recommended: true },
      { id: "street-food-tour", name: "Chinatown street food walking tour", cost: 50, durationHours: 3, tags: ["foodie", "culture"], description: "Yaowarat Road after dark — pad thai, mango sticky rice, dim sum.", recommended: true },
      { id: "chatuchak", name: "Chatuchak Weekend Market", cost: 0, durationHours: 3, tags: ["culture", "foodie", "free"], description: "8,000 stalls, weekends only. Bring cash. Easy from BTS Mo Chit." },
      { id: "tuk-tuk-evening", name: "Evening tuk-tuk + rooftop bar", cost: 45, durationHours: 3, tags: ["nightlife", "iconic"], description: "Tuk-tuk through the old town then up to Sky Bar at Lebua or a cheaper rooftop." },
      { id: "ayutthaya", name: "Day trip to Ayutthaya ruins", cost: 35, durationHours: 8, tags: ["iconic", "culture", "outdoor"], description: "Former Thai capital ruins 1.5hr north by train or guided tour." },
      { id: "thai-massage", name: "Traditional Thai massage", cost: 15, durationHours: 1.5, tags: ["culture"], description: "$10-20 for a full hour at a reputable shop. Wat Pho's massage school is the gold standard." },
      { id: "longtail-canals", name: "Longtail boat through the klong canals", cost: 25, durationHours: 2, tags: ["outdoor", "culture"], description: "Old Bangkok still lives along the canals. Negotiate the price firmly at Tha Tien pier." },
    ],
  }),

  bundle({
    key: "bali",
    name: "Bali, Indonesia (Denpasar)",
    airportCode: "DPS",
    region: "transpacific",
    activities: [
      { id: "ubud-rice", name: "Tegallalang rice terraces (Ubud)", cost: 5, durationHours: 2, tags: ["iconic", "outdoor"], description: "Iconic green terraces 30 min from Ubud center. Photo, walk, swing optional.", recommended: true },
      { id: "monkey-forest", name: "Sacred Monkey Forest Sanctuary", cost: 6, durationHours: 1.5, tags: ["outdoor", "family", "iconic"], description: "Hindu temple complex with 700+ macaques. Don't bring food in your bag." },
      { id: "uluwatu-temple", name: "Uluwatu Temple + Kecak fire dance", cost: 12, durationHours: 3, tags: ["iconic", "culture"], description: "Clifftop temple at sunset followed by the traditional fire dance ceremony.", recommended: true },
      { id: "tanah-lot", name: "Tanah Lot sunset", cost: 5, durationHours: 2, tags: ["iconic", "outdoor"], description: "Iconic sea-rock temple. Crowded but worth it. Eat dinner at Mengening beach after." },
      { id: "mount-batur", name: "Mount Batur sunrise hike", cost: 65, durationHours: 7, tags: ["adventure", "outdoor"], description: "2am pickup, summit by sunrise. Easy hike but altitude. Guides include breakfast on the rim.", recommended: true },
      { id: "balinese-cooking", name: "Balinese cooking class in Ubud", cost: 35, durationHours: 4, tags: ["foodie", "culture"], description: "Market visit + cooking 5-6 dishes. Paon Bali is a popular reputable choice." },
      { id: "seminyak-beach", name: "Seminyak beach club afternoon", cost: 50, durationHours: 4, tags: ["nightlife", "outdoor"], description: "Potato Head or KU DE TA — daybeds, pool, sunset DJs. Reservation needed." },
      { id: "tirta-empul", name: "Tirta Empul water purification temple", cost: 6, durationHours: 2, tags: ["culture", "iconic"], description: "Hindu purification ritual in sacred springs. Bring a sarong and waterproof phone case." },
    ],
  }),

  bundle({
    key: "dubai",
    name: "Dubai, UAE",
    airportCode: "DXB",
    region: "long-haul",
    activities: [
      { id: "burj-khalifa", name: "Burj Khalifa observation deck (124th + 125th)", cost: 50, durationHours: 1.5, tags: ["iconic"], description: "Book the sunset slot. The 148th floor is double the price for a slightly higher view.", recommended: true },
      { id: "desert-safari", name: "Desert safari + camp dinner", cost: 80, durationHours: 6, tags: ["adventure", "outdoor", "iconic"], description: "Dune bashing, camel ride, BBQ dinner with belly dancing in a Bedouin camp. Touristy but iconic.", recommended: true },
      { id: "old-dubai", name: "Old Dubai: Gold Souk + Spice Souk + abra ferry", cost: 5, durationHours: 3, tags: ["culture", "foodie", "outdoor"], description: "1 dirham abra (water taxi) across Dubai Creek connects the two souks.", recommended: true },
      { id: "dubai-mall", name: "Dubai Mall + fountain show + aquarium", cost: 0, durationHours: 3, tags: ["family", "iconic", "free"], description: "Free fountain show every 30 min at sunset. Aquarium walkthrough is paid extra." },
      { id: "grand-mosque", name: "Sheikh Zayed Grand Mosque (Abu Dhabi day trip)", cost: 0, durationHours: 6, tags: ["iconic", "culture", "free"], description: "1.5h drive to Abu Dhabi; the mosque is free and stunning. Modest dress required." },
      { id: "marina-walk", name: "Dubai Marina walk + dhow dinner cruise", cost: 70, durationHours: 3, tags: ["nightlife", "outdoor"], description: "Walk the marina, then traditional dhow boat dinner cruise around the harbor." },
      { id: "jbr-beach", name: "JBR Beach + The Walk afternoon", cost: 0, durationHours: 3, tags: ["outdoor", "family", "free"], description: "Free public beach with restaurants behind it. Good for sunset." },
      { id: "ski-dubai", name: "Ski Dubai (Mall of the Emirates)", cost: 90, durationHours: 3, tags: ["family", "adventure"], description: "Indoor snow park inside a mall. Truly absurd; kids love it." },
    ],
  }),

  // ─── Americas ─────────────────────────────────────────────────────────
  bundle({
    key: "new-york-city",
    name: "New York City, NY",
    airportCode: "JFK",
    region: "domestic-us",
    activities: [
      { id: "central-park", name: "Central Park walk + Bethesda Terrace", cost: 0, durationHours: 3, tags: ["outdoor", "iconic", "free"], description: "Enter at Columbus Circle, walk north past Bethesda, exit at the Met. Bike rental optional.", recommended: true },
      { id: "met-museum", name: "Metropolitan Museum of Art", cost: 30, durationHours: 4, tags: ["iconic", "culture"], description: "Suggested admission $30, but NY/NJ/CT residents pay what you wish.", recommended: true },
      { id: "9-11-memorial", name: "9/11 Memorial + Museum", cost: 33, durationHours: 3, tags: ["iconic", "culture"], description: "Memorial pools are free; the museum requires a ticket. Go early." },
      { id: "high-line-chelsea", name: "The High Line + Chelsea Market lunch", cost: 25, durationHours: 3, tags: ["outdoor", "foodie", "free"], description: "Free elevated park along an old rail line. Walk south to Chelsea Market for lunch.", recommended: true },
      { id: "brooklyn-bridge", name: "Brooklyn Bridge walk + DUMBO sunset", cost: 0, durationHours: 2.5, tags: ["outdoor", "iconic", "free"], description: "Walk Brooklyn Bridge from Manhattan side, end at DUMBO for the Manhattan Bridge photo + Time Out Market.", recommended: true },
      { id: "broadway-show", name: "Broadway show", cost: 130, durationHours: 2.5, tags: ["culture", "nightlife", "iconic"], description: "TKTS booth in Times Square has same-day discount tickets — line up 1h before opening." },
      { id: "moma", name: "MoMA (Museum of Modern Art)", cost: 30, durationHours: 3, tags: ["culture", "iconic"], description: "Reserve a free Friday evening slot if you can — last 2 hours before close." },
      { id: "katz-deli", name: "Lower East Side: Katz's + Russ & Daughters", cost: 35, durationHours: 2, tags: ["foodie", "culture"], description: "Pastrami sandwich at Katz's + bagel + lox at Russ & Daughters. Iconic NYC food doubleheader." },
    ],
  }),

  bundle({
    key: "miami",
    name: "Miami, FL",
    airportCode: "MIA",
    region: "domestic-us",
    activities: [
      { id: "south-beach", name: "South Beach + Ocean Drive walk", cost: 0, durationHours: 3, tags: ["outdoor", "iconic", "free"], description: "Free beach + Art Deco facades. Sunbed rental ~$20.", recommended: true },
      { id: "wynwood-walls", name: "Wynwood Walls + brewery crawl", cost: 12, durationHours: 3, tags: ["culture", "foodie", "iconic"], description: "Outdoor street art museum + the surrounding indie breweries (Wynwood Brewing, J. Wakefield).", recommended: true },
      { id: "everglades", name: "Everglades airboat tour (half-day)", cost: 75, durationHours: 4, tags: ["adventure", "outdoor", "iconic"], description: "1hr drive to Everglades National Park + 30-min airboat. Alligators guaranteed.", recommended: true },
      { id: "little-havana", name: "Little Havana walking tour + Cuban lunch", cost: 35, durationHours: 2.5, tags: ["foodie", "culture"], description: "Calle Ocho domino park, cigar rollers, cafecito stops, ropa vieja lunch at Versailles." },
      { id: "vizcaya", name: "Vizcaya Museum and Gardens", cost: 25, durationHours: 2.5, tags: ["culture", "outdoor"], description: "1916 Italian Renaissance villa on Biscayne Bay. Insta-famous." },
      { id: "key-biscayne", name: "Key Biscayne beach + lighthouse", cost: 12, durationHours: 4, tags: ["outdoor", "family"], description: "Cape Florida State Park — quieter beach + lighthouse climb." },
      { id: "art-deco-tour", name: "Art Deco walking tour", cost: 35, durationHours: 1.5, tags: ["culture", "iconic"], description: "Official MDPL tour through Ocean Drive's Art Deco district." },
      { id: "south-beach-nightlife", name: "Evening at LIV or rooftop bar", cost: 100, durationHours: 4, tags: ["nightlife"], description: "Club cover + drinks. Or skip the megaclub and hit Sweet Liberty for craft cocktails." },
    ],
  }),

  bundle({
    key: "mexico-city",
    name: "Mexico City, Mexico",
    airportCode: "MEX",
    region: "north-america",
    activities: [
      { id: "zocalo", name: "Zócalo + Templo Mayor + Cathedral", cost: 5, durationHours: 2.5, tags: ["iconic", "culture"], description: "Main plaza + Aztec ruins beside the Spanish cathedral. Climb the cathedral bell tower.", recommended: true },
      { id: "anthropology-museum", name: "Museo Nacional de Antropología", cost: 5, durationHours: 4, tags: ["iconic", "culture"], description: "World-class museum of pre-Columbian Mexican history. Easily a half-day.", recommended: true },
      { id: "frida-kahlo", name: "Casa Azul (Frida Kahlo Museum)", cost: 14, durationHours: 1.5, tags: ["iconic", "culture"], description: "Frida's blue house in Coyoacán. BUY ONLINE — walk-up tickets sell out by noon.", recommended: true },
      { id: "teotihuacan", name: "Teotihuacán pyramids day trip", cost: 30, durationHours: 7, tags: ["iconic", "outdoor", "adventure"], description: "1hr north by bus from Terminal Norte. Climb the Pyramid of the Sun at sunrise.", recommended: true },
      { id: "xochimilco", name: "Xochimilco trajinera boat", cost: 25, durationHours: 4, tags: ["family", "outdoor", "foodie"], description: "Floating gardens with mariachi-bedecked party boats. Saturday is the spectacle." },
      { id: "coyoacan-walk", name: "Coyoacán plaza + market lunch", cost: 15, durationHours: 2.5, tags: ["culture", "foodie"], description: "Charming colonial neighborhood. Mercado de Coyoacán has incredible tostadas." },
      { id: "lucha-libre", name: "Lucha libre night at Arena México", cost: 25, durationHours: 2.5, tags: ["nightlife", "iconic", "family"], description: "Friday or Tuesday nights. Loud, masked, glorious chaos." },
      { id: "polanco-tasting", name: "Polanco taquería crawl + mezcal", cost: 60, durationHours: 3, tags: ["foodie", "nightlife"], description: "El Califa de León + mezcal at Bósforo. Or splurge for Pujol if you book 3 months out." },
    ],
  }),

  bundle({
    key: "cancun",
    name: "Cancún, Mexico",
    airportCode: "CUN",
    region: "north-america",
    activities: [
      { id: "playa-delfines", name: "Playa Delfines beach day", cost: 0, durationHours: 4, tags: ["outdoor", "free", "family"], description: "Public beach with the iconic CANCÚN sign. Bring shade — limited.", recommended: true },
      { id: "chichen-itza", name: "Chichén Itzá day trip", cost: 90, durationHours: 10, tags: ["iconic", "culture", "adventure"], description: "2.5hr drive each way. Combine with a cenote swim and Valladolid lunch.", recommended: true },
      { id: "isla-mujeres", name: "Isla Mujeres ferry day", cost: 50, durationHours: 7, tags: ["outdoor", "iconic", "adventure"], description: "20-min ferry. Rent a golf cart and circle the island with snorkel + beach stops.", recommended: true },
      { id: "tulum", name: "Tulum ruins + cenote day trip", cost: 70, durationHours: 9, tags: ["iconic", "outdoor", "culture", "adventure"], description: "2hr south. Mayan ruins on a cliff over the Caribbean + freshwater cenote swim after." },
      { id: "xcaret", name: "Xcaret eco-park (full day)", cost: 130, durationHours: 9, tags: ["family", "adventure"], description: "All-inclusive eco-park: underground rivers, cenotes, dolphin show, evening Mexico spectacular." },
      { id: "mercado-23", name: "Mercado 23 + downtown Cancún food walk", cost: 30, durationHours: 2.5, tags: ["foodie", "culture"], description: "Local market downtown — actual Mexican food (vs hotel zone). Tacos al pastor." },
      { id: "snorkel-mesoamerican", name: "MUSA underwater museum snorkel", cost: 65, durationHours: 4, tags: ["adventure", "outdoor", "iconic"], description: "Snorkel an underwater sculpture park off Punta Nizuc. Boat departures from the marina." },
      { id: "coba-bike", name: "Cobá ruins + bike to top pyramid", cost: 75, durationHours: 8, tags: ["culture", "outdoor", "adventure"], description: "Less crowded than Chichén. You can still climb the main pyramid (currently)." },
    ],
  }),

  // ─── United States (expanded) ──────────────────────────────────────────
  bundle({
    key: "san-francisco",
    name: "San Francisco, CA",
    airportCode: "SFO",
    region: "domestic-us",
    neighborhoods: [
      { name: "Mission District", vibe: "murals, taquerias, and dive bars", mealTip: "Burrito at La Taqueria or Tartine bread and pastries" },
      { name: "North Beach", vibe: "Little Italy cafes and Beat poet history", mealTip: "Pasta at Tony's Coal-Fired Pizza or espresso at Caffe Trieste" },
      { name: "Haight-Ashbury", vibe: "counterculture history and vintage shops", mealTip: "Brunch at Pork Store Cafe" },
      { name: "Hayes Valley", vibe: "boutique shopping and cocktail bars", mealTip: "Smitten Ice Cream or dinner at Rich Table" },
      { name: "Chinatown", vibe: "oldest Chinatown in North America", mealTip: "Dim sum at Good Mong Kok Bakery or City View" },
      { name: "Castro", vibe: "LGBTQ+ history and neighborhood pride", mealTip: "Brunch at Kitchen Story" },
    ],
    tips: [
      "Layers are essential — mornings are foggy and cold even in summer; afternoons warm up",
      "MUNI and BART are the main transit — get a Clipper card for all systems",
      "Street parking is nearly impossible downtown — rideshare or transit is easier",
      "Book Alcatraz tickets 2-4 weeks in advance — they sell out fast",
      "The best views of the Golden Gate are from Battery Spencer on the Marin side",
      "Fog typically burns off by noon June-August — plan outdoor activities for afternoon",
    ],
    airportTransfer: {
      taxi: [40, 65],
      transit: [9, 13],
    },
    activities: [
      { id: "golden-gate-bridge", name: "Golden Gate Bridge walk + Battery Spencer viewpoint", cost: 0, durationHours: 2.5, tags: ["iconic", "outdoor", "free"], description: "Walk or bike across the bridge from the Welcome Center to Battery Spencer on the Marin side for the classic postcard photo. Best on a clear afternoon — morning fog often obscures the bridge until noon. Pro tip: rent a bike at Blazing Saddles and ride across, then ferry back from Sausalito.", recommended: true },
      { id: "alcatraz", name: "Alcatraz Island night tour", cost: 47, durationHours: 3, tags: ["iconic", "culture"], description: "The night tour is smaller, more atmospheric, and includes the audio tour narrated by former inmates. Book 2-4 weeks ahead — sells out fast. Ferry departs from Pier 33. Pro tip: the night tour includes sunset views of the city skyline from the island.", recommended: true },
      { id: "fishermans-wharf", name: "Fisherman's Wharf + Ghirardelli Square", cost: 15, durationHours: 2.5, tags: ["iconic", "foodie", "family"], description: "Touristy but the sea lions at Pier 39 are genuinely entertaining. Grab clam chowder in a sourdough bowl at Boudin Bakery. Skip the overpriced seafood restaurants on the wharf itself. Pro tip: walk one block inland to In-N-Out for a cheaper meal with a bay view.", recommended: true },
      { id: "chinatown-walk", name: "Chinatown walking tour + dim sum", cost: 25, durationHours: 2.5, tags: ["culture", "foodie"], description: "The oldest Chinatown in North America — enter through the Dragon Gate on Grant Avenue. Self-guided or join a walking tour. Dim sum at Good Mong Kok Bakery or City View Restaurant. Pro tip: duck into the alleys off Grant for the real neighborhood." },
      { id: "golden-gate-park", name: "Golden Gate Park + de Young Museum + Japanese Tea Garden", cost: 20, durationHours: 4, tags: ["outdoor", "culture"], description: "1,000-acre urban park with world-class museums. The de Young Museum ($15) has a free observation tower with panoramic views. The Japanese Tea Garden ($12) is the oldest in the US. Pro tip: rent a bike to cover more ground — the park stretches 3 miles.", recommended: true },
      { id: "cable-cars", name: "Cable car ride + Lombard Street", cost: 8, durationHours: 1.5, tags: ["iconic", "family"], description: "Ride the Powell-Hyde line from Union Square to Fisherman's Wharf, passing Lombard Street (the crooked one). $8 per ride or free with a MUNI day pass. Pro tip: board at the California & Powell stop (less crowded than the turnaround) and hang off the side." },
      { id: "ferry-building", name: "Ferry Building Marketplace + Embarcadero walk", cost: 30, durationHours: 2, tags: ["foodie", "culture"], description: "Gourmet food hall with artisan vendors — Cowgirl Creamery cheese, Blue Bottle Coffee, Hog Island Oyster Bar. Saturday farmers' market outside is legendary. Pro tip: grab oysters and a glass of wine at Hog Island's bar, then walk the Embarcadero waterfront south.", recommended: true },
      { id: "mission-murals", name: "Mission District murals + burrito crawl", cost: 20, durationHours: 2.5, tags: ["culture", "foodie", "outdoor"], description: "Balmy Alley and Clarion Alley have the densest collections of murals. Follow with a Mission burrito at La Taqueria or El Farolito. The neighborhood is also the sunniest part of SF. Pro tip: walk Valencia Street for indie bookshops and coffee between mural stops." },
    ],
  }),

  bundle({
    key: "chicago",
    name: "Chicago, IL",
    airportCode: "ORD",
    region: "domestic-us",
    neighborhoods: [
      { name: "The Loop", vibe: "downtown architecture and public art", mealTip: "Deep dish at Lou Malnati's or Italian beef at Portillo's" },
      { name: "Wicker Park", vibe: "indie shops, cafes, and nightlife", mealTip: "Brunch at Big Star or dinner at Piece Brewery" },
      { name: "Lincoln Park", vibe: "tree-lined streets and the free zoo", mealTip: "Dinner at Alinea (splurge) or R.J. Grunts (casual)" },
      { name: "West Loop", vibe: "restaurant row and trendy dining", mealTip: "Girl & The Goat, Au Cheval burgers, or Avec" },
      { name: "Pilsen", vibe: "Mexican-American murals and culture", mealTip: "Tacos at Birrieria Zaragoza or tamales at 5 Rabanitos" },
      { name: "Old Town", vibe: "comedy clubs and historic brownstones", mealTip: "Second City show + dinner at Twin Anchors ribs" },
    ],
    tips: [
      "The 'L' train covers most of the city — get a Ventra card for CTA buses and trains",
      "Chicago is called the Windy City for its politics, not just its weather — but dress warmly Oct-Apr",
      "Deep dish pizza is a tourist must but locals often prefer tavern-style thin crust",
      "Tipping 18-20% is standard at restaurants",
      "Lake Michigan beaches are free and beautiful in summer — North Avenue Beach is the most popular",
      "Architecture boat tours sell out in summer — book 1-2 days ahead",
    ],
    airportTransfer: {
      taxi: [35, 55],
      transit: [3, 5],
    },
    activities: [
      { id: "millennium-park", name: "Millennium Park + Cloud Gate (The Bean)", cost: 0, durationHours: 2, tags: ["iconic", "outdoor", "free"], description: "Free public park with the iconic Cloud Gate sculpture (The Bean), Crown Fountain, and Lurie Garden. In summer, catch a free concert at the Pritzker Pavilion. Pro tip: go early morning for reflection photos at The Bean without crowds, or at night when the skyline lights up behind it.", recommended: true },
      { id: "art-institute", name: "Art Institute of Chicago", cost: 35, durationHours: 3.5, tags: ["iconic", "culture"], description: "One of the world's great art museums — home to Seurat's A Sunday Afternoon, Nighthawks, and American Gothic. Plan at least 3 hours. Pro tip: Illinois residents get free admission on select evenings. Start on the 2nd floor with the Impressionists.", recommended: true },
      { id: "willis-tower", name: "Willis Tower Skydeck + Ledge", cost: 35, durationHours: 1.5, tags: ["iconic", "family"], description: "103rd-floor observation deck with glass-bottom Ledge boxes extending over the street. Go on a clear day for views of 4 states. Pro tip: 360 Chicago (formerly Hancock) is cheaper, less crowded, has a bar, and some say the view is better because it includes Willis Tower.", recommended: true },
      { id: "navy-pier", name: "Navy Pier + Centennial Wheel", cost: 18, durationHours: 2.5, tags: ["iconic", "family", "outdoor"], description: "Lakefront pier with the Centennial Wheel ($18), free fireworks on summer Wednesdays and Saturdays, and the Chicago Shakespeare Theater. Touristy but the views of the skyline from the wheel at sunset are worth it. Pro tip: skip the chain restaurants and eat before you go." },
      { id: "wrigley-field", name: "Wrigley Field game or tour", cost: 55, durationHours: 3.5, tags: ["iconic", "outdoor"], description: "Historic 1914 ballpark — even non-baseball fans love the ivy walls and rooftop atmosphere. Bleacher seats ($25-55) are the most fun. Game-day Wrigleyville bar crawl is part of the experience. Pro tip: the ballpark tour ($35) runs on non-game days and includes the field.", recommended: true },
      { id: "deep-dish-tour", name: "Deep dish pizza tour", cost: 60, durationHours: 3, tags: ["foodie"], description: "Hit the big three: Lou Malnati's (butter crust classic), Pequod's (caramelized cheese crust), and Giordano's (stuffed style). Split a small at each — they're filling. Pro tip: Pequod's in Lincoln Park is the locals' pick and usually has the longest wait; go at 4pm." },
      { id: "architecture-cruise", name: "Chicago Architecture River Cruise", cost: 52, durationHours: 1.5, tags: ["iconic", "culture", "outdoor"], description: "Docent-led boat tour through the Chicago River explaining 50+ landmark buildings. Widely considered the #1 activity in Chicago. Book with the Chicago Architecture Center for the best guides. Pro tip: the first and last departures of the day are less crowded and have the best light.", recommended: true },
      { id: "lincoln-park-zoo", name: "Lincoln Park Zoo + Nature Boardwalk", cost: 0, durationHours: 2.5, tags: ["family", "outdoor", "free"], description: "One of the last free zoos in the country, in a beautiful lakefront park. The Nature Boardwalk behind the zoo has a stunning skyline view. Great for families or a casual morning walk. Pro tip: visit the farm-in-the-zoo section and walk the adjacent North Pond trail." },
    ],
  }),

  bundle({
    key: "new-orleans",
    name: "New Orleans, LA",
    airportCode: "MSY",
    region: "domestic-us",
    neighborhoods: [
      { name: "French Quarter", vibe: "wrought-iron balconies, jazz, and history", mealTip: "Beignets at Cafe Du Monde or po'boy at Parkway Bakery" },
      { name: "Garden District", vibe: "antebellum mansions and oak-lined streets", mealTip: "Commander's Palace for a jazz brunch (25-cent martinis at lunch)" },
      { name: "Marigny/Bywater", vibe: "colorful shotgun houses and live music", mealTip: "Bacchanal Wine for backyard jazz and cheese plates" },
      { name: "Warehouse District", vibe: "art galleries and upscale dining", mealTip: "Cochon for Cajun or Emeril's for a classic splurge" },
      { name: "Treme", vibe: "oldest African-American neighborhood in the US", mealTip: "Dooky Chase's for Creole soul food" },
      { name: "Magazine Street", vibe: "6 miles of shops, cafes, and galleries", mealTip: "Dat Dog for gourmet sausages or brunch at Surrey's" },
    ],
    tips: [
      "You can drink alcohol openly on the street (go cups are a thing) — pace yourself",
      "Streetcars are the best way to get around — $1.25 per ride or $3 for a Jazzy Pass day pass",
      "Tipping 18-20% is standard; many service workers depend on tips as primary income",
      "Summers are brutally hot and humid — spring (March-May) and fall (Oct-Nov) are ideal",
      "Skip Bourbon Street tourist traps for food — eat one block off the main strip",
      "Second lines (neighborhood parades) happen most Sundays — ask locals or check WWOZ listings",
    ],
    airportTransfer: {
      taxi: [36, 46],
      transit: [2, 3],
    },
    activities: [
      { id: "french-quarter", name: "French Quarter walking tour", cost: 0, durationHours: 3, tags: ["iconic", "culture", "outdoor", "free"], description: "Self-guided walk through the Vieux Carre — Jackson Square, St. Louis Cathedral, Pirates Alley, and the wrought-iron balconies of Royal Street. Free tip-based walking tours depart from Jackson Square. Pro tip: go early morning for empty streets and golden light, or after dark for the full atmosphere.", recommended: true },
      { id: "bourbon-street", name: "Bourbon Street evening + live music bars", cost: 40, durationHours: 3, tags: ["nightlife", "iconic"], description: "Love it or hate it, one evening on Bourbon is a must. The first two blocks are the wildest; deeper blocks get more local. Lafitte's Blacksmith Shop (oldest bar in America) is at the quieter end. Pro tip: grab a Hand Grenade or Hurricane to-go and walk — you don't need to sit at the overpriced bars.", recommended: true },
      { id: "cafe-du-monde", name: "Cafe Du Monde beignets + chicory coffee", cost: 10, durationHours: 1, tags: ["iconic", "foodie"], description: "Cash only, open 24 hours, powdered sugar everywhere. The beignets are simple, cheap, and iconic. Go at midnight to avoid lines, or accept the 20-minute wait during the day. Pro tip: order cafe au lait (half chicory coffee, half hot milk) — it's the perfect pairing.", recommended: true },
      { id: "garden-district", name: "Garden District + Lafayette Cemetery walk", cost: 0, durationHours: 2.5, tags: ["culture", "outdoor", "free"], description: "Take the St. Charles streetcar to the Garden District for a self-guided walk past antebellum mansions. Lafayette Cemetery No. 1 is the most atmospheric above-ground cemetery. Pro tip: Commander's Palace across the street offers 25-cent martinis at lunch — book ahead.", recommended: true },
      { id: "wwii-museum", name: "National WWII Museum", cost: 32, durationHours: 4, tags: ["iconic", "culture"], description: "Consistently rated one of the best museums in the country. The Beyond All Boundaries 4D film narrated by Tom Hanks is worth the extra $7. Plan at least half a day. Pro tip: buy the all-access pass to include the submarine and all exhibits.", recommended: true },
      { id: "jazz-clubs", name: "Live jazz on Frenchmen Street", cost: 20, durationHours: 3, tags: ["nightlife", "culture", "iconic"], description: "Frenchmen Street is where locals go for live music — no cover at many clubs. The Spotted Cat, d.b.a., and The Maison are the essentials. Music starts around 10pm. Pro tip: bar hop — most clubs have no cover, so you can catch 3-4 acts in one night." },
      { id: "frenchmen-street", name: "Frenchmen Street art market + dinner", cost: 45, durationHours: 2.5, tags: ["culture", "foodie", "nightlife"], description: "Weekend night market with local art, then dinner at one of the Marigny/Bywater gems — Three Muses for small plates with live music, or Bacchanal Wine for the backyard courtyard experience." },
      { id: "swamp-tour", name: "Bayou swamp tour (boat or kayak)", cost: 65, durationHours: 4, tags: ["adventure", "outdoor"], description: "Guided boat or kayak tour through the bayou — alligators, herons, cypress trees draped in Spanish moss. Tours depart from Lafitte or Slidell, 30-45 min outside the city. Pro tip: the smaller kayak tours (Kayak-iti-Yat) are more immersive than the big airboats." },
    ],
  }),

  bundle({
    key: "nashville",
    name: "Nashville, TN",
    airportCode: "BNA",
    region: "domestic-us",
    neighborhoods: [
      { name: "Broadway/Downtown", vibe: "honky-tonks and neon lights", mealTip: "Hot chicken at Hattie B's or Prince's, then a honky-tonk crawl" },
      { name: "East Nashville", vibe: "hipster cafes and craft cocktails", mealTip: "Brunch at Barista Parlor or dinner at Butcher & Bee" },
      { name: "12 South", vibe: "boutique shopping and murals", mealTip: "Burger at Pharmacy or tacos at Mas Tacos Por Favor" },
      { name: "The Gulch", vibe: "upscale dining and urban lofts", mealTip: "Biscuits at Biscuit Love or cocktails at L.A. Jackson rooftop" },
      { name: "Germantown", vibe: "historic brick buildings and restaurants", mealTip: "Dinner at Rolf and Daughters or brunch at Henrietta Red" },
      { name: "Music Row", vibe: "recording studios and music history", mealTip: "Grab coffee at Frothy Monkey between studio tours" },
    ],
    tips: [
      "Broadway honky-tonks are free to enter — the music is live and there's no cover charge",
      "Uber/Lyft is the easiest way around — downtown is walkable but neighborhoods are spread out",
      "Hot chicken ranges from 'mild' to 'shut the cluck up' — start at medium unless you're experienced",
      "Bachelorette parties are everywhere on Broadway on weekends — go weeknights for a calmer scene",
      "The Nashville MTA bus costs $2 and covers most areas, but service is limited",
      "Tipping 18-20% is standard; Nashville's service industry workers are famously friendly",
    ],
    airportTransfer: {
      taxi: [25, 40],
      transit: [2, 4],
    },
    activities: [
      { id: "broadway-honkytonks", name: "Broadway honky-tonk crawl", cost: 30, durationHours: 3, tags: ["iconic", "nightlife"], description: "Lower Broadway is wall-to-wall live music bars — Tootsie's, Robert's Western World, and The Stage are the classics. No cover charge; drinks are ~$8. The music is live all day starting at 10am. Pro tip: Robert's Western World is the most authentic; order a Recession Special (fried bologna sandwich + PBR + MoonPie for $6).", recommended: true },
      { id: "grand-ole-opry", name: "Grand Ole Opry show", cost: 70, durationHours: 2.5, tags: ["iconic", "culture"], description: "The longest-running radio show in history — live country music in a legendary 4,400-seat venue. Shows are Tuesday, Friday, and Saturday nights. Pro tip: the post-show backstage tour ($35 extra) lets you stand in the circle where legends performed. Book 1-2 weeks ahead for good seats.", recommended: true },
      { id: "country-music-hof", name: "Country Music Hall of Fame", cost: 28, durationHours: 3, tags: ["iconic", "culture"], description: "Massive museum with Elvis's gold Cadillac, Taylor Swift's handwritten lyrics, and Johnny Cash's black suits. Combo tickets with RCA Studio B tour ($45) are worth it. Pro tip: the Studio B bus tour takes you to the actual recording room where Dolly, Elvis, and Roy Orbison recorded.", recommended: true },
      { id: "parthenon", name: "The Parthenon in Centennial Park", cost: 10, durationHours: 1.5, tags: ["culture", "outdoor"], description: "Full-scale replica of the Greek Parthenon with a 42-foot Athena statue inside. Nashville earned the nickname 'Athens of the South' for its universities. The surrounding Centennial Park is a lovely green space. Pro tip: free to walk around outside; $10 to go inside and see the Athena.", recommended: true },
      { id: "hot-chicken-crawl", name: "Nashville hot chicken crawl", cost: 40, durationHours: 2.5, tags: ["foodie"], description: "Hit the three essential hot chicken spots: Prince's Hot Chicken (the original, since 1945), Hattie B's (the popular tourist pick), and Bolton's Spicy Chicken & Fish (the local's favorite). Order 'medium' at Prince's — their 'hot' is legitimately painful. Pro tip: Prince's line can be 45+ minutes; go at 2pm to avoid the rush.", recommended: true },
      { id: "ryman-auditorium", name: "Ryman Auditorium tour or show", cost: 35, durationHours: 2, tags: ["iconic", "culture"], description: "The 'Mother Church of Country Music' — originally a church built in 1892, it hosted the Grand Ole Opry for 31 years. Self-guided tour is $35; catching a show here is a bucket-list experience. Pro tip: the pew seats are original wooden church pews — no padding. Bring a cushion for longer shows." },
      { id: "printers-alley", name: "Printers Alley + speakeasy bars", cost: 35, durationHours: 2.5, tags: ["nightlife", "culture"], description: "Historic alley that was Nashville's printing district, then its nightlife center during Prohibition. Today it's home to speakeasy-style bars and smaller music venues. Skull's Rainbow Room has burlesque and live jazz. Pro tip: it's quieter and more intimate than Broadway — perfect for a second night out." },
      { id: "centennial-park", name: "Centennial Park + Cheekwood Estate", cost: 22, durationHours: 3, tags: ["outdoor", "culture"], description: "Centennial Park is free and home to the Parthenon replica. For a deeper nature experience, drive 15 minutes to Cheekwood Estate ($22) — 55 acres of botanical gardens and an art museum in a 1930s mansion. Pro tip: Cheekwood's seasonal exhibits (Chihuly glass, holiday lights) are spectacular." },
    ],
  }),

  bundle({
    key: "austin",
    name: "Austin, TX",
    airportCode: "AUS",
    region: "domestic-us",
    neighborhoods: [
      { name: "South Congress (SoCo)", vibe: "eclectic shops, food trucks, and murals", mealTip: "Tacos at Torchy's or food truck breakfast at Elizabeth Street Cafe" },
      { name: "Rainey Street", vibe: "converted bungalow bars and food trucks", mealTip: "Drinks at Banger's beer garden or craft cocktails at Emmer & Rye" },
      { name: "East Austin", vibe: "gallery-hopping and craft breweries", mealTip: "BBQ at la Barbecue or tacos at Valentina's Tex Mex" },
      { name: "6th Street", vibe: "live music bars and nightlife", mealTip: "Skip the food here — eat elsewhere and come for the music" },
      { name: "South Lamar", vibe: "local restaurants and Alamo Drafthouse cinema", mealTip: "Ramen at Tatsu-ya or burgers at P. Terry's" },
      { name: "Downtown/2nd Street", vibe: "hotels, restaurants, and the convention center", mealTip: "Lunch at Odd Duck or brunch at Lamberts" },
    ],
    tips: [
      "Austin's motto is 'Keep Austin Weird' — embrace the eccentricity",
      "Summers are extremely hot (100F+) — plan outdoor activities for early morning or after 5pm",
      "The live music scene is real — check Do512.com for nightly free shows",
      "Uber/Lyft is the main way around; public transit is limited",
      "Breakfast tacos are a way of life — every local has a favorite spot",
      "SXSW (March) and ACL Fest (October) fill the city to capacity — book months ahead or avoid",
    ],
    airportTransfer: {
      taxi: [20, 35],
      transit: [2, 4],
    },
    activities: [
      { id: "south-congress", name: "South Congress Avenue stroll + shopping", cost: 15, durationHours: 2.5, tags: ["iconic", "culture", "outdoor"], description: "Austin's most walkable strip — vintage shops, the 'I love you so much' mural, Allen's Boots, and great people-watching. Jo's Coffee has the famous mural. Pro tip: start at the south end and walk north toward the Capitol, stopping at food trucks along the way.", recommended: true },
      { id: "barton-springs", name: "Barton Springs Pool", cost: 5, durationHours: 3, tags: ["outdoor", "iconic"], description: "Natural spring-fed pool in Zilker Park — water stays 68-70F year-round. A true Austin institution. $5 admission for adults; free before 8am and after 9pm. Pro tip: the south (free) side is actually more local and less crowded than the main pool entrance.", recommended: true },
      { id: "sixth-street-music", name: "Live music crawl on 6th Street", cost: 25, durationHours: 3, tags: ["nightlife", "iconic", "culture"], description: "Austin is the 'Live Music Capital of the World' — 6th Street has dozens of venues with free live music nightly. Dirty 6th (east of Congress) is the rowdy college strip; West 6th is more upscale. Pro tip: skip Dirty 6th and head to Red River Cultural District (Mohawk, Stubb's, Cheer Up Charlies) for the best indie music.", recommended: true },
      { id: "lady-bird-lake", name: "Lady Bird Lake kayaking or paddleboarding", cost: 20, durationHours: 2, tags: ["outdoor", "adventure"], description: "Rent a kayak or SUP on Lady Bird Lake right in the center of the city. No motorized boats allowed, so it's peaceful. Texas Rowing Center and The Rowing Dock rent by the hour. Pro tip: sunset paddle is magic — the skyline lights up and you'll see the bats fly out from the Congress Bridge.", recommended: true },
      { id: "texas-capitol", name: "Texas State Capitol tour", cost: 0, durationHours: 1.5, tags: ["iconic", "culture", "free"], description: "Free guided tours of the Capitol building — it's actually taller than the US Capitol in DC. Beautiful pink granite exterior and impressive rotunda. Pro tip: the underground extension is a fascinating modern addition, and the grounds have great city views." },
      { id: "bbq-trail", name: "Austin BBQ trail", cost: 65, durationHours: 3, tags: ["foodie", "iconic"], description: "Austin's BBQ is world-famous. Franklin Barbecue is the legendary 3-hour wait; la Barbecue is nearly as good with a shorter line. Micklethwait or Interstellar BBQ are excellent no-wait alternatives. Pro tip: arrive at Franklin by 8am for 11am opening, or order online the day before for pickup.", recommended: true },
      { id: "zilker-park", name: "Zilker Park + Botanical Garden", cost: 12, durationHours: 2.5, tags: ["outdoor", "family"], description: "350-acre park with Barton Springs, the botanical garden ($12), hiking trails, and the Zilker Zephyr miniature train. The park is the heart of Austin's outdoor culture. Pro tip: the Barton Creek Greenbelt trail starts nearby and leads to swimming holes — Sculpture Falls is the best." },
      { id: "congress-bridge-bats", name: "Congress Bridge bat colony at sunset", cost: 0, durationHours: 1, tags: ["outdoor", "iconic", "free"], description: "1.5 million Mexican free-tailed bats emerge from under the Congress Avenue Bridge at sunset (March-October). It's one of the largest urban bat colonies in North America. Watch from the bridge itself or from a kayak on Lady Bird Lake below. Pro tip: arrive 30 minutes before sunset for a good spot; peak season is August.", recommended: false },
    ],
  }),

  bundle({
    key: "seattle",
    name: "Seattle, WA",
    airportCode: "SEA",
    region: "domestic-us",
    neighborhoods: [
      { name: "Capitol Hill", vibe: "LGBTQ+ friendly, coffee shops, and nightlife", mealTip: "Brunch at Skillet Diner or cocktails at Canon" },
      { name: "Fremont", vibe: "quirky 'Republic of Fremont' with public art", mealTip: "Dinner at Manolin or drinks at Fremont Brewing" },
      { name: "Ballard", vibe: "craft breweries and Scandinavian roots", mealTip: "Seafood at The Walrus and the Carpenter or brunch at Stoneburner" },
      { name: "Pioneer Square", vibe: "historic brick buildings and galleries", mealTip: "First Thursday art walks and lunch at Salumi" },
      { name: "Queen Anne", vibe: "residential with the best city viewpoints", mealTip: "Dinner at How to Cook a Wolf or Thai at Kin Dee" },
      { name: "International District", vibe: "Chinatown-International District markets", mealTip: "Dim sum at Jade Garden or pho at Tamarind Tree" },
    ],
    tips: [
      "Seattle rain is mostly drizzle — locals don't carry umbrellas, but a waterproof jacket is essential",
      "The ORCA card works on buses, light rail, ferries, and streetcar",
      "Coffee culture is serious — skip Starbucks Reserve and try Elm, Victrola, or Storyville",
      "The best weather is July-September; the rest of the year is overcast and mild",
      "Ride the light rail from the airport to downtown for $3 — skip the taxi",
      "Recreational cannabis is legal; dispensaries are regulated and ID'd strictly",
    ],
    airportTransfer: {
      taxi: [40, 55],
      transit: [3, 5],
    },
    activities: [
      { id: "pike-place", name: "Pike Place Market", cost: 20, durationHours: 3, tags: ["iconic", "foodie", "culture"], description: "America's oldest continuously running farmers' market — the fish throwers, the original Starbucks, Rachel the Pig, and dozens of artisan stalls. Arrive before 10am to beat crowds. Pro tip: skip the first Starbucks line and explore the lower floors (DownUnder shops) — most tourists miss them entirely.", recommended: true },
      { id: "space-needle", name: "Space Needle observation deck", cost: 40, durationHours: 1.5, tags: ["iconic"], description: "The 605-foot icon of Seattle with a rotating glass floor at the top. Best on a clear day with Mt. Rainier visible. Pro tip: the rotating glass benches on the lower observation deck are a more relaxing experience. Consider a sunset visit for both day and night views.", recommended: true },
      { id: "chihuly", name: "Chihuly Garden and Glass", cost: 36, durationHours: 2, tags: ["iconic", "culture"], description: "Stunning blown-glass art installations by Dale Chihuly, right next to the Space Needle. The outdoor garden with glass sculptures against the sky is the highlight. Combo ticket with Space Needle saves $10. Pro tip: visit at dusk when the garden is illuminated.", recommended: true },
      { id: "mopop", name: "Museum of Pop Culture (MoPOP)", cost: 38, durationHours: 3, tags: ["culture", "family"], description: "Frank Gehry-designed building housing exhibits on music, sci-fi, fantasy, and gaming. The Sound Lab lets you play real instruments in soundproof rooms. The Nirvana and Jimi Hendrix exhibits are highlights. Pro tip: the Guitar Gallery with its 700-instrument tower is the must-see room." },
      { id: "pioneer-square", name: "Pioneer Square + Underground Tour", cost: 25, durationHours: 2.5, tags: ["culture"], description: "Seattle's original neighborhood — red brick, iron pergola, and the famous Underground Tour ($25) through the buried streets from the 1889 fire rebuild. Tours are funny and fascinating. Pro tip: Bill Speidel's is the original tour; Beneath the Streets is smaller and more intimate.", recommended: true },
      { id: "kerry-park", name: "Kerry Park viewpoint at sunset", cost: 0, durationHours: 1, tags: ["outdoor", "iconic", "free"], description: "The postcard view of Seattle — Space Needle, downtown skyline, and Mt. Rainier in one frame. Small park on Queen Anne hill, free to visit anytime. Pro tip: come at sunset on a clear day; if Rainier is out, it's the best view in the Pacific Northwest." },
      { id: "fremont-troll", name: "Fremont Troll + quirky Fremont walk", cost: 0, durationHours: 1.5, tags: ["culture", "outdoor", "free"], description: "The 18-foot concrete troll clutching a VW Beetle under a bridge is peak Seattle weird. Walk the self-proclaimed 'Center of the Universe' in Fremont — find the Lenin statue, the rocket ship, and the Fremont Brewing taproom. Pro tip: combine with a walk along the Burke-Gilman Trail." },
      { id: "bainbridge-ferry", name: "Bainbridge Island ferry day trip", cost: 18, durationHours: 4, tags: ["outdoor", "iconic"], description: "35-minute ferry from downtown Seattle to Bainbridge Island — the ride itself has spectacular skyline views. Walk Winslow's main street for wine tasting, bookshops, and lunch. Pro tip: the ferry is $9.45 roundtrip (car is extra); stand on the upper deck for the best views on the way over and back." },
    ],
  }),

  bundle({
    key: "denver",
    name: "Denver, CO",
    airportCode: "DEN",
    region: "domestic-us",
    activities: [
      { id: "red-rocks", name: "Red Rocks Amphitheatre", cost: 20, durationHours: 3, tags: ["iconic", "outdoor"], description: "Iconic open-air amphitheater set among 300-million-year-old sandstone formations. Free to visit during the day ($0 to walk around, $20 for a concert); catching a show here is a bucket-list experience. Pro tip: even without a concert, the Trading Post trail loop and the venue's natural acoustics are worth the 30-minute drive from downtown.", recommended: true },
      { id: "rocky-mountain-day", name: "Rocky Mountain National Park day trip", cost: 30, durationHours: 8, tags: ["outdoor", "adventure", "iconic"], description: "1.5-hour drive to one of America's most visited national parks. Trail Ridge Road reaches 12,183 feet — the highest continuous paved road in the US. Elk, alpine lakes, and 60+ peaks over 12,000 feet. $30 per vehicle entry. Pro tip: buy a timed entry reservation in advance (required May-October); arrive early to avoid afternoon thunderstorms.", recommended: true },
      { id: "larimer-square", name: "Larimer Square + LoDo evening", cost: 40, durationHours: 2.5, tags: ["nightlife", "foodie", "culture"], description: "Denver's oldest block — gas-lit Victorian buildings with cocktail bars and restaurants. Rioja for Mediterranean, The Capital Grille for steak, or TAG for creative small plates. Pro tip: walk to nearby Union Station after dinner for a cocktail at the Terminal Bar in the gorgeous renovated train station.", recommended: true },
      { id: "denver-art-museum", name: "Denver Art Museum", cost: 22, durationHours: 2.5, tags: ["culture"], description: "Distinctive Daniel Libeskind-designed building with strong Western American and Indigenous collections. Free for Colorado residents on the first Saturday of each month. Pro tip: the rooftop deck has great mountain views, and the Native Arts collection is one of the best in the country.", recommended: true },
      { id: "union-station", name: "Union Station + craft cocktails", cost: 35, durationHours: 2, tags: ["foodie", "culture"], description: "Beautifully renovated 1914 Beaux-Arts train station now housing restaurants, bars, and a boutique hotel. Terminal Bar in the main hall is perfect for a drink. Mercantile Dining is excellent for dinner. Pro tip: the basement has Cooper Lounge, a swanky speakeasy with leather chairs and barrel-aged cocktails." },
      { id: "16th-street-mall", name: "16th Street Mall + Capitol Building", cost: 0, durationHours: 2, tags: ["outdoor", "free"], description: "Free MallRide shuttle runs the 1.2-mile pedestrian mall. The Colorado State Capitol at the south end sits exactly one mile above sea level — stand on the 15th step for the marker. Pro tip: the Capitol dome tour (free) offers panoramic views of the Front Range from the observation deck." },
      { id: "coors-field", name: "Coors Field Rockies game", cost: 25, durationHours: 3.5, tags: ["outdoor", "iconic"], description: "Catch a Rockies game at the gorgeous Coors Field with mountain views from the upper deck. Rockpile seats are $6 on game day. The rooftop bar has craft beer and the best stadium views. Pro tip: the Purple Row (row 20 in the upper deck) marks exactly one mile above sea level — take a photo.", recommended: true },
      { id: "rino-art", name: "RiNo Art District + brewery crawl", cost: 30, durationHours: 3, tags: ["culture", "foodie"], description: "River North (RiNo) is Denver's creative hub — massive murals, galleries, and a dozen craft breweries within walking distance. Ratio Beerworks, Great Divide, and Our Mutual Friend are standouts. Pro tip: the First Friday art walk (monthly) has gallery openings, food trucks, and live music." },
    ],
  }),

  bundle({
    key: "boston",
    name: "Boston, MA",
    airportCode: "BOS",
    region: "domestic-us",
    activities: [
      { id: "freedom-trail", name: "Freedom Trail walking tour", cost: 0, durationHours: 3, tags: ["iconic", "culture", "outdoor", "free"], description: "2.5-mile red-brick-line walk through 16 historic sites — Paul Revere's House, Old North Church, Faneuil Hall, and the Bunker Hill Monument. Free to walk; guided tours available for $14. Pro tip: start at Boston Common and walk north to end at the waterfront for a seafood lunch.", recommended: true },
      { id: "fenway-park", name: "Fenway Park game or tour", cost: 45, durationHours: 3, tags: ["iconic", "outdoor"], description: "America's oldest ballpark (1912) — the Green Monster, Pesky's Pole, and the manual scoreboard are baseball history. Standing room tickets start at $20. Pro tip: the ballpark tour ($25) runs on non-game days and gets you onto the Green Monster and inside the press box.", recommended: true },
      { id: "boston-common", name: "Boston Common + Public Garden swan boats", cost: 5, durationHours: 2, tags: ["outdoor", "family", "iconic"], description: "America's oldest public park (1634) and the adjacent Public Garden with the swan boat rides ($5, April-September). The Make Way for Ducklings bronze statues are a beloved photo op. Pro tip: in winter, the Frog Pond becomes a public ice rink.", recommended: true },
      { id: "north-end", name: "North End Italian feast + pastry walk", cost: 40, durationHours: 2.5, tags: ["foodie", "culture"], description: "Boston's Little Italy — narrow streets packed with authentic Italian restaurants and bakeries. Get a cannoli at Mike's Pastry or Modern Pastry (locals prefer Modern). Dinner at Giacomo's (cash only, always a line) or Neptune Oyster for lobster rolls. Pro tip: the rivalry between Mike's and Modern is fierce — try both and pick a side.", recommended: true },
      { id: "harvard-mit", name: "Harvard + MIT campus walk", cost: 0, durationHours: 3, tags: ["culture", "outdoor", "free"], description: "Take the Red Line to Harvard Square for the campus, Harvard Yard, and bookshops. Then walk or ride one stop to MIT to see the Stata Center (Gehry), the Infinite Corridor, and the Great Dome. Free student-led tours at both. Pro tip: rub the foot of the John Harvard statue for good luck (every tourist does).", recommended: true },
      { id: "aquarium", name: "New England Aquarium", cost: 34, durationHours: 2.5, tags: ["family", "iconic"], description: "Giant Ocean Tank with sea turtles, sharks, and a four-story coral reef. The penguin colony at the entrance is a hit with kids. IMAX theater is $5 extra. Pro tip: buy timed tickets online to skip the line; whale watch boat tours depart from the same dock (seasonal, $65 extra)." },
      { id: "faneuil-hall", name: "Faneuil Hall + Quincy Market lunch", cost: 20, durationHours: 1.5, tags: ["iconic", "foodie"], description: "Historic meeting hall + Quincy Market food hall with lobster rolls, clam chowder, and cannoli. Touristy but the food hall is a genuine Boston institution. Pro tip: skip the sit-down restaurants and eat at the market counters for better value and speed." },
      { id: "beacon-hill", name: "Beacon Hill walk + Charles Street shopping", cost: 0, durationHours: 2, tags: ["outdoor", "culture", "free"], description: "Gas-lit cobblestone streets, brick row houses, and the most photographed street in Boston — Acorn Street. Walk Charles Street for antique shops and cafes. Pro tip: visit in autumn when the trees turn or December when the gas lamps and holiday decorations make it magical." },
    ],
  }),

  bundle({
    key: "washington-dc",
    name: "Washington, DC",
    airportCode: "DCA",
    region: "domestic-us",
    activities: [
      { id: "national-mall", name: "National Mall walk (monuments loop)", cost: 0, durationHours: 4, tags: ["iconic", "outdoor", "free"], description: "Walk the 2-mile stretch from the Capitol to the Lincoln Memorial, passing the Washington Monument, WWII Memorial, Reflecting Pool, and MLK Memorial. All free, all open 24/7. Pro tip: do the walk at sunrise or sunset for the best light and smallest crowds — the Lincoln Memorial at dawn is transcendent.", recommended: true },
      { id: "smithsonian", name: "Smithsonian Museums (free!)", cost: 0, durationHours: 4, tags: ["iconic", "culture", "family", "free"], description: "All 21 Smithsonian museums are free — Air & Space, Natural History, and African American History & Culture are the most popular. You could spend a full day in any one of them. Pro tip: the National Museum of African American History & Culture requires timed passes — book online as soon as they're released (they go fast).", recommended: true },
      { id: "lincoln-memorial", name: "Lincoln Memorial + Reflecting Pool at night", cost: 0, durationHours: 1.5, tags: ["iconic", "free"], description: "The Lincoln Memorial is powerful at any hour, but at night with the Reflecting Pool and Washington Monument lit up, it's unforgettable. The National Park Service runs free ranger-led moonlight tours in summer. Pro tip: stand on the spot where MLK gave the 'I Have a Dream' speech — it's marked on the steps.", recommended: true },
      { id: "capitol-building", name: "US Capitol Building guided tour", cost: 0, durationHours: 2, tags: ["iconic", "culture", "free"], description: "Free guided tour through the Capitol Rotunda, National Statuary Hall, and the Crypt. Book online at visitthecapitol.gov. Pro tip: if you contact your congressperson's office in advance, you can get passes to watch the House or Senate in session — a truly unique experience.", recommended: true },
      { id: "georgetown", name: "Georgetown waterfront + M Street shopping", cost: 25, durationHours: 3, tags: ["outdoor", "foodie", "culture"], description: "Historic neighborhood with Federal-style row houses, boutique shopping on M Street, and the waterfront park along the Potomac. Georgetown Cupcake always has a line (worth it). Pro tip: walk the C&O Canal towpath for a shady, quiet break from the crowds, or rent a kayak on the Potomac." },
      { id: "arlington", name: "Arlington National Cemetery", cost: 0, durationHours: 2.5, tags: ["iconic", "culture", "free"], description: "639 acres and 400,000+ graves including JFK's eternal flame and the Tomb of the Unknown Soldier. The changing of the guard ceremony happens every hour (every 30 min in summer). Pro tip: the cemetery is hilly and large — wear comfortable shoes and bring water. The ANC Explorer app helps navigate.", recommended: true },
      { id: "library-congress", name: "Library of Congress guided tour", cost: 0, durationHours: 1.5, tags: ["culture", "free"], description: "The world's largest library — the Main Reading Room is one of the most beautiful rooms in America. Free guided tours run every hour. The Gutenberg Bible is on permanent display. Pro tip: peek into the Main Reading Room from the visitors' gallery — researchers are working below in real time." },
      { id: "tidal-basin", name: "Tidal Basin walk + Jefferson/FDR Memorials", cost: 0, durationHours: 2, tags: ["outdoor", "iconic", "free"], description: "2-mile loop around the Tidal Basin passing the Jefferson Memorial, FDR Memorial, and MLK Memorial. Spectacular during cherry blossom season (late March-early April). Pro tip: rent a paddleboat ($30/hr for 2-person, $40 for 4-person) for a unique perspective of the monuments from the water." },
    ],
  }),

  bundle({
    key: "honolulu",
    name: "Honolulu, HI",
    airportCode: "HNL",
    region: "domestic-us",
    activities: [
      { id: "waikiki-beach", name: "Waikiki Beach + surfing lesson", cost: 45, durationHours: 3, tags: ["iconic", "outdoor", "adventure"], description: "The world-famous crescent beach in the shadow of Diamond Head. Gentle waves make it perfect for beginner surfing lessons ($45-80 for a group lesson). Board rentals are $20/hr. Pro tip: walk to the quieter east end near the Waikiki Wall for calmer water and fewer crowds.", recommended: true },
      { id: "diamond-head", name: "Diamond Head summit hike", cost: 5, durationHours: 2, tags: ["iconic", "outdoor", "adventure"], description: "Short but steep 1.6-mile roundtrip hike up the volcanic crater with panoramic views of Waikiki and the Pacific. $5 per person entry, plus $10 parking. Pro tip: go at sunrise (opens at 6am) to beat the heat and crowds — the crater floor gets brutally hot by 10am. Bring water and sunscreen.", recommended: true },
      { id: "pearl-harbor", name: "Pearl Harbor National Memorial + USS Arizona", cost: 0, durationHours: 4, tags: ["iconic", "culture", "free"], description: "Free timed tickets to the USS Arizona Memorial include a documentary film and boat ride to the sunken battleship. Reserve online 60 days ahead — walk-up tickets go fast. The Battleship Missouri ($35) and USS Bowfin Submarine ($21) are separately ticketed. Pro tip: arrive by 7am for walk-up tickets if you don't have a reservation.", recommended: true },
      { id: "north-shore", name: "North Shore drive + Haleiwa town", cost: 30, durationHours: 6, tags: ["outdoor", "iconic", "adventure"], description: "Drive the scenic route to the North Shore for legendary surf beaches (Sunset Beach, Pipeline, Waimea Bay). Stop in Haleiwa for shrimp trucks (Giovanni's is the famous one; Romy's is better). Pro tip: winter (Nov-Feb) has the big waves for watching; summer has calm water for swimming. Don't swim at Pipeline — ever.", recommended: true },
      { id: "hanauma-bay", name: "Hanauma Bay snorkeling", cost: 25, durationHours: 4, tags: ["outdoor", "adventure"], description: "Protected marine preserve with crystal-clear water and abundant fish. $25 entry + mandatory 9-minute conservation video. Online reservations required — book 2 days ahead. Closed Mondays and Tuesdays. Pro tip: bring your own snorkel gear to save $20 on rentals, and go early before the water gets churned up.", recommended: true },
      { id: "iolani-palace", name: "Iolani Palace guided tour", cost: 27, durationHours: 1.5, tags: ["culture", "iconic"], description: "The only royal palace on US soil — home to Hawaii's last reigning monarchs. Guided docent tours ($27) or self-guided audio tours ($20) tell the fascinating and tragic story of the Hawaiian monarchy. Pro tip: the guided tour is significantly better — the docents are passionate and knowledgeable." },
      { id: "chinatown-hnl", name: "Chinatown food + art walk", cost: 20, durationHours: 2, tags: ["foodie", "culture"], description: "Honolulu's Chinatown is a gritty, authentic mix of dim sum shops, lei stands, art galleries, and Vietnamese pho houses. The Oahu Market has fresh poke for $12/lb. Pro tip: First Friday art walks (monthly) transform the neighborhood with gallery openings, food trucks, and live music." },
      { id: "lanikai-beach", name: "Lanikai Beach + Kailua Beach day", cost: 0, durationHours: 5, tags: ["outdoor", "free"], description: "Lanikai consistently ranks as one of the world's most beautiful beaches — powder-white sand, turquoise water, and the Mokulua Islands offshore. No facilities (no restrooms/showers), so base at nearby Kailua Beach Park. Pro tip: the Lanikai Pillbox hike (30 min up) gives you the aerial view you've seen on Instagram." },
    ],
  }),

  bundle({
    key: "portland",
    name: "Portland, OR",
    airportCode: "PDX",
    region: "domestic-us",
    activities: [
      { id: "powells-books", name: "Powell's City of Books", cost: 0, durationHours: 2, tags: ["iconic", "culture", "free"], description: "The world's largest independent bookstore — an entire city block of new and used books across 9 color-coded rooms. Grab a free map at the entrance. Pro tip: the Rare Book Room on the top floor has first editions and signed copies; the Pearl Room has the best staff picks.", recommended: true },
      { id: "food-carts", name: "Food cart pod crawl", cost: 25, durationHours: 2, tags: ["foodie", "iconic"], description: "Portland has 500+ food carts in permanent pods across the city. Cartlandia (SE 82nd) and Hawthorne Asylum are the biggest pods. Try Nong's Khao Man Gai (Thai chicken rice), Viking Soul Food (Norwegian lefse), and Potato Champion (fries). Pro tip: carts are cash-friendly but most take cards now; the pods on Hawthorne and Division are the most walkable.", recommended: true },
      { id: "japanese-garden", name: "Portland Japanese Garden", cost: 22, durationHours: 2, tags: ["outdoor", "culture"], description: "Considered the most authentic Japanese garden outside Japan. 12 acres of meticulously maintained gardens in the West Hills with city and mountain views. Pro tip: visit on a rainy day (this is Portland) — the garden is designed to be beautiful in rain, and it's far less crowded.", recommended: true },
      { id: "forest-park-hike", name: "Forest Park hike (Wildwood Trail)", cost: 0, durationHours: 3, tags: ["outdoor", "adventure", "free"], description: "5,200-acre urban forest — one of the largest in the US. The Wildwood Trail is 30+ miles total; the Lower Macleay to Pittock Mansion section (5 miles roundtrip) is the classic route. Pro tip: start at Lower Macleay Park, pass the Stone House (an old restroom turned photo op), and end at Pittock Mansion for the city view.", recommended: true },
      { id: "pittock-mansion", name: "Pittock Mansion + panoramic view", cost: 14, durationHours: 1.5, tags: ["culture", "outdoor"], description: "1914 French Renaissance mansion with 46 acres of grounds and the best free panoramic view of Portland, Mt. Hood, Mt. St. Helens, and Mt. Adams. The mansion tour is $14; the grounds and viewpoint are free. Pro tip: drive up or hike from Forest Park — the viewpoint is accessible even when the mansion is closed." },
      { id: "pearl-district", name: "Pearl District + First Thursday art walk", cost: 0, durationHours: 2.5, tags: ["culture", "foodie", "free"], description: "Converted warehouse district with galleries, boutiques, and some of Portland's best restaurants. First Thursday (monthly) has gallery openings with free wine. Pro tip: walk from Powell's through the Pearl to the waterfront — it's Portland's most walkable stretch." },
      { id: "multnomah-falls", name: "Multnomah Falls day trip (Columbia River Gorge)", cost: 5, durationHours: 4, tags: ["outdoor", "iconic", "adventure"], description: "Oregon's tallest waterfall (620 feet) in the dramatic Columbia River Gorge, 30 minutes east of Portland. The Benson Bridge viewpoint is a short 0.2-mile walk; the top is a steep 1.2-mile hike. $5 parking reservation required. Pro tip: continue east on the Historic Columbia River Highway for more waterfalls — Latourell, Wahkeena, and Horsetail Falls are all within a few miles.", recommended: true },
      { id: "alberta-street", name: "Alberta Street art + dining", cost: 30, durationHours: 2.5, tags: ["culture", "foodie"], description: "Northeast Portland's creative corridor — murals, vintage shops, galleries, and restaurants. Salt & Straw (handmade ice cream), Bollywood Theater (Indian street food), and Tin Shed Garden Cafe (brunch) are highlights. Pro tip: Last Thursday (monthly, April-September) has a massive street fair with live music, art vendors, and food." },
    ],
  }),

  bundle({
    key: "savannah",
    name: "Savannah, GA",
    airportCode: "SAV",
    region: "domestic-us",
    activities: [
      { id: "forsyth-park", name: "Forsyth Park + fountain", cost: 0, durationHours: 1.5, tags: ["outdoor", "iconic", "free"], description: "Savannah's crown jewel — a 30-acre park with the iconic white fountain, live oaks draped in Spanish moss, and a Saturday farmers' market. Perfect for a morning jog or an afternoon under the trees. Pro tip: grab a coffee from The Collins Quarter on the park's north end and sit by the fountain.", recommended: true },
      { id: "river-street", name: "River Street cobblestone walk + lunch", cost: 25, durationHours: 2, tags: ["iconic", "foodie", "outdoor"], description: "Nine-block cobblestone riverfront with restaurants, candy shops, and river views. The cobblestones are original ballast stones from 18th-century ships. Pro tip: eat at The Pirate's House (one of the oldest buildings in Georgia) or Vic's on the River for elevated Southern food with a view.", recommended: true },
      { id: "bonaventure", name: "Bonaventure Cemetery tour", cost: 0, durationHours: 2, tags: ["culture", "outdoor", "free"], description: "Hauntingly beautiful Victorian cemetery on a bluff above the Wilmington River — massive live oaks, Spanish moss, and elaborate monuments. Made famous by Midnight in the Garden of Good and Evil. Pro tip: the cemetery is free and open daily; Shannon Scott's guided walking tours ($20) are the best way to learn the stories.", recommended: true },
      { id: "cathedral-st-john", name: "Cathedral of St. John the Baptist", cost: 0, durationHours: 1, tags: ["culture", "iconic", "free"], description: "Stunning French Gothic cathedral with some of the most beautiful stained glass windows in the South. Free to enter (donations welcome). Pro tip: attend a Sunday mass for the full experience with the pipe organ; photography is welcome outside of services." },
      { id: "historic-district", name: "Historic District square walk + history tour", cost: 20, durationHours: 3, tags: ["iconic", "culture", "outdoor"], description: "Savannah's 22 original squares are laid out in a walkable grid — each has its own character and history. Take a free tip-based walking tour from a local guide or explore with the Savannah Historic District walking tour app. Pro tip: Chippewa, Monterey, and Madison squares are the most beautiful; Mercer-Williams House on Monterey Square is the Midnight in the Garden house.", recommended: true },
      { id: "leopolds", name: "Leopold's Ice Cream + Jones Street photo", cost: 8, durationHours: 1, tags: ["foodie", "iconic"], description: "Family-owned ice cream shop since 1919 — Tutti Frutti and Savannah Socialite are the signature flavors. The line is always long; it moves fast. Walk one block south to Jones Street, often called the most beautiful street in America. Pro tip: go in late afternoon for a shorter line; the rum bisque flavor is the hidden gem." },
      { id: "tybee-island", name: "Tybee Island beach day trip", cost: 10, durationHours: 5, tags: ["outdoor", "family"], description: "Savannah's beach — 20 minutes east of downtown. Laid-back, low-key, and uncrowded compared to other East Coast beaches. Climb the Tybee Island Lighthouse ($10) for panoramic views. Pro tip: the North Beach (past the lighthouse) is quieter and better for shelling; South Beach has the pier and restaurants.", recommended: true },
      { id: "midnight-garden", name: "Midnight in the Garden of Good and Evil tour", cost: 25, durationHours: 2, tags: ["culture"], description: "Walking tour through the locations from John Berendt's bestselling book — the Mercer-Williams House, Club One (Lady Chablis's stage), and the Bonaventure Cemetery. Multiple tour companies run versions. Pro tip: read or listen to the book before you go — the tour is twice as good when you know the characters." },
    ],
  }),

  bundle({
    key: "charleston",
    name: "Charleston, SC",
    airportCode: "CHS",
    region: "domestic-us",
    activities: [
      { id: "rainbow-row", name: "Rainbow Row + Battery walk", cost: 0, durationHours: 2, tags: ["iconic", "outdoor", "free"], description: "The 13 pastel-painted Georgian row houses on East Bay Street are Charleston's most photographed spot. Walk south to The Battery seawall park for harbor views and antebellum mansions. Pro tip: early morning has the best light for photos and no crowds; the houses face east so they're front-lit at sunrise.", recommended: true },
      { id: "fort-sumter", name: "Fort Sumter National Monument", cost: 30, durationHours: 3, tags: ["iconic", "culture"], description: "Where the Civil War began — the fort is only accessible by ferry from Liberty Square ($30 roundtrip, includes fort entrance). The 30-minute boat ride across Charleston Harbor is scenic. Pro tip: book the first ferry of the day; the fort is small and gets crowded when multiple ferries arrive at once.", recommended: true },
      { id: "king-street", name: "King Street shopping + dining", cost: 40, durationHours: 3, tags: ["foodie", "culture"], description: "Charleston's main commercial strip — Upper King has restaurants and bars, Middle King has fashion, Lower King has antiques. Callie's Hot Little Biscuit, Carmella's (desserts), and any of the James Beard-nominated restaurants are must-stops. Pro tip: walk King Street from south to north in the afternoon, ending at Upper King for dinner.", recommended: true },
      { id: "waterfront-park", name: "Waterfront Park + Pineapple Fountain", cost: 0, durationHours: 1, tags: ["outdoor", "iconic", "free"], description: "Peaceful 8-acre park on the harbor with the iconic Pineapple Fountain, swinging benches, and views of Fort Sumter. The pineapple is a symbol of Southern hospitality. Pro tip: this is the most romantic sunset spot in Charleston — bring a bottle of wine (it's allowed) and sit on the pier swings.", recommended: true },
      { id: "magnolia-plantation", name: "Magnolia Plantation and Gardens", cost: 25, durationHours: 3, tags: ["outdoor", "culture"], description: "The oldest public garden in America (since 1676) — 500 acres of romantic gardens, swamp boardwalks, and a nature center with alligators. The house tour is $8 extra. Pro tip: the Audubon Swamp Garden ($8) is a separate ticket and worth it — it's a boardwalk through a blackwater cypress swamp.", recommended: true },
      { id: "husk-dinner", name: "Husk dinner (Sean Brock's restaurant)", cost: 85, durationHours: 2, tags: ["foodie"], description: "James Beard Award-winning restaurant celebrating Southern ingredients — the menu changes daily based on what's local. The bar upstairs has craft cocktails and a more casual vibe. Pro tip: reservations fill up weeks ahead; try the Husk Bar (walk-in) if the restaurant is full, or check at 5pm for day-of cancellations." },
      { id: "french-quarter-chs", name: "French Quarter walk + Dock Street Theatre", cost: 10, durationHours: 2, tags: ["culture", "outdoor"], description: "Charleston's French Quarter (smaller than New Orleans') has art galleries, the gorgeous Dock Street Theatre (America's first theater, 1736), and the Old Slave Mart Museum ($8). Pro tip: the galleries on Church Street have free openings on First Friday; the Dock Street Theatre offers free self-guided tours during the day." },
      { id: "folly-beach", name: "Folly Beach afternoon", cost: 0, durationHours: 4, tags: ["outdoor", "free"], description: "Charleston's beach — 20 minutes from downtown with a laid-back surfer vibe. The Washout section has the best waves; the Morris Island Lighthouse is accessible at low tide. Center Street has beach bars and restaurants. Pro tip: go at low tide to walk out to the lighthouse; the Folly Beach Pier ($8 entry) is great for dolphin watching." },
    ],
  }),
];
