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
      { id: "eiffel-tower", name: "Eiffel Tower (summit ticket)", cost: 32, durationHours: 2.5, tags: ["iconic", "culture"], description: "Lift to the summit. Book online weeks ahead — walk-ups are 90+ min.", recommended: true },
      { id: "louvre", name: "Louvre Museum", cost: 22, durationHours: 4, tags: ["iconic", "culture"], description: "World's largest museum. Reserve a timed entry slot online and start at the less-mobbed entrance via Carrousel.", recommended: true },
      { id: "musee-orsay", name: "Musée d'Orsay (Impressionists)", cost: 16, durationHours: 2.5, tags: ["culture"], description: "Best Impressionist collection in the world, in a converted Beaux-Arts train station." },
      { id: "seine-walk", name: "Seine riverbank walk + Notre-Dame exterior", cost: 0, durationHours: 2, tags: ["outdoor", "iconic", "free"], description: "Self-guided walk from Île de la Cité past Pont Neuf and the Tuileries.", recommended: true },
      { id: "montmartre", name: "Montmartre + Sacré-Cœur", cost: 0, durationHours: 3, tags: ["outdoor", "iconic", "culture", "free"], description: "Hilltop neighborhood with the basilica, artist square, and the city's best free skyline view.", recommended: true },
      { id: "marais-food", name: "Le Marais food walk + falafel lunch", cost: 30, durationHours: 2.5, tags: ["foodie", "culture"], description: "Self-guided wander through the historic Jewish quarter — falafel at L'As du Fallafel + bakery stops." },
      { id: "versailles", name: "Day trip to Versailles", cost: 32, durationHours: 6, tags: ["iconic", "outdoor", "culture"], description: "RER C train + palace + gardens. Skip the audio tour — read up before you go." },
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
      { id: "british-museum", name: "British Museum", cost: 0, durationHours: 3, tags: ["iconic", "culture", "free"], description: "Free admission. Rosetta Stone, Parthenon Marbles, Egyptian galleries — book a free timed entry to skip the line.", recommended: true },
      { id: "tower-of-london", name: "Tower of London + Crown Jewels", cost: 38, durationHours: 3, tags: ["iconic", "culture"], description: "Yeoman Warder tour included with ticket — go on the first one of the day." },
      { id: "borough-market", name: "Borough Market food crawl", cost: 35, durationHours: 2, tags: ["foodie"], description: "Britain's best food market. Skip Tuesdays. Try Kappacasein cheese toastie and Bread Ahead doughnuts.", recommended: true },
      { id: "westminster-walk", name: "Westminster + Big Ben walk", cost: 0, durationHours: 2, tags: ["outdoor", "iconic", "free"], description: "Self-guided: Westminster Abbey exterior → Parliament → cross Westminster Bridge for the photo.", recommended: true },
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
      { id: "colosseum", name: "Colosseum + Roman Forum + Palatine Hill (combo)", cost: 24, durationHours: 4, tags: ["iconic", "culture"], description: "One ticket covers all three — book online weeks ahead, do them in one morning.", recommended: true },
      { id: "vatican", name: "Vatican Museums + Sistine Chapel + St. Peter's", cost: 32, durationHours: 4, tags: ["iconic", "culture"], description: "Book the earliest morning slot. The Vatican is huge — pace yourself.", recommended: true },
      { id: "pantheon", name: "Pantheon + Piazza Navona walk", cost: 5, durationHours: 1.5, tags: ["iconic", "culture", "free"], description: "Pantheon entry now ticketed; nearby Piazza Navona is free.", recommended: true },
      { id: "trastevere-dinner", name: "Trastevere dinner + evening wander", cost: 50, durationHours: 3, tags: ["foodie", "nightlife"], description: "Cobblestone neighborhood across the Tiber — best for evening trattorias and bar-hopping.", recommended: true },
      { id: "trevi-spanish", name: "Trevi Fountain + Spanish Steps walk", cost: 0, durationHours: 1.5, tags: ["iconic", "outdoor", "free"], description: "Toss the coin. Go after dark for fewer crowds.", recommended: true },
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
      { id: "sagrada-familia", name: "Sagrada Família (with tower)", cost: 36, durationHours: 2, tags: ["iconic", "culture"], description: "Gaudí's masterpiece. Book the tower add-on; reserve weeks ahead.", recommended: true },
      { id: "park-guell", name: "Park Güell (monumental zone)", cost: 13, durationHours: 2, tags: ["iconic", "outdoor", "culture"], description: "Gaudí's mosaic park on a hilltop. Free to walk in; the iconic terrace is a paid zone with a timed ticket.", recommended: true },
      { id: "casa-batllo", name: "Casa Batlló", cost: 35, durationHours: 1.5, tags: ["iconic", "culture"], description: "The most playful of Gaudí's houses on Passeig de Gràcia." },
      { id: "gothic-quarter", name: "Gothic Quarter walking tour", cost: 0, durationHours: 2.5, tags: ["outdoor", "culture", "free"], description: "Free tip-based walking tour through the medieval old town.", recommended: true },
      { id: "boqueria", name: "La Boqueria market + tapas crawl", cost: 35, durationHours: 2, tags: ["foodie"], description: "Famous market off Las Ramblas. Eat at El Quim de la Boqueria.", recommended: true },
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
      { id: "shibuya-crossing", name: "Shibuya Crossing + Hachiko + Center Gai", cost: 0, durationHours: 2, tags: ["iconic", "outdoor", "free"], description: "Famous scramble crossing — best from Starbucks above or the Shibuya Sky observation deck.", recommended: true },
      { id: "senso-ji", name: "Senso-ji Temple + Asakusa walk", cost: 0, durationHours: 2, tags: ["iconic", "culture", "free"], description: "Tokyo's oldest temple. Go early morning before the crowds arrive.", recommended: true },
      { id: "tsukiji", name: "Tsukiji outer market sushi breakfast", cost: 35, durationHours: 2, tags: ["foodie", "iconic"], description: "Inner fish market moved to Toyosu, but Tsukiji outer market remains for street food." },
      { id: "teamlab", name: "teamLab Borderless or Planets", cost: 38, durationHours: 3, tags: ["iconic", "culture", "family"], description: "Immersive digital art experience. Book timed tickets 2+ weeks ahead.", recommended: true },
      { id: "shinjuku-night", name: "Shinjuku Golden Gai + Omoide Yokocho dinner", cost: 60, durationHours: 3, tags: ["nightlife", "foodie", "iconic"], description: "Tiny postwar bars in Golden Gai, then yakitori under the train tracks at Memory Lane.", recommended: true },
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
];
