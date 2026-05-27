import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const charities = [
  {
    name: "Macmillan Cancer Support",
    description: "Support for people living with cancer",
    registered_number: "261017",
  },
  {
    name: "Marie Curie",
    description: "Care for people living with terminal illness",
    registered_number: "207994",
  },
  {
    name: "Cancer Research UK",
    description: "Research to prevent, diagnose and treat cancer",
    registered_number: "1089464",
  },
  {
    name: "British Heart Foundation",
    description: "Research and support for heart and circulatory diseases",
    registered_number: "225971",
  },
  {
    name: "Age UK",
    description: "Supporting older people to love later life",
    registered_number: "1128267",
  },
  {
    name: "Alzheimer\'s Society",
    description: "Support and research for people affected by dementia",
    registered_number: "296645",
  },
  {
    name: "Oxfam",
    description: "Working to end the injustice of poverty",
    registered_number: "202918",
  },
  {
    name: "Shelter",
    description: "Fighting homelessness and bad housing",
    registered_number: "263710",
  },
  {
    name: "RNLI",
    description: "Saving lives at sea",
    registered_number: "209603",
  },
  {
    name: "Dogs Trust",
    description: "UK\'s largest dog welfare charity",
    registered_number: "227523",
  },
  {
    name: "RSPCA",
    description: "Preventing cruelty and promoting kindness to animals",
    registered_number: "219099",
  },
  {
    name: "St Mungo\'s",
    description: "Helping people to recover from homelessness",
    registered_number: "1079126",
  },
  {
    name: "Mind",
    description: "Mental health support and advocacy",
    registered_number: "219830",
  },
  {
    name: "Samaritans",
    description: "Listening support for anyone in distress",
    registered_number: "219432",
  },
  {
    name: "Crisis",
    description: "Ending homelessness in the UK",
    registered_number: "1082947",
  },
  {
    name: "Trussell Trust",
    description: "Supporting food banks across the UK",
    registered_number: "1110522",
  },
  {
    name: "Médecins Sans Frontières",
    description: "Emergency medical aid in crisis zones",
    registered_number: "1026588",
  },
  {
    name: "Save the Children",
    description: "Protecting children in the UK and around the world",
    registered_number: "213890",
  },
  {
    name: "WWF",
    description:
      "Conservation of nature and reduction of threats to biodiversity",
    registered_number: "1081247",
  },
  {
    name: "National Trust",
    description: "Caring for places of natural beauty and historic interest",
    registered_number: "205846",
  },
  {
    name: "RNIB",
    description: "Support for people with sight loss",
    registered_number: "226227",
  },
  {
    name: "Scope",
    description: "Equality for disabled people",
    registered_number: "208231",
  },
  {
    name: "St Richard\'s Hospice",
    description: "Specialist palliative care in Worcestershire",
    registered_number: "515668",
  },
  {
    name: "Hospice UK",
    description: "Supporting hospice care across the country",
    registered_number: "1003017",
  },
  {
    name: "Comic Relief",
    description: "Using the power of entertainment to change lives",
    registered_number: "326568",
  },
  {
    name: "Children\'s Society",
    description: "Fighting for children who are ignored, abused and forgotten",
    registered_number: "221124",
  },
  {
    name: "Barnardos",
    description: "Transforming the lives of vulnerable children",
    registered_number: "216250",
  },
  {
    name: "NSPCC",
    description: "Protecting children and preventing abuse",
    registered_number: "216401",
  },
  {
    name: "Diabetes UK",
    description: "Supporting people living with diabetes",
    registered_number: "215199",
  },
  {
    name: "Stroke Association",
    description: "Support and research for stroke survivors",
    registered_number: "211015",
  },
]

const categories = [
  { label: "Nature", description: "Natural world and our place in it" },
  {
    label: "Music",
    description: "Songs, genres, and the moments they soundtracked",
  },
  { label: "Film & TV", description: "Stories told on screen" },
  { label: "Food & Drink", description: "Tastes and smells we grew up with" },
  { label: "Places", description: "Locations that stay with us" },
  {
    label: "Sport",
    description: "Games, teams, and the thrill of competition",
  },
  { label: "Literature", description: "Books and the worlds they opened" },
  { label: "Everyday life", description: "Small things that make up a life" },
  { label: "Childhood", description: "What we remember from growing up" },
  { label: "Time", description: "Seasons, moments, and the rhythm of days" },
]

// ---------------------------------------------------------------------------
// Placeholder writing discipline
//
// Every occasion entry has: about, reveal.  (framing removed entirely)
//
// Writing order:
//   1. Reveal first — specific named answer, one concrete detail
//   2. About second — topic area without naming the answer
//   3. Check: does about leak the reveal? If yes, rewrite.
//
// All reveal answers must exist in the topic_items list.
// Marcus Webb (achievement) raises RNLI money via favpoll itself.
// ---------------------------------------------------------------------------

type TopicPlaceholders = {
  [occasion: string]: { about: string; reveal: string }
}

type TopicSeed = {
  title: string
  description: string
  is_finite: boolean
  categories: string[]
  placeholders: TopicPlaceholders
}

const topics: TopicSeed[] = [
  // ── Finite ──────────────────────────────────────────────────────────────────
  {
    title: "Colour",
    description: "Colour that spoke to them most",
    is_finite: true,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A retired teacher and mother who gave forty years to her pupils and her garden. She had a precise eye for what belonged where — in a room, in a border, on a person. Marie Curie nurses cared for her at home in her final weeks.",
        reveal:
          "Hers was purple. She wore it to every occasion that mattered, and grew lavender in every garden she ever had.",
      },
      tribute: {
        about:
          "A mentor, colleague, and friend who spent decades shaping careers and conversations in equal measure. He was not a man who did anything by accident — not a meeting, not a word, not an outfit. His colleagues noticed the consistency long before they understood it.",
        reveal:
          "His was blue. The same shade, the same pocket square, every meeting that counted. Nobody ever asked why.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has never made a neutral choice in her life. Three weekends of deliberation for a single wall, two trips to the paint shop, and complete conviction about the result. She has not once looked back.",
        reveal:
          "Hers is green. Three weekends, two trips to the paint shop, no regrets. She still brings it up.",
      },
      retirement: {
        about:
          "Thirty-five years building engineering teams, and David arrived at every important occasion dressed as a man who had made a decision and stuck to it. His team knew exactly what to expect. They found this more comforting than they expected.",
        reveal:
          "His was black. Every important meeting, for thirty-five years. He said it was practical. It was also completely him.",
      },
      wedding: {
        about:
          "Emma and James met at a rainy festival in 2019 and have been disagreeing about interior design ever since. Their flat has one wall that remains unpainted after two years. Neither of them is in a hurry to resolve it.",
        reveal:
          "Hers is blue. His is green. The wall remains unpainted. This is not a problem they are in any hurry to solve.",
      },
      engagement: {
        about:
          "Callum proposed on Arthur\'s Seat on New Year\'s Day. He had been planning it around a specific walk at a specific time of year for months. Sophie thought they were just going for a walk. The hillside looked exactly as he\'d hoped.",
        reveal:
          "Theirs is green — the exact shade of the hillside on the morning Callum proposed. Sophie said she hadn\'t noticed. She had.",
      },
      anniversary: {
        about:
          "Forty years, three houses, and a sitting room that has been repainted twice and still isn\'t quite right. They disagree on almost everything domestic. It has never once been a problem worth solving.",
        reveal:
          "Theirs keeps changing. The sitting room has been repainted twice and still isn\'t right. They consider this a feature, not a flaw.",
      },
      leaving: {
        about:
          "Priya dressed with the conviction of someone who had worked herself out years ago and never needed to revisit the question. Six years in the studio and every choice was deliberate — not a statement, just a very precise self-knowledge.",
        reveal:
          "Hers was orange — worn deliberately, always exactly right. The office felt greyer the day she left.",
      },
      graduation: {
        about:
          "Tom spent four years at architecture school developing opinions about proportion, light, and the relationship between material and meaning. His tutors said his instincts were good. He agreed, but would have preferred to think they were rational.",
        reveal:
          "His was brown — terracotta specifically, he would tell you. He said he chose it logically. His tutors said otherwise.",
      },
      christening: {
        about:
          "Lily arrived in March and immediately attracted strong opinions about what her room should look like. Everyone in the family has a view. We are saving them for when she is old enough to disagree with all of us.",
        reveal:
          "We\'ve all got opinions on what her room should be. We\'re saving them for the right moment.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll — the charity that patrols the coastline he trained on every morning for eight months. He has strong views about kit. His supporters know which ones.",
        reveal:
          "His is yellow. He said it was for visibility on the early morning runs. It was also, clearly, just his colour.",
      },
      recovery: {
        about:
          "Claire finished her treatment last month and made deliberate choices about what surrounded her while she recovered — nothing dramatic, just enough of the right things in the right places. She said it helped in ways she couldn\'t quite explain.",
        reveal:
          "Hers was white. She said she needed space around her — clean, open, uncluttered. It turned out to be exactly right.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year, and anyone who has spent time in her classroom would not be surprised. She made choices about that room with intention — read the research afterwards, and watched it work exactly as she\'d expected.",
        reveal:
          "Hers is yellow. She chose it deliberately and watched it work. She knew it before the research confirmed it.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He has applied the same thinking to every product he has ever shipped: that the visual decisions are never separate from the strategic ones.",
        reveal:
          "His is red. He has a whole theory about it, applied to every product he has ever shipped. The promotion feels like the theory paying off.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and what the way they dress, decorate, or surround themselves says about them. Colour preference is more specific than it sounds.",
        reveal: "Tell us which colour, and what it says about you.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. How someone makes visual choices — deliberately, instinctively, or not at all — is always a worthwhile detail.",
        reveal:
          "Name a colour and tell the story behind it. The more specific, the better.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite colour — the one someone always comes back to — makes a good starting point.",
        reveal: "Name a colour and say what it means to you.",
      },
    },
  },
  {
    title: "Season",
    description: "Time of year they loved most",
    is_finite: true,
    categories: ["Nature", "Time"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who measured the year in the garden. She knew exactly when things would come back and was always ready for them. The first signs of her favourite season were a private occasion she marked quietly, alone.",
        reveal:
          "Hers was spring. She\'d have seeds in the ground before anyone else had thought about it.",
      },
      tribute: {
        about:
          "A mentor whose best thinking always seemed to arrive at the same time of year. His colleagues noticed it without ever naming it — the meetings that mattered, the decisions that held. Something about the light in that season suited him.",
        reveal:
          "His was autumn. He was the kind of person who suited October. Something about the quality of the light.",
      },
      birthday: {
        about:
          "Sarah has a public position on her favourite season that her friends consider entirely incorrect. She plans her whole year around long evenings and warm weekends, then remembers in October that she\'s been claiming otherwise for years.",
        reveal:
          "Hers is summer, if you ask the people who know her. She plans her whole year around it, whatever she says.",
      },
      retirement: {
        about:
          "Thirty-five years building an engineering team from four people to four hundred, and the best projects always found their rhythm at the same time of year. David is planning his first free twelve months. The pattern will probably reassert itself.",
        reveal:
          "His was autumn. The best project always came together in October. Every year, without fail.",
      },
      wedding: {
        about:
          "Emma and James met at a rainy festival in 2019, which has shaped their views on British weather in ways they are still working through. They have disagreed warmly about the best time of year since approximately their third date.",
        reveal:
          "Hers is spring. His is summer. They\'ve been at this for five years with no sign of resolution.",
      },
      engagement: {
        about:
          "Callum had been planning the proposal around a specific kind of day — a particular light, a particular temperature, the right part of the year. Sophie thought they were just going for a walk. The timing was, as he had intended, entirely the point.",
        reveal:
          "Autumn. He\'d been waiting for October in the Lakes. Sophie thought they were just going for a walk.",
      },
      anniversary: {
        about:
          "Forty years of seasons together, and they still disagree about the garden at exactly the same moment every year. She says it\'s time. He says wait. This has been resolved the same way every year for four decades. Neither will say who wins.",
        reveal:
          "Theirs is spring, though they can\'t agree on exactly when. She plants in March. He says April. The argument is annual.",
      },
      leaving: {
        about:
          "Priya arrived in January and had changed everything about how the studio worked by the time the first warm days came. She always said the dark months were when the real work got done. The team have been testing this theory since she left.",
        reveal:
          "Hers was winter. She said the dark gave you something the other seasons didn\'t. She was the only person who meant it.",
      },
      graduation: {
        about:
          "Tom spent his final year almost entirely in the studio and emerged, blinking, into natural light he had seen very little of since January. He has since developed strong views about daylight and what it is actually for.",
        reveal:
          "His is summer. He saw very little daylight between January and May. It was particularly welcome.",
      },
      christening: {
        about:
          "Lily arrived just as the garden was starting, and the timing felt right to everyone who was there. The most optimistic of all the seasons. She came in exactly on schedule.",
        reveal:
          "She came in spring, just as everything was beginning. The timing felt perfect.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll — the charity that patrols the coastline he trained on every morning. Eight months of early starts, every season, to get to the start line.",
        reveal:
          "His is autumn. The marathon was a crisp October morning. He\'ll always associate that season with finishing something hard.",
      },
      recovery: {
        about:
          "Claire came through her treatment and found that one season sat differently with her this year — the particular quality of it, what it asked of her, and what it gave back. She said it suited her better than she\'d expected.",
        reveal:
          "Hers is winter. She said the quiet suited her — the permission to stay still. She found it more restoring than she expected.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year, and the people who nominated her will tell you she is at her absolute best at one particular moment in the school calendar. She plans the whole year around it.",
        reveal:
          "Hers is autumn. September energy, first week back. She builds the whole year around that feeling.",
      },
      promotion: {
        about:
          "Three years of patient, excellent work, and Kwame waited for exactly the right moment to mark his promotion properly. He said the timing was practical. Nobody who knows him believes this.",
        reveal:
          "His is spring. He waited for the first warm day of the year. It happened to be perfect.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which time of year brings the best of them out. The season someone always comes alive in is more specific than it sounds.",
        reveal:
          "Tell us which season and what it gives you that the others can\'t.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. Which time of year brings the best of them out — and why — is always worth including.",
        reveal: "Pick a season and say what makes it yours.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite season — and what it gives them that the others don\'t — is a good place to start.",
        reveal: "Pick a season and say what it gives you that no other can.",
      },
    },
  },
  {
    title: "Day of the week",
    description: "Day that felt most like them",
    is_finite: true,
    categories: ["Time", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had made one day of the week entirely her own. The schedule was long-established and non-negotiable — family knew it, friends knew it, and it was treated with appropriate respect.",
        reveal:
          "Hers was Sunday. Long lunch, garden, Radio 4 — in that order, without variation. If you wanted her, you had to know the schedule.",
      },
      tribute: {
        about:
          "A mentor who had a particular evening of the week he kept for conversations worth having. His colleagues built their weeks around it without quite realising they\'d done so. The calendar has been different since he stopped holding it.",
        reveal:
          "His was Thursday. He held court on Thursday evenings — that was the night for a proper conversation. Everyone knew it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with a consistent theory about which day of the week has the best energy. Her colleagues have been unable to disprove it. She has held this position for years.",
        reveal:
          "Hers is Friday. She makes the whole office feel like the weekend starts at lunch. Nobody has been able to explain how.",
      },
      retirement: {
        about:
          "Thirty-five years of the same working week, and David had a particular relationship with one day of it that his team found genuinely puzzling. He is retiring. His theory about that day is about to be tested in full.",
        reveal:
          "His was Monday. He always said weekends were just Mondays with better lighting. He believed this sincerely. His team did not.",
      },
      wedding: {
        about:
          "Emma and James have never quite agreed on a favourite day, which is appropriate given that they\'ve never quite agreed on most things and it has never once been a problem.",
        reveal:
          "Hers is Sunday. His is Friday. They met on a Friday, got engaged on a Sunday, and haven\'t resolved it since.",
      },
      engagement: {
        about:
          "Callum proposed on Arthur\'s Seat on New Year\'s Day — a day he\'d been planning around for months. Sophie thought they were just going for a walk. She has since reassessed several other walks in the relationship with new information.",
        reveal:
          "It was a Sunday. Long walk, the proposal, the view. Sophie will never think of it as just a day again.",
      },
      anniversary: {
        about:
          "Forty years together, and they have spent most of those years disagreeing about which day of the week is best. They have not resolved it. They are not trying to. This is the arrangement.",
        reveal:
          "Theirs is Saturday. They\'ve been arguing about it for forty years and Saturday keeps winning. Neither of them fully admits this.",
      },
      leaving: {
        about:
          "Priya had a way of making one particular day of the week feel like something worth turning up for. The rest of the week was fine. That day was different. The team noticed it most in the weeks after she left.",
        reveal:
          "Hers was Tuesday. She made Tuesday lunches feel like the best part of the week. We\'re still not sure how.",
      },
      graduation: {
        about:
          "Tom spent four years at architecture school with a timetable that taught him a great deal about which day of the week felt earned and which felt like it arrived too easily. He has strong views about this. They are probably correct.",
        reveal:
          "His was Wednesday. Crit day — the work either held up or it didn\'t. By the end of four years he\'d learned to love that feeling.",
      },
      christening: {
        about:
          "Lily arrived on a Tuesday, which her parents are treating as a meaningful coincidence. It was, they say, a very Tuesday kind of arrival — quiet, unhurried, completely her own.",
        reveal:
          "She arrived on a Tuesday. Her parents have decided this is exactly right for her. The rest of us are going along with it.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll — the charity that patrols the coastline he trained on for eight months. He has permanently reordered the week in his mind since crossing the finish line.",
        reveal:
          "His is Sunday now. He finished 26.2 miles before the papers were read. Sundays will never feel ordinary again.",
      },
      recovery: {
        about:
          "Claire finished her treatment and found herself counting one day of the week differently — not marking it, exactly, just noticing it more than before. She says it changed what that day means to her.",
        reveal:
          "Hers became Monday. Each one a milestone, each one its own small arrival. She started looking forward to them.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year, and anyone who has taught alongside her will know which day of the week she considers the best one. She has structured her whole approach around it.",
        reveal:
          "Hers is Wednesday. By then the class has found its rhythm. She has theirs. She wouldn\'t swap that day for anything.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He got the news midweek and spent two days waiting to tell the team properly. The day he chose was very deliberate.",
        reveal:
          "His is Friday. He got the news on a Wednesday and spent Thursday waiting to tell the team. Worth every minute.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which day of the week is most like them. The day someone considers their best says something specific.",
        reveal: "Tell us which day is yours and what makes it the best one.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite day of the week — and what makes it theirs — is a small detail that opens up something larger.",
        reveal: "Pick a day and say what it gives you that no other can.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite day of the week is one of those things everyone has a position on.",
        reveal: "Pick a day and tell us what makes it the best.",
      },
    },
  },
  {
    title: "Meal of the day",
    description: "Meal they never skipped",
    is_finite: true,
    categories: ["Food & Drink", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who treated one meal of the day as a serious commitment. It was the meal where the real conversations happened — the ones that lasted two hours after the plates were cleared. People always stayed.",
        reveal:
          "Hers was dinner. Still at the table at nine, most nights. That was when the day\'s conversations properly started.",
      },
      tribute: {
        about:
          "A mentor who never ate at his desk. Not once, in thirty years. He said the midday meal was for people, not screens, and he organised his entire working day around this principle. His colleagues eventually understood he was right.",
        reveal:
          "His was lunch. Never at his desk, always with someone. He said no important conversation should happen on an empty stomach.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has strong opinions about every meal, but reserves her highest regard for the one that sits between morning and the rest of the day. She approaches it with an enthusiasm her friends find both baffling and infectious.",
        reveal:
          "Hers is brunch. Two hours minimum, good coffee, no rushing. She considers this a moral position.",
      },
      retirement: {
        about:
          "Thirty-five years of the same commute, the same desk, and the same meal eaten in the same twenty minutes because there was never enough time. David is retiring. The time has arrived. The meal will finally be done properly.",
        reveal:
          "His is breakfast. He ate it standing at the kitchen counter for thirty-five years. He is now planning to sit down. For as long as he likes.",
      },
      wedding: {
        about:
          "Emma and James spent their first proper date arguing about where to eat and ended up somewhere neither of them had suggested and both of them loved. This remains the template for all subsequent decisions about food.",
        reveal:
          "Theirs is dinner. The longer and later the better. They\'ve been known to still be at the table at midnight. This is considered a good evening.",
      },
      engagement: {
        about:
          "Sophie and Callum have a division of labour around food that works perfectly. Callum cooks. Sophie judges. The system was established on their second date and has not been revised since.",
        reveal:
          "Theirs is supper. Callum makes pasta at nine, Sophie critiques it, they eat it together. This has been the arrangement for four years.",
      },
      anniversary: {
        about:
          "Forty years of eating together, and there is one meal of the day they have always treated as the important one — the one that doesn\'t get cancelled, doesn\'t get rushed, and doesn\'t get eaten in front of the television.",
        reveal:
          "Theirs is lunch. Proper lunch, every day when they can manage it. That was always the meal they protected.",
      },
      leaving: {
        about:
          "Priya was always in before everyone else. The coffee was already made when the rest of the team arrived, and the early morning was when she did the thinking that the rest of the day ran on. Nobody else knew this at first.",
        reveal:
          "Hers was breakfast. She arrived early, ate at her desk before anyone else arrived, and had solved the day\'s hardest problem before nine. She never mentioned this.",
      },
      graduation: {
        about:
          "Tom graduated from four years of architecture school with strong opinions about many things, including which meal of the day deserved the most ceremony. His parents came to the degree show and brought food. He cried, which surprised everyone including him.",
        reveal:
          "His was afternoon tea. His mum brought a cake to the degree show. He said she shouldn\'t have. He was wrong.",
      },
      christening: {
        about:
          "The family gathered for Lily\'s christening and fed each other in the way that families do — slightly chaotically, with too much of some things and not enough of others, and completely perfectly.",
        reveal:
          "They gathered for lunch. The table was too small and nobody minded.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll — the charity that patrols the coastline he trained along for eight months. He had one meal planned from mile fourteen onwards.",
        reveal:
          "His was breakfast. A full cooked breakfast at mile fourteen in his head, in reality at eleven-thirty after the finish line. He earned every part of it.",
      },
      recovery: {
        about:
          "Claire finished her treatment and found that the evening meal became something different this year — quieter, more deliberate, more noticed. She said food tasted different when you stopped taking it for granted.",
        reveal:
          "Hers is supper. Late, quiet, properly cooked. She said learning to take her time over it was one of the better things the year taught her.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and has firm views about the meal of the day that keeps everything running. She eats it at the same time every day. Her colleagues have learned to leave her to it.",
        reveal:
          "Hers is afternoon tea. Three o\'clock, without fail. She says it\'s where the second half of the day starts. She\'s not wrong.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He celebrated with exactly the kind of meal he thinks a promotion deserves — unhurried, good company, the right time of day.",
        reveal:
          "His is brunch. He said the promotion deserved the meal that has the least respect for what time it is. He was right.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which meal of the day they treat as the serious one. The meal someone protects says something about how they organise their life.",
        reveal: "Tell us which meal is yours and why it beats all the others.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite meal of the day — and what they do with it — is a detail that says more than you\'d expect.",
        reveal: "Pick a meal and make the case for it.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite meal of the day is one of those things everyone has a take on.",
        reveal:
          "Tell us which meal and why. It says more about a person than you\'d think.",
      },
    },
  },
  {
    title: "Time of day",
    description: "Hour when they were at their best",
    is_finite: true,
    categories: ["Time", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had claimed one hour of the day as entirely her own long before anyone else in the house was awake. Her family knew the shape of her morning. It was not to be interrupted.",
        reveal:
          "Hers was early morning. The garden done, the thinking done, the tea made — all before the world woke up. She said it was when everything was possible.",
      },
      tribute: {
        about:
          "A mentor who was at his most precise and most generous at one specific hour of the day. His colleagues knew when to find him with a question, and when to leave him to it. The timing was always reliable.",
        reveal:
          "His was late afternoon. He\'d always be there at five with something worth saying. The timing was never accidental.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and is at her most vivid in the hours when most people are winding down. She has been known to start elaborate dinners at ten o\'clock. Nobody has ever complained about the timing.",
        reveal:
          "Hers is evening. The later the better. She says everything gets more interesting after nine. Most of her friends agree.",
      },
      retirement: {
        about:
          "Thirty-five years of the same alarm, the same drive, the same desk by eight-fifteen. David is retiring. The alarm is the first thing going. The hour it used to ring is the one he\'s most looking forward to reclaiming.",
        reveal:
          "His was mid morning. Best coffee, full focus, the work done before anyone had called a meeting. He\'s keeping the hour. Just not the commute.",
      },
      wedding: {
        about:
          "Emma and James got married at a time of day they both agreed on, which their friends consider the most romantic detail of the whole event. Everything after that has been a negotiation. The wedding hour was unanimous.",
        reveal:
          "Theirs is dusk. Golden light, the day done, the evening starting. They said it was the only moment the photographs could possibly be right. They were correct.",
      },
      engagement: {
        about:
          "Callum chose the hour of the proposal with as much care as the location. Sophie thought they were just stopping to rest. She has since reviewed the rest of the walk with new understanding.",
        reveal:
          "Late afternoon — the light on the fells turning gold. He\'d been waiting for that specific hour on that specific hillside. Sophie thought they\'d just stopped to look at the view.",
      },
      anniversary: {
        about:
          "Forty years together, and there is one hour of the day they have always protected — the one that belongs to nobody else and has no agenda. It has never been cancelled. It has never needed to be.",
        reveal:
          "Theirs is lunchtime. Same time, same table, same lack of phones. That hour has held forty years together.",
      },
      leaving: {
        about:
          "Priya\'s presence in the studio had a particular quality at one time of day — a sharpness and a warmth simultaneously. Her colleagues found themselves doing their best thinking in that hour. They still do. It just feels different now.",
        reveal:
          "Hers was the afternoon — specifically, the three o\'clock hour. Something shifted in the studio at that time when she was there. It has not quite shifted back.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school having spent more hours of the night working than most people would consider sustainable. He is sanguine about this. He says the late hours gave him something the daylight hours didn\'t.",
        reveal:
          "His was late night. The studio emptied, the work got clearer, the decisions became obvious. He learned things about himself between midnight and three that he couldn\'t have learned any other way.",
      },
      christening: {
        about:
          "Lily has, in her brief time so far, established a strong position on the hours of the day. Her parents are adapting. They now know more about early mornings than they did before.",
        reveal:
          "She arrived in the early morning and has been loudly in favour of that hour ever since. Her parents are learning to appreciate it.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll — the charity that patrols the coastline he trained along. Eight months of the same hour, the same route, the same determination.",
        reveal:
          "His is mid morning. He was on mile twelve before most people had checked their phones. He says something happens in that hour that doesn\'t happen any other time.",
      },
      recovery: {
        about:
          "Claire finished her treatment and found that one hour of the day became important to her in a way it hadn\'t been before — unhurried, unscheduled, entirely her own. She says it was a small thing that turned out to be a large one.",
        reveal:
          "Hers is the afternoon. Two o\'clock, slow, no plans. She said it was the hour she learned to stop moving through and start being in.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and has a lesson slot she considers the best one in the week. She has never taught it any other way and would not move it for anything.",
        reveal:
          "Hers is lunchtime — a class that runs through the lunch hour by mutual agreement. Everyone stays. No one mentions the time.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He told his partner the news at a particular hour of the evening. He said it was the only time that felt right for it.",
        reveal:
          "His is evening. That\'s when the day makes sense to him — what worked, what didn\'t, what comes next. He does his best thinking then.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which hour of the day they are most themselves. The time someone is at their best says something true.",
        reveal: "Tell us your time, and what it gives you.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite time of day — the hour someone is most themselves — is always worth including.",
        reveal: "Pick your time and say why it\'s yours.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite time of day is one of those things everyone has strong feelings about.",
        reveal:
          "Early morning energy, or the kind of person who gets better as the day goes on?",
      },
    },
  },
  {
    title: "Decade",
    description: "Era that shaped them most",
    is_finite: true,
    categories: ["Time", "Music", "Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A retired teacher and mother who came of age in a decade she always said had changed everything. She kept a box of photographs from that time she\'d show to anyone who asked, and several who hadn\'t.",
        reveal:
          "Hers was the 1960s. She could tell you exactly where she was when things happened. The box of photographs from 1968 was the evidence.",
      },
      tribute: {
        about:
          "A mentor who had a decade he returned to in conversation as naturally as other people quote poetry. He said it was when everything became clear. His colleagues eventually understood what he meant.",
        reveal:
          "His was the 1970s. He had a theory that ran from Coltrane to Thatcher that explained the whole decade. It took an hour to hear properly. It was worth it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has never pretended to be neutral about the decade that shaped her. She has strong views about the music, the films, and the fashion, and she delivers them with conviction.",
        reveal:
          "Hers is the 1980s. She knows every word to every song from 1986. She considers this useful knowledge. She is not wrong.",
      },
      retirement: {
        about:
          "David joined the firm the year the decade turned and spent the next ten years building something that still holds. He considers the nineties the decade when engineering got interesting. His colleagues from that era agree.",
        reveal:
          "His was the 1990s. He joined the firm in 1989. The decade that followed was when the real work happened.",
      },
      wedding: {
        about:
          "Emma and James share a decade they grew up in, which they discovered on their second date and found more significant than they expected. The playlist for their wedding covered it extensively.",
        reveal:
          "Theirs is the 2000s. They grew up to the same music without knowing each other existed. The wedding playlist made this plain.",
      },
      engagement: {
        about:
          "Sophie and Callum grew up in parallel decades without knowing it — same music, same television, same slightly bewildering cultural references. They only found this out a year into the relationship.",
        reveal:
          "The 1990s. They were born the same year and discovered this at the worst possible moment — on their third date, with no way to recover.",
      },
      anniversary: {
        about:
          "They got married in a decade they still consider the best one, and have spent forty years building an argument for this position that has only got stronger.",
        reveal:
          "Theirs was the 1970s. They met in 1974 and have been making the case for it ever since. They are still right.",
      },
      leaving: {
        about:
          "Priya grew up between two musical traditions and two different ideas about what a decade meant. She had a decade she claimed as her own and defended it with more evidence than most people bring to the argument.",
        reveal:
          "Hers was the 2000s. She arrived already shaped by it. The studio benefited for six years.",
      },
      graduation: {
        about:
          "Tom spent four years at architecture school developing a theory about how buildings reflect the decade they were built in. He applied this to everything. His tutors found it useful. His housemates found it a great deal.",
        reveal:
          "His is the 2010s. He has views about what happened architecturally in that decade. They are extensive and probably correct.",
      },
      christening: {
        about:
          "Lily is the first person in her family to be born in this decade, which everyone agrees is significant. She starts her story in new territory. The rest of us are catching up.",
        reveal:
          "She arrived in the 2020s. Her story starts here. The decade is still deciding what it is.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He trained to music from one decade almost exclusively and says it got him through the worst mornings. His supporters will recognise the playlist.",
        reveal:
          "His is the 2000s. The anthems that got him through mile eighteen belong to that decade. He chose them deliberately.",
      },
      recovery: {
        about:
          "Claire went back to the music of a specific period during her recovery — the decade when everything felt urgent and important and full of possibility. She played it quietly. It did what she needed it to do.",
        reveal:
          "Hers is the 2010s. She said it was the decade that gave her the language she needed. She went back to it and found it was still there.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and teaches a unit on a particular decade she considers the most important one for understanding what came after. Her students always feel it applies to them.",
        reveal:
          "Hers is the 1960s. She says it was the first decade that understood what young people were. Her students find this strangely moving.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He has a map of how culture and technology moved through one particular decade that he finds genuinely useful for thinking about product. He has given this talk in three different companies.",
        reveal:
          "His is the 2010s. He says it was when product thinking finally grew up. He has evidence. He\'s probably right.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which decade shaped them most. The era someone returns to is always the one that formed them.",
        reveal:
          "Pick the decade and say what it gave you that nothing else could.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite decade — and what it gave them — is always worth including.",
        reveal: "Name the decade and say what it gave you.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. Everyone has a decade that shaped them.",
        reveal:
          "Pick a decade and say what it gave you that nothing else could.",
      },
    },
  },
  // ── Infinite — Nature ────────────────────────────────────────────────────────
  {
    title: "Animal",
    description: "Creature they felt closest to",
    is_finite: false,
    categories: ["Nature", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose garden was as much for the creatures as for herself. She had strong opinions about which animals deserved more attention than they got. Her family learned early which ones those were.",
        reveal:
          "Hers was the fox. They came to her garden reliably and she always stopped to watch. She said animals knew things people didn\'t.",
      },
      tribute: {
        about:
          "A mentor who paid attention to things most people walked past. He had a quality — patience, watchfulness, precision — that his colleagues associated with one particular creature they saw him stop for once on a riverside walk.",
        reveal:
          "His was the heron. Patient, watchful, always in exactly the right place at the right moment. His colleagues said the comparison was inevitable.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with a dog named Pepper who attends every dinner party and is, she will tell you, her most consistent relationship. She claims to be a cat person. Everyone who has met Pepper knows this is not true.",
        reveal:
          "Hers is the dog, if you ask anyone who knows her. She says cat person. Pepper says otherwise.",
      },
      retirement: {
        about:
          "Thirty-five years building an engineering team and David was known for one quality above all others: steadiness. He was always there, always reliable, always the same. His team built their confidence around it.",
        reveal:
          "His was the horse. Steady, dependable, built for the long effort. His team said the comparison was a compliment. He accepted it as one.",
      },
      wedding: {
        about:
          "Emma and James have been debating which animal best represents their relationship since approximately their second date. They have not reached a conclusion. The debate is considered one of their better ongoing conversations.",
        reveal:
          "Hers is the otter. His is the dog. They haven\'t resolved it. Neither of them particularly wants to.",
      },
      engagement: {
        about:
          "They got engaged on Arthur\'s Seat at New Year, on a walk that Sophie had been led to believe was just a walk. There was a moment — an unexpected one — that she now considers part of the story.",
        reveal:
          "The robin. It landed on the path just before Callum proposed. Sophie took it as a sign. Callum says the timing was coincidental. Sophie does not accept this.",
      },
      anniversary: {
        about:
          "Forty years together, and they have had exactly the same argument about pets for most of them. The argument has a resolution that neither of them fully accepts. This is fine. The argument is the point.",
        reveal:
          "Theirs is the dog — that much is settled. The breed question has been open for forty years. Everything else has been resolved.",
      },
      leaving: {
        about:
          "Priya\'s desk was the one with the small ceramic elephant on it — a gift from her first day that survived six years and three desk moves. The symbolism was not lost on anyone.",
        reveal:
          "Hers was the elephant. The ceramic one on her desk arrived on her first day and left on her last. Patient, steady, impossible to overlook.",
      },
      graduation: {
        about:
          "Tom spent four years at architecture school drawing the same bird in the margins of his lecture notes. He has not explained why. The drawings got progressively better. His tutors noticed.",
        reveal:
          "His was the owl. He said it was about the patience — watching until you understood something properly. His tutors found this accurate.",
      },
      christening: {
        about:
          "Lily\'s room currently features approximately seven different animal prints, a mobile with sheep on it, and a rabbit from her grandmother that is larger than Lily is. She seems, as far as anyone can tell, unbothered.",
        reveal:
          "Hers is the rabbit — specifically the enormous one from her grandmother that takes up a third of her cot. She has no complaints.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He passed the same two birds at the two-mile mark every morning for eight months. He named them. They were unmoved.",
        reveal:
          "His is the robin. He saw the same two at mile two every morning for eight months. He considered them colleagues.",
      },
      recovery: {
        about:
          "During her recovery, Claire started doing things she had been meaning to do for years. One of them was small and consistent and turned out to matter more than she expected.",
        reveal:
          "Hers is the hedgehog. She started leaving food out for them during her recovery. They came every evening. The regularity helped more than she expected.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year, and anyone who has been in her classroom will have noticed the corner with the working hive of bees behind glass. It is, she says, the best teaching aid she has ever used.",
        reveal:
          "Hers is the owl. Patient, wide-eyed, comfortable in the dark. She says it makes students think about the value of instinct.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He would like it noted that he is a dog person, has always been a dog person, and considers this relevant background information for anyone working with him.",
        reveal:
          "His is the dog. Loyal, energetic, excellent at reading a room. He means this as a self-description. His team agrees.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what matters to them, and whether there\'s an animal that says something true about them. The specific choice is always more revealing than the general one.",
        reveal: "Pick the animal that says something true about who you are.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite animal — and the reason behind it — is often more revealing than expected.",
        reveal: "Pick an animal and say what it says about you.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite animal is one of those choices that always means something.",
        reveal:
          "Pick the animal that captures something true about who you are.",
      },
    },
  },
  {
    title: "Bird",
    description: "Bird that always caught their eye",
    is_finite: false,
    categories: ["Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who kept a garden that was largely for other creatures. She logged every bird that visited over the years, and her notebooks — decades of them — are still in the shed.",
        reveal:
          "Hers was the robin. She could identify a bird by its song before it appeared. The notebooks have forty years of arrivals recorded in them.",
      },
      tribute: {
        about:
          "A mentor with a clear, unhurried voice who filled a room without raising it. His colleagues associated him with one bird in particular — not for any obvious reason, but with the certainty that comes from knowing someone well.",
        reveal:
          "His was the blackbird. Clear voice, unhurried, completely itself. His colleagues said the comparison was obvious once you\'d thought of it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has been accumulating opinions about birds on her weekend hikes for years. She has a list she claims not to take seriously. Everyone who has hiked with her knows this is not true.",
        reveal:
          "Hers is the puffin. She spotted one from a moving ferry and talked about it for an hour. She says she\'s not a birdwatcher. Her list says otherwise.",
      },
      retirement: {
        about:
          "Thirty-five years in engineering and David\'s colleagues described him the same way: patient, watchful, precise, and always in the right place at the right moment. The bird feeders that have been in his garage since 2009 are coming out this week.",
        reveal:
          "His is the heron. Patient, watchful, then exactly right. His team used this word about him for years before realising they were describing the same bird.",
      },
      wedding: {
        about:
          "Emma and James have strong and opposing views about birds — a disagreement that began on a trip they took specifically to settle it and succeeded only in making both positions more entrenched.",
        reveal:
          "Hers is the kingfisher. His is the puffin. They went to Skomer to settle it in 2022. They came back exactly as divided.",
      },
      engagement: {
        about:
          "They got engaged on Arthur\'s Seat at New Year — a walk Callum had been planning for months. Sophie thought it was just a walk. There was a moment, just before the question, that both of them remember.",
        reveal:
          "The robin. It landed on the path just before he proposed. Sophie took it as a sign. Callum takes credit for the timing.",
      },
      anniversary: {
        about:
          "Forty years of mornings together, and one corner of the garden has been managed specifically for one kind of visitor — the same visitor, every year, without fail. Neither of them has ever questioned this arrangement.",
        reveal:
          "Theirs is the robin. It comes back every year. They leave crumbs on the same wall. It has never not returned.",
      },
      leaving: {
        about:
          "Priya once stopped a team meeting to point out something on the office roof. She was right, she was confident, and she was the only person in the room who knew what she was looking at. That tells you most of what you need to know.",
        reveal:
          "Hers was the barn owl. She spotted it on the office roof on a Tuesday in December and nobody believed her until she showed them the photograph.",
      },
      graduation: {
        about:
          "Tom studied architecture with a tutor who had a particular interest in how buildings and birds share space — nest sites, flight paths, acoustic change. Tom now notices things that other architects walk straight past.",
        reveal:
          "His is the blackbird. His tutor said the best architects listened to what a building did to sound before they looked at what it did to light. The blackbird was always the test.",
      },
      christening: {
        about:
          "Lily\'s parents are already arguing about whether the birds nesting in the garden box are a good omen. Her father says yes. Her mother says it\'s a coincidence. Both are enjoying the argument.",
        reveal:
          "The blue tits nested in the garden box the week Lily arrived. Her father considers this significant. Her mother is coming around.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He ran the same coastal route every morning and noted the birds in his training log. His supporters will know the ones.",
        reveal:
          "His is the heron. He passed the same two at the two-mile mark every morning for eight months. He credits them with getting him through the worst runs.",
      },
      recovery: {
        about:
          "During her recovery, Claire started learning something she had always meant to learn and never had time for. She found a secondhand field guide in a charity shop. She has now filled two notebooks.",
        reveal:
          "Hers is the robin. She took up birdwatching during her recovery. She says it teaches you to be where you are. She\'s not wrong.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. Her classroom has a bird feeder visible through the window and a running list on the wall of every species her students have identified since 2019. The list is now longer than several sections of the curriculum.",
        reveal:
          "Hers is the barn owl. Patient, wide-eyed, good with the dark. She means it as a teaching philosophy.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He celebrated with a long weekend in the Cairngorms — his first time in Scotland and the first time in three years he had fully switched off. He came back with strong opinions.",
        reveal:
          "His is the goldfinch. He saw his first one in the Cairngorms. He said it was the best thing he\'d seen in years, which surprised him.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what they love, and whether there\'s a bird that says something true about them. Small specific details are always the ones that land.",
        reveal: "Pick your bird. It says something.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite bird — and a reason behind it — often opens up an unexpected conversation.",
        reveal: "Tell us the bird and what it gives you.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite bird is one of those choices that always says something.",
        reveal:
          "Pick a bird that captures something about the way you see the world.",
      },
    },
  },
  {
    title: "Flower",
    description: "Bloom that stopped them in their tracks",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who grew something in every garden she ever had — the same plant, the same spot if possible, the same care every year. The garden is still there. It came back this spring.",
        reveal:
          "Hers was lavender. She grew it in every garden she ever had. The smell is still entirely hers.",
      },
      tribute: {
        about:
          "A mentor who always arrived with flowers — not every time, but always at the moments when most people would have arrived empty-handed. He had a florist he trusted completely and never explained his choices. They were always exactly right.",
        reveal:
          "His was the sweet pea. In season, always exactly right. He never explained why. Everyone came to understand anyway.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with a flat she keeps stocked with one particular flower from April to June, because she decided some years ago that there was no reasonable argument against this. Her guests have never disagreed.",
        reveal:
          "Hers is the peony. She decided some years ago that April to June without them was a waste of April to June. Nobody has challenged this.",
      },
      retirement: {
        about:
          "David spent thirty-five years in an engineering company and is retiring with a plan to do something about the garden. Specifically: one flower his mother grew, which he has been meaning to grow for decades. The seeds are already ordered.",
        reveal:
          "His is the foxglove. His mother grew them along the back wall every year. He\'s been meaning to do the same for thirty years. The time has arrived.",
      },
      wedding: {
        about:
          "Emma had a flower she\'d chosen years before she met James. She knew what she wanted at her wedding long before she knew who she\'d be marrying. James had strong views about this choice from the start, and he was right.",
        reveal:
          "Hers was wisteria. She\'d known since long before the wedding. James agreed immediately. That tells you something.",
      },
      engagement: {
        about:
          "Sophie has a list of things she loves about the Lake District that gets longer every time they go. Callum adds to it deliberately. He proposed in October — too late for most things, exactly right for others.",
        reveal:
          "Hers is the bluebell. Too early for October, she knows, but they\'re what she loves. Callum chose a hillside that would have them in spring. He is already planning the return.",
      },
      anniversary: {
        about:
          "Forty years, and Dad has bought Mum flowers every anniversary without variation. She has been calling this predictable for forty years. She has never, not once, said she was disappointed.",
        reveal:
          "Theirs is the rose. Same every year for forty years. She calls it predictable. He calls it correct. Neither of them is wrong.",
      },
      leaving: {
        about:
          "Priya always brought flowers when something was worth celebrating. Not supermarket bunches — whatever was in season at the market on the corner, chosen specifically. The desk has been empty since she left.",
        reveal:
          "Hers was the daisy. She brought them whenever something good had happened. The office has been short of daisies since she left.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school on a warm June morning. His mother came to the degree show. She brought flowers. He said she shouldn\'t have. He was wrong, and she knew it.",
        reveal:
          "His mum brought daffodils to the degree show in June, out of season and exactly right. He said she shouldn\'t have. He cried.",
      },
      christening: {
        about:
          "Lily arrived in spring and the garden was already full of things coming back. Her parents said the timing was perfect. Everyone agreed it was. It was.",
        reveal:
          "The primroses were out the week she arrived. Her parents took this as a sign. They are probably right.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He crossed the finish line to flowers from his sister. He said she shouldn\'t have. He didn\'t mean it.",
        reveal:
          "His sister brought sunflowers to the finish line. 26.2 miles and they were waiting. He said nothing had ever looked better.",
      },
      recovery: {
        about:
          "Claire finished her treatment and kept one particular flower on her windowsill for the whole year — through the difficult months and the easier ones. She said it was small and it helped.",
        reveal:
          "Hers was the poppy. She kept them on the windowsill through the whole year. She said they had the right quality of colour for the situation.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. Her students left flowers on her desk the morning the announcement was made. Nobody had organised it. It just happened.",
        reveal:
          "They brought primroses. Nobody organised it. It just happened. That\'s who they are.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. His team sent flowers. He put them on his desk and left them there all week. Several people noticed.",
        reveal:
          "His team sent peonies. He put them on the desk and didn\'t move them for a week. He said he didn\'t know what to do with them. He did exactly the right thing.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which flower says something true about them. A bloom someone returns to is always worth knowing.",
        reveal: "Tell us which one and why it\'s yours.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite flower — the one they always grow, always buy, or always stop for — is a detail worth including.",
        reveal:
          "A bloom that takes you somewhere, or one that just makes you stop.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite flower is one of those details that always means something.",
        reveal:
          "A bloom that takes you somewhere, or one that just makes you stop.",
      },
    },
  },
  {
    title: "Tree",
    description: "Tree they would sit under",
    is_finite: false,
    categories: ["Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who planted a sapling in her garden decades ago and watched it grow into something that gave shade to an entire lawn. She used to say a garden without a proper tree was just a lawn with ambitions.",
        reveal:
          "Hers was the oak. She planted it as a sapling. It is now older than most of the people who knew her.",
      },
      tribute: {
        about:
          "A mentor who had something of the deep-rooted about him — patient, extensive, quietly providing shade for everyone around him. His colleagues were in his shadow in the best possible sense for years before they fully understood it.",
        reveal:
          "His was the beech. He used to say the beech was the most generous tree — all that canopy, all that shade, nothing asked for in return.",
      },
      birthday: {
        about:
          "Sarah planted a rowan in her first garden because she said she needed something with structure and berries in autumn. She has been talking about it at dinner parties ever since. Her guests are always glad she did.",
        reveal:
          "Hers is the rowan. She planted it herself, watched it take hold, and considers this one of her better decisions. The berries in autumn are vindication.",
      },
      retirement: {
        about:
          "David spent thirty-five years in an engineering company and retired to a garden with an old apple tree that had been there when they moved in. He has a plan for it. The plan involves leaving it largely alone.",
        reveal:
          "His is the apple tree. It was there when they arrived and has been asking nothing of anyone for thirty years. He considers this an admirable approach.",
      },
      wedding: {
        about:
          "Emma and James planted a tree together on their first anniversary. They chose it carefully and planted it in the wrong place. They have been arguing about this ever since and have no plans to move it.",
        reveal:
          "Theirs is the silver birch. Two saplings in the wrong spot in a rented garden, still there. They check on it when they drive past.",
      },
      engagement: {
        about:
          "Callum and Sophie have walked the same ridge above Coniston every autumn for four years. Callum proposed there. Sophie says she knew something was different about that particular walk from the first mile.",
        reveal:
          "The yew. There is a line of them on the ridge above Coniston where Callum stopped walking. Sophie says she understood as soon as she saw it.",
      },
      anniversary: {
        about:
          "They planted a tree the year they got married. Forty years later it is enormous and in entirely the wrong place in the garden. Neither of them will suggest moving it.",
        reveal:
          "Theirs is the horse chestnut. They planted it in 1984 and it has taken over a corner of the garden they now consider its. The argument about whether it\'s in the right spot has been running for thirty years.",
      },
      leaving: {
        about:
          "Priya had a quality — not loudness, not drama, just presence — that the studio felt and couldn\'t name until she left. Then they knew exactly what it was.",
        reveal:
          "Hers was the willow. You don\'t notice how much shade they give until they\'re gone. The studio has noticed.",
      },
      graduation: {
        about:
          "Tom\'s final-year project was built around a single tree on the site. His tutors said it was either very brave or very risky. It turned out to be neither — it was just right.",
        reveal:
          "His was the beech. The final project grew entirely from one beech tree on the site. His tutors still mention it.",
      },
      christening: {
        about:
          "Lily\'s parents are already talking about planting something to mark the year she arrived. They have not agreed on what. The discussion has been productive.",
        reveal:
          "They\'re planting a cherry blossom. They agreed on it immediately, which surprised them both.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He trained along the same coastal path every morning and passed the same oak at the three-mile mark for eight months. It became a landmark.",
        reveal:
          "His is the oak. It was at the three-mile mark on his training route. He has strong feelings about that oak.",
      },
      recovery: {
        about:
          "During her recovery, Claire started noticing trees differently — their patience, their permanence, the fact that they had been there long before and would be there long after. She found this more useful than she expected.",
        reveal:
          "Hers is the elm. She said something about knowing it had been there before and would be there after. She found that steady.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She uses trees as a metaphor in every year group — roots, reach, the long game. She has been making this case for thirty years.",
        reveal:
          "Hers is the Scots pine. She says it is the tree that knows how to be in difficult conditions and still reach. She applies this to education. Also to herself.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He says great teams are like trees — deep roots, long growth, visible from a distance. His team has heard this speech. They consider it accurate.",
        reveal:
          "His is the pine. He has a whole metaphor built around it. His team has heard it. They find it works.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which tree says something true about them. Trees outlast almost everything. The right one is worth knowing.",
        reveal: "Name yours and say what it gives you.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite tree — or the kind of place where they feel most themselves — is always worth including.",
        reveal: "Pick the tree that feels like yours.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite tree is one of those choices that always means something.",
        reveal: "Pick the tree that means something. They usually do.",
      },
    },
  },
  {
    title: "Weather",
    description: "Sky that lifted their spirit",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had a particular relationship with cold, clear mornings. Her family knew that certain weather belonged to her — the kind of day she was most herself in.",
        reveal:
          "Hers was crisp frost. Clear sky, cold air, the garden white. She said the best thinking happened before anyone else was awake.",
      },
      tribute: {
        about:
          "A mentor whose thinking always seemed clearest at one particular time of year, in one particular quality of light. His colleagues noticed it without being able to name it until they saw him stop on an October afternoon and understood.",
        reveal:
          "His was golden autumn light. He said it was the only light that made the world look finished.",
      },
      birthday: {
        about:
          "Sarah has a favourite kind of weather that most people would not choose, and she will explain at length why they are wrong. She finds warm rain, unexpected sunshine, weather that doesn\'t do what it promised — these are her conditions.",
        reveal:
          "Hers is warm rain. Unexpected, brief, the sky doing something it hadn\'t planned. She says it has the best quality of light. She\'s not wrong.",
      },
      retirement: {
        about:
          "Thirty-five years of the same commute in every kind of weather, and David has developed a taxonomy of British skies that his family finds more detailed than necessary. He is now home, and the garden is waiting.",
        reveal:
          "His is bright sunshine. He spent thirty-five years commuting through everything else. He\'s done his time.",
      },
      wedding: {
        about:
          "Emma and James got married on a day that the forecast had said was uncertain, and which turned out to be exactly right. They both consider this typical of their relationship.",
        reveal:
          "It was overcast and mild. Not the day the forecast promised. Exactly the day it turned out to be. They consider this perfect.",
      },
      engagement: {
        about:
          "Callum checked the forecast three times before the proposal walk and arrived at Arthur\'s Seat with conditions that were exactly what he had hoped for. Sophie thought they were going for a walk. She did not check the forecast.",
        reveal:
          "It was a dewy spring morning — still, clear, the city below them just waking up. He had been waiting for that specific kind of morning.",
      },
      anniversary: {
        about:
          "Forty years together and they have walked in most kinds of British weather — not because they like it, but because the walk was always the walk and the weather was just what was happening.",
        reveal:
          "Theirs is blustery wind. They\'ve been walking in it for forty years. Neither of them has ever suggested waiting for a better day.",
      },
      leaving: {
        about:
          "Priya arrived in the dark and left in the light, and she told anyone who would listen that she preferred arriving in January — she said it made the good days count.",
        reveal:
          "Hers was bright sunshine. She said it was the weather that reminded you why you were doing it. She was right. The office has been dimmer since.",
      },
      graduation: {
        about:
          "Tom spent four years in Manchester, which means he has a detailed personal taxonomy of grey. He has made his peace with it. He considers it an architectural education.",
        reveal:
          "His is the misty morning. He said Manchester taught him to find the quality in it. He is now genuinely not complaining.",
      },
      christening: {
        about:
          "Lily arrived in March to weather that nobody had predicted. Her parents say the day was exactly right. The photographs confirm this.",
        reveal:
          "It snowed lightly the morning of her christening — brief, unexpected, gone by lunch. Her parents consider this significant.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He trained in all weathers for eight months. The race morning was the weather he would have chosen.",
        reveal:
          "The marathon was overcast and mild. Not too hot, not too cold, not too bright. He\'d trained in worse. It was exactly right.",
      },
      recovery: {
        about:
          "Claire went for a walk every day during her recovery regardless of what the weather was doing. She says she started to notice it properly — the specific quality of each kind of morning — for the first time.",
        reveal:
          "Hers is the dewy spring morning. She started noticing them during her recovery. She says they have the best quality of beginning.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She has strong views about weather and learning — specifically that certain kinds of day produce better thinking than others, and that this is worth paying attention to.",
        reveal:
          "Hers is golden autumn light. She says it makes students more curious. She has no scientific evidence for this. She doesn\'t need any.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He walked home in a particular kind of weather after hearing the news and says the walk was exactly right for the moment.",
        reveal:
          "Warm rain. Light, unexpected, not dramatic. He said it was the right kind of weather for news you needed time to take in.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and what kind of sky belongs to them. The weather someone loves is always more specific than it seems.",
        reveal: "Tell us which sky belongs to you.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite kind of weather — the sky that changes how they feel — is always worth including.",
        reveal: "The sky that gets you out of the house and into the world.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite kind of weather is one of those things everyone has a take on.",
        reveal:
          "The weather that instantly lifts something in you — which one is it?",
      },
    },
  },
  {
    title: "Landscape",
    description: "View that took their breath away",
    is_finite: false,
    categories: ["Nature", "Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who loved the English countryside with the quiet certainty of someone who had never felt the need to say so. She walked the same hills in Shropshire for thirty years and knew every view by name.",
        reveal:
          "Hers was rolling hills. She walked the same stretch for thirty years and still found new things to notice every time.",
      },
      tribute: {
        about:
          "A mentor who believed that where you think best is worth paying attention to. He walked alone every autumn and came back with decisions made. His colleagues knew not to schedule important meetings the Monday after a walking weekend.",
        reveal:
          "His was open moorland. He said it was the only landscape that gave you space to think without telling you what to think.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with strong opinions about landscape formed almost entirely on weekend hikes. She does not trust anyone who says mountains are overrated and is suspicious of people who prefer the flat.",
        reveal:
          "Hers is mountains. She says they are the only landscape that asks something of you. She considers this their best quality.",
      },
      retirement: {
        about:
          "David spent thirty-five years commuting into an industrial estate and is retiring with a plan to spend more time in the Dales, where he grew up. He bought new walking boots last week. They are already broken in.",
        reveal:
          "His is river valleys. He grew up in one and has been meaning to get back to them properly for thirty years. The time has arrived.",
      },
      wedding: {
        about:
          "Emma and James have been arguing about Scotland versus the Mediterranean since 2020 and have not resolved it. They got married on the English coast and chose it specifically because it sat, diplomatically, between both positions.",
        reveal:
          "Theirs is the coastline. They argued about where to get married for a year. The coast was the one answer neither of them could argue with.",
      },
      engagement: {
        about:
          "Callum chose Arthur\'s Seat for the proposal because of the specific view from the top on a clear January morning. Sophie thought they were going for a walk. She had not expected the landscape to be the point.",
        reveal:
          "Theirs is woodland — the specific kind, the path above Coniston before the fell opens out. Sophie now understands why Callum kept going back to that walk.",
      },
      anniversary: {
        about:
          "Forty years together and they have walked some version of the same landscape every anniversary — not always the same place, but always the same kind of open, quiet view at the top. They don\'t talk much on the way up.",
        reveal:
          "Theirs is chalk downs. Open, pale, immense. They\'ve been walking the same kind of country for forty years and haven\'t tired of it.",
      },
      leaving: {
        about:
          "Priya grew up in Tamil Nadu and spent six years designing in Manchester, and the thing that surprised her most about Britain was how many kinds of landscape it contained in such a small space. She wrote about it once. Her team didn\'t know she wrote.",
        reveal:
          "Hers was the city skyline — specifically Manchester at dusk from the top of the Beetham Tower. She said she hadn\'t expected to love it. She did.",
      },
      graduation: {
        about:
          "Tom studied architecture and spent four years writing about how landscape shapes buildings — the way a harbour site produces different decisions to a valley one. His tutor said he thought like a geographer. He took it as a compliment.",
        reveal:
          "His is the harbour. He wrote about it extensively in his final year. The relationship between water, edge, and building. He was right about most of it.",
      },
      christening: {
        about:
          "Lily\'s parents chose a church in the village where her grandfather grew up — partly for the tradition, partly for the view from the churchyard on a clear day, which is one of the better views in the county.",
        reveal:
          "Theirs is the village green — the specific one beside the church, the view across it unchanged for a century. They chose it for Lily\'s day.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He grew up near the coast and chose the charity because the sea was never background for him — it was always the point.",
        reveal:
          "His is farmland — specifically the stretch of it on his training route at the five-mile mark where the path opened out. He ran it two hundred times.",
      },
      recovery: {
        about:
          "During her recovery, Claire started spending time in places she had driven past for years without stopping. She began making notes. The places that kept her longest were always the same kind.",
        reveal:
          "Hers is woodland. She said the light in it was different — the way it moved, the way it changed. She went back to the same wood every week.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and once took her whole year group to a loch in the Highlands for a day that was technically unrelated to the curriculum. Several students cited it as a turning point. She has never fully explained what she was trying to do.",
        reveal:
          "Hers is the loch. She says it is the landscape that makes you feel properly small. She considers this useful for a Year 9.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up in Accra and came to the UK for university, and the thing he found most startling — and now loves — is the English countryside in October.",
        reveal:
          "His is farmland. He said it looks like the world made up its mind about what it was and just kept going. He finds this admirable.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and whether there\'s a landscape that says something true about them. The place someone keeps going back to is always worth knowing.",
        reveal: "The view that brings you back to yourself — which one is it?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite landscape — the kind of place where they feel most themselves — is always worth including.",
        reveal: "The view that brings you back to yourself.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite landscape is one of those things everyone has a strong feeling about.",
        reveal:
          "The view that brings you back to yourself — which one is it, and what does it give you?",
      },
    },
  },
  // ── Infinite — Places ────────────────────────────────────────────────────────
  {
    title: "Place",
    description: "Where they were happiest",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose house was the place everyone came back to — for Sunday lunch, for difficult news, for no particular reason. The kitchen table was where the conversations happened. People still go back to it.",
        reveal:
          "Hers was home. Specifically, her kitchen table. Every conversation worth having happened there.",
      },
      tribute: {
        about:
          "A mentor who had a corner table in a particular pub he treated as an informal office. His colleagues knew to find him there on a Thursday evening. The conversation was always worth whatever you\'d been putting off.",
        reveal:
          "His was the pub — one specific one, one specific table. He was there every Thursday. The conversation was always worth turning up for.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has been to thirty countries and still has one kind of place she says nothing else compares to. She plans her trips around it. She always finds it.",
        reveal:
          "Hers is abroad — specifically her grandmother\'s kitchen in Cork, which she did not plan and which has beaten every destination she\'s planned since.",
      },
      retirement: {
        about:
          "David spent thirty-five years commuting into the city and is retiring with a plan to spend the majority of the next chapter in the Dales, where he grew up and where his best thinking has always happened.",
        reveal:
          "His is the countryside — specifically the Dales, where he grew up. He kept a photograph of it on his office wall for thirty-five years.",
      },
      wedding: {
        about:
          "Emma and James have been arguing about Scotland versus Italy since 2020. They got married on the English coast and chose it specifically because it sat, diplomatically, between all outstanding positions.",
        reveal:
          "Theirs is the seaside. They argued about where to get married for a year. The coast was the one answer neither could argue with.",
      },
      engagement: {
        about:
          "Callum and Sophie have been returning to the same stretch of the Lake District since their second year together. Callum proposed there. Sophie says she understood the moment they parked.",
        reveal:
          "Theirs is the mountains — specifically the fells above Coniston, where Callum proposed on a January morning with no wind and perfect visibility.",
      },
      anniversary: {
        about:
          "Forty years together and the garden has been the constant — three different houses, always a garden, always the place they end up at the end of the day when there\'s nothing that needs doing.",
        reveal:
          "Theirs is the garden. Any garden they\'ve ever had. That\'s where the day ends properly.",
      },
      leaving: {
        about:
          "Priya has had the same flight saved in her browser for two years. She grew up moving between cities and has a particular relationship with urban life that people who grew up in one place tend not to.",
        reveal:
          "Hers is the city — specifically, a city that isn\'t this one. She\'s been planning the move for two years. The time has arrived.",
      },
      graduation: {
        about:
          "Tom has a building in Manchester he considers his — not his, obviously, but the one that taught him what he was trying to understand. He visits it occasionally for reasons he struggles to explain.",
        reveal:
          "His is the childhood home — the one he grew up in, back in Wales. He says he thinks about it differently now that he studies buildings for a living.",
      },
      christening: {
        about:
          "Lily\'s parents chose a church beside a river in the village where her grandfather grew up. The setting was part of the point. The river was there before the church.",
        reveal:
          "Hers is by a river — specifically the one that runs through the village where she was christened. She doesn\'t know this yet. She will.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. The coastline he trained along every morning is not background for him — it is the reason he chose the charity he chose.",
        reveal:
          "His is the seaside. He trained along the coast for eight months. He says he can\'t think clearly anywhere else now.",
      },
      recovery: {
        about:
          "Claire found a bench in a park she visited every day during her recovery — same bench, same view, whatever the weather. She said the sameness was the point.",
        reveal:
          "Hers is home. Not the house — the specific feeling of being somewhere that asks nothing of you. She spent a year finding it again.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. Thirty-seven cards from former students, all mentioning the same room. Room 14 is the place that made the difference for more students than she will ever know.",
        reveal:
          "Hers is her childhood home — the kitchen in it specifically, where her mother read to her. She says everything she became as a teacher started there.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame keeps going back to the coffee shop where he said yes to this job three years ago. Same table, same order, slightly different person. He says he owes it something.",
        reveal:
          "His is the pub — the one near the office where the team goes after a hard week. He said the promotion only felt real when they raised a glass there.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and where they are happiest. The place someone keeps coming back to is always worth knowing.",
        reveal:
          "Somewhere you always come back to, or somewhere you\'ve always meant to go.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite place — where they feel most themselves — is always worth including.",
        reveal:
          "Somewhere you always come back to, or somewhere you\'ve always meant to go.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite place is one of those things that always says something.",
        reveal:
          "Somewhere you always come back to, or somewhere you\'ve always meant to go.",
      },
    },
  },
  {
    title: "Type of holiday",
    description: "How they loved to get away",
    is_finite: false,
    categories: ["Places", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who took exactly one kind of holiday for thirty years and never considered another. Maps, proper boots, no signal, long days, good evenings. She once turned a week in the Lakes into a navigation exercise. Everyone said it was the best holiday they\'d had.",
        reveal:
          "Hers was the walking holiday. Maps, boots, no signal. She said everything else was just going somewhere.",
      },
      tribute: {
        about:
          "A mentor who introduced a whole circle of friends to one kind of holiday they\'d never tried and couldn\'t subsequently do without. He planned them badly, navigated confidently, and stopped at everything interesting. He was perfect company.",
        reveal:
          "His was the city break. He\'d arrive with no plan and come back having seen everything worth seeing. Everyone wanted to go with him.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has a strong position on the best kind of holiday that her friends describe as surprising. She says it is the only genuine holiday. They have tested this claim. She may be right.",
        reveal:
          "Hers is camping. She says it is the only holiday where you actually stop. Her friends were sceptical. They are less sceptical now.",
      },
      retirement: {
        about:
          "David spent thirty-five years with a map on his wall showing a valley he meant to visit properly. He is retiring. The map is coming down. The boots are going on.",
        reveal:
          "His is the countryside retreat. Slow roads, no agenda, one valley he has been saving for this exact moment.",
      },
      wedding: {
        about:
          "Emma and James went on their honeymoon to a place neither of them had been to before, by mutual agreement, which is how they make most decisions and why most of them work out.",
        reveal:
          "Theirs is the beach holiday. They said they\'d earned it. They had.",
      },
      engagement: {
        about:
          "Callum and Sophie have a tradition of going somewhere that requires proper kit and some planning, every winter. The trip that matters most to them happened on one of those.",
        reveal:
          "Theirs is skiing. They started going in their second year together. Callum proposed on a different kind of mountain, but the principle was the same.",
      },
      anniversary: {
        about:
          "Forty years together and they go back to where the family is every few years — not out of obligation, out of genuine preference. They say the best holidays are the ones where you know where everything is.",
        reveal:
          "Theirs is visiting family. They say the best holidays are the ones where you don\'t have to decide anything. The family decides everything.",
      },
      leaving: {
        about:
          "Priya has been talking about a proper long trip for years. The excuses have run out. The diary is her own now. The only thing left is deciding where.",
        reveal:
          "Hers is a staycation — properly done, for the first time. She said she wanted to see the country she\'s been living in. She has a list.",
      },
      graduation: {
        about:
          "Tom has not had a proper holiday since starting architecture school. This is about to change significantly. He has been planning it in some detail.",
        reveal:
          "His is winter sun. Four years of grey. He says he has earned direct sunlight and he intends to collect.",
      },
      christening: {
        about:
          "Lily\'s first holiday will be decided in due course, by committee. Her parents have already started the conversation. It is going well.",
        reveal:
          "Her parents are planning a staycation for her first summer. They say she is not ready for airports. She agrees by not having an opinion.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He has promised himself a holiday that involves no running whatsoever. He has been specific about this.",
        reveal:
          "His is the beach holiday. No training plan, no alarm, no route. He has earned this completely.",
      },
      recovery: {
        about:
          "Claire has been planning a trip since January — not a specific trip, just the idea of one, somewhere slow, somewhere entirely her own. She is now ready to plan the specific version.",
        reveal:
          "Hers is a cruise. Slow, contained, no decisions about where to go next. She said she needed someone else to handle the itinerary for once.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and takes exactly one holiday a year, planned in detail and executed precisely. Her colleagues find this typical. She finds their surprise typical.",
        reveal:
          "Hers is the walking holiday. She plans the route in February, packs in April, and leaves on the same weekend every July. The route changes. The rest does not.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame booked a long weekend within thirty minutes of hearing the news. He did not overthink it. This is, his team will tell you, characteristic.",
        reveal:
          "His is the city break. Decision made in thirty minutes, bags packed by Thursday. He says good decisions shouldn\'t take longer than that.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and what kind of holiday says something true about them. How someone chooses to get away tells you most of what you need to know.",
        reveal:
          "Tell us the holiday you\'d take if time and money were no object.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite kind of holiday — and what it says about how they want to spend their time — is always worth including.",
        reveal:
          "The kind of traveller you are tells you everything you need to know about yourself.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite kind of holiday is one of those things everyone has strong opinions about.",
        reveal:
          "The kind of traveller you are tells you everything you need to know.",
      },
    },
  },
  {
    title: "Way to travel",
    description: "How they loved to get from A to B",
    is_finite: false,
    categories: ["Places", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who always took the train. She said you missed everything if you were in a hurry. She was right about that too — the journey was always part of the point.",
        reveal:
          "Hers was the train. She always said you miss everything if you\'re in a hurry. The journey was part of the point.",
      },
      tribute: {
        about:
          "A mentor who walked everywhere and knew every route. He could tell you the best way between any two points in the city. Every route had been considered. He arrived having noticed things most people drive past.",
        reveal:
          "His was on foot. He could tell you the best way between any two points in the city. Every route considered, every shortcut earned.",
      },
      birthday: {
        about:
          "Sarah once walked fourteen miles to a restaurant rather than take the bus. She said this was reasonable. The restaurant was worth it. Both statements are true, and both tell you what you need to know.",
        reveal:
          "Hers is by bicycle. She says it is the only way to arrive somewhere having actually been there. Her friends are starting to agree.",
      },
      retirement: {
        about:
          "David drove the same route to work for thirty-five years. He is retiring. The car stays. The motorway can go.",
        reveal:
          "His is by car — slow roads only, now. No motorways. He says the motorway was the part of the commute he was doing for someone else.",
      },
      wedding: {
        about:
          "Emma and James got married abroad, which required a conversation about travel that they handled with their usual combination of disagreement and eventual complete agreement.",
        reveal:
          "Theirs is by plane. Emma said it was the only way to arrive somewhere feeling like you\'ve actually left. James agreed immediately.",
      },
      engagement: {
        about:
          "Callum and Sophie walk everywhere when they\'re in the Lake District — not as exercise, just as the natural way to be there. Every significant moment in their relationship has happened on foot.",
        reveal:
          "Theirs is on foot. Boots on, phone away, miles ahead. Every important thing that has happened between them has happened while walking.",
      },
      anniversary: {
        about:
          "They had a motorbike when they first got together in the 1980s and sold it when the children arrived. They have discussed getting another one every few years for forty years. They haven\'t yet.",
        reveal:
          "Theirs was the motorbike. They had one for the first three years. They still talk about it. They are probably going to get another one.",
      },
      leaving: {
        about:
          "Priya cycled to the studio every day for six years and arrived with energy that the team found both useful and slightly exhausting. She says she learned the city from a bicycle. She probably knows it better than anyone.",
        reveal:
          "Hers is by bicycle. She says you only know a city when you\'ve cycled it. Six years of cycling Manchester. She knows it.",
      },
      graduation: {
        about:
          "Tom walked home from his last exam in Manchester rain and says it felt exactly right. He has walked most of the significant distances of the last four years. He has strong views about the thinking you do on foot.",
        reveal:
          "His is on foot. He says the thinking he did walking to and from the studio was at least as useful as the thinking he did in it.",
      },
      christening: {
        about:
          "The family drove to the church together, in too many cars, with too much stuff, which is how the family does most things and which is, they will tell you, the right way to do them.",
        reveal:
          "Theirs is by car. The whole family, too many cars, absolutely fine. That\'s the way it\'s always been done.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He has been known to run to places most people drive to. His colleagues consider this extreme. He considers it normal.",
        reveal:
          "His is on foot. He runs to places people drive to. He says arriving having covered the ground yourself is the only way to earn being somewhere.",
      },
      recovery: {
        about:
          "Claire started walking places she used to drive during her recovery — not for the exercise, but for the different quality of arrival. She says she\'s been walking to things ever since.",
        reveal:
          "Hers is on foot. She started walking places she used to drive. She says arriving having covered the ground changes what you think about the journey.",
      },
      award: {
        about:
          "Amelia cycles to school and says it sets the tone for the day. She has been doing so for twelve years. She has a theory about the connection between how you arrive somewhere and what you do when you get there.",
        reveal:
          "Hers is by bicycle. She says how you arrive somewhere determines what you do when you get there. Twelve years of evidence suggests she\'s right.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame took the train home after hearing the news and says the hour on the train was when it properly landed. He needed the time. The train gave it to him.",
        reveal:
          "His is by train. He said the promotion needed time to become real. The train gave him exactly the right amount.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and how they get from A to B. The way someone travels is a whole character portrait.",
        reveal:
          "How someone gets from A to B says everything you need to know.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite way to travel — and what it says about how they move through the world — is always worth including.",
        reveal: "How someone gets from A to B is a whole character portrait.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite way to travel is one of those things everyone has a position on.",
        reveal: "How someone gets from A to B is a whole character portrait.",
      },
    },
  },
  // ── Infinite — Film & TV ─────────────────────────────────────────────────────
  {
    title: "Film",
    description: "Film they could watch again and again",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who came back to the same film every year without fail. Her children learned the lines before they understood what they meant. They understand them now.",
        reveal:
          "Hers was Brief Encounter. She could quote it entirely from memory. It never seemed to get less affecting.",
      },
      tribute: {
        about:
          "A mentor who watched films with the same attention he brought to everything else — completely, once, in silence. He had a list of films he considered essential. It was not a short list.",
        reveal:
          "His was Lawrence of Arabia. He watched it once a decade and said it was different every time. He was always right about it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has a film she has watched so many times she now watches other people watch it for the first time instead. She considers this a reasonable development.",
        reveal:
          "Hers is Four Weddings and a Funeral. She\'s watched it so many times she now watches other people watching it. She prefers it this way.",
      },
      retirement: {
        about:
          "David always said the best projects had the structure of a good heist film. His team learned not to question this analogy. It turned out to be useful.",
        reveal:
          "His was The Italian Job. He still believes the best projects work like a well-run heist. He has evidence.",
      },
      wedding: {
        about:
          "Emma and James had a long debate about which film best explained their relationship before they realised they\'d been arguing about the same film from different angles. They got married shortly after this.",
        reveal:
          "Theirs was Local Hero. They argued about it for an hour before they\'d introduced themselves. He came around eventually.",
      },
      engagement: {
        about:
          "Sophie and Callum watched a film on their second date that they both, without discussing it, consider theirs. They didn\'t tell each other for over a year. They found out at a wedding.",
        reveal:
          "Theirs is Gregory\'s Girl. Their second date film. Neither of them mentioned it for a year. They found out at a wedding.",
      },
      anniversary: {
        about:
          "Forty years together and there is one film they watch on every anniversary, same as they have for as long as either of them can remember. Different things noticed each time. Same feeling at the end.",
        reveal:
          "Theirs is It\'s a Wonderful Life. Every anniversary. Different things noticed each time. Same feeling at the end.",
      },
      leaving: {
        about:
          "Priya has a film she considers a test. If someone loves it, she knows what she needs to know about them. She applied this logic at the studio for six years. Her track record is good.",
        reveal:
          "Hers was Some Like It Hot. She used it as a character test. Nobody who failed it lasted long.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school with a film he has watched at every major turning point of his life. He says he doesn\'t know why. The film says otherwise.",
        reveal:
          "His is The Shawshank Redemption. He has watched it at every turning point. He says it\'s about persistence. His tutors say it\'s about hope. Both are probably right.",
      },
      christening: {
        about:
          "Lily\'s parents have a plan for her film education. Her father has a hidden agenda involving one specific film at approximately age seven. Her mother is aware of this.",
        reveal:
          "Her parents have not decided yet. Her father has. He is keeping it to himself for now.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He has views about films that involve running and has been known to pause them to explain what they\'re getting wrong about the physiology.",
        reveal:
          "His is Paddington 2. He says it is the most technically correct film about being kind under pressure. This is not a running film. He considers this irrelevant.",
      },
      recovery: {
        about:
          "Claire worked through a list of films she\'d been meaning to watch for years during her recovery — an episode a day, no rushing. She found one she will keep coming back to.",
        reveal:
          "Hers is Casablanca. She watched it for the first time during her recovery. She said she understood immediately why people kept watching it.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and uses films in class whenever she can. She has a list, organised by theme and year. She will tell you it is not a personal preference list. It is. It\'s excellent.",
        reveal:
          "Hers is The Sound of Music. She says it is about what happens when someone with convictions meets a system that doesn\'t share them. Her students find this interesting.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up watching films from two different traditions and has strong views about genre that draw from both. He gives a very good recommendation when asked.",
        reveal:
          "His is Whisky Galore. He says it is the best film about what happens when a community decides to solve its own problem. He applies this principle to product.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which film is entirely theirs. Genre is always more revealing than it seems.",
        reveal: "The film that\'s just entirely yours — which one, and why?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite film — the one they always recommend, or the one they\'ve watched three times — is a detail that opens up a conversation.",
        reveal: "The film that\'s yours — which one is it?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite film is one of those things everyone has strong feelings about.",
        reveal: "The film that\'s just entirely yours — which one, and why?",
      },
    },
  },
  {
    title: "Film genre",
    description: "Kind of story they loved on screen",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who considered a good documentary a serious commitment and watched them with the full attention they deserved. She said they were the only honest films. Her children inherited the habit.",
        reveal:
          "Hers was the documentary. She said they were the only honest films. Her notebooks had recommendations going back thirty years.",
      },
      tribute: {
        about:
          "A mentor who watched films with the same rigour he brought to everything else. He had a genre he returned to above all others and could always name three examples you hadn\'t seen that were exactly right.",
        reveal:
          "His was drama. He\'d name three films you\'d never seen and somehow they were always exactly right for the moment.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has strong views about what comedy is and what it isn\'t, which she will share at some length if invited. She is not wrong about any of it.",
        reveal:
          "Hers is comedy. She has a very specific view of what qualifies. The list is long and well-defended.",
      },
      retirement: {
        about:
          "David always said his career had the structure of a good thriller — procedural, with occasional moments of genuine tension. His team found this more accurate than he intended.",
        reveal:
          "His was the thriller. He said his career was one. His team agreed and didn\'t mention it.",
      },
      wedding: {
        about:
          "Emma and James argued about film on their first date and have been arguing about it since. They agree on one genre absolutely. Everything else is still in dispute.",
        reveal:
          "Theirs is romance. They\'ve agreed on this since their first date. Everything else is still in dispute.",
      },
      engagement: {
        about:
          "Sophie and Callum have one kind of film they always agree on and everything else is a negotiation. The one they agree on is not the one most people would guess.",
        reveal:
          "Theirs is the musical. Neither of them admits this first. It always comes out eventually.",
      },
      anniversary: {
        about:
          "Forty years together and they have watched every kind of film at least once. They have a genre they share completely and have never needed to explain to each other. It has been this way since the beginning.",
        reveal:
          "Theirs is the western. They\'ve never needed to explain it to each other. It\'s just been their genre.",
      },
      leaving: {
        about:
          "Priya has a genre she considers underrated and has been making the case for it since she arrived at the studio. Several people have come around. Nobody admits it.",
        reveal:
          "Hers was science fiction. She said it was the only genre that took ideas seriously. She was right and she knew it.",
      },
      graduation: {
        about:
          "Tom spent four years at architecture school developing a theory about the relationship between crime fiction and urban planning. His tutors found it more convincing than they\'d expected.",
        reveal:
          "His is crime. He has a thesis about crime fiction and how cities are designed. It is more persuasive than it sounds.",
      },
      christening: {
        about:
          "Lily\'s parents have been discussing her film education since before she arrived. They disagree about where to start. They are going to start with animation. This is settled.",
        reveal:
          "Her parents have agreed on animation. This is the one thing they\'ve agreed on. They\'re starting there.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He has strong views about sports films and finds most of them technically incorrect. Animation, he says, is more honest about the human experience.",
        reveal:
          "His is animation. He says it is the only genre that doesn\'t pretend things are simpler than they are. His friends find this surprising. He doesn\'t.",
      },
      recovery: {
        about:
          "Claire watched films she\'d been meaning to watch for years during her recovery. She found one genre worked better than anything else during that time. She chose it deliberately.",
        reveal:
          "Hers is comedy. Not escapism — just genuine laughter. She chose it deliberately and it worked.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She uses films in class whenever she can justify it. Her students have come to understand that documentary day is a serious day.",
        reveal:
          "Hers is the documentary. She uses them like other teachers use textbooks. The results speak for themselves.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He watches films with the same structural interest he brings to products and finds crime the most instructive genre for understanding how systems work.",
        reveal:
          "His is crime. He says it\'s the genre most interested in how systems fail. He applies this to product. It works.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which film genre says something true about them. Genre is always more revealing than it seems.",
        reveal:
          "Some people are epics. Some are comedies. Which genre are you?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite film genre — and what it says about how they see the world — is always worth including.",
        reveal: "Taste in genre is a portrait. Which one is yours?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite film genre is one of those things everyone has a strong position on.",
        reveal:
          "Some people are epics. Some are comedies. Some are both. Which genre are you?",
      },
    },
  },
  {
    title: "TV show",
    description: "Show they always settled in to watch",
    is_finite: false,
    categories: ["Film & TV", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who organised her Sunday evenings around television the way she organised everything else — with clear priorities and no tolerance for interruption. She watched dramas with complete commitment and remembered everything.",
        reveal:
          "Hers was a drama series. She watched with total commitment and took notes. Her children thought she was joking. She was not.",
      },
      tribute: {
        about:
          "A mentor who watched television selectively and seriously. He watched exactly one thing at a time and watched it with full attention. He said anything less was disrespectful to the people who made it.",
        reveal:
          "His was crime. No multitasking, full attention. He said it was the only respectful way to watch. He meant it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has rewatched one series in its entirety to explain it to a friend in enough detail to make the recommendation. She did not consider this excessive. It wasn\'t.",
        reveal:
          "Hers is the sitcom. She has rewatched most of her favourites twice. She knows exactly which episodes to show people first.",
      },
      retirement: {
        about:
          "David spent thirty-five years of early starts and missed most of what happened on a weeknight after nine o\'clock. He has a watch list. It is significant. He is now free to start it.",
        reveal:
          "His starts with period drama. Thirty-five years of missing the television everyone was talking about. He is starting from the beginning.",
      },
      wedding: {
        about:
          "Emma and James have a shared list and a private list. The distinction between them is taken seriously. The shared list requires agreement. The private list is watched on the commute, alone, without discussion.",
        reveal:
          "Theirs is nature documentary. The only thing they always agree to watch together without debate. Everything else is negotiated.",
      },
      engagement: {
        about:
          "Sophie and Callum watch very different television and have developed a system for managing this that both of them consider fair. The one programme they have no system for is the one they both watch immediately.",
        reveal:
          "Theirs is the reality show — specifically one specific one they discovered by accident and have never explained to anyone. They don\'t intend to.",
      },
      anniversary: {
        about:
          "Forty years of evenings together, and the television has been a constant in all of them. They have strong and completely compatible views about what they like to watch. They consider this one of the foundations.",
        reveal:
          "Theirs is the quiz show. Same sofa, same time, same shouting at the television. Forty years of the same arrangement. It has never needed to change.",
      },
      leaving: {
        about:
          "Priya\'s television recommendations were always worth taking. She watched selectively, remembered everything, and had an uncanny sense of which series a specific person would love. The team benefited from this for six years.",
        reveal:
          "Hers was cooking shows. She said they were the most optimistic genre of television. She was right.",
      },
      graduation: {
        about:
          "Tom has a complicated relationship with television — too busy during term, then watching four episodes at a time during the holidays. He has seen approximately half of everything he\'s started and is sanguine about it.",
        reveal:
          "His is the soap opera. He says he respects the ambition of something with no end. His tutors found this argument more convincing than they expected.",
      },
      christening: {
        about:
          "Lily\'s parents have strong views about how much television is appropriate for a small child. They have agreed on a position. They reserve the right to revise it as tiredness increases.",
        reveal:
          "Her parents have agreed: no television until she\'s three. Both of them believe this. One of them will crack first.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He watched sports documentaries on rest days as research, he says. His training log agrees.",
        reveal:
          "His is sport. He watched every marathon documentary he could find during training. He says it was preparation. It was also just television he loved.",
      },
      recovery: {
        about:
          "Claire worked through a series she\'d been putting off for three years during her recovery — an episode at a time, no rushing. She says it was one of the most reliable pleasures of a difficult period.",
        reveal:
          "Hers was a drama series. She watched it slowly, an episode a day. She says the pacing was the point.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and recommends television to her students the way other teachers recommend books. She has not recommended a bad one. They have checked.",
        reveal:
          "Hers is the period drama. She says it is the form that takes character most seriously. Her students have learned to trust her on this.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He watches television with the structural interest he brings to products and finds the genre that most rewards close attention.",
        reveal:
          "His is crime. He saved a series for the promotion. He said some things deserve to be waited for.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which television programme says something true about them. A series someone returns to is always worth knowing.",
        reveal: "The one you\'d watch with anyone, any time. Which one is it?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite television programme — the one they always recommend — is a detail worth including.",
        reveal: "Pick the show that captures something true about you.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite television programme is one of those things everyone has strong feelings about.",
        reveal: "Pick the show that captures something true about you.",
      },
    },
  },
  // ── Infinite — Music ─────────────────────────────────────────────────────────
  {
    title: "Song",
    description: "Song that reminds you of them",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who sang under her breath without noticing she was doing it. Her children knew every word to songs they hadn\'t consciously learned. She had a hymn for every occasion.",
        reveal:
          "Hers was Jerusalem. She\'d sing along under her breath. Every time. Always the same verse first.",
      },
      tribute: {
        about:
          "A mentor who had a song for every mood and occasion — he said this as a joke and meant it entirely. His team learned to pay attention to what he played at the end of a long week.",
        reveal:
          "His was Waterloo Sunset. He said it made London feel worth everything. He played it on Friday evenings and everyone understood.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with a playlist she updates monthly and would share with anyone who asks. She has strong views about which songs go where. The order is non-negotiable.",
        reveal:
          "Hers is Angels. She turns the volume up every time. She has never once apologised for this.",
      },
      retirement: {
        about:
          "Thirty-five years in the same company and David\'s team knows exactly which song belongs to his leaving do. He will not have chosen it himself. He will not object.",
        reveal:
          "His is My Way. Not his choice. Entirely right. He will deny that he cried.",
      },
      wedding: {
        about:
          "Emma and James spent an entire evening arguing about which song to play first at their wedding and compromised on something that was neither of their first choices and turned out to be perfect. They are both very good at this.",
        reveal:
          "Theirs was What a Wonderful World. Not either of their first choices. Completely right. They haven\'t argued about it since.",
      },
      engagement: {
        about:
          "Sophie and Callum have a song that came on by accident at the wrong moment in their relationship and became, for reasons neither of them can fully explain, entirely theirs.",
        reveal:
          "Theirs is Don\'t Look Back in Anger. It came on in a pub on their third date. Nobody planned it. They haven\'t been able to hear it as someone else\'s song since.",
      },
      anniversary: {
        about:
          "Forty years together and there is a song from the early years that still comes on and makes them both stop what they\'re doing. They have never discussed this. They don\'t need to.",
        reveal:
          "Theirs is Wind Beneath My Wings. It came on at their wedding. It\'s been theirs ever since. Neither of them chose it to be. It just is.",
      },
      leaving: {
        about:
          "Priya put together a leaving playlist for herself and shared it with no one until the party, at which point it turned out to be the best thing anyone had heard at a work event. Several people asked for the list. She sent it.",
        reveal:
          "Hers was Bohemian Rhapsody. Nobody expected it. Everyone understood it immediately.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school with a playlist that functions as a complete autobiography of the four years. He played it on the train home. He has played it three times since and will not be explaining why.",
        reveal:
          "His is You\'ll Never Walk Alone. He didn\'t choose it for the obvious reasons. He chose it for his own reasons. He keeps those to himself.",
      },
      christening: {
        about:
          "Everyone in this family has a song they want Lily to know when she\'s old enough. We are keeping the list. We will share it with her at the right moment.",
        reveal:
          "She\'ll find her own. For now, everyone here has one they\'d want her to know.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll — the charity that keeps the coastline he trained on safe. He had a song planned for the finish line from mile fourteen onwards.",
        reveal:
          "His was Abide With Me. He chose it for the coast, for the RNLI, for what the finish line meant. It was exactly right.",
      },
      recovery: {
        about:
          "Claire says there was one song more than any other that got her through — not because it was cheerful, but because it meant something that she needed it to mean at that particular time.",
        reveal:
          "Hers was Danny Boy. She played it on repeat through the hardest months. She says she\'s not sure she can explain why. She doesn\'t have to.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She played a song at the start of every term for years — same song, every September, without explanation. Her former students still remember it.",
        reveal:
          "Hers is Angels. She played it every September. Year 7s who\'ve since graduated still mention it. The song did something she never fully explained.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He played a song on the walk home after hearing the news and says it was the right song for the moment in every possible way.",
        reveal:
          "His is My Way. He played it on the walk home. He says he didn\'t choose it for the obvious reason. He said it was just the right tempo.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which song is entirely theirs. The song someone turns up every time is always worth knowing.",
        reveal: "The one that plays and takes you somewhere — which one is it?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite song — the one they turn up every time, or the one they play when nobody else is listening — is worth including.",
        reveal:
          "The song that plays and instantly takes you somewhere — what is it?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite song is one of the most personal things there is.",
        reveal:
          "The song that plays and instantly takes you somewhere — what is it?",
      },
    },
  },
  {
    title: "Music genre",
    description: "Music that moved them",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had strong views about what made a good song. She listened to one kind of music above all others and could explain exactly why it was the best. Her children eventually agreed.",
        reveal:
          "Hers was folk. She said it was the only music that told the truth. She knew every word to every song she loved.",
      },
      tribute: {
        about:
          "A mentor who lived in one kind of music and thought everyone should. He wasn\'t evangelical about it — he just quietly played the right things at the right moments until you understood.",
        reveal:
          "His was jazz. He wasn\'t evangelical. He just kept playing the right things until everyone around him understood.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and her taste is wide and eclectic, which is what she will tell you. Her Spotify Wrapped tells a different story, consistently, every year. She accepts this with good grace.",
        reveal:
          "Hers is pop — specifically nineties pop, if you ask her Spotify. She\'ll tell you she listens to everything. She does. Pop wins anyway.",
      },
      retirement: {
        about:
          "David had the same CDs in the car for twenty years and considered this perfectly normal. His team found it consistent. His family found it predictable. He found it correct.",
        reveal:
          "His was rock. Twenty years of the same CDs in the same car. He never wavered once.",
      },
      wedding: {
        about:
          "Emma and James each come from different musical traditions and together they make something without a name that works perfectly. Their wedding playlist was, by general agreement, the best part of the evening.",
        reveal:
          "Theirs is soul. She brought it to the relationship. He agreed immediately. The wedding playlist reflected this.",
      },
      engagement: {
        about:
          "Sophie and Callum discovered, on their third date, that they had been listening to the same music for years from entirely different backgrounds and for entirely different reasons. They have been unable to fully explain this.",
        reveal:
          "Theirs is country. Neither of them was expecting this. Both of them accept it.",
      },
      anniversary: {
        about:
          "Forty years of shared music, and they have never quite agreed on a genre — except one. That one has been theirs since the beginning and has never required discussion.",
        reveal:
          "Theirs is blues. They found it together in 1984 and it has never belonged to anyone else.",
      },
      leaving: {
        about:
          "Priya\'s music taste was, like everything else about her, specific and confident. The studio\'s shared playlist changed character the day she arrived and has been quieter since she left.",
        reveal:
          "Hers was electronic. She played it at the right volume and the right time. The playlist hasn\'t been the same since.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school having spent most of the last year in the studio with one kind of music playing in the background. He says it was for the focus. His studio-mates found it calming. Everyone agrees it worked.",
        reveal:
          "His is classical. He came to it in his final year and hasn\'t left. He says it\'s the music that gets out of the way and lets you work.",
      },
      christening: {
        about:
          "Lily will grow up in a house full of music. Her parents have very different views about which kind. She will have access to all of it and will form her own opinion.",
        reveal:
          "She\'ll find her own genre. Both her parents have strong views about which one it should be. She\'ll ignore both of them.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He trained to one kind of music for eight months and says it carried him through every difficult mile.",
        reveal:
          "His is hip-hop. Eight months of training, same playlist, same genre. He says it\'s the music that knows what effort feels like.",
      },
      recovery: {
        about:
          "Claire found one kind of music worked better than anything else during her recovery. She couldn\'t explain it logically. She didn\'t need to.",
        reveal:
          "Hers is musical theatre. She couldn\'t say why it helped. It just kept the room from being quiet in the wrong way.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She teaches a music unit that her students consider the best week of the year. She plays one genre and defends it rigorously. She is always right.",
        reveal:
          "Hers is soul. She says it is the only genre that has never been dishonest. Her students find this argument convincing.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He has a theory about jazz and product thinking that he has given as a talk three times. It always lands.",
        reveal:
          "His is jazz. He says it is the music that understands iteration. He has given a talk about this. It\'s a good talk.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which kind of music is most theirs. Taste in music is a portrait.",
        reveal: "Taste in music is a portrait. Which genre is yours?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite music genre — and what it gives them — is always worth including.",
        reveal:
          "Taste in music is a portrait. Which genre is yours, and what does it reveal?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite music genre is one of those things everyone has strong feelings about.",
        reveal:
          "Taste in music is a portrait. Which genre is yours, and what does it reveal?",
      },
    },
  },
  {
    title: "Music era",
    description: "Golden age of music for them",
    is_finite: false,
    categories: ["Music", "Time"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who could tell you where she was when she heard every important record of one particular decade. She kept the albums. Her children have them now.",
        reveal:
          "Hers was the seventies. Soul and funk, specifically. She said it was the decade that understood what music was for.",
      },
      tribute: {
        about:
          "A mentor whose cultural reference points were all rooted in one era, and who made this feel like a gift rather than a limitation. He brought everything back to one decade and made it seem relevant every time.",
        reveal:
          "His was the swinging sixties. He had evidence for this position going back thirty years. The evidence was compelling.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one decade rooted in her bones that she would not trade for anything. She knows every B-side and every album track. She does not consider this a niche interest.",
        reveal:
          "Hers is the eighties. She knows every B-side from 1984 to 1989. She considers this a reasonable amount of knowledge.",
      },
      retirement: {
        about:
          "David has a theory about rock and roll and engineering — about how one kind of ambition produces another — that his team has heard in several forms over thirty-five years. He has retired. The theory remains.",
        reveal:
          "His was rock and roll. He has a theory about what it and engineering have in common. He\'s been refining it for thirty-five years.",
      },
      wedding: {
        about:
          "Emma and James grew up in parallel musical worlds and discovered, on their first date, that they had been listening to the same things without knowing. The wedding playlist covered it extensively.",
        reveal:
          "Theirs is nineties indie and dance. They grew up to the same music without knowing each other. The wedding playlist made this plain.",
      },
      engagement: {
        about:
          "Sophie and Callum were born the same year and discovered they\'d been listening to the same music since they were teenagers. They found this out in their second year together. It changed how they thought about the relationship.",
        reveal:
          "Theirs is the noughties. Same music, same age, different cities. They found out on their third date.",
      },
      anniversary: {
        about:
          "They got together to music they still play, and the era it came from is still theirs in a way that nothing since has managed to be. Forty years and that decade remains the one they share most completely.",
        reveal:
          "Theirs is the jazz age — not because they lived through it, but because they found it together as students and it has belonged to them since.",
      },
      leaving: {
        about:
          "Priya grew up between two musical traditions and had a decade she claimed as entirely her own — a decade that explained who she was and where she came from simultaneously.",
        reveal:
          "Hers was the noughties. She arrived already shaped by it. The studio understood her better once they knew this.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school having spent four years studying buildings that belong to one era and music that belongs to another. The two things are connected, he says. His tutors now agree.",
        reveal:
          "His is nineties indie and dance. He says it was the era when things were being built and broken at the same time. He applies this to architecture.",
      },
      christening: {
        about:
          "Lily arrives in an era that hasn\'t finished deciding what it is. She\'ll grow up in it and it will be hers in ways none of us can predict. That\'s the point.",
        reveal:
          "She\'ll have the streaming era. All of it, all at once. She\'ll find her own decade within it.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He trained to music from one era almost exclusively and says it was the only thing that got him through the difficult miles.",
        reveal:
          "His is seventies soul and funk. He says it is the music that knows what hard work feels like from the inside.",
      },
      recovery: {
        about:
          "Claire went back to the music of a specific era during her recovery — the one that had felt most like itself when she first heard it, and which still did.",
        reveal:
          "Hers is the swinging sixties. She said it was the era that believed things could change. She needed that.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She teaches a music history unit on one era that her students consider the best lesson of the year. She says the era matters because it was when music became something young people owned.",
        reveal:
          "Hers is the jazz age. She says it was the first era that understood that music could be both serious and joyful simultaneously. Her students find this interesting.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He has a map of how music has changed from one era to the next that he uses as a model for thinking about product evolution.",
        reveal:
          "His is the streaming era. He says it\'s the era that made everything available and forced people to choose properly. He applies this to product every day.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which music era they feel most themselves in. The era someone returns to is always the one that formed them.",
        reveal:
          "An era that seems to have been made exactly for you — which one?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite music era — and what it gave them — is always worth including.",
        reveal:
          "An era of music that seems to have been made exactly for you — which one, and why?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite music era is one of those things everyone has a strong position on.",
        reveal:
          "An era of music that seems to have been made exactly for you — which one, and why?",
      },
    },
  },
  {
    title: "Instrument",
    description: "Sound that moved them most",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who played the piano quietly, for herself, for fifty years. She never performed. She just played. Her children heard it through the walls.",
        reveal:
          "Hers was the piano. She played it every evening. Never for anyone else. That was the whole point.",
      },
      tribute: {
        about:
          "A mentor who kept a guitar in his office for twelve years and used it to end difficult meetings by changing the subject abruptly. This worked more often than it should have. Nobody questioned it.",
        reveal:
          "His was the guitar. Nothing impressive, always enough. He kept one in the office for twelve years. It ended more meetings than any agenda.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has been playing the violin since she was eight with more ambition than technical precision. Her neighbours have opinions about the Tuesday evening sessions. She does not solicit these opinions.",
        reveal:
          "Hers is the violin. She\'s been playing since she was eight. The ambition has always exceeded the execution. This has never once put her off.",
      },
      retirement: {
        about:
          "David is retiring with a plan to return to the cello he put down at twenty-two when work became more important. The cello is still there. It has been waiting.",
        reveal:
          "His is the cello. He played until he was twenty-two and then didn\'t. It has been in the sitting room for thirty-five years. He is going back to it.",
      },
      wedding: {
        about:
          "Emma had a specific vision for the music at her wedding that she had held for years before she met James. He heard it described and agreed immediately. This remains one of the things she holds against him.",
        reveal:
          "Theirs was the harp. She\'d known for years. He agreed without hesitation. She found this suspicious.",
      },
      engagement: {
        about:
          "Sophie and Callum discovered a shared musical enthusiasm on their second date that neither of them had mentioned before. It is not the obvious one. They find this part of the story.",
        reveal:
          "Theirs is the accordion. Neither of them can explain it. Both of them are certain.",
      },
      anniversary: {
        about:
          "There has been a keyboard in their house for forty years. She plays it occasionally. He never has. Neither of them has ever suggested removing it.",
        reveal:
          "Theirs is the organ. The keyboard in the sitting room has been there since they moved in. She plays it. He listens. This has been the arrangement for forty years.",
      },
      leaving: {
        about:
          "Priya played tabla as a child and says she never got good enough for it to matter. Her colleagues who heard her play at the studio summer event disagree. She says they\'re being polite. They are not.",
        reveal:
          "Hers was the drums — tabla specifically. She says she was never good enough. She is wrong.",
      },
      graduation: {
        about:
          "Tom played French horn in his school orchestra for six years and considers it the thing he most regrets giving up. He is not sure what he would do with it now. He thinks about it regularly.",
        reveal:
          "His was the trumpet. He played through school and gave it up for architecture. He still hasn\'t forgiven himself.",
      },
      christening: {
        about:
          "Lily\'s grandmother has already suggested piano lessons. Her parents have said they\'ll wait and see what she gravitates towards. The piano is available. The grandmother has made this clear.",
        reveal:
          "Her grandmother has opinions. Her parents are keeping an open mind. The piano is waiting in the background.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He plays one instrument badly and considers this the correct relationship to have with music.",
        reveal:
          "His is the banjo. He plays it to a basic standard, which he considers exactly right. He is not trying to get better. He is not trying to get worse.",
      },
      recovery: {
        about:
          "Claire started playing again during her recovery — slowly, quietly, from memory. She hadn\'t touched it since her twenties. She says it was not for anyone else to hear. That\'s why it helped.",
        reveal:
          "Hers is the flute. She played through school and put it away for twenty years. She found it again. She says it remembered her.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and once arranged for a musician to play in her classroom on the last day of term, funded by arts budget she\'d been quietly not spending for three years. Her students still mention it.",
        reveal:
          "Hers is the saxophone. She arranged for one to play in her classroom once. The students still mention it. She has never explained where the budget came from.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He sings — not casually, properly, in a choir he has attended every Thursday for four years without telling anyone at work.",
        reveal:
          "His is the voice. He\'s been in a choir for four years. He told his team after the promotion. They found this completely typical.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and whether there\'s an instrument that says something true about them. Played, given up, or just admired — it\'s always a good detail.",
        reveal:
          "The sound that moves something in you — which instrument, and what does it do?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite instrument — or one they play, or wish they\'d learned — is a detail that opens up something interesting.",
        reveal:
          "The sound that moves something in you — which instrument, and what does it do?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite instrument is one of those choices that always says something.",
        reveal:
          "The sound that moves something in you — which instrument, and what does it do?",
      },
    },
  },
  {
    title: "Type of song",
    description: "Kind of song they always came back to",
    is_finite: false,
    categories: ["Music", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who knew every hymn and every lullaby and could move between them without thinking. She sang in the kitchen without noticing she was doing it. Her children knew every word before they knew they\'d learned them.",
        reveal:
          "Hers was the hymn. She said they were just the best folk songs. She knew every verse of every one she loved.",
      },
      tribute: {
        about:
          "A mentor who could always find the right song for the right moment — a leaving do, a celebration, a difficult afternoon. He had an instinct for the song that contained the whole situation. It was, everyone agreed, a gift.",
        reveal:
          "His was the song that tells a story. He said the best songs were the ones that went somewhere. He was right.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has a very clear position on birthday songs: they must be in the right key, sung with conviction, and not ended awkwardly. She has been to enough birthday dinners to have strong views on all three.",
        reveal:
          "Hers is the anthem. She has a karaoke setlist that has been in development for years. It is ambitious. It suits her completely.",
      },
      retirement: {
        about:
          "Thirty-five years in the same company and David sat through his send-off with the composure of someone who had been quietly dreading the singing part. He was wrong to worry. They got it exactly right.",
        reveal:
          "His is the song that makes you cry. He sat through his send-off with complete composure until the song. Then he didn\'t.",
      },
      wedding: {
        about:
          "Emma and James\'s story started as a love song and has had the texture of something more complicated and more true ever since. They chose the music for their wedding very carefully. It was right.",
        reveal:
          "Theirs is the love song. It started there and stayed there. The best ones do.",
      },
      engagement: {
        about:
          "Sophie and Callum share a musical tradition they discovered together on their second date, at a gig neither of them was particularly expecting to be at. It has been theirs ever since.",
        reveal:
          "Theirs is folk. Sophie says the best songs are the ones you already know the second time you hear them. Callum wrote this down.",
      },
      anniversary: {
        about:
          "Forty years together and there are songs they share from before they knew each other that have become part of the story — songs from before they met that feel, now, like they belong to both of them.",
        reveal:
          "Theirs is the song from childhood. Songs they knew before they met each other that now belong to both of them. They have never agreed on which ones qualify. The argument is part of it.",
      },
      leaving: {
        about:
          "Priya\'s leaving playlist was, by general agreement, the best thing anyone had heard at a work event. Nobody had known she had strong opinions about show tunes. She had kept this extremely well-hidden.",
        reveal:
          "Hers was the show tune. Nobody knew. The leaving do revealed it. The studio is still talking about the playlist.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school and immediately put on a playlist that had nothing to do with anything he\'d studied and everything to do with how he felt. His housemates joined in. The neighbours did not.",
        reveal:
          "His is the song that makes you dance. The graduation playlist had one function. It performed that function completely.",
      },
      christening: {
        about:
          "Lily\'s parents have been singing to her since she was born — different songs, different voices, no consensus on what constitutes appropriate. She has opinions about this already. They are non-verbal but clear.",
        reveal:
          "She has very clear feelings about lullabies. Specifically, she has rejected three so far. The search continues.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He had a song planned for the final mile from the beginning of training. He says it was part of the preparation.",
        reveal:
          "His is the anthem. He knew which one before he started training. He played it at mile twenty-five. It did exactly what it was supposed to do.",
      },
      recovery: {
        about:
          "Claire says there was a type of song that worked during her recovery when other kinds didn\'t — not because it was cheerful, but because it meant something specific that she needed it to mean.",
        reveal:
          "Hers is the song that makes you cry. She chose it deliberately. She says crying about the right thing is entirely different from crying about everything.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She plays one type of song at the start of every term. She has been doing this for twenty years. Her students across those years remember it.",
        reveal:
          "Hers is the hymn. She means it literally and as a metaphor for teaching. Both interpretations hold.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He celebrated with a specific kind of song and says there was no other kind that would have been right for the moment.",
        reveal:
          "His is the anthem. Not a ballad, not a love song — something with propulsion. He was right about this.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which kind of song is most theirs. Love song, anthem, hymn, lullaby — they all say different things.",
        reveal: "Love song, anthem, hymn, lullaby — which type is yours?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite type of song — and what it gives them — is worth including.",
        reveal:
          "Love song, anthem, hymn, lullaby — which type is yours, and what does it give you?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite type of song is one of those things everyone has a position on.",
        reveal:
          "Love song, anthem, hymn, lullaby — which type is yours, and what does it give you?",
      },
    },
  },
  // ── Infinite — Food & Drink ──────────────────────────────────────────────────
  {
    title: "Drink",
    description: "Their go-to cup or glass",
    is_finite: false,
    categories: ["Food & Drink", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who made tea for everyone who came through her door, without asking whether they wanted any. The kettle was the first thing on. The pot came second. That was the order of things.",
        reveal:
          "Hers was tea. Proper loose leaf, pot on the table. She said everything worth talking about happened over tea. She had a point.",
      },
      tribute: {
        about:
          "A mentor who never drank alone. He had something good in the cabinet and he opened it for the right conversations. His colleagues learned that a particular invitation meant something important was about to be decided.",
        reveal:
          "His was whisky. He never drank alone. The bottle came out when something mattered. Everyone understood this.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with opinions about coffee that have grown more specific every year. She has opinions about brewing methods, bean origins, and milk temperatures. Her friends have stopped arguing. She is always right.",
        reveal:
          "Hers is coffee. The opinions are extensive and correct. She has never ordered the wrong thing.",
      },
      retirement: {
        about:
          "David spent thirty-five years drinking bad coffee in the office and good wine at home on Fridays. He is retiring. The ratio is about to change significantly in favour of the wine.",
        reveal:
          "His is red wine. He kept it for Fridays for thirty-five years. He is now planning to reconsider the schedule.",
      },
      wedding: {
        about:
          "Emma and James chose the drinks for their wedding with the same combination of disagreement and final complete agreement that characterises most of their decisions. The result was correct.",
        reveal:
          "Theirs was champagne. They said it was for the occasion. It was also just the right drink for them.",
      },
      engagement: {
        about:
          "Sophie and Callum have a drink they associate with good evenings — which is most evenings — and a drink they associate with evenings that have turned into something important. These are not always the same drink.",
        reveal:
          "Theirs is gin and tonic. The engagement was celebrated with one. It was, they say, the correct drink for the occasion and the person.",
      },
      anniversary: {
        about:
          "Forty years of evenings together, and there is a drink they share at the end of certain days that has no agenda and no occasion. It just means the day is done and they are still here.",
        reveal:
          "Theirs is hot chocolate. Same mugs, same time, same lack of conversation required. That\'s the drink.",
      },
      leaving: {
        about:
          "Priya has a drink she orders every time something good happens. Her colleagues learned to read this as a signal. Tonight qualifies by any standard.",
        reveal:
          "Hers is stout. She said it was the only drink that tasted like it meant it. She ordered it every time something was worth celebrating.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school and went to the pub with his housemates. This was the plan from the beginning of first year. The drink was decided four years ago.",
        reveal:
          "His was beer. He\'d been planning the first pint after the final submission since year one. It was exactly right.",
      },
      christening: {
        about:
          "The family raised a glass for Lily. Some of those glasses had juice in them. This was considered appropriate. Nobody mentioned it.",
        reveal:
          "Everyone raised something. Lily\'s was juice. She seemed satisfied.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He crossed the finish line and someone handed him something that tasted better than anything he\'d had in eight months of training.",
        reveal:
          "His was beer. The first pint after the finish line. 26.2 miles. He says nothing has ever tasted better. He is right.",
      },
      recovery: {
        about:
          "Claire found that one drink became a ritual during her recovery — same time, same mug, same routine. She says it was a small thing that held the day together.",
        reveal:
          "Hers is tea. Same mug, same time, every day. She said the routine was the point.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. Her staffroom tea is apparently legendary. She makes it once a day at exactly the same time and the staff know to be there.",
        reveal:
          "Hers is tea. Made at eleven, every day, for thirty years. The staff know the time.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He made himself a specific drink on the evening he heard the news and says the ritual of making it was the moment it became real.",
        reveal:
          "His is coffee. Two sugars, made slowly. He\'d been making it the same way since year one. That night he made it like it mattered. It did.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and what they drink when something is worth celebrating. The cup or glass says something.",
        reveal:
          "The cup or glass that belongs to you more than any other — which one?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite drink — what they make when they need to think, or order when something is worth marking — is always a worthwhile detail.",
        reveal: "The cup or glass that belongs to you more than any other.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite drink is one of those things everyone keeps coming back to.",
        reveal:
          "The cup or glass that belongs to you more than any other — which one, and why?",
      },
    },
  },
  {
    title: "Comfort food",
    description: "Food that felt like a hug",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had a dish she made for anyone who needed it — not a grand gesture, just the thing that arrived when it was needed. She\'d leave it on the doorstep with a note. The note was always short.",
        reveal:
          "Hers was shepherd\'s pie. She\'d leave it in the oven and say she\'d barely done anything. She had done everything.",
      },
      tribute: {
        about:
          "A mentor who made exactly one dish and made it perfectly. His colleagues were invited to eat it at key moments — a project finished, a difficult period ended, a reason to gather. Nobody knew what was in it.",
        reveal:
          "His was soup — one specific soup, his recipe, which he never wrote down. His colleagues have been trying to recreate it ever since. They haven\'t.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and makes no apologies for her relationship with one comfort food that she considers both a treat and a right. Her friends have stopped pretending they feel differently.",
        reveal:
          "Hers is fish and chips. She says they are the only food that cannot be improved upon. She has been making this argument for twenty years.",
      },
      retirement: {
        about:
          "Thirty-five years of desk lunches and David is retiring with a specific plan for Sundays. The plan involves a table, a proper meal, and no emails. He has been planning it since 2017.",
        reveal:
          "His is a roast dinner. He ate at his desk for thirty-five years. He is now planning the standing Sunday table. Everything else is detail.",
      },
      wedding: {
        about:
          "Emma and James have strong opinions about pasta and have been arguing about the best kind since their first meal together. The argument has produced useful research. They are both better cooks for it.",
        reveal:
          "Theirs is pasta. Specifically, one of his recipes and one of hers. They\'ve been arguing about which is better for five years. Both are good.",
      },
      engagement: {
        about:
          "Sophie and Callum have a Sunday evening ritual that has been part of the relationship since the second month. It involves the same ingredients in a slightly different arrangement every time. Neither of them has ever suggested changing it.",
        reveal:
          "Theirs is scrambled eggs. Sunday evening, simple, always exactly right. The specific recipe is disputed. The outcome never is.",
      },
      anniversary: {
        about:
          "Forty years of Sundays together and there is a pudding that has appeared on the table at the end of enough of them to constitute a tradition. Neither of them decided this. It just became the thing.",
        reveal:
          "Theirs is bread and butter pudding. Her mother\'s recipe, unchanged for forty years. It appears at the right moments. Nobody decides when those are.",
      },
      leaving: {
        about:
          "Priya once brought something in for no reason and transformed the mood of the whole studio. Nobody had asked. She had just decided the moment called for it. It called for it more than anyone had realised.",
        reveal:
          "Hers was cottage pie. No occasion, no explanation. Just the right thing at the right time. The studio has missed it.",
      },
      graduation: {
        about:
          "Tom survived four years of architecture school on approximately three ingredients and has strong opinions about all of them. He is now free to eat differently. He is starting slowly.",
        reveal:
          "His is toast. He has very strong opinions about it after four years of living on it. The opinions are specific and probably correct.",
      },
      christening: {
        about:
          "The family gathered after the christening and fed each other in the way that families do at these occasions — generously, slightly chaotically, and with complete satisfaction.",
        reveal:
          "There was porridge the next morning. Her grandmother made it. That felt right.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He had one meal planned from mile fourteen onwards. It was specific. He had earned it completely.",
        reveal:
          "His was a bacon sandwich. He planned it from mile fourteen. It was the best thing he\'d eaten in eight months.",
      },
      recovery: {
        about:
          "Claire had a friend who brought the same thing every time she visited during the recovery — not because it had been discussed, but because the friend understood what was needed without being told.",
        reveal:
          "Hers is soup. Her friend brought it every visit without being asked. That is the friend, and that is the soup.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and celebrates every win of any kind with the same food she has celebrated with since she was a child. The scale of the occasion does not change the choice.",
        reveal:
          "Hers is shepherd\'s pie. Her mother made it for every good thing that happened. She has continued this practice. It always works.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame and his partner cooked together to celebrate the promotion. They didn\'t go out. They stayed in, made the thing they always make together, and it was exactly right.",
        reveal:
          "His is pasta — one specific recipe, made together, on the evenings that matter. The promotion earned it.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which comfort food is entirely theirs. The food someone reaches for says something true.",
        reveal: "The food that brings you back somewhere — what is it?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite comfort food — the one they make when they need it most — is always worth including.",
        reveal:
          "The food that\'s entirely yours — what is it and what does it remind you of?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite comfort food is one of those things everyone has strong feelings about.",
        reveal:
          "The food that\'s entirely yours — what is it and what does it remind you of?",
      },
    },
  },
  {
    title: "Biscuit",
    description: "One they always reached for",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who always had a tin of biscuits on the table for visitors. The tin appeared the moment anyone came through the door. That was the signal everything was fine.",
        reveal:
          "Hers were hobnobs. She put the tin down the moment anyone arrived. That was the signal everything was going to be fine.",
      },
      tribute: {
        about:
          "A mentor whose office always had a good tin. He had views about biscuits that his colleagues had not expected and could not subsequently forget. The right biscuit for the right conversation.",
        reveal:
          "His was the digestive. Plain, exactly right for every serious conversation. He had a theory about this. It held up.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has a position on biscuits that she will not be changing. She delivers it with conviction. Her friends have stopped testing it.",
        reveal:
          "Hers is the Bourbon. She has held this position since she was seven. It has never wavered.",
      },
      retirement: {
        about:
          "David spent thirty-five years eating the wrong biscuits in the wrong meeting rooms. He is retiring with very specific plans about this. The plans begin immediately.",
        reveal:
          "His is shortbread. He spent thirty-five years with a Rich Tea in hand. He has known for years what he actually wanted. The time has come.",
      },
      wedding: {
        about:
          "Emma and James discovered early in the relationship that their biscuit preferences were completely incompatible and have spent five years finding this amusing rather than concerning.",
        reveal:
          "Hers is the chocolate digestive. His is something different. They\'ve agreed to disagree. The tin has both.",
      },
      engagement: {
        about:
          "Sophie and Callum have a biscuit they eat on every walk in the Lake District. It is non-negotiable. It is in the bag before anything else. It has been this way since their second walk together.",
        reveal:
          "Theirs is the ginger nut. Every walk, without fail. Sophie says it was her idea. Callum says it was his. Both are claiming credit for a good decision.",
      },
      anniversary: {
        about:
          "Forty years together and the biscuit tin has always had the same biscuits in it. She buys them. He refills them. This has been the arrangement for forty years. Neither of them has ever questioned it.",
        reveal:
          "Theirs is the custard cream. She buys the tin. He refills it. This has been the division of labour that has sustained forty years.",
      },
      leaving: {
        about:
          "Priya always brought the right biscuit without explaining why. Not the obvious choice, not the crowd-pleaser — the one that was right for the moment. The team have missed this more than they expected.",
        reveal:
          "Hers was the Viennese Whirl. Nobody else in the office bought them. Nobody asked her to. They were always exactly right.",
      },
      graduation: {
        about:
          "Tom got through finals on a specific biscuit chosen for its properties — he has strong views about what a biscuit should do at eleven o\'clock on a deadline night. His views are specific and correct.",
        reveal:
          "His was the Rich Tea. He has strong views about why. They involve structural integrity and dunking properties. The degree agrees with him.",
      },
      christening: {
        about:
          "Someone brought biscuits to the christening. This was the right call. Everything was better for it.",
        reveal:
          "The right biscuits appeared at the right moment. This is all that needs to be said.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He had a specific post-marathon breakfast planned. The biscuit was part of it. He had thought about this since mile nine.",
        reveal:
          "His was the hobnob. Part of the post-marathon breakfast he\'d planned since mile nine. He ate three. He had earned them.",
      },
      recovery: {
        about:
          "Claire\'s sister always brought biscuits when she visited during the recovery — not the obvious ones, exactly the right ones. She knew without being told. This is the kind of sister she is.",
        reveal:
          "Hers is the Bourbon. Her sister brought them every time. Not because anyone asked. Because she knew.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. Her classroom biscuit tin is an institution. It has never been empty. She has never explained how. The students have long since stopped asking.",
        reveal:
          "Hers is the ginger nut. It\'s never empty. She\'s never explained how. The students accept this.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame brought biscuits to the team on his first day as Head of Product. He chose them carefully. His team consider this characteristic.",
        reveal:
          "His are chocolate hobnobs. He chose them deliberately. That\'s the kind of Head of Product he is.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which biscuit is entirely theirs. There is always a right biscuit for the right person.",
        reveal:
          "There\'s always a right biscuit for the right person. Which one is entirely yours?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite biscuit — the one they always reach for — is a small detail that says something larger.",
        reveal:
          "There\'s always a right biscuit for the right person. Which one is entirely yours?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite biscuit is one of those things everyone has a strong position on.",
        reveal:
          "There\'s always a right biscuit for the right person. Which one is entirely yours?",
      },
    },
  },
  // ── Infinite — Sport ─────────────────────────────────────────────────────────
  {
    title: "Sport to watch",
    description: "Game they never missed",
    is_finite: false,
    categories: ["Sport", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who followed one sport with total devotion for forty years. She listened to the radio rather than watching — she said it required more attention, and attention was what it deserved.",
        reveal:
          "Hers was cricket. On the radio, never the television. She could tell you the score of any Test match from 1972. It was a considerable gift.",
      },
      tribute: {
        about:
          "A mentor who watched one sport alone, on his terms, with complete concentration. He didn\'t need company for it. He didn\'t discuss it afterwards. It was his and that was the whole point.",
        reveal:
          "His was football. He watched alone, in his own time, with full attention. He never needed to explain this. Everyone respected it.",
      },
      birthday: {
        about:
          "Sarah watches one sport with a level of intensity her friends find both impressive and slightly alarming. She once lost her voice at a major tournament and didn\'t notice until the next morning.",
        reveal:
          "Hers is tennis. She once lost her voice during Wimbledon. She noticed the following day. She had no regrets.",
      },
      retirement: {
        about:
          "David made one considerable sacrifice over thirty-five years that he has never forgiven himself for. He is retiring. The sacrifice will not be repeated.",
        reveal:
          "His is golf. He missed the 2005 Ryder Cup for a board meeting. He has not forgiven anyone. Now he\'ll never miss another round.",
      },
      wedding: {
        about:
          "Emma and James have not agreed on a sport in five years of trying and consider this a healthy arrangement. They go to different things. They are both happier for it.",
        reveal:
          "Theirs is rugby. They haven\'t agreed on anything else. They both turned up to the same game independently before they\'d met.",
      },
      engagement: {
        about:
          "Sophie has strong opinions about athletics that she delivers with complete conviction. Callum has opinions about rugby. Sophie says athletics is better. Callum admires her for this. He also disagrees.",
        reveal:
          "Hers is athletics. Track and field, specifically. She has strong views about which events matter. Callum disagrees about all of them. She is probably right.",
      },
      anniversary: {
        about:
          "Forty years together and they have watched the same sport from the same seats on the same weekend every year for most of them. The seats have changed once. The sport hasn\'t.",
        reveal:
          "Theirs is snooker. The same tournament, same weekend, forty years. They don\'t miss it. They never have.",
      },
      leaving: {
        about:
          "Priya has three half-finished sporting seasons saved in her browser. The time has finally arrived to give them the attention they deserve. She has been specific about the order.",
        reveal:
          "Hers is cycling. She\'s had three seasons saved for two years. The time has come. The list is ready.",
      },
      graduation: {
        about:
          "Tom watched an entire cricket Test between dissertation drafts and says it helped with the pacing. His tutors may not have agreed with the timing. The dissertation was excellent.",
        reveal:
          "His is cricket. He watched it between drafts. He says it helped. The first is complete.",
      },
      christening: {
        about:
          "Lily will one day have a sport she follows with complete devotion. The family have strong views about which one it should be. She will make her own decision. They are already preparing for this.",
        reveal:
          "She\'ll come to it herself. The family have opinions. She will ignore them. This is as it should be.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He now watches marathons on television with the specific attention of someone who has done it. He notices different things now.",
        reveal:
          "His is athletics — marathon running specifically. He watches it completely differently now. He knows what mile eighteen looks like from the inside.",
      },
      recovery: {
        about:
          "Claire says watching one sport helped during her recovery — the rhythm of it, the routine, the world continuing in an expected way. She found this more useful than she\'d anticipated.",
        reveal:
          "Hers is bowls. She started watching during her recovery. She says it has exactly the right pace. She has not stopped watching.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and uses one sport as a classroom metaphor so regularly that her students have developed views about it. She considers their views incorrect but useful.",
        reveal:
          "Hers is darts. She uses it to explain precision under pressure. Her students find this argument more convincing than they expected.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He says watching one sport taught him more about team structure and pressure than any management book.",
        reveal:
          "His is football. He says teams reveal themselves under pressure in ways that nothing else replicates. He watches closely for this reason.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which sport they\'d never miss. The one someone follows regardless of what else is happening.",
        reveal: "The sport you\'d never miss, whatever else was happening.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite sport to watch — the one they organise their weekend around — is always worth including.",
        reveal: "The sport that takes you somewhere — which one?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sport to watch is one of those things everyone has a strong position on.",
        reveal:
          "The sport you\'d never miss, whatever else was happening — which one is it?",
      },
    },
  },
  {
    title: "Sport to play",
    description: "How they loved to move",
    is_finite: false,
    categories: ["Sport", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who swam every morning until her seventies without exception. She said it was the only sport where you couldn\'t have your phone. She loved it for exactly this reason.",
        reveal:
          "Hers was swimming. Every morning, without fail, until her seventies. She said it was the only sport that asked for your complete attention.",
      },
      tribute: {
        about:
          "A mentor who played one sport until his eighties and never admitted to anyone that he was competitive. He was very competitive. Everyone knew this. Nobody said anything.",
        reveal:
          "His was bowls. He said it was a social game. He played it to win. Everyone understood the distinction.",
      },
      birthday: {
        about:
          "Sarah plays one sport with more ambition than her ranking suggests is warranted and makes no apologies for this. She has beaten people half her age and spent the following week describing it to her friends.",
        reveal:
          "Hers is tennis. She once beat someone half her age and spent a week telling people. Nobody blamed her.",
      },
      retirement: {
        about:
          "David\'s golf clubs have been in the boot of the car for three years. He has been ready for some time. The moment has arrived.",
        reveal:
          "His is golf. The clubs have been ready since 2021. He is now free to use them.",
      },
      wedding: {
        about:
          "Emma and James tried playing against each other once, in the first year of the relationship. They have played doubles ever since. This was a good decision by both of them.",
        reveal:
          "They play doubles now. They tried singles once. They have never discussed what happened. Doubles is better.",
      },
      engagement: {
        about:
          "Callum runs. Sophie hikes. They discovered in year two that these were essentially the same activity at different speeds and have been doing them together on the same routes ever since.",
        reveal:
          "His is running. He runs every route they walk together, but faster. They start together, arrive separately, and this is the arrangement.",
      },
      anniversary: {
        about:
          "They played one sport together for twenty years and stopped when it became inconvenient and have been saying they\'ll go back to it ever since. The argument about whether it matters has been running for twenty years.",
        reveal:
          "Theirs was badminton. They played for twenty years. They\'ve been meaning to go back since 2008. The argument about whether they need to is ongoing.",
      },
      leaving: {
        about:
          "Priya has been talking about cycling properly since year two at the studio. The diary is now entirely hers. The training plan is already written. There are no more excuses.",
        reveal:
          "Hers is cycling. The bike has been ready for a year. The excuses have run out. She is going.",
      },
      graduation: {
        about:
          "Tom played five-a-side every week throughout university and says it was where he did his best thinking. His teammates have opinions about whether his concentration during matches supports this theory.",
        reveal:
          "His is football — specifically five-a-side, specifically Tuesday evenings. He says he did his best thinking there. His teammates have strong views about this claim.",
      },
      christening: {
        about:
          "Lily will find the sport that belongs to her. The family have suggestions. She will ignore most of them. One of them will turn out to be right.",
        reveal:
          "She\'ll find her sport. The family have opinions. Some of them are correct.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll — the charity that patrols the coastline he trained on for eight months. He came back from the marathon different. The running is permanent now.",
        reveal:
          "His is running. The marathon made it permanent. He ran the coastline every morning for eight months. He will keep running it.",
      },
      recovery: {
        about:
          "Claire returned to a sport she had stopped during the difficult period. Coming back was harder than starting had been. She is glad she did.",
        reveal:
          "Hers is swimming. She stopped for a year. Coming back was hard. She is very glad she came back.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and coached the school netball team for fifteen years alongside her teaching. She says the two things used the same part of her. Her players agree.",
        reveal:
          "Hers is cricket. She\'s been playing since she was nine. She says it teaches the same patience as teaching. She has evidence for this.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame plays five-a-side every week and says it tells him everything he needs to know about how a team is working. His team at work have learned to check the Monday morning mood.",
        reveal:
          "His is football. Five-a-side, every week. He says every problem he\'s encountered at work has a five-a-side equivalent. He uses both.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which sport is theirs to play. The one someone plays with real feeling — not to win, just because it\'s theirs.",
        reveal: "The sport you played with real feeling — which one was yours?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite sport to play — the one they return to — is always worth including.",
        reveal: "The sport you played with real feeling — which one was yours?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sport to play is one of those things everyone has a position on.",
        reveal: "The sport you played with real feeling — which one was yours?",
      },
    },
  },
  {
    title: "Form of exercise",
    description: "How they kept moving",
    is_finite: false,
    categories: ["Sport", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who walked every morning — same route, same pace — for thirty years. Her family knew the route. They knew the timing. They knew it was not for company.",
        reveal:
          "Hers was walking. Same route, every morning. She said it was where she did her best thinking. The lane still feels like hers.",
      },
      tribute: {
        about:
          "A mentor who spent his retirement doing the one thing he had always said was more useful than exercise. He was in the garden every morning. He was right that it was better than a gym.",
        reveal:
          "His was gardening. He said it was the only exercise that produced something. He was in the garden by seven every morning.",
      },
      birthday: {
        about:
          "Sarah has downloaded seventeen fitness apps and uses exactly one of them consistently. She found it in year two of looking. She has not looked elsewhere since.",
        reveal:
          "Hers is running. One app, one route, consistent for three years. She says everything else was just looking for this.",
      },
      retirement: {
        about:
          "David has been saying he\'ll take up cycling properly since 2017. The bike is in the garage. The time is now. The excuses have run out.",
        reveal:
          "His is cycling. The bike has been in the garage for five years. He has retired. The excuses are gone.",
      },
      wedding: {
        about:
          "Emma and James have never had an argument that a long walk didn\'t resolve. This is a well-documented fact about their relationship. The walks are excellent.",
        reveal:
          "Theirs is walking. This is a well-established fact. The walks are the solution to most things.",
      },
      engagement: {
        about:
          "Callum started joining Sophie on her walks in year two of the relationship, which became hikes, which became the Lake District every autumn, which became the proposal.",
        reveal:
          "Theirs is walking — the long, steep, sometimes inadvisable kind. Every significant moment in their relationship has happened on one.",
      },
      anniversary: {
        about:
          "They started walking together on their first anniversary and have walked on every one since — not always the same place, but always the same kind of effort, the same kind of view at the end.",
        reveal:
          "Theirs is walking. Every anniversary, the same effort, a different view. Forty years of this arrangement.",
      },
      leaving: {
        about:
          "Priya has been planning to take up yoga properly since year three at the studio. The diary is now hers. The mat is ready. The planning is done.",
        reveal:
          "Hers is yoga. She\'s been meaning to do it properly for three years. The time is now.",
      },
      graduation: {
        about:
          "Tom cycled everywhere in Manchester for four years and arrived at everything slightly out of breath, which he considered a reasonable trade for the independence and the time to think.",
        reveal:
          "His is swimming. He picked it up in year three as a way to think without cycling. He found it worked better.",
      },
      christening: {
        about:
          "Lily will discover how she likes to move. The family have suggestions. She will find her own answer. Probably quite soon.",
        reveal:
          "Walking, running, swimming — she\'ll find her thing. It\'s early days.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. Eight months of training along the same coastal route. The running is not finished.",
        reveal:
          "His is running. Eight months of it, the same route, the same coastline. The marathon was not the end.",
      },
      recovery: {
        about:
          "Claire swam during her recovery — not for fitness, just for the water. She said it was the exercise that asked least of her and gave most back. She has not stopped going.",
        reveal:
          "Hers is swimming. She went back to it during recovery. She says the water was the point. She hasn\'t stopped going.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and swims before school on Tuesdays. She has been doing this for twelve years. She says it sets everything up. The twelve years suggest she is right.",
        reveal:
          "Hers is Pilates. She took it up the year she got the teaching post and has not missed a week. She says it is the exercise that requires the most honesty.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame runs when he needs to think. He doesn\'t track it. He doesn\'t time it. He says that\'s the whole point — just movement, no data.",
        reveal:
          "His is golf. He took it up after the first promotion. He says it is the only sport that punishes thinking too much. He finds this useful.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and how they keep moving. The exercise someone returns to says something true.",
        reveal:
          "How someone moves through the world says something true about them.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite form of exercise — how they keep moving — is always worth including.",
        reveal:
          "How someone moves through the world says something true about them.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite form of exercise is one of those things everyone has a position on.",
        reveal:
          "How someone moves through the world says something true about them.",
      },
    },
  },
  // ── Infinite — Childhood ─────────────────────────────────────────────────────
  {
    title: "Childhood game",
    description: "What they played until dark",
    is_finite: false,
    categories: ["Childhood", "Sport"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had strong views about the rules of conkers that she passed on to her children with the same precision she brought to everything else. The rules are still observed.",
        reveal:
          "Hers was conkers. She had very strong feelings about the correct rules. Her children inherited this. So did their children.",
      },
      tribute: {
        about:
          "A mentor who said the only game worth playing was one that required complete focus. He applied this principle to card games with an intensity that surprised people who hadn\'t played with him before.",
        reveal:
          "His was card games. He played them with complete focus and no mercy. He said this was a compliment to the other players.",
      },
      birthday: {
        about:
          "Sarah would play rounders tomorrow if someone organised it. She has been saying this for ten years. Nobody has organised it. She would not let the competition go if they did.",
        reveal:
          "Hers is rounders. She still has the arm. She is not subtle about this.",
      },
      retirement: {
        about:
          "David spent his childhood summers on a cricket pitch and spent thirty-five years saying he\'d get back to it properly. There are thirty summers ahead. The whites are in the back of the wardrobe.",
        reveal:
          "His is French cricket. He says it was better than the real thing because it required less equipment. His grandchildren will be finding this out shortly.",
      },
      wedding: {
        about:
          "Emma and James spent their first summer together in a garden playing something that seemed to involve increasingly arbitrary rules. Neither of them could explain the rules afterwards. Both of them remember it as the best afternoon.",
        reveal:
          "Theirs is hide and seek. The rules got more elaborate as the afternoon went on. Nobody won. Both of them consider it the best afternoon of that year.",
      },
      engagement: {
        about:
          "Callum and Sophie are both competitive in ways they do not advertise. They found this out playing something very simple on their third date. It has been part of the relationship ever since.",
        reveal:
          "Theirs is tag. Simple, fast, completely revealing. They found out more about each other in twenty minutes than in the two dates before it.",
      },
      anniversary: {
        about:
          "Forty years together and they have played board games on more evenings than either of them can count. The investment in winning has never decreased. The enjoyment has never depended on it.",
        reveal:
          "Theirs is board games. Forty years of them, same amount of investment, same enjoyment. They play every Christmas. It always ends the same way.",
      },
      leaving: {
        about:
          "Priya was the person at the studio who knew how to make something out of nothing — a lunch break, an afternoon, a project with no clear brief. She had that since childhood. It never went anywhere.",
        reveal:
          "Hers was building dens. She was the one who organised it, specified the structure, and made sure it held up. Some things don\'t change.",
      },
      graduation: {
        about:
          "Tom played hide and seek in the architecture faculty late at night during finals week and does not regret it. The building had excellent hiding places. He knows this professionally now.",
        reveal:
          "His was marbles. He played with the same intensity he brings to everything. He still has them. He says this is irrelevant. It isn\'t.",
      },
      christening: {
        about:
          "Lily will learn the games in due course. The family have strong views about which ones matter. She will make her own list.",
        reveal: "She\'ll find her game. The family are ready to play.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He says the marathon had the same quality as one particular game from his childhood — pure effort, no strategy, just getting to the other side.",
        reveal:
          "His was British bulldogs. He says running a marathon had the same feeling. Just get across. Nothing else matters.",
      },
      recovery: {
        about:
          "Claire played card games with her family all through the difficult period — not talking much, just playing. She says it was the right thing to be doing. The game was the point.",
        reveal:
          "Hers was card games. They didn\'t talk much. They just played. She says it was exactly what she needed.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and says the best classrooms have the energy of a good playground. She means this literally. She knows which games produce which energy.",
        reveal:
          "Hers is skipping. She still knows the rhymes. She uses them in primary school sessions. The children find this extremely surprising.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He says product launches are essentially the same as stuck in the mud — everyone running, certain collisions inevitable, somehow you get to the other side.",
        reveal:
          "His was stuck in the mud. He has used this analogy in three product reviews. It always lands.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which game they\'d play tomorrow if someone let them. The game someone returns to in memory says something true.",
        reveal: "The game you\'d play tomorrow if someone let you.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite childhood game — the one they played until it was dark — is a detail worth including.",
        reveal:
          "The game that says something true about who you were and probably still are.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite childhood game is one of those things everyone remembers clearly.",
        reveal:
          "The game that says something true about who you were and probably still are.",
      },
    },
  },
  {
    title: "School subject",
    description: "Lesson they always enjoyed",
    is_finite: false,
    categories: ["Childhood", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who taught English for forty years and could find a metaphor in anything. Her notebooks are full of lines she was saving for the right moment.",
        reveal:
          "Hers was English. She said every other subject was English if you looked at it properly. Most of her colleagues came to agree.",
      },
      tribute: {
        about:
          "A mentor who read history the way other people read novels — for the story, for what it explained about now. He thought everyone should know more of it and spent thirty years quietly making this argument.",
        reveal:
          "His was history. He said it was the only subject that told you where you were. He had been making this argument since school.",
      },
      birthday: {
        about:
          "Sarah got detention in a science lesson at fourteen for arguing with the textbook. She was right. She has never stopped arguing with things she finds incorrect. Her colleagues consider this one of her better qualities.",
        reveal:
          "Hers is science. She argues with the textbook when it\'s wrong. It\'s usually wrong. She\'s usually right.",
      },
      retirement: {
        about:
          "David\'s team will tell you it was drama all along, not maths. David will tell you it was maths. Both are probably right, which is what made him such a good engineer.",
        reveal:
          "His was maths. He says it taught him how to be certain about things. His team says that was the drama.",
      },
      wedding: {
        about:
          "Emma and James met in a class — not the romantic kind, an actual class, a foreign language class they both enrolled in for different reasons. The language didn\'t stick. The relationship did.",
        reveal:
          "Theirs is languages. They met in a French class in 2018. They speak no French. They consider this irrelevant.",
      },
      engagement: {
        about:
          "Callum studied geography for two years longer than was strictly required, because he said it was the subject that made sense of everywhere. Sophie studied landscape poetry. The Lake District was, in retrospect, inevitable.",
        reveal:
          "His is geography. He says it is the subject that explains where you are and why it matters. He applied this to the proposal.",
      },
      anniversary: {
        about:
          "Forty years together and the question of which subject was most formative has never been resolved. She says drama. He says science. They\'ve been at this since the first month.",
        reveal:
          "Theirs is drama. They don\'t agree on this. She says drama. He says science. Drama wins because she is more convincing about it.",
      },
      leaving: {
        about:
          "Priya ran every project at the studio with the instincts of the best art teacher — materials, space, iteration, trust. Her colleagues only realised this when she left.",
        reveal:
          "Hers was art. She ran projects the way good art teachers run studios. Her colleagues only understood this afterwards.",
      },
      graduation: {
        about:
          "Tom\'s love of architecture started in a drawing lesson when he was eleven and never stopped. His teacher kept a good stack of paper. Tom drew until it ran out.",
        reveal:
          "His was PE. His tutors were surprised. He said it was the subject that taught him about how bodies move through space. He applied this to architecture. His tutors revised their position.",
      },
      christening: {
        about:
          "The subjects Lily will love are still to be discovered. The family have strong views about which ones should win. She will come to her own conclusions.",
        reveal:
          "Too early to know. The family have opinions. She\'ll have better ones.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He says the maths he used to estimate his finish time was the most useful he had ever done. He is revising his view of the subject.",
        reveal:
          "His is PE. He says nothing in his education was as useful as what PE taught him about effort. He stands by this.",
      },
      recovery: {
        about:
          "Claire read more this year than in any year since school — going back to the books she had loved and then the ones she had missed. She says reading was the best thing she did.",
        reveal:
          "Hers is English. She went back to the books she\'d loved at school and found they\'d been waiting for her. They had.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She teaches English alongside everything else she does — the book club, the evening sessions, the conversations that run ten minutes over. She says every subject is English if you teach it properly.",
        reveal:
          "Hers is English. She says it is the subject that teaches you how to think about everything else. Thirty years of evidence support this.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He says everything he needed to know about shipping products he learned in GCSE physics — force, friction, velocity, the cost of resistance.",
        reveal:
          "His is maths. He says it taught him to be precise when precision matters and approximate when it doesn\'t. He applies this daily.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which school subject shaped them most. The lesson someone loved is always worth knowing.",
        reveal:
          "The lesson that actually shaped you — which one, and what did it give you?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite school subject — the one they were made for — is a detail worth including.",
        reveal:
          "The subject you were made for — which one, and what did it give you?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite school subject is one of those things everyone has a strong feeling about.",
        reveal:
          "The subject you were made for — which one, and what did it give you?",
      },
    },
  },
  // ── Infinite — Literature ────────────────────────────────────────────────────
  {
    title: "Type of book",
    description: "What they loved to read",
    is_finite: false,
    categories: ["Literature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who read proper biographies — long ones, nothing abridged. She always had three on the go and could tell you where each one was up to without consulting any of them.",
        reveal:
          "Hers was biography. Long ones, never abridged. She said a life well documented was a gift worth giving.",
      },
      tribute: {
        about:
          "A mentor who read history the way other people read thrillers — for the pace of it, the reversals, the moments where everything could have gone differently. He thought everyone should read more of it.",
        reveal:
          "His was history. He said it was the only honest narrative. He recommended three books to everyone he liked.",
      },
      birthday: {
        about:
          "Sarah reads everything but comes back to one kind above all others — the kind with a journey in it, real or imagined. She marks passages and tells people about them at dinner. Her friends have started doing the same.",
        reveal:
          "Hers is travel writing. She reads it wherever she goes and wherever she doesn\'t. She marks passages. She tells everyone about them.",
      },
      retirement: {
        about:
          "David has a bookshelf that tells the story of thirty-five years more clearly than any CV. He is retiring. He is going to write the next chapter himself.",
        reveal:
          "His is memoir. He reads them for the honesty. He says he\'s been keeping notes for years. He probably has.",
      },
      wedding: {
        about:
          "Emma and James share books with each other — not because they have to, but because they always have something to say about what they\'ve read and the other person is always interested. This has been true since the second month.",
        reveal:
          "Theirs is the novel. She reads, he reads, they discuss. They haven\'t agreed on a book yet. They\'re always going to have the conversation.",
      },
      engagement: {
        about:
          "Sophie studied landscape poetry at university and never quite stopped reading it. Callum studied geography. They discovered these were not as different as they seemed, on their second date, in a pub, for an hour.",
        reveal:
          "Hers is short stories. She says they are the form that respects the reader\'s time. Callum has been working through her recommendations for two years.",
      },
      anniversary: {
        about:
          "Forty years of reading together — not always the same books, always books. She annotates. He doesn\'t. They have made peace with this. Mostly.",
        reveal:
          "Theirs is crime fiction. They\'ve read it together for years. She solves it first. He disputes this. She is usually right.",
      },
      leaving: {
        about:
          "Priya would write a book about her time at the studio that you\'d recommend to people you liked. She knows this. She has been taking notes since year one.",
        reveal:
          "Hers is children\'s books. She says they are the ones that tell the truth clearly. She reads them for the clarity.",
      },
      graduation: {
        about:
          "Tom spent four years reading technical literature and has a list of everything else he\'s been meaning to read since the first year. The list is long. He is starting from the top.",
        reveal:
          "His is science fiction. He says it is the only genre that takes the future seriously. His tutors say this explains a great deal about his work.",
      },
      christening: {
        about:
          "Lily\'s parents are already building her library. They have very different views about where to start. They have agreed on the first shelf. The rest is under discussion.",
        reveal:
          "Her library is starting. The first shelf has been decided. It is mostly picture books. This is correct.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He picked up one kind of book during training that he hadn\'t expected to read and found he couldn\'t stop.",
        reveal:
          "His is nature writing. He started reading it during training. He says it taught him to pay attention to the coastline he was running along. He is still reading it.",
      },
      recovery: {
        about:
          "Claire read poetry during her recovery because it didn\'t ask too much of her — each poem was complete in itself, small and whole. She has continued reading it. The poems are no longer small to her.",
        reveal:
          "Hers is poetry. Short, complete, honest. She needed that. She kept reading it after she didn\'t need it that way any more.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She has a list of books she gives to different students at different moments. The list has been growing for twenty years. She never gives the same one twice.",
        reveal:
          "Hers is history. She says it is the subject that teaches you what is actually difficult. She assigns it whenever she thinks a student is ready.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He is very specific about which books in one genre earn the distinction. Not many do. The ones that do, he reads twice.",
        reveal:
          "His is self-help — the good kind. He reads it rigorously and discards most of it. What remains, he uses. His team has noticed.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which type of book says something true about them. A bookshelf is a portrait.",
        reveal: "A bookshelf is a portrait. Which type of book is yours?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite type of book — the one they always come back to — is a detail worth including.",
        reveal:
          "A bookshelf is a portrait. Which type of book is yours, and what does it say?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite type of book is one of those things everyone has strong feelings about.",
        reveal:
          "A bookshelf is a portrait. Which type of book is yours, and what does it say?",
      },
    },
  },
  {
    title: "Poet",
    description: "Voice that said what they felt",
    is_finite: false,
    categories: ["Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who always had the right line for the right moment. She wrote them on cards and left them for people to find. You\'d come across one months later and understand why she\'d chosen it.",
        reveal:
          "Hers was Mary Oliver. She could find the line that applied to exactly where you were. She left them for people.",
      },
      tribute: {
        about:
          "A mentor who produced poems without making it feel like a performance — the right one, at the right moment, without explanation. His colleagues came to understand that this was a skill he had been practising for decades.",
        reveal:
          "His was Philip Larkin. He\'d produce a line without context and it was always exactly right. He never needed to explain why.",
      },
      birthday: {
        about:
          "Sarah quoted a poem at a dinner party once and made someone cry. She says she doesn\'t read poetry. There are four collections on her bedside table. Both things are true.",
        reveal:
          "Hers is Pam Ayres. She says this without apology. She is entirely right to.",
      },
      retirement: {
        about:
          "David\'s leaving do deserves the right poem — not the obvious one, the one that says thirty-five years of one thing better than any speech could. Whoever gives the speech will need to have done their reading.",
        reveal:
          "His is John Betjeman. He says Betjeman understood what England actually looked like. Thirty-five years of engineering confirms this.",
      },
      wedding: {
        about:
          "Emma had chosen the poem for her wedding years before she met James. She hadn\'t told him this when they got together. She told him on the train to the venue. He said it was exactly the right poem. It was.",
        reveal:
          "Hers is W.B. Yeats. She\'d known the poem since she was nineteen. James agreed immediately. That settled it.",
      },
      engagement: {
        about:
          "Sophie left a poetry collection on the kitchen table once. Callum read it without mentioning this for three weeks. He has since read everything else by the same poet. Sophie found this out by accident. She considers it one of the better things she knows about him.",
        reveal:
          "His is Seamus Heaney. Sophie left the collection on the table. He read it without saying so for three weeks.",
      },
      anniversary: {
        about:
          "Their wedding had a poem. They read it every anniversary. The same words mean something different every year and something entirely the same.",
        reveal:
          "Theirs is Dylan Thomas. The wedding poem. Every anniversary. Different understanding, same feeling.",
      },
      leaving: {
        about:
          "Priya deserves the right poem for this moment. Not the obvious one. The one that says what everyone actually means when they say they\'ll miss her.",
        reveal:
          "Hers is Maya Angelou. She\'d say she doesn\'t need a poem. She\'s wrong.",
      },
      graduation: {
        about:
          "Tom\'s graduation speech included a poem nobody was embarrassed by. He chose it himself. The room was very quiet. That is the test.",
        reveal:
          "His is Ted Hughes. He chose it for the graduation speech and the room was quiet. He considers this the standard.",
      },
      christening: {
        about:
          "Every child should have a poem that belongs to them. Lily\'s is still to be decided. The family have suggestions. She will choose her own in time.",
        reveal:
          "Theirs is Roger McGough. They want her to have a poet who is funny and true at the same time. They\'ve started there.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He says there is a poem that describes running a marathon better than anything written about sport. He has found several candidates.",
        reveal:
          "His is Wilfred Owen. He says the poems are about effort and endurance in conditions that shouldn\'t be endured. He ran the marathon with one line in his head.",
      },
      recovery: {
        about:
          "Claire found a poet during her recovery who seemed to understand exactly what the year had been like — not to make it better, just to name it. She reread the same poems many times. They held up.",
        reveal:
          "Hers is Emily Dickinson. She said the poems were written for exactly this. She was right.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She believes every teacher should be able to name three poets. She has more than three. She can recite from all of them. She doesn\'t advertise this.",
        reveal:
          "Hers is William Shakespeare. She says he understood every kind of person. She tests her students on this. They tend to agree.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He reads poetry for the compression — the way good lines do more with less. He has applied this to every product description he has ever written.",
        reveal:
          "His is R.S. Thomas. He says the poems understand that some things are worth doing slowly. He applies this to product.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which poet speaks for them. Some poets just speak for particular people.",
        reveal:
          "Some poets just speak for particular people. Which voice is yours?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite poet — the voice that says what they can\'t always say themselves — is worth including.",
        reveal:
          "Some poets just speak for particular people. Which voice is yours?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite poet is one of those choices that always says something.",
        reveal:
          "Some poets just speak for particular people. Which voice is yours?",
      },
    },
  },
  // ── Infinite — Everyday life ─────────────────────────────────────────────────
  {
    title: "Hobby",
    description: "What they did just for love of it",
    is_finite: false,
    categories: ["Everyday life", "Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who gardened like it was a form of prayer. She said once that the garden taught her everything she knew about patience. Her children think this is exactly right.",
        reveal:
          "Hers was gardening. She said it taught her everything she knew about patience. The garden is still there. Someone else is tending it now.",
      },
      tribute: {
        about:
          "A mentor who made furniture as a young man and gave a piece to everyone he loved. His colleagues didn\'t know this until the leaving do, when the pieces were mentioned. Every house in the room had one.",
        reveal:
          "His was woodwork. He gave something he\'d made to everyone he cared about. He never mentioned it. They always knew.",
      },
      birthday: {
        about:
          "Sarah took up photography three years ago and now sees everything differently. She\'d be horrified if you called it a hobby. She considers it a discipline. The photographs agree.",
        reveal:
          "Hers is photography. She took it up three years ago and sees everything differently now. She does not call it a hobby. She is right not to.",
      },
      retirement: {
        about:
          "David mentioned fishing once in passing eight years ago and his team have thought about it ever since. He is retiring. The rod has been in the garage since 2004.",
        reveal:
          "His is fishing. The rod has been in the garage since 2004. He has retired. He is going.",
      },
      wedding: {
        about:
          "Emma and James started cooking properly together in year two of the relationship and now have opinions about knives that their friends find amusing and their kitchen confirms are correct.",
        reveal:
          "Theirs is cooking. They found the shared thing. It feeds them in every sense. The knives are, yes, excessive.",
      },
      engagement: {
        about:
          "Sophie volunteers at a community garden every Saturday morning and has done since university. Callum joined her in year two of the relationship. He has opinions about soil now. He considers this a development.",
        reveal:
          "Hers is volunteering. Same community garden, every Saturday, for eight years. Callum now comes. He has opinions about soil. She considers this a success.",
      },
      anniversary: {
        about:
          "Forty years together and she has knitted through every conversation, every film, every evening worth having. He says it is meditative. She says she just likes something to do with her hands.",
        reveal:
          "Hers is knitting. She has knitted through forty years of evenings. The grandchildren are all wearing evidence of this.",
      },
      leaving: {
        about:
          "Priya drew things obsessively as a child, studied something more practical, and never quite stopped drawing. The margins of her notebooks are full of it. Nobody at the studio saw this coming.",
        reveal:
          "Hers was painting and drawing. The notebooks have been full of it for years. She never stopped. She just didn\'t tell anyone.",
      },
      graduation: {
        about:
          "Tom played in bands at school, studied architecture, and has been saying he\'ll play properly again since year one. He has graduated. The guitar is available.",
        reveal:
          "His is playing music. He has played in bands since he was fifteen. He stopped for architecture. He is starting again.",
      },
      christening: {
        about:
          "Lily will find the thing she loves doing for its own sake. The family have views on which direction to point her. She will find the thing herself.",
        reveal:
          "She\'ll find her thing. The family are ready to make room for it.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He walks — really walks, not as training — on the days he doesn\'t run. He says it is completely different and he needs both.",
        reveal:
          "His is walking. Different from running, different purpose. He says you think different things. He needs both.",
      },
      recovery: {
        about:
          "Claire read more this year than in any year she can remember — slowly, without agenda, just the book and the afternoon. She says it was the hobby that cost her nothing and gave back the most.",
        reveal:
          "Hers is reading. She always read. This year she read properly. She says the difference is significant.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She birdwatches on Saturday mornings and has done for twenty years. Her students don\'t know this. She has never explained the connection between birdwatching and teaching. It is, they would find, exact.",
        reveal:
          "Hers is birdwatching. Saturday mornings, notebook, same hedgerow for twenty years. She says it teaches the same attention as teaching. It does.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He does the crossword every morning without looking anything up, which his partner finds impressive and his colleagues find entirely predictable.",
        reveal:
          "His is crosswords. Every morning, no looking things up. He says it sets the brain up. His team suspects he\'s right.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and what they do purely for love of it. The hobby someone returns to says something true.",
        reveal:
          "What do you do purely for love of it? Not for fitness, not for work — just because it\'s yours.",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite hobby — the thing they do purely for love of it — is worth including.",
        reveal:
          "What do you do purely for love of it? Not for fitness, not for work — just because it\'s yours.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite hobby is one of those things everyone has strong feelings about.",
        reveal:
          "What do you do purely for love of it? Not for fitness, not for work — just because it\'s yours.",
      },
    },
  },
  {
    title: "Way to spend Sunday",
    description: "Their idea of a perfect day off",
    is_finite: false,
    categories: ["Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who made Sundays the most important day of the week. The schedule was long-established and defended by everyone who loved her. It was the best day of the week.",
        reveal:
          "Hers was roast dinner with family. Noon arrival, table set, radio on. Nobody left before four. That was the point.",
      },
      tribute: {
        about:
          "A mentor who kept Sundays for walking. Nobody was invited, nobody was excluded. He walked until he had thought through whatever needed thinking through and then went home. Everyone knew not to call on a Sunday.",
        reveal:
          "His was the long walk. Every Sunday. He came back having decided whatever needed deciding. Nobody called on a Sunday. Everyone understood this.",
      },
      birthday: {
        about:
          "Sarah has very clear views about what Sunday mornings are for and will not be persuaded that any other position is reasonable. She holds this view with conviction and without apology.",
        reveal:
          "Hers is the lie in. She is not negotiating on this. Sunday mornings are not for early starts. That is the rule.",
      },
      retirement: {
        about:
          "David has known for years exactly what he would do with Sundays when he retired. The plan is specific. The garden is waiting.",
        reveal:
          "His is pottering in the garden. No plan, no goal. Just the garden and whatever it needs. He has been saving this for thirty-five years.",
      },
      wedding: {
        about:
          "Emma and James spend their Sundays cooking something with more components than a weeknight can accommodate. They have a system. It involves several hours, at least one argument, and a very good result.",
        reveal:
          "Theirs is cooking something special. Long recipe, several hours, at least one disagreement. Always worth it.",
      },
      engagement: {
        about:
          "Sophie and Callum drive somewhere different every few Sundays — not very far, not very planned. Callum has a list. Sophie has different preferences. The list serves as a starting point.",
        reveal:
          "Theirs is a drive in the countryside. Callum has a list. Sophie has opinions about the list. They always find somewhere good.",
      },
      anniversary: {
        about:
          "Forty years together and the pub lunch has been the Sunday structure for most of them. Same pub for twenty years, different pub before that, the arrangement always the same.",
        reveal:
          "Theirs is the pub lunch. Same table, same order, forty years. They say it is the most reliable thing they have. They mean it as a compliment.",
      },
      leaving: {
        about:
          "Priya always had somewhere new she was meaning to get to. The list was long and she worked through it methodically. She is leaving with a long list and no more excuses. The timing is finally right.",
        reveal:
          "Hers is visiting somewhere new. She had a list. She worked through it. She\'s leaving with the next chapter of the list ready.",
      },
      graduation: {
        about:
          "Tom has not done nothing on a Sunday since he started architecture school four years ago. He has strong plans for the Sunday after graduation. They involve the absolute absence of plans.",
        reveal:
          "His is doing absolutely nothing. He has been planning this Sunday since year one. No sketchbook, no laptop, no ambition. He has earned this.",
      },
      christening: {
        about:
          "Lily has reorganised Sunday mornings entirely and without apology. Her parents have adapted. They are enjoying this more than they expected.",
        reveal:
          "Her parents are discovering new shapes for Sundays. She is the one deciding the shape. Everyone agrees it\'s better.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He trained on Sunday mornings for eight months. His Sunday is about to change significantly.",
        reveal:
          "His is the long walk. Post-marathon, no running, no target. Just moving because he can. He says the walk is earned.",
      },
      recovery: {
        about:
          "Claire spent many Sundays this year reading. Not catching up, not research — just reading, with no obligations attached. She says she is keeping this arrangement.",
        reveal:
          "Hers is reading all day. She kept Sundays for it this year and is not giving them back.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. Her Sundays involve watching sport with a level of commitment her colleagues find surprising and consistent.",
        reveal:
          "Hers is watching sport. The same Sunday fixture, same level of investment, since approximately 1998. She has never considered changing this.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame has been promoted to Head of Product. He celebrates every significant moment at the same pub with the same people in the same way.",
        reveal:
          "His is the pub lunch. Same people, same pub, same Sunday. He says continuity is underrated.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and what their ideal Sunday looks like. How someone spends their best free day is always worth knowing.",
        reveal: "The ideal Sunday — what does yours look like?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. How someone spends their Sunday says a great deal about them.",
        reveal: "The ideal Sunday — what does yours look like?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite way to spend Sunday is one of those things everyone has strong feelings about.",
        reveal:
          "The ideal Sunday — what does yours look like, and what does it tell you?",
      },
    },
  },
  {
    title: "Smell",
    description: "Scent that took them somewhere",
    is_finite: false,
    categories: ["Everyday life", "Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who grew lavender in every garden she ever had. The smell attached itself to the rooms she\'d been in and the people who\'d been close to her. It doesn\'t require explanation.",
        reveal:
          "Hers was lavender. It grew in every garden she ever had. It attached itself to everything she touched.",
      },
      tribute: {
        about:
          "A mentor who had more books than shelves and had arranged them according to a system only he fully understood. His office smelled of them before you noticed anything else. His colleagues associate the smell with good thinking.",
        reveal:
          "His was old books. The office smelled of them. His colleagues associate it with every conversation worth having.",
      },
      birthday: {
        about:
          "Sarah has strong opinions about the morning and what it should smell like. She has a coffee machine with specific settings that she defends with conviction. Her guests always agree it was worth it.",
        reveal:
          "Hers is coffee in the morning. Specific coffee, specific machine, non-negotiable settings. She says it sets everything up. It does.",
      },
      retirement: {
        about:
          "David is retiring with plans to spend more time outdoors, in conditions that most people describe as unsuitable, at a time of year most people prefer to observe from inside. He will be very happy.",
        reveal:
          "His is bonfire. Autumn, outdoor fire, the day done. He has been planning this since the eighties.",
      },
      wedding: {
        about:
          "Emma and James got married in a garden that had been rained on the previous night. Everyone commented on the smell. It was, they both agreed afterwards, the best thing about the venue.",
        reveal:
          "Theirs is garden after rain. The morning of the wedding. They both noticed it immediately. Nobody had planned it.",
      },
      engagement: {
        about:
          "Sophie has a smell she associates with safety and arrival — one specific and domestic smell that means everything is fine. Callum worked this out without being told. He is proud of this.",
        reveal:
          "Hers is fresh laundry. Specifically the smell of sheets dried outside in summer. She said once that it meant everything was fine. Callum remembered.",
      },
      anniversary: {
        about:
          "Forty years together and the kitchen on a Sunday morning still smells the same way it has for forty years. Neither of them has commented on this. Neither of them needs to.",
        reveal:
          "Theirs is bread baking. Sunday mornings, forty years. The smell means the day is exactly what it should be.",
      },
      leaving: {
        about:
          "Priya grew up near the coast and says the sea air is the smell she missed most when she came inland. She is going somewhere where she won\'t have to miss it any more.",
        reveal:
          "Hers is sea air. She missed it every year she was away from the coast. She is going back.",
      },
      graduation: {
        about:
          "Tom has a specific smell he associates with the best thinking — stone, candle wax, cold air, centuries of quiet concentration. He has been pursuing this smell since his first tutorial.",
        reveal:
          "His is old churches. Stone, cold, quiet. He says it is the smell of thinking that has been happening for a long time. He finds this useful.",
      },
      christening: {
        about:
          "The christening was in June and the village green had just been cut. The family were outside for the photographs. The smell was exactly right.",
        reveal:
          "Freshly cut grass. The village green, June, just after the photographs. The smell of the right day at the right time.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He ran the same coastal route for eight months and says the sea air on cold mornings will always mean something specific to him now.",
        reveal:
          "His is sea air. Cold morning, coast, wind off the water. He says it will always mean the same thing now.",
      },
      recovery: {
        about:
          "Claire walked in the same park every day during her recovery. When it rained and then stopped, she would stay a little longer. She says she was looking for something and that smell was part of finding it.",
        reveal:
          "Hers is garden after rain. She walked every day. After rain, she stayed longer. She says it smelled like things were still growing.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and has been in libraries and school halls and old buildings her whole adult life. There is one smell she would not swap for any other.",
        reveal:
          "Hers is old books. Libraries, school halls, the smell of knowledge that has been handled. She says it tells you something good is about to happen.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame walked home in the rain after hearing the news. He says the smell of the wet city was entirely right for the moment. It smelled like arrival.",
        reveal:
          "His is rain on dry earth — petrichor, specifically. He walked home in it after hearing the news. He says it smelled like things starting.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which smell takes them somewhere specific. Scent is always the most direct route.",
        reveal: "The smell that takes you somewhere immediately — which one?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite smell — the one that takes them somewhere in an instant — is always worth including.",
        reveal:
          "The smell that takes you somewhere immediately — which one, and where?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite smell is one of the most direct things there is.",
        reveal:
          "The smell that takes you somewhere immediately — which one, and where?",
      },
    },
  },
  {
    title: "Weather for walk",
    description: "The sky that made them pull on their boots",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who walked every morning without exception, in every kind of weather. Her children knew which weather was her weather — the one she smiled at through the window before she put her coat on.",
        reveal:
          "Hers was the crisp winter morning. Cold air, clear sky, the garden white. She said it was the weather that made everything possible.",
      },
      tribute: {
        about:
          "A mentor who walked in weather that other people stayed indoors for, and came back having made his best decisions. His colleagues eventually understood this was not a coincidence.",
        reveal:
          "His was autumn drizzle. He said it was the weather that made you concentrate. He did his best thinking in it.",
      },
      birthday: {
        about:
          "Sarah has very strong opinions about the best conditions for a walk. She is not interested in compromise on this point. The conditions she requires are specific and she will wait for them.",
        reveal:
          "Hers is a bright spring day — cool enough to walk properly, warm enough to stop. She says it is the only weather that earns the view.",
      },
      retirement: {
        about:
          "David has been saying he\'ll walk properly when he has the time. He has the time. He is going at the hour he\'s been waiting for all year.",
        reveal:
          "His is golden hour. He waited for it all year, every year, working. He is now free to walk in it.",
      },
      wedding: {
        about:
          "Emma and James had their first proper walk together in weather that neither of them would have chosen. They have been going back to similar weather ever since, on purpose.",
        reveal:
          "Theirs is after rain. The light, the smell, the path empty. They found it by accident and have been choosing it since.",
      },
      engagement: {
        about:
          "Callum chose the morning of the proposal in part because of the weather. The fells were in mist. The visibility was poor. The view was entirely the point.",
        reveal:
          "Theirs is misty and still. The morning of the proposal. The fells half-visible. Sophie says she understood as soon as they started walking.",
      },
      anniversary: {
        about:
          "Forty years of walking together in all kinds of weather, and they have agreed on exactly one kind as the best. They have walked in it every anniversary where possible. It is the right weather for the occasion.",
        reveal:
          "Theirs is blustery and wild. They\'ve been walking in it for forty years. Neither of them has ever suggested waiting for a nicer day.",
      },
      leaving: {
        about:
          "Priya\'s last walk in this city will be in the best weather for it. She has been planning which route and which conditions since she decided to go. The conditions are specific.",
        reveal:
          "Hers is a warm summer evening. She says it is the weather that makes a city feel worth leaving properly.",
      },
      graduation: {
        about:
          "Tom graduated in June and walked the long way home. He says the weather was right for the day. His housemates found him on a bench two hours later. He was not lost. He was just walking.",
        reveal:
          "His is blustery and wild. He says it is the weather that clears things out. He walked three miles on graduation day without deciding to.",
      },
      christening: {
        about:
          "Lily will one day be old enough to have opinions about which weather to walk in. The family will have strong views. She will overrule them.",
        reveal:
          "She\'ll have opinions soon. The family are ready to walk in whatever she decides.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon and is raising money for the RNLI through favpoll. He ran in all weathers for eight months and has decided which one he prefers. The preference is specific and earned.",
        reveal:
          "His is the crisp winter morning. Cold, clear, the coast empty. He trained in it for eight months. He says it is the best weather there is.",
      },
      recovery: {
        about:
          "Claire walked every day during her recovery regardless of weather. She came to prefer one kind above all others — not for any reason she could name, but for the quality of attention it asked of her.",
        reveal:
          "Hers is misty and still. She says it is the weather that asks you to look closer. She walked in it every chance she had.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She walks every Sunday in the same landscape and at the same time of year considers one kind of day the best day for it.",
        reveal:
          "Hers is a bright spring day. She says it is the weather of beginning. She plans her whole spring around the first one.",
      },
      promotion: {
        about:
          "After three years of excellent work, Kwame walked home after hearing the news about the promotion in weather that he says was exactly right for how the day felt.",
        reveal:
          "His is after rain. He walked home in it. He says it smelled like things had been cleaned up ready for the next thing.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and which weather gets them out the door. The sky someone walks in says something true.",
        reveal:
          "The weather that gets you out the door and into the world — which one?",
      },
      other: {
        about:
          "Tell us who this person is and why you\'re gathering. A favourite walking weather — the sky that makes them pull on their boots — is always worth including.",
        reveal: "The sky that gets you out the door — which one is it?",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite walking weather is one of those things everyone has a strong position on.",
        reveal:
          "The weather that gets you out the door — which one is it, and what does it give you?",
      },
    },
  },
]

// ---------------------------------------------------------------------------
// Topic items
// ---------------------------------------------------------------------------

// display_order for finite topics — null/missing means sort alphabetically
const topicItemDisplayOrder: Record<string, Record<string, number>> = {
  "Day of the week": {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  },
  "Meal of the day": {
    Breakfast: 1,
    Brunch: 2,
    Lunch: 3,
    "Afternoon tea": 4,
    Dinner: 5,
    Supper: 6,
  },
  "Time of day": {
    "Early morning": 1,
    "Mid morning": 2,
    Lunchtime: 3,
    Afternoon: 4,
    "Late afternoon": 5,
    Dusk: 6,
    Evening: 7,
    "Late night": 8,
  },
  Decade: {
    "1920s": 1,
    "1930s": 2,
    "1940s": 3,
    "1950s": 4,
    "1960s": 5,
    "1970s": 6,
    "1980s": 7,
    "1990s": 8,
    "2000s": 9,
    "2010s": 10,
    "2020s": 11,
  },
  Season: {
    Spring: 1,
    Summer: 2,
    Autumn: 3,
    Winter: 4,
  },
}

const topicItems: Record<string, string[]> = {
  Colour: [
    "Black",
    "Blue",
    "Brown",
    "Green",
    "Grey",
    "Orange",
    "Pink",
    "Purple",
    "Red",
    "White",
    "Yellow",
  ],
  "Day of the week": [
    "Friday",
    "Monday",
    "Saturday",
    "Sunday",
    "Thursday",
    "Tuesday",
    "Wednesday",
  ],
  Decade: [
    "1920s",
    "1930s",
    "1940s",
    "1950s",
    "1960s",
    "1970s",
    "1980s",
    "1990s",
    "2000s",
    "2010s",
    "2020s",
  ],
  "Meal of the day": [
    "Afternoon tea",
    "Breakfast",
    "Brunch",
    "Dinner",
    "Lunch",
    "Supper",
  ],
  Season: ["Autumn", "Spring", "Summer", "Winter"],
  "Time of day": [
    "Afternoon",
    "Dusk",
    "Early morning",
    "Evening",
    "Late afternoon",
    "Late night",
    "Lunchtime",
    "Mid morning",
  ],
  Animal: [
    "Badger",
    "Cat",
    "Deer",
    "Dog",
    "Dolphin",
    "Duck",
    "Elephant",
    "Fox",
    "Hedgehog",
    "Horse",
    "Owl",
    "Rabbit",
    "Robin",
    "Swan",
  ],
  Bird: [
    "Barn owl",
    "Blackbird",
    "Blue tit",
    "Goldfinch",
    "Heron",
    "Kingfisher",
    "Pheasant",
    "Puffin",
    "Robin",
    "Sparrow",
    "Swan",
    "Wren",
  ],
  Biscuit: [
    "Bourbon",
    "Chocolate digestive",
    "Custard cream",
    "Digestive",
    "Garibaldi",
    "Ginger nut",
    "Hobnob",
    "Jammie Dodger",
    "Malted milk",
    "Pink Wafer",
    "Rich Tea",
    "Shortbread",
    "Tunnock\'s Caramel Wafer",
    "Viennese Whirl",
    "Wagon Wheel",
  ],
  "Childhood game": [
    "Board games",
    "British bulldogs",
    "Building dens",
    "Card games",
    "Conkers",
    "Elastics",
    "French cricket",
    "Hide and seek",
    "Hopscotch",
    "Marbles",
    "Rounders",
    "Skipping",
    "Stuck in the mud",
    "Tag",
  ],
  "Comfort food": [
    "Bacon sandwich",
    "Beans on toast",
    "Bread and butter pudding",
    "Cheese on toast",
    "Cottage pie",
    "Fish and chips",
    "Pasta",
    "Porridge",
    "Rice pudding",
    "Roast dinner",
    "Scrambled eggs",
    "Shepherd\'s pie",
    "Soup",
    "Toast",
  ],
  Drink: [
    "Beer",
    "Champagne",
    "Cider",
    "Coffee",
    "Gin & tonic",
    "Hot chocolate",
    "Juice",
    "Red wine",
    "Soft drink",
    "Stout",
    "Tea",
    "Whisky",
    "White wine",
  ],
  Film: [
    "Brief Encounter",
    "Casablanca",
    "Four Weddings and a Funeral",
    "Gone with the Wind",
    "Gregory\'s Girl",
    "It\'s a Wonderful Life",
    "Lawrence of Arabia",
    "Local Hero",
    "Paddington 2",
    "Schindler\'s List",
    "Some Like It Hot",
    "The Italian Job",
    "The Shawshank Redemption",
    "The Sound of Music",
    "Whisky Galore",
  ],
  "Film genre": [
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Horror",
    "Musical",
    "Romance",
    "Science fiction",
    "Thriller",
    "War film",
    "Western",
  ],
  Flower: [
    "Bluebell",
    "Daffodil",
    "Daisy",
    "Foxglove",
    "Lavender",
    "Lily",
    "Magnolia",
    "Peony",
    "Poppy",
    "Primrose",
    "Rose",
    "Sunflower",
    "Sweet pea",
    "Wisteria",
  ],
  "Form of exercise": [
    "Cycling",
    "Dancing",
    "Football",
    "Gardening",
    "Golf",
    "Pilates",
    "Running",
    "Swimming",
    "Tai chi",
    "Tennis",
    "Walking",
    "Yoga",
  ],
  Hobby: [
    "Birdwatching",
    "Collecting",
    "Cooking",
    "Crosswords or puzzles",
    "Fishing",
    "Gardening",
    "Knitting or sewing",
    "Model making",
    "Painting or drawing",
    "Photography",
    "Playing music",
    "Reading",
    "Volunteering",
    "Walking",
    "Woodwork",
  ],
  Instrument: [
    "Accordion",
    "Banjo",
    "Cello",
    "Drums",
    "Flute",
    "Guitar",
    "Harp",
    "Organ",
    "Piano",
    "Saxophone",
    "Trumpet",
    "Violin",
    "Voice",
  ],
  Landscape: [
    "Chalk downs",
    "City skyline",
    "Coastline",
    "Farmland",
    "Harbour",
    "Loch",
    "Mountains",
    "Open moorland",
    "River valley",
    "Rolling hills",
    "Village green",
    "Woodland",
  ],
  "Music era": [
    "Eighties pop",
    "Jazz age",
    "Nineties indie and dance",
    "Noughties",
    "Rock and roll",
    "Seventies soul and funk",
    "Streaming era",
    "Swinging sixties",
  ],
  "Music genre": [
    "Blues",
    "Classical",
    "Country",
    "Electronic",
    "Folk",
    "Hip-Hop",
    "Jazz",
    "Musical theatre",
    "Pop",
    "Reggae",
    "Rock",
    "Soul",
  ],
  Place: [
    "Abroad",
    "By river",
    "Childhood home",
    "City",
    "Countryside",
    "Garden",
    "Home",
    "Mountains",
    "Pub",
    "Seaside",
  ],
  Poet: [
    "Dylan Thomas",
    "Emily Dickinson",
    "John Betjeman",
    "John Keats",
    "Mary Oliver",
    "Maya Angelou",
    "Pam Ayres",
    "Philip Larkin",
    "R.S. Thomas",
    "Roger McGough",
    "Seamus Heaney",
    "Ted Hughes",
    "W.B. Yeats",
    "Wilfred Owen",
    "William Shakespeare",
  ],
  "School subject": [
    "Art",
    "Drama",
    "English",
    "Geography",
    "History",
    "Languages",
    "Maths",
    "Music",
    "PE",
    "RE",
    "Science",
    "Woodwork or cookery",
  ],
  Smell: [
    "Bonfire",
    "Bread baking",
    "Coffee in morning",
    "Fresh laundry",
    "Freshly cut grass",
    "Garden after rain",
    "Lavender",
    "Old books",
    "Old churches",
    "Petrol",
    "Rain on dry earth",
    "Sea air",
    "Sunscreen",
    "Woodsmoke",
  ],
  Song: [
    "Abide With Me — traditional",
    "Angels — Robbie Williams",
    "Bohemian Rhapsody — Queen",
    "Danny Boy — traditional",
    "Don\'t Look Back in Anger — Oasis",
    "Jerusalem — Parry",
    "My Way — Frank Sinatra",
    "Over the Rainbow — Judy Garland",
    "Waterloo Sunset — The Kinks",
    "What a Wonderful World — Louis Armstrong",
    "Wind Beneath My Wings — Bette Midler",
    "You\'ll Never Walk Alone — traditional",
  ],
  "Sport to play": [
    "Badminton",
    "Bowls",
    "Cricket",
    "Cycling",
    "Darts",
    "Football",
    "Golf",
    "Running",
    "Swimming",
    "Table tennis",
    "Tennis",
    "Walking",
  ],
  "Sport to watch": [
    "Athletics",
    "Bowls",
    "Cricket",
    "Cycling",
    "Darts",
    "Football",
    "Golf",
    "Horse racing",
    "Rugby",
    "Snooker",
    "Swimming",
    "Tennis",
  ],
  Tree: [
    "Apple",
    "Beech",
    "Cherry blossom",
    "Elm",
    "Horse chestnut",
    "Oak",
    "Pine",
    "Rowan",
    "Scots pine",
    "Silver birch",
    "Willow",
    "Yew",
  ],
  "TV show": [
    "Chat show",
    "Cooking show",
    "Crime thriller",
    "Drama series",
    "Nature documentary",
    "News programme",
    "Period drama",
    "Quiz show",
    "Reality show",
    "Sitcom",
    "Soap opera",
    "Sport",
  ],
  "Type of book": [
    "Biography",
    "Children\'s books",
    "Crime fiction",
    "History",
    "Memoir",
    "Nature writing",
    "Novel",
    "Poetry",
    "Science fiction",
    "Self-help",
    "Short stories",
    "Travel writing",
  ],
  "Type of holiday": [
    "Beach holiday",
    "Camping",
    "City break",
    "Countryside retreat",
    "Cruise",
    "Skiing",
    "Staycation",
    "Visiting family",
    "Walking holiday",
    "Winter sun",
  ],
  "Type of song": [
    "Anthem",
    "Folk song",
    "Hymn or spiritual",
    "Love song",
    "Lullaby",
    "Show tune",
    "Song from childhood",
    "Song that makes you cry",
    "Song that makes you dance",
    "Song that tells story",
  ],
  "Way to spend Sunday": [
    "Cooking something special",
    "Doing absolutely nothing",
    "Drive in countryside",
    "Going to church",
    "Lie in",
    "Long walk",
    "Pottering in garden",
    "Pub lunch",
    "Reading all day",
    "Roast dinner with family",
    "Visiting somewhere new",
    "Watching sport",
  ],
  "Way to travel": [
    "By bicycle",
    "By boat",
    "By bus",
    "By car",
    "By plane",
    "By train",
    "On foot",
    "On motorbike",
  ],
  Weather: [
    "Blustery wind",
    "Bright sunshine",
    "Crisp frost",
    "Dewy spring morning",
    "Golden autumn light",
    "Light snow",
    "Misty morning",
    "Overcast and mild",
    "Thunderstorm",
    "Warm rain",
  ],
  "Weather for walk": [
    "After rain",
    "Autumn drizzle",
    "Blustery and wild",
    "Bright spring day",
    "Crisp winter morning",
    "Golden hour",
    "Misty and still",
    "Warm summer evening",
  ],
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedCharities() {
  console.log("Seeding charities…")
  let inserted = 0
  for (const charity of charities) {
    const { data: existing } = await supabase
      .from("charities")
      .select("id")
      .eq("name", charity.name)
      .maybeSingle()
    if (existing) continue
    const { error } = await supabase.from("charities").insert(charity)
    if (error) console.error(`  ✗ ${charity.name}:`, error.message)
    else inserted++
  }
  console.log(
    `  ${inserted} inserted, ${charities.length - inserted} already existed`
  )
}

async function seedCategories() {
  console.log("Seeding categories…")
  let inserted = 0
  for (const cat of categories) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("label", cat.label)
      .maybeSingle()
    if (existing) continue
    const { error } = await supabase.from("categories").insert(cat)
    if (error) console.error(`  ✗ ${cat.label}:`, error.message)
    else inserted++
  }
  console.log(
    `  ${inserted} inserted, ${categories.length - inserted} already existed`
  )
}

async function seedTopics() {
  console.log("Seeding topics…")
  let inserted = 0
  let updated = 0
  for (const topic of topics) {
    const { data: existing } = await supabase
      .from("topics")
      .select("id, is_finite")
      .eq("title", topic.title)
      .maybeSingle()

    if (existing) {
      const patch: Record<string, unknown> = {
        placeholders: topic.placeholders,
      }
      if (existing.is_finite !== topic.is_finite)
        patch.is_finite = topic.is_finite
      await supabase.from("topics").update(patch).eq("id", existing.id)
      updated++
      continue
    }

    const { error } = await supabase.from("topics").insert({
      title: topic.title,
      description: topic.description,
      is_finite: topic.is_finite,
      is_active: true,
      placeholders: topic.placeholders,
    })
    if (error) console.error(`  ✗ ${topic.title}:`, error.message)
    else inserted++
  }
  console.log(`  ${inserted} inserted, ${updated} updated`)
}

async function seedTopicItems() {
  console.log("Seeding topic items…")
  let inserted = 0

  const { data: allTopics } = await supabase.from("topics").select("id, title")
  const topicByTitle = Object.fromEntries(
    (allTopics ?? []).map((t) => [t.title, t.id])
  )

  for (const [title, items] of Object.entries(topicItems)) {
    const topicId = topicByTitle[title]
    if (!topicId) {
      console.error(`  ✗ Topic not found: ${title}`)
      continue
    }

    const { data: existing } = await supabase
      .from("topic_items")
      .select("label")
      .eq("topic_id", topicId)
    const existingLabels = new Set(
      (existing ?? []).map((i: { label: string }) => i.label.toLowerCase())
    )

    const orderMap = topicItemDisplayOrder[title]
    const toInsert = items
      .filter((label) => !existingLabels.has(label.toLowerCase()))
      .map((label) => ({
        topic_id: topicId,
        label,
        is_canonical: true,
        source: "seed",
        markets: ["en-GB"],
        ...(orderMap?.[label] !== undefined
          ? { display_order: orderMap[label] }
          : {}),
      }))

    if (toInsert.length === 0) continue

    const { error } = await supabase.from("topic_items").insert(toInsert)
    if (error) console.error(`  ✗ Items for "${title}":`, error.message)
    else inserted += toInsert.length
  }

  console.log(`  ${inserted} items inserted`)
}

async function seedTopicCategories() {
  console.log("Seeding topic–category links…")
  let inserted = 0

  const { data: allTopics } = await supabase.from("topics").select("id, title")
  const topicByTitle = Object.fromEntries(
    (allTopics ?? []).map((t) => [t.title, t.id])
  )

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, label")
  const categoryByLabel = Object.fromEntries(
    (allCategories ?? []).map((c: { id: string; label: string }) => [
      c.label,
      c.id,
    ])
  )

  for (const topic of topics) {
    const topicId = topicByTitle[topic.title]
    if (!topicId) continue

    for (const catLabel of topic.categories) {
      const categoryId = categoryByLabel[catLabel]
      if (!categoryId) {
        console.error(`  ✗ Category not found: ${catLabel}`)
        continue
      }

      const { data: existing } = await supabase
        .from("topic_categories")
        .select("topic_id")
        .eq("topic_id", topicId)
        .eq("category_id", categoryId)
        .maybeSingle()

      if (existing) continue

      const { error } = await supabase
        .from("topic_categories")
        .insert({ topic_id: topicId, category_id: categoryId })
      if (error)
        console.error(`  ✗ Link ${topic.title} → ${catLabel}:`, error.message)
      else inserted++
    }
  }

  console.log(`  ${inserted} links inserted`)
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Starting seed…\n")
  await seedCharities()
  await seedCategories()
  await seedTopics()
  await seedTopicItems()
  await seedTopicCategories()
  console.log("\nSeed complete.")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
