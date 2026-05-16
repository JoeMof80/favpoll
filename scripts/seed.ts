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
    name: "Alzheimer's Society",
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
    description: "UK's largest dog welfare charity",
    registered_number: "227523",
  },
  {
    name: "RSPCA",
    description: "Preventing cruelty and promoting kindness to animals",
    registered_number: "219099",
  },
  {
    name: "St Mungo's",
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
    name: "St Richard's Hospice",
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
    name: "Children's Society",
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

type TopicPlaceholders = {
  [occasion: string]: { framing: string; quote: string }
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
        framing: "Belinda loved purple — which colour do you love?",
        quote:
          "She always had something lavender in the garden. Every summer without fail…",
      },
      tribute: {
        framing:
          "David wore purple to everything important — which colour do you love?",
        quote:
          "He always had a pocket square. Always the same shade. Nobody ever asked why…",
      },
      birthday: {
        framing:
          "Sarah has been known to redecorate entire rooms around a colour — which colour do you love?",
        quote:
          "She spent three weekends deliberating between sage and duck egg. She still brings it up…",
      },
      retirement: {
        framing:
          "David always said navy was the only colour worth trusting — which colour do you love?",
        quote:
          "Same tie. Every important meeting. Thirty years. Navy, obviously…",
      },
      wedding: {
        framing:
          "Emma says blue. James says green. They still haven't agreed — which colour do you love?",
        quote:
          "They've left one wall unpainted for five years. Still can't agree…",
      },
      anniversary: {
        framing:
          "Forty years of painting walls and they still argue about the colour — which colour do you love?",
        quote:
          "The sitting room has been repainted twice. The colour is still wrong, apparently…",
      },
      leaving: {
        framing:
          "Priya wore colour like she meant it — which colour do you love?",
        quote:
          "The office felt genuinely greyer the day she left. Make of that what you will…",
      },
      graduation: {
        framing:
          "Tom's degree show had a colour palette he'd been refining for three years — which colour do you love?",
        quote:
          "He said he chose it logically. It was clearly entirely instinctive…",
      },
      christening: {
        framing:
          "Lily arrived in a world full of colour — which colour do you love?",
        quote:
          "We've all got opinions on what her room should be. We're saving them for the right moment…",
      },
      achievement: {
        framing:
          "Marcus wore orange for every training run so the cars could see him — which colour do you love?",
        quote:
          "Eight months of early mornings, mostly in orange. It's earned its place…",
      },
      recovery: {
        framing:
          "Claire said yellow always helped — something about brightness when everything felt grey — which colour do you love?",
        quote: "She surrounded herself with it. Not aggressively. Just enough…",
      },
      award: {
        framing:
          "Amelia's classroom is full of colour — she believes it changes how students think — which colour do you love?",
        quote:
          "She's probably right. The research backs her up. But she knew it before the research…",
      },
      promotion: {
        framing:
          "Kwame always said design begins with colour — which colour do you love?",
        quote:
          "He has opinions about this. Specific ones. They're worth listening to…",
      },
      celebration: {
        framing: "Today is full of colour — which colour do you love?",
        quote: "Tell us which colour, and what it says about you…",
      },
      other: {
        framing:
          "Every gathering has its own colours — which colour do you love?",
        quote: "Name a colour and say what it means to you…",
      },
      default: {
        framing: "Which colour do you love — and what does it say about you?",
        quote:
          "Name a colour and tell the story behind it. The more specific, the better…",
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
        framing:
          "Belinda loved spring — always the first with seeds in the ground — which season do you love?",
        quote:
          "She'd have the garden ready before anyone else had put away their winter coat…",
      },
      tribute: {
        framing:
          "David loved the transition into autumn — said it was when things got interesting — which season do you love?",
        quote:
          "He was the kind of person who suited October. Something about the quality of the light…",
      },
      birthday: {
        framing:
          "Sarah says she loves autumn but her friends say she's actually a summer person — which season do you love?",
        quote:
          "She plans her whole year around the season she's in. Right now it's complicated…",
      },
      retirement: {
        framing:
          "David always said autumn was when real work got done — which season do you love?",
        quote:
          "The best project always came together in October. Every year, without fail…",
      },
      wedding: {
        framing:
          "Emma and James met at a summer festival — but which season do you actually love?",
        quote:
          "She says spring. He says she's wrong. They've been at this for five years…",
      },
      anniversary: {
        framing:
          "They've had forty springs together and still disagree about when to plant — which season do you love?",
        quote:
          "She plants in March. He says April. Neither of them is entirely wrong…",
      },
      leaving: {
        framing:
          "Priya said she felt most herself in spring — which season do you love?",
        quote:
          "She arrived in January and changed everything by March. That tracks…",
      },
      graduation: {
        framing:
          "Tom spent his whole final year in the studio and emerged, blinking, into summer — which season do you love?",
        quote:
          "He saw very little daylight between January and May. Summer was particularly welcome…",
      },
      christening: {
        framing: "Lily arrived in spring — which season do you love?",
        quote:
          "She came just as the garden was starting. The timing was perfect…",
      },
      achievement: {
        framing:
          "Marcus trained through every season but the marathon itself was a crisp October morning — which season do you love?",
        quote:
          "He'll always associate autumn with finishing something. Which season is yours?",
      },
      recovery: {
        framing:
          "Claire says spring felt different this year — which season do you love?",
        quote:
          "She noticed things she'd never noticed before. The season felt like it was specifically for her…",
      },
      award: {
        framing:
          "Amelia said autumn was when her students were hungriest — which season do you love?",
        quote: "September energy. First week back. She lives for it…",
      },
      promotion: {
        framing:
          "Kwame celebrated his promotion on the first warm day of the year — which season do you love?",
        quote: "It happened to be perfect weather. He took note of that…",
      },
      celebration: {
        framing:
          "Whichever season this is, it's the right one — which season do you love?",
        quote:
          "Tell us which season and what it gives you that the others can't…",
      },
      other: {
        framing:
          "Some gatherings belong to a particular season — which season do you love?",
        quote: "Pick a season and say what makes it yours…",
      },
      default: {
        framing:
          "Which season do you love — and what is it about that particular time of year?",
        quote: "Pick a season and say what it gives you that no other can…",
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
        framing:
          "Belinda lived for Sunday — long lunch, garden, Radio 4 — which day do you love?",
        quote:
          "If you wanted her on a Sunday, you had to know the schedule. It was sacred…",
      },
      tribute: {
        framing:
          "David held court on Thursday evenings — which day do you love?",
        quote:
          "Everyone knew Thursday was the night for a proper conversation. It became tradition by accident…",
      },
      birthday: {
        framing:
          "Sarah always said Thursday had the best energy — which day do you love?",
        quote:
          "She somehow managed to make Wednesday feel like the weekend. No one could explain it…",
      },
      retirement: {
        framing:
          "David perfected his Monday morning for thirty-five years — which day do you love?",
        quote:
          "He always said weekends were just Mondays with better lighting…",
      },
      wedding: {
        framing:
          "Emma and James got engaged on a Sunday — which day do you love?",
        quote:
          "They met on a Friday, got engaged on a Sunday, and have never agreed on a favourite day since…",
      },
      anniversary: {
        framing:
          "Forty years of Sundays — they've had more of those together than any other day — which day do you love?",
        quote:
          "Same routine, same cup of tea. The Sunday has never changed. That's the whole point…",
      },
      leaving: {
        framing:
          "Priya made every Tuesday feel like an event — which day do you love?",
        quote:
          "She made Tuesday lunches feel like the best part of the week. We're still not sure how…",
      },
      graduation: {
        framing:
          "Tom said Fridays at university felt earned — which day do you love?",
        quote:
          "Five days in the studio, then Friday felt like a reward. He worked for every one of them…",
      },
      christening: {
        framing: "Lily was born on a Tuesday — which day do you love?",
        quote:
          "She arrived on a Tuesday and immediately made it feel significant…",
      },
      achievement: {
        framing:
          "The marathon was a Sunday — Marcus says Sundays will never feel the same — which day do you love?",
        quote:
          "He ran 26.2 miles and finished before the Sunday papers were read. Quite a morning…",
      },
      recovery: {
        framing:
          "Claire says she started counting Mondays differently this year — which day do you love?",
        quote: "Each one a milestone. Each one its own small arrival…",
      },
      award: {
        framing:
          "Amelia says Thursday is her best teaching day — which day do you love?",
        quote:
          "By Thursday the class has found its rhythm and she has theirs. She wouldn't swap it…",
      },
      promotion: {
        framing:
          "Kwame got the call on a Wednesday and had to wait until Monday to tell the team — which day do you love?",
        quote:
          "The longest Thursday and Friday of his career. The Monday was worth it…",
      },
      celebration: {
        framing: "Today is the best day of the week — which day do you love?",
        quote: "Tell us which day is yours and what makes it the best one…",
      },
      other: {
        framing:
          "Which day of the week do you love — and what makes it distinctly yours?",
        quote: "Pick a day and say what it gives you that no other can…",
      },
      default: {
        framing: "Which day of the week do you love — and what makes it yours?",
        quote: "Pick a day and tell us what makes it the best…",
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
        framing:
          "Belinda loved breakfast — still at the table at eleven — which meal do you love?",
        quote: "That was the whole point of a Saturday. Never rushed it once…",
      },
      tribute: {
        framing:
          "David always had time for a proper lunch — never at a desk, always with someone — which meal do you love?",
        quote:
          "He believed no important conversation should happen on an empty stomach. He practised what he preached…",
      },
      birthday: {
        framing:
          "Sarah treats dinner like a performance — which meal do you love?",
        quote:
          "She once cancelled a lunch to spend the afternoon making proper stock. No regrets…",
      },
      retirement: {
        framing:
          "David spent thirty-five years eating lunch at his desk — which meal do you love?",
        quote:
          "He's already planning a standing reservation somewhere with a good wine list…",
      },
      wedding: {
        framing:
          "Emma and James have strong opinions about brunch — which meal do you love?",
        quote:
          "They've spent three years arguing about whether brunch counts as a meal. It does, obviously…",
      },
      anniversary: {
        framing:
          "Forty years of Sunday lunches and they've only argued about the gravy a handful of times — which meal do you love?",
        quote: "The gravy debate is ongoing. Everything else is settled…",
      },
      leaving: {
        framing:
          "Priya made every ten-minute lunch feel like the best part of the day — which meal do you love?",
        quote:
          "She had a way of turning a lunch break into something worth looking forward to…",
      },
      graduation: {
        framing:
          "Tom survived on late-night toast and reheated pasta and says dinner is now sacred — which meal do you love?",
        quote:
          "Three years of questionable meals. The world is full of better options now…",
      },
      christening: {
        framing:
          "The family gathered for lunch to welcome Lily — which meal do you love?",
        quote: "Some meals are just meals. This one was for something bigger…",
      },
      achievement: {
        framing:
          "Marcus's post-marathon meal was a full breakfast — well earned — which meal do you love?",
        quote:
          "26.2 miles and what he wanted more than anything was eggs. He had them…",
      },
      recovery: {
        framing:
          "Claire says breakfast tastes different now — she means it in the best possible way — which meal do you love?",
        quote:
          "Some meals become something more than food. Breakfast became that for her…",
      },
      award: {
        framing:
          "Amelia takes her school lunch seriously — she says teachers who eat at their desks send the wrong message — which meal do you love?",
        quote:
          "She means it. She's been known to collect a colleague from their desk and insist…",
      },
      promotion: {
        framing:
          "Kwame took the team to dinner to celebrate — which meal do you love?",
        quote: "He insisted. He chose. It was exactly right…",
      },
      celebration: {
        framing:
          "Every celebration deserves a proper meal — which meal do you love?",
        quote: "Tell us which one and why it beats all the others…",
      },
      other: {
        framing:
          "Which meal of the day do you love — and what makes it the best?",
        quote: "Pick a meal and make the case for it…",
      },
      default: {
        framing:
          "Which meal of the day do you love — and what makes it the best?",
        quote:
          "Tell us which meal and why. It says more about a person than you'd think…",
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
        framing:
          "Belinda loved the early morning — half the garden done before the world woke up — which time do you love?",
        quote:
          "She always said the best thinking happened before anyone else was awake…",
      },
      tribute: {
        framing:
          "David was best in the late afternoon — when conversations had nowhere to be — which time of day do you love?",
        quote:
          "He'd always be there at 5pm with something worth saying. The timing was never an accident…",
      },
      birthday: {
        framing: "Sarah comes alive after 9pm — which time of day do you love?",
        quote:
          "She's been known to start an elaborate dinner at 10pm. No one complains…",
      },
      retirement: {
        framing:
          "David was always best at 7am, fresh coffee and full focus — which time of day do you love?",
        quote:
          "He'd solved the hardest problems before the rest of the team had parked their cars…",
      },
      wedding: {
        framing:
          "Emma loves golden hour. James loves late evening — which time of day do you love?",
        quote:
          "They're happiest on long evenings when neither of them thinks to check the time…",
      },
      anniversary: {
        framing:
          "They're both morning people — which is why forty years worked so well — which time of day do you love?",
        quote:
          "Early morning tea. No phones. No plans. That's been the whole foundation of it…",
      },
      leaving: {
        framing:
          "Priya had a way of making 3pm feel like the beginning of something — which time of day do you love?",
        quote:
          "That hour belonged to her. The office felt it most around then…",
      },
      graduation: {
        framing:
          "Tom says midnight was when the best work happened — which time of day do you love?",
        quote:
          "Three years of 2am renders and decisions that looked different in the morning. All worth it…",
      },
      christening: {
        framing:
          "Lily has strong opinions about what time of day matters — which time do you love?",
        quote: "She's made her views very clear, mostly between 2am and 4am…",
      },
      achievement: {
        framing:
          "Marcus ran the marathon from 8am — which time of day do you love?",
        quote:
          "He was on mile 12 before most people had checked their phones. There's something in that…",
      },
      recovery: {
        framing:
          "Claire says mornings feel different now — lighter — which time of day do you love?",
        quote: "She started noticing them more. Noticing them properly…",
      },
      award: {
        framing:
          "Amelia says the best teaching happens in the first hour — which time of day do you love?",
        quote:
          "The 9am lesson. Everyone still awake, still up for it. She plans everything around that energy…",
      },
      promotion: {
        framing:
          "Kwame does his best thinking at 6am and his best presenting at 10 — which time of day do you love?",
        quote:
          "He's found the hours that are his. Everything else is scheduled around them…",
      },
      celebration: {
        framing:
          "The best time of day is right now — which time of day do you love?",
        quote: "Tell us your time, and what it gives you…",
      },
      other: {
        framing:
          "Which time of day do you love — the hour that belongs to you?",
        quote: "Pick your time and say why it's yours…",
      },
      default: {
        framing:
          "Which time of day do you love — the hour when you're most alive?",
        quote:
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
        framing:
          "Belinda always said the sixties changed everything — which decade do you love?",
        quote:
          "She kept a box of photos from 1968 that she'd show anyone who asked. And many who didn't…",
      },
      tribute: {
        framing:
          "David said the nineties were when he really found his voice — which decade do you love?",
        quote:
          "He had a theory about music and decades that started with Coltrane and ended with Radiohead…",
      },
      birthday: {
        framing:
          "Sarah's aesthetic is deeply eighties and she's not sorry about it — which decade do you love?",
        quote:
          "She knows every word to every song from 1986. Don't test her on this…",
      },
      retirement: {
        framing:
          "David always said the nineties were when the real work got done — which decade do you love?",
        quote:
          "He joined the firm in 1989. The engineers who were there would agree…",
      },
      wedding: {
        framing:
          "Emma and James are both children of the nineties who'd never admit it — which decade do you love?",
        quote:
          "Their first date playlist covered entirely the wrong decade for both of them. It worked anyway…",
      },
      anniversary: {
        framing:
          "Mum and Dad got married in the seventies — which decade do you love?",
        quote:
          "Forty years makes you a time traveller. Ask them about the decades they've lived through…",
      },
      leaving: {
        framing:
          "Priya always said the noughties were underrated — which decade do you love?",
        quote:
          "She arrived already shaped by the right decade. We just got lucky with the timing…",
      },
      graduation: {
        framing:
          "Tom came of age in the noughties and would probably tell you why at length — which decade do you love?",
        quote:
          "He has opinions about architecture's relationship with each decade. It's a long but worthwhile conversation…",
      },
      christening: {
        framing:
          "Lily is the first person in this family born in the 2020s — which decade do you love?",
        quote:
          "She starts her story in a new decade. The rest of us have our own…",
      },
      achievement: {
        framing:
          "Marcus says the training reminded him of everything he loved about the 2000s — which decade do you love?",
        quote:
          "Something about getting up before dawn in the cold felt specifically like a particular era…",
      },
      recovery: {
        framing:
          "Claire said this decade already felt different — in the best sense — which decade do you love?",
        quote: "It's still early. The decade is already earning its place…",
      },
      award: {
        framing:
          "Amelia believes the nineties were when education got interesting — which decade do you love?",
        quote:
          "She has reasons. Very specific reasons. They're worth asking her about…",
      },
      promotion: {
        framing:
          "Kwame thinks the 2010s were when product thinking finally grew up — which decade do you love?",
        quote: "He'll defend this position. He's also probably right…",
      },
      celebration: {
        framing: "Every decade had its golden era — which decade do you love?",
        quote: "Pick the one that gave you something no other could…",
      },
      other: {
        framing: "Which decade do you love — the era that shaped you most?",
        quote: "Name the decade and say what it gave you…",
      },
      default: {
        framing:
          "Which decade do you love — and what was it about that particular era?",
        quote:
          "Pick a decade and say what it gave you that nothing else could…",
      },
    },
  },

  // ── Infinite ─────────────────────────────────────────────────────────────────
  {
    title: "Animal",
    description: "Creature they felt closest to",
    is_finite: false,
    categories: ["Nature", "Childhood"],
    placeholders: {
      memorial: {
        framing:
          "Belinda had a soft spot for foxes — they'd always turn up in her garden — which animal do you love?",
        quote:
          "She always said animals knew things people didn't. I'm not sure she was wrong…",
      },
      tribute: {
        framing:
          "David had something of the patient heron about him — always in exactly the right place — which animal do you love?",
        quote:
          "He knew when to stay still. He knew when to move. Both exactly right, every time…",
      },
      birthday: {
        framing:
          "Sarah has always said she's a cat person, but behaves like a dog person — which animal do you love?",
        quote:
          "She once spent an evening convincing everyone that dogs have better emotional intelligence than most managers…",
      },
      retirement: {
        framing:
          "David has always had something of the old labrador about him — which animal do you love?",
        quote:
          "His colleagues always said you knew where you stood with him. Steady, loyal, never fussed…",
      },
      wedding: {
        framing:
          "Emma loves otters. James loves dogs. They haven't resolved this — which animal do you love?",
        quote:
          "She's got swallow energy. He's more of a heron. Somehow it works perfectly…",
      },
      anniversary: {
        framing:
          "After forty years together they've agreed on dogs but not on the breed — which animal do you love?",
        quote:
          "The dog question remains open. Everything else has been resolved…",
      },
      leaving: {
        framing:
          "Priya always said she was a fox in a house of golden retrievers — which animal do you love?",
        quote:
          "She meant it as a compliment to everyone involved. Knowing her, it was…",
      },
      graduation: {
        framing:
          "Tom's tutor always said he had the single-mindedness of a migratory bird — which animal do you love?",
        quote:
          "He got the first-class degree and immediately wanted to be somewhere else. Classic migratory instinct…",
      },
      christening: {
        framing:
          "Everyone has an animal they think Lily will love — which animal do you love?",
        quote:
          "She'll make up her own mind. But it's worth starting the conversation now…",
      },
      achievement: {
        framing:
          "Marcus says he started to feel like a horse around mile 20 — just keeping going — which animal do you love?",
        quote: "He'll look back on this and know something true about himself…",
      },
      recovery: {
        framing:
          "Claire says birds came to mean something to her this year — which animal do you love?",
        quote: "She started noticing them more. Noticing them properly…",
      },
      award: {
        framing:
          "Amelia's classroom has always had something wildlife-related on the wall — which animal do you love?",
        quote:
          "She says it makes students think about instinct and adaption. It also makes them smile…",
      },
      promotion: {
        framing:
          "Kwame always said the best product teams have the instincts of a border collie — which animal do you love?",
        quote:
          "He means focused, energetic, excellent at herding things that need herding. A compliment, clearly…",
      },
      celebration: {
        framing:
          "Every gathering has an animal spirit — which animal do you love?",
        quote: "Pick the one that says something true about who you are…",
      },
      other: {
        framing:
          "Which animal do you love — and what does it tell us about you?",
        quote: "Pick an animal that captures something true…",
      },
      default: {
        framing: "Which animal do you love — and what does it say about you?",
        quote:
          "Pick the animal that captures something true about who you are…",
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
        framing: "Belinda always stopped for a robin — which bird do you love?",
        quote:
          "She could identify a bird by its song before it appeared. It seemed impossible, until you knew her…",
      },
      tribute: {
        framing:
          "David always reminded people of a blackbird — clear voice, unhurried — which bird do you love?",
        quote:
          "He could fill a room without raising his volume. That's a blackbird…",
      },
      birthday: {
        framing:
          "Sarah once spotted a puffin from a moving ferry and talked about it for an hour — which bird do you love?",
        quote:
          "She has a birdwatching list she claims not to take seriously. She does…",
      },
      retirement: {
        framing:
          "David always had a bit of the heron about him — patient, watchful, then exactly right — which bird do you love?",
        quote:
          "You'd hear him described the same way by everyone who worked with him…",
      },
      wedding: {
        framing:
          "Emma and James are birds who found each other — which bird do you love?",
        quote:
          "Separately they're completely different birds. Together they somehow make perfect sense…",
      },
      anniversary: {
        framing:
          "They've watched the same birds in the same garden for forty years — which bird do you love?",
        quote:
          "The robin always comes back. Every year. They leave it crumbs on the same wall…",
      },
      leaving: {
        framing:
          "Priya always said she felt most like a swift — always moving, hard to pin down — which bird do you love?",
        quote:
          "She was the kind of bird that makes you notice the sky more when they're gone…",
      },
      graduation: {
        framing:
          "Tom's tutors said he had the eye of a hawk — detail, precision, always scanning — which bird do you love?",
        quote: "Three years of training his eye. It's now very, very sharp…",
      },
      christening: {
        framing:
          "Lily came into a world full of birdsong — which bird do you love?",
        quote:
          "The garden was loud the morning she arrived. A good sign from a particularly good robin…",
      },
      achievement: {
        framing:
          "Marcus said at mile 18 he felt like a swift — just instinct and movement — which bird do you love?",
        quote:
          "He didn't think. He just ran. He'll understand that better in a few months…",
      },
      recovery: {
        framing:
          "Claire has started birdwatching — she says it teaches you to be where you are — which bird do you love?",
        quote: "She's not wrong. Something about watching birds does that…",
      },
      award: {
        framing:
          "Amelia compares herself to an owl — patient, wide-eyed, good with the dark — which bird do you love?",
        quote: "She means it as a compliment to owls. They deserve it…",
      },
      promotion: {
        framing:
          "Kwame once said good product thinking is like a red kite — you need the big view — which bird do you love?",
        quote:
          "He still believes this. He's used it in three job interviews. It always landed…",
      },
      celebration: {
        framing: "Every person here has a bird — which one do you love?",
        quote: "Pick your bird. It says something…",
      },
      other: {
        framing: "Which bird do you love — and why that one?",
        quote: "Tell us the bird and what it gives you…",
      },
      default: {
        framing: "Which bird do you love — and why that one?",
        quote:
          "Pick a bird that captures something about the way you see the world…",
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
        framing:
          "Belinda's garden was famous for its sweet peas — which flower do you love?",
        quote:
          "She'd fill the house with them every June. The smell is still entirely hers…",
      },
      tribute: {
        framing:
          "David always arrived with flowers — nothing flashy, always exactly right — which flower do you love?",
        quote:
          "He had a florist he trusted and he trusted her completely. Never questioned a choice…",
      },
      birthday: {
        framing:
          "Sarah grew a whole windowsill of lavender just to prove she could — which flower do you love?",
        quote:
          "She could. She was very casual about telling everyone about it…",
      },
      retirement: {
        framing:
          "David's wife always said he was more of a rose person than he'd admit — which flower do you love?",
        quote:
          "He kept the same pot plant on his desk for fifteen years. We think it was a peace lily…",
      },
      wedding: {
        framing:
          "Emma carried wildflowers at their wedding. James didn't question it — which flower do you love?",
        quote:
          "She'd chosen them years before she met him. That tells you everything…",
      },
      anniversary: {
        framing:
          "The same flowers in the same vase on the same anniversary for forty years — which flower do you love?",
        quote: "The order never changes. It doesn't need to…",
      },
      leaving: {
        framing:
          "Priya always brought flowers in when something was worth celebrating — which flower do you love?",
        quote:
          "The office had flowers on the desk the day she arrived. It still does. That's her legacy…",
      },
      graduation: {
        framing:
          "Tom's mum brought flowers to the degree show — Tom said she shouldn't have apologised — which flower do you love?",
        quote: "He was right. The flowers were exactly the thing…",
      },
      christening: {
        framing:
          "Lily arrived to a room full of flowers — which flower do you love?",
        quote:
          "Everyone had brought something. It always should be that way, for an arrival like this…",
      },
      achievement: {
        framing:
          "Marcus crossed the finish line to a bunch of flowers from his sister — which flower do you love?",
        quote: "26.2 miles and the flowers were waiting. Which ones are yours?",
      },
      recovery: {
        framing:
          "Claire said sunflowers helped — all that height, all that reaching — which flower do you love?",
        quote:
          "She had them on the windowsill. Every week. Never let the window go without…",
      },
      award: {
        framing:
          "Amelia's students left flowers on her desk the morning the award was announced — which flower do you love?",
        quote: "Nobody organised it. It just happened. That's who they are…",
      },
      promotion: {
        framing:
          "Kwame's team sent flowers. He was embarrassed. He was also clearly delighted — which flower do you love?",
        quote: "He put them on his desk. They were there all week. We noticed…",
      },
      celebration: {
        framing:
          "Every celebration deserves flowers — which flower do you love?",
        quote: "Tell us which one and why it's yours…",
      },
      other: {
        framing: "Which flower do you love — and what does it remind you of?",
        quote:
          "A bloom that takes you somewhere, or one that just makes you stop…",
      },
      default: {
        framing: "Which flower do you love — and what does it remind you of?",
        quote:
          "A bloom that takes you somewhere, or one that just makes you stop…",
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
        framing:
          "Belinda planted an oak in her garden as a sapling — it's still there — which tree do you love?",
        quote:
          "She used to say a garden without a proper tree is just a lawn with ambitions…",
      },
      tribute: {
        framing:
          "David had something of the oak about him — which tree do you love?",
        quote: "Everybody's shade. Nobody's obstacle. That's the tree for him…",
      },
      birthday: {
        framing:
          "Sarah planted a rowan in her first garden. Said she needed something with structure — which tree do you love?",
        quote:
          "She has strong opinions about trees. Stronger than you'd expect…",
      },
      retirement: {
        framing:
          "David was always oak — deep-rooted, reliable, shelter for everyone — which tree do you love?",
        quote:
          "He never took up much space but the whole team was in his shade. That's the tree…",
      },
      wedding: {
        framing:
          "Emma and James planted a tree together on their first anniversary — which tree do you love?",
        quote:
          "Two saplings that found the same patch of light. Watch them grow…",
      },
      anniversary: {
        framing:
          "There's a tree in their garden they planted the year they got married — which tree do you love?",
        quote:
          "Forty years. It's enormous now. They still argue about whether they planted it in the right place…",
      },
      leaving: {
        framing:
          "Priya was always the tree in the room that made everything feel calmer — which tree do you love?",
        quote:
          "Some people are like a tree in an office. You don't notice how much shade they gave until they're gone…",
      },
      graduation: {
        framing:
          "Tom designed his final-year project around a silver birch — which tree do you love?",
        quote:
          "It was in the brief. He made it the whole piece. His tutors still mention it…",
      },
      christening: {
        framing:
          "Every family needs a tree to grow alongside — which tree do you love?",
        quote:
          "Lily has her whole life to find hers. She might already have one…",
      },
      achievement: {
        framing:
          "Marcus ran past the same oak at mile three every training morning — which tree do you love?",
        quote:
          "He has very strong feelings about that oak. It became the landmark the run was organised around…",
      },
      recovery: {
        framing:
          "Claire said she noticed trees differently this year — their patience, their permanence — which tree do you love?",
        quote:
          "Something about knowing they'd been there before and would be there after. She found that useful…",
      },
      award: {
        framing:
          "Amelia uses trees as a metaphor in every year group — which tree do you love?",
        quote:
          "The lesson is always about roots, reach, and the long game. She means it for the students. Also for herself…",
      },
      promotion: {
        framing:
          "Kwame said great product teams are like a tree — deep roots, visible canopy — which tree do you love?",
        quote: "He uses this metaphor at least once a month. It holds up…",
      },
      celebration: {
        framing:
          "Every celebration deserves something that grows — which tree do you love?",
        quote: "Name yours and say what it gives you…",
      },
      other: {
        framing: "Which tree do you love — and what does it mean to you?",
        quote: "Pick the tree that feels like yours…",
      },
      default: {
        framing: "Which tree do you love — and what does it give you?",
        quote: "Pick the tree that means something. They usually do…",
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
        framing:
          "Belinda loved a crisp winter morning — clear sky, cold air — which weather do you love?",
        quote:
          "She always said the best thinking happened in cold air. She was right…",
      },
      tribute: {
        framing:
          "David always said he did his best thinking in the rain — which weather do you love?",
        quote:
          "He didn't mind it at all. He had the quality of someone who simply didn't notice bad weather…",
      },
      birthday: {
        framing:
          "Sarah loves warm rain — unexpected but always right — which weather do you love?",
        quote:
          "She has the quality of a day that starts overcast and turns into the best of summer…",
      },
      retirement: {
        framing:
          "David was steady weather — the kind you could rely on — which weather do you love?",
        quote:
          "Retirement might be the first golden autumn after a very long, dependable summer…",
      },
      wedding: {
        framing:
          "It rained at Emma and James's wedding and they didn't notice — which weather do you love?",
        quote:
          "It rained for ten minutes and they didn't notice. That's what you need to know about them…",
      },
      anniversary: {
        framing:
          "In forty years they've had every kind of weather together — which do you love?",
        quote:
          "The storms passed. The sunshine came back. Same as ever. Which weather is yours?",
      },
      leaving: {
        framing:
          "Priya had the quality of a bright cold morning — you felt more awake when she walked in — which weather do you love?",
        quote:
          "The office had her particular weather for six years. We'll notice the change…",
      },
      graduation: {
        framing:
          "Tom walked out of his degree show into a grey Manchester day and it felt exactly right — which weather do you love?",
        quote: "He said the overcast suited the city. The city agreed…",
      },
      christening: {
        framing:
          "The weather the day Lily arrived was entirely irrelevant — which weather do you love?",
        quote:
          "She arrived. That was the weather. Everything else was background…",
      },
      achievement: {
        framing:
          "Marcus ran the marathon in cool autumn air — he says it was the best possible weather — which weather do you love?",
        quote:
          "Not too hot, not too cold. He'd trained in worse. He was ready for anything…",
      },
      recovery: {
        framing:
          "Claire said she started noticing the weather more — like seeing it properly for the first time — which weather do you love?",
        quote:
          "Light through a window. The specific quality of a cold morning. She noticed it all…",
      },
      award: {
        framing:
          "Amelia says the best lessons happen in the worst weather — something about being cosy and focused — which weather do you love?",
        quote:
          "November rain on school windows, central heating on, everyone in. Perfect conditions…",
      },
      promotion: {
        framing:
          "Kwame celebrated by walking home in the rain — said it felt like exactly the right thing to do — which weather do you love?",
        quote: "Not dramatic. Just right. That's what the moment needed…",
      },
      celebration: {
        framing:
          "All weather is good weather today — which weather do you love?",
        quote: "Tell us which sky belongs to you…",
      },
      other: {
        framing: "Which weather do you love — and what does it do for you?",
        quote: "The sky that changes how you feel — which one is it?",
      },
      default: {
        framing:
          "Which weather do you love — and what is it about that particular sky?",
        quote:
          "The weather that instantly lifts something in you — which one is it, and why?",
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
        framing:
          "Belinda always went back to the Lake District — which landscape do you love?",
        quote:
          "She said the fells reminded her to be patient. She walked them every year for fifty years…",
      },
      tribute: {
        framing:
          "David said certain landscapes made him think of particular people — which landscape do you love?",
        quote:
          "He'd quote geography the way other people quote poetry. It meant just as much to him…",
      },
      birthday: {
        framing:
          "Sarah dreams of the Scottish Highlands but lives in the city — which landscape do you love?",
        quote:
          "She has moorland in her soul and no particular plans to act on it. The moors can wait…",
      },
      retirement: {
        framing:
          "David kept a photo of the Dordogne on his desk for thirty-five years — which landscape do you love?",
        quote:
          "Thirty-five years of the same commute. Now the world is landscape-shaped and waiting…",
      },
      wedding: {
        framing:
          "Emma and James are happiest near water — which landscape do you love?",
        quote:
          "They've been arguing about coast versus mountains since their second date. Both are still winning…",
      },
      anniversary: {
        framing:
          "They've walked the same stretch of coast every anniversary — which landscape do you love?",
        quote:
          "Forty years of the same path. Still finding new things to notice…",
      },
      leaving: {
        framing:
          "Priya always said wide open spaces were where she thought most clearly — which landscape do you love?",
        quote:
          "She brought something expansive to everything she did. There's a landscape for that…",
      },
      graduation: {
        framing:
          "Tom said architecture only makes sense in relation to landscape — which landscape do you love?",
        quote:
          "He believes this profoundly. His degree show was partly about proving it…",
      },
      christening: {
        framing:
          "The landscape Lily grows up in will shape her — which landscape do you love?",
        quote: "We each have one. She'll find hers. What's yours?",
      },
      achievement: {
        framing:
          "The marathon route went through parkland and across a river — which landscape do you love?",
        quote:
          "He noticed none of it until afterwards, and then noticed everything…",
      },
      recovery: {
        framing:
          "Claire says open landscape helped — the space, the horizon — which landscape do you love?",
        quote:
          "She walked somewhere new every week. The landscape was doing something the walls couldn't…",
      },
      award: {
        framing:
          "Amelia takes her class outside whenever the weather allows — she says landscape is the best classroom — which landscape do you love?",
        quote:
          "She has a field she particularly loves. The class has learned a great deal in that field…",
      },
      promotion: {
        framing:
          "Kwame grew up near the sea and says it's still where he thinks best — which landscape do you love?",
        quote:
          "He hasn't lived near it in years. Doesn't matter. It's still the one…",
      },
      celebration: {
        framing:
          "Every celebration belongs somewhere — which landscape do you love?",
        quote: "The view that's entirely yours — which one is it?",
      },
      other: {
        framing: "Which landscape do you love — the one that feels like yours?",
        quote: "The view that brings you back to yourself…",
      },
      default: {
        framing:
          "Which landscape do you love — the view that feels like yours?",
        quote:
          "The view that brings you back to yourself — which one is it, and what does it give you?",
      },
    },
  },
  {
    title: "Place",
    description: "Where they were happiest",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      memorial: {
        framing:
          "Belinda was happiest in her garden or round her kitchen table — which place do you love?",
        quote:
          "Every conversation worth having happened at that kitchen table. We all still come back to it…",
      },
      tribute: {
        framing:
          "David was a person of particular places — a pub, a park bench, a back room — which place do you love?",
        quote:
          "You'd always find him in the same corner. He was extremely consistent about this…",
      },
      birthday: {
        framing:
          "Sarah has been to thirty countries and still says her grandmother's kitchen in Cork is her favourite — which place do you love?",
        quote:
          "She plans every trip carefully. That one she'd never planned at all…",
      },
      retirement: {
        framing:
          "David had a map on his office wall for thirty-five years. Now he can actually go — which place do you love?",
        quote:
          "He'd look at it every year and then go back to his desk. Not anymore…",
      },
      wedding: {
        framing:
          "Emma and James keep going back to the field where they met — which place do you love?",
        quote: "Not for the festival anymore. Just because it's theirs now…",
      },
      anniversary: {
        framing:
          "They went back to the place they got married for their fortieth — which place do you love?",
        quote: "Same place, different people. In all the best ways…",
      },
      leaving: {
        framing:
          "Priya has had the same flight saved in her browser for two years — which place do you love?",
        quote: "We think it's time. We're holding her to it…",
      },
      graduation: {
        framing:
          "Tom has a building in Manchester he calls his — which place do you love?",
        quote:
          "It's not his. He just knows exactly why it's good. He could explain it for an hour…",
      },
      christening: {
        framing:
          "Lily will grow up learning what it means to love a place — which place do you love?",
        quote: "We each have one. We're curious about hers already…",
      },
      achievement: {
        framing:
          "The finish line of the marathon is now a place Marcus considers his — which place do you love?",
        quote:
          "He'll go back. He might not run again. But he'll go back to that place…",
      },
      recovery: {
        framing:
          "Claire found a bench she went to every day this year — which place do you love?",
        quote:
          "The bench. The same view. Twenty minutes. Whatever the weather…",
      },
      award: {
        framing:
          "Amelia's classroom is a place her students describe long after they've left — which place do you love?",
        quote: "Thirty-seven cards from former students. All mention the room…",
      },
      promotion: {
        framing:
          "Kwame keeps going back to the coffee shop where he said yes to this job three years ago — which place do you love?",
        quote: "Same table. Same order. He owes that table something…",
      },
      celebration: {
        framing: "Some places hold moments — which place do you love?",
        quote:
          "Somewhere you always come back to, or somewhere you've always meant to go…",
      },
      other: {
        framing:
          "Which place do you love — the one that belongs entirely to you?",
        quote:
          "Somewhere you always come back to, or somewhere you've always meant to go…",
      },
      default: {
        framing: "Which place do you love — the one that's entirely yours?",
        quote:
          "Somewhere you always come back to, or somewhere you've always meant to go…",
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
        framing:
          "Belinda loved a walking holiday — maps, no signal, proper boots — which kind of holiday do you love?",
        quote:
          "She once turned a week in the Lakes into a navigation exercise. Best holiday anyone had ever had…",
      },
      tribute: {
        framing:
          "David introduced a whole circle of friends to road trips — which kind of holiday do you love?",
        quote:
          "He'd pack badly, navigate confidently, and stop at everything interesting. Perfect company…",
      },
      birthday: {
        framing:
          "Sarah books city breaks with military precision — which kind of holiday do you love?",
        quote:
          "She has seventeen open tabs about her next trip at any given moment. This is not an exaggeration…",
      },
      retirement: {
        framing:
          "David has always said he'd do a long slow train journey when he retired — which holiday do you love?",
        quote:
          "Somewhere enormous, by train, with nothing booked past the first night. He's known it for years…",
      },
      wedding: {
        framing:
          "Emma wanted adventure. James wanted good food. They always find both — which kind of holiday do you love?",
        quote:
          "They've never been somewhere that didn't deliver on both counts. Somehow…",
      },
      anniversary: {
        framing:
          "Forty years of holidays, most of them compromises, all of them memorable — which kind do you love?",
        quote:
          "She wanted culture. He wanted beach. They always found a way. Still do…",
      },
      leaving: {
        framing:
          "Priya has been talking about a proper long trip for six years — which kind of holiday do you love?",
        quote: "The excuses have finally run out. The trip can finally happen…",
      },
      graduation: {
        framing:
          "Tom is planning something long and unstructured now that the degree is done — which holiday do you love?",
        quote:
          "No brief. No deadline. No one to present to. He's figuring out what that feels like…",
      },
      christening: {
        framing:
          "The family holiday is now a completely different proposition — which kind of holiday do you love?",
        quote:
          "Lily has joined the itinerary. The itinerary has changed significantly…",
      },
      achievement: {
        framing:
          "Marcus has promised himself a proper holiday as a reward — which kind do you love?",
        quote:
          "He's earned it. Eight months of dark early mornings. Time for something completely different…",
      },
      recovery: {
        framing:
          "Claire has been planning a trip since January — which kind of holiday do you love?",
        quote:
          "No deadlines, no itinerary. Just somewhere, and time, and herself…",
      },
      award: {
        framing:
          "Amelia takes exactly one holiday a year and plans it in complete detail — which kind do you love?",
        quote:
          "Teachers who plan. We shouldn't be surprised. The holidays are apparently excellent…",
      },
      promotion: {
        framing:
          "Kwame's first act after the promotion news was to book a long weekend — which kind of holiday do you love?",
        quote:
          "Decision made in thirty minutes. No overthinking. Good instinct…",
      },
      celebration: {
        framing: "Today is earned — which kind of holiday do you love?",
        quote:
          "Tell us the holiday you'd take if time and money were no object…",
      },
      other: {
        framing:
          "Which kind of holiday do you love — and what does that say about you?",
        quote: "The kind of traveller you are tells you everything…",
      },
      default: {
        framing:
          "Which kind of holiday do you love — and what does it say about you?",
        quote:
          "The kind of traveller you are tells you everything you need to know about yourself…",
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
        framing:
          "Belinda always travelled by train — there was never any question — which way do you love to travel?",
        quote:
          "She always said you miss everything if you're in a hurry. She was right about that too…",
      },
      tribute: {
        framing:
          "David always took the train — said it was the only way to actually arrive somewhere — which way do you love to travel?",
        quote:
          "He'd be in the quiet carriage, reading, completely at ease with the journey taking as long as it took…",
      },
      birthday: {
        framing:
          "Sarah once walked fourteen miles to a restaurant rather than take the bus — how do you love to travel?",
        quote:
          "She says this was reasonable. The restaurant was worth it. Both may be true…",
      },
      retirement: {
        framing:
          "David drove to work for thirty-five years. Now it's slow roads only — how do you love to travel?",
        quote: "The car stays. The motorway can go. No more rushing anywhere…",
      },
      wedding: {
        framing:
          "Emma likes the journey. James likes arriving. Together they've found a compromise — how do you love to travel?",
        quote:
          "She reads. He drives. Then they swap. Somehow they've always agreed on this…",
      },
      anniversary: {
        framing:
          "They've driven to the same place every year — which way do you love to travel?",
        quote: "Same road. Same songs on the radio. Slightly different speed…",
      },
      leaving: {
        framing:
          "Priya said she'd learn to cycle properly once she left — how do you love to travel?",
        quote: "We're holding her to it. The bike is already on her list…",
      },
      graduation: {
        framing:
          "Tom cycled across Manchester every day for three years and says cycling is still the only way — which way do you love to travel?",
        quote:
          "He timed every route. He knows exactly which roads to avoid and at what time…",
      },
      christening: {
        framing:
          "Lily's world is small right now, but it will expand — which way do you love to travel?",
        quote:
          "For now she goes everywhere in someone's arms. This will not last long…",
      },
      achievement: {
        framing:
          "Marcus has run so many miles that running still feels like a natural way to get places — how do you love to travel?",
        quote:
          "He's been known to run to places most people drive to. This is a choice he makes freely…",
      },
      recovery: {
        framing:
          "Claire has started walking places she used to drive — not for the exercise, just for the different quality of arrival — how do you love to travel?",
        quote: "Something about arriving having covered the ground yourself…",
      },
      award: {
        framing:
          "Amelia cycles to school — she says it's the right way to arrive — which way do you love to travel?",
        quote: "It sets the tone for the day. She's noticed the difference…",
      },
      promotion: {
        framing:
          "Kwame upgraded his travel for the first time after the promotion news — which way do you love to travel?",
        quote:
          "He'll say it was just a train upgrade. It was also a small moment of arrival…",
      },
      celebration: {
        framing:
          "The journey here was worth it — which way do you love to travel?",
        quote: "How someone gets from A to B is a whole character portrait…",
      },
      other: {
        framing: "How do you love to travel — and what does it say about you?",
        quote:
          "The way someone gets from A to B is a whole character portrait…",
      },
      default: {
        framing: "How do you love to travel — and what does it say about you?",
        quote:
          "The way someone gets from A to B is a whole character portrait…",
      },
    },
  },
  {
    title: "Film",
    description: "Film they could watch again and again",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      memorial: {
        framing:
          "Belinda watched Brief Encounter every Christmas — which film do you love?",
        quote:
          "She could quote it entirely from memory. It never seemed to get less affecting…",
      },
      tribute: {
        framing:
          "David once watched the same film seven times in one month to understand why it worked — which film do you love?",
        quote:
          "He eventually explained it. The explanation was better than the film…",
      },
      birthday: {
        framing:
          "Sarah has a film she's watched so many times she knows every line — which film do you love?",
        quote:
          "She watches it whenever she needs reminding that some decisions are worth making…",
      },
      retirement: {
        framing:
          "David always said the best projects had the structure of a good heist film — which film do you love?",
        quote:
          "He still believes this. He has evidence. It's a long conversation…",
      },
      wedding: {
        framing:
          "Emma and James argued about a film for an hour before they'd even introduced themselves — which film do you love?",
        quote: "She was right, he eventually admitted. Three years later…",
      },
      anniversary: {
        framing:
          "They have a film they watch on every anniversary — which film do you love?",
        quote:
          "Forty viewings. Different things noticed each time. Still the same feeling at the end…",
      },
      leaving: {
        framing:
          "Someone said Priya's leaving felt like the end of a great arc in a brilliant series — which film do you love?",
        quote:
          "Not the show ending. Just that particular chapter. We're still watching…",
      },
      graduation: {
        framing:
          "Tom says architecture school ruined certain films for him in the best possible way — which film do you love?",
        quote:
          "He can't watch a building on screen without having opinions. This is both a gift and a burden…",
      },
      christening: {
        framing:
          "There'll come a day when Lily has a favourite film — which film do you love?",
        quote:
          "We all have one. It always says something truer than we'd want to admit…",
      },
      achievement: {
        framing:
          "Marcus watched a film the night before the marathon and ran a mile faster than ever — which film do you love?",
        quote:
          "He won't reveal which film. He's worried it only works for him…",
      },
      recovery: {
        framing:
          "Claire watched films she'd been avoiding for years this year — which film do you love?",
        quote:
          "She worked through the whole list. Some were worth the wait. One in particular…",
      },
      award: {
        framing:
          "Amelia uses films in class regularly — says the best ones teach without feeling like teaching — which film do you love?",
        quote:
          "She's got a list. It's organised by theme, then year. It's a very good list…",
      },
      promotion: {
        framing:
          "Kwame said the best product launches feel like the third act of a well-made film — which film do you love?",
        quote:
          "He means it as a design principle. The films he uses as examples are always perfect choices…",
      },
      celebration: {
        framing:
          "Every celebration has a film that captures the feeling — which film do you love?",
        quote: "The film that's just entirely yours — which one, and why?",
      },
      other: {
        framing:
          "Which film do you love — and what is it about that particular story?",
        quote: "The film that's yours — which one is it?",
      },
      default: {
        framing:
          "Which film do you love — and what is it about that particular story?",
        quote: "The film that's just entirely yours — which one, and why?",
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
        framing:
          "Belinda loved a proper documentary — said they were the only honest films — which genre do you love?",
        quote:
          "She lived in fine detail. The kind that makes the best documentaries…",
      },
      tribute: {
        framing:
          "David loved a good biography film — said they were the most honest kind — which genre do you love?",
        quote:
          "He'd always name three you'd never seen and somehow they were all exactly right…",
      },
      birthday: {
        framing:
          "Sarah's life is clearly a caper film — charming, one step ahead, always — which genre do you love?",
        quote:
          "She'd say drama. Her friends would say comedy. The truth is probably both at once…",
      },
      retirement: {
        framing:
          "David always said his career had the structure of a good thriller — which genre do you love?",
        quote:
          "Procedural with occasional moments of genuine horror. His words. Probably right…",
      },
      wedding: {
        framing:
          "Emma says romance. James says adventure. They're both right — which genre do you love?",
        quote:
          "Which is the whole point. They've been arguing about this since the second date…",
      },
      anniversary: {
        framing:
          "Forty years of films together — they've watched every genre and still haven't agreed on a favourite — which genre do you love?",
        quote:
          "She says romance. He says thriller. They watch both. This is the system…",
      },
      leaving: {
        framing:
          "Priya's time here was fast-paced, warm, and had a few genuinely brilliant set pieces — which genre do you love?",
        quote:
          "We know the genre. The question is what comes next in the series…",
      },
      graduation: {
        framing:
          "Tom's architecture thesis included a chapter on film and space — which genre do you love?",
        quote:
          "He's written 4,000 words about the relationship between noir and brutalism. He'll tell you about it…",
      },
      christening: {
        framing:
          "We'll recommend genres to Lily for years — which genre do you love?",
        quote: "Start them young on the right ones. That's the task…",
      },
      achievement: {
        framing:
          "Marcus says a good sports documentary is in a genre of its own — which genre do you love?",
        quote:
          "He's watched every marathon documentary in existence. Some twice…",
      },
      recovery: {
        framing:
          "Claire says comedy got her through as much as anything — which genre do you love?",
        quote:
          "Not escapism. Just genuine laughter. She chose it deliberately…",
      },
      award: {
        framing:
          "Amelia says the best genre for teaching empathy is drama — which genre do you love?",
        quote:
          "She uses drama films like some teachers use textbooks. The results speak for themselves…",
      },
      promotion: {
        framing:
          "Kwame only watches things he calls 'structurally interesting' — which genre do you love?",
        quote:
          "This is somehow not as narrow as it sounds. His taste is excellent…",
      },
      celebration: {
        framing:
          "Today calls for something brilliant — which genre do you love?",
        quote: "Pick the genre and make the case for it…",
      },
      other: {
        framing:
          "Which film genre do you love — and what does that say about you?",
        quote: "Some people are epics. Some are comedies. Which genre are you?",
      },
      default: {
        framing:
          "Which film genre do you love — and what does that say about you?",
        quote:
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
        framing:
          "Belinda watched Midsomer Murders with total commitment — which TV show do you love?",
        quote:
          "She could identify the murderer inside fifteen minutes. It was impressive and slightly alarming…",
      },
      tribute: {
        framing:
          "David watched exactly one TV show at a time and watched it properly — which TV show do you love?",
        quote:
          "No multitasking. Fully present. He said it was the only respectful way to watch…",
      },
      birthday: {
        framing:
          "Sarah rewatched a whole series to write one paragraph to a friend — which TV show do you love?",
        quote: "She did not consider this excessive. It wasn't…",
      },
      retirement: {
        framing:
          "David has a watch list that's been building for fifteen years — which TV show do you love?",
        quote: "There's a list. It's long. The time has finally come…",
      },
      wedding: {
        framing:
          "Emma picks one. James picks one. Neither has ever not watched both — which TV show do you love?",
        quote:
          "They haven't argued about it once. This is the foundation of the marriage…",
      },
      anniversary: {
        framing:
          "They have a show they've been watching together since their first flat — which TV show do you love?",
        quote: "The show changed. The routine hasn't. Same sofa. Same time…",
      },
      leaving: {
        framing:
          "Priya got all the best lines in every meeting — which TV show do you love?",
        quote:
          "Every team has the character who makes every scene better. That was her…",
      },
      graduation: {
        framing:
          "Tom watched an architectural documentary series in his final week and called it revision — which TV show do you love?",
        quote:
          "It was technically revision. He also just really liked the show…",
      },
      christening: {
        framing:
          "One day Lily will have a favourite show — which TV show do you love?",
        quote: "For now she has opinions about ceiling fans. This will evolve…",
      },
      achievement: {
        framing:
          "Marcus says he watched nature documentaries on rest days because they required nothing — which TV show do you love?",
        quote:
          "Rest days needed something genuinely restful. David Attenborough delivered…",
      },
      recovery: {
        framing:
          "Claire says one particular show got her through the hardest weeks — which TV show do you love?",
        quote:
          "She couldn't have said why. It just worked. Which show does that for you?",
      },
      award: {
        framing:
          "Amelia recommends TV shows to her students the way other teachers recommend books — which TV show do you love?",
        quote: "She's never recommended a bad one. The students have checked…",
      },
      promotion: {
        framing:
          "Kwame started a show the night he got promoted and watched it through over the next month — which TV show do you love?",
        quote:
          "He hadn't let himself start it until then. Some things are worth saving…",
      },
      celebration: {
        framing: "Tonight is a TV night — which show do you love?",
        quote: "The one you'd watch with anyone, any time. Which one is it?",
      },
      other: {
        framing:
          "Which TV show do you love — and which character would you be?",
        quote: "Pick the show that captures something true about you…",
      },
      default: {
        framing:
          "Which TV show do you love — and which character would you be?",
        quote: "Pick the show that captures something true about you…",
      },
    },
  },
  {
    title: "Song",
    description: "Song that reminds you of them",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      memorial: {
        framing:
          "Belinda always played Jerusalem on Sunday mornings — which song do you love?",
        quote:
          "She'd sing along under her breath. Every time. Always the same verse first…",
      },
      tribute: {
        framing:
          "David introduced so many people to a particular song — which song do you love?",
        quote:
          "He'd play it without context and watch people react. It never failed to work…",
      },
      birthday: {
        framing:
          "Sarah turns the volume up every time that song comes on — which song do you love?",
        quote:
          "She has a playlist called The Big One. It has exactly one song. We're not allowed to know which…",
      },
      retirement: {
        framing:
          "David always said good music should say what people can't — which song do you love?",
        quote:
          "There's a song that says thirty-five years better than any speech could. Which one is it?",
      },
      wedding: {
        framing:
          "Emma had been saving that song for years — which song do you love?",
        quote:
          "The moment it played, everyone at the wedding understood why. That was the one…",
      },
      anniversary: {
        framing:
          "Their song hasn't changed in forty years — which song do you love?",
        quote: "First dance. Same song. They've never needed another…",
      },
      leaving: {
        framing:
          "There's a song that's Priya's now, irreversibly — which song do you love?",
        quote:
          "There's a song playing somewhere in the world that belongs entirely to her. Which one is it?",
      },
      graduation: {
        framing:
          "Tom played the same song on the morning of every deadline — which song do you love?",
        quote:
          "It started as superstition. It became ritual. It apparently always worked…",
      },
      christening: {
        framing:
          "Every person in this room has a song they'd want Lily to know — which song do you love?",
        quote: "She'll find her own. But there's time to share yours…",
      },
      achievement: {
        framing:
          "Marcus had a song he played in the final kilometre and it will always be that song now — which song do you love?",
        quote:
          "It belonged to the finish line before it belonged to anything else…",
      },
      recovery: {
        framing:
          "Claire says music got her through — there was one song more than any other — which song do you love?",
        quote: "She won't name it. It's hers. Which song is yours?",
      },
      award: {
        framing:
          "Amelia played a song at the start of every term for years — which song do you love?",
        quote:
          "Year 7s who've since graduated still remember it. That song did something…",
      },
      promotion: {
        framing:
          "Kwame played a song on the walk home after the promotion news and it's been his ever since — which song do you love?",
        quote:
          "He made the decision on that walk too. The song was present for both…",
      },
      celebration: {
        framing: "Every celebration needs its song — which song do you love?",
        quote: "The one that plays and takes you somewhere — which one is it?",
      },
      other: {
        framing: "Which song do you love — and why that song?",
        quote:
          "The song that plays and instantly takes you somewhere — what is it and where does it go?",
      },
      default: {
        framing: "Which song do you love — and why that song?",
        quote:
          "The song that plays and instantly takes you somewhere — what is it and where does it go?",
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
        framing:
          "Belinda loved folk music — said it was the only genre that told the truth — which genre do you love?",
        quote:
          "She had strong opinions about what made a good song. Folk always won. No contest…",
      },
      tribute: {
        framing:
          "David lived in jazz and thought everyone should — which genre do you love?",
        quote:
          "He wasn't evangelical about it. He just quietly played the right things until you understood…",
      },
      birthday: {
        framing:
          "Sarah's taste is eclectic but there's always a gravitational centre — which genre do you love?",
        quote:
          "She'll tell you she listens to everything. Her playlist says otherwise. In the best way…",
      },
      retirement: {
        framing:
          "David had the same CDs in the car for twenty years — which genre do you love?",
        quote:
          "That's the genre, right there. Twenty years and not once did it change…",
      },
      wedding: {
        framing:
          "She's jazz. He's indie. Together they're something without a name yet — which genre do you love?",
        quote: "It sounds exactly right, whatever it's called…",
      },
      anniversary: {
        framing:
          "Forty years of shared music — a playlist of every genre and all of them right — which genre do you love?",
        quote:
          "She's soul. He's folk. Together it sounds like something entirely different…",
      },
      leaving: {
        framing:
          "Priya had the quality of a genre you didn't know you needed until it started playing — which genre do you love?",
        quote: "We know the genre now. We'll miss the sound…",
      },
      graduation: {
        framing:
          "Tom's playlist from final year is a document of exactly what he was listening to while making something impossible — which genre do you love?",
        quote: "It tells the whole story. Three years in one playlist…",
      },
      christening: {
        framing: "Music will fill Lily's life — which genre do you love?",
        quote: "Every person here has one they'd want her to discover…",
      },
      achievement: {
        framing:
          "Marcus ran to one genre for eight months — which genre do you love?",
        quote:
          "It carried every kilometre. He can't listen to it now without feeling like he's moving…",
      },
      recovery: {
        framing:
          "Claire found one genre worked better than anything else — which genre do you love?",
        quote: "She couldn't say why logically. She just knew it was the one…",
      },
      award: {
        framing:
          "Amelia believes music education is the most important kind — which genre do you love?",
        quote:
          "She has strong feelings about this. They're backed by thirty years of watching students…",
      },
      promotion: {
        framing:
          "Kwame says jazz and product thinking have more in common than people realise — which genre do you love?",
        quote:
          "He's given a version of this talk at three different companies. It's always well received…",
      },
      celebration: {
        framing:
          "Every celebration has a genre — which music genre do you love?",
        quote: "Taste in music is a portrait. Which genre is yours?",
      },
      other: {
        framing:
          "Which music genre do you love — and what does it say about you?",
        quote:
          "Taste in music is a portrait. Which genre is yours, and what does it reveal?",
      },
      default: {
        framing:
          "Which music genre do you love — and what does it say about you?",
        quote:
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
        framing:
          "Belinda said the seventies was when music finally understood itself — which era do you love?",
        quote:
          "She could tell you where she was when she heard every important record from 1971 to 1979…",
      },
      tribute: {
        framing:
          "David always said the golden era of music was whatever you were seventeen for — which era do you love?",
        quote:
          "His golden era was specifically 1975. He had evidence for this…",
      },
      birthday: {
        framing:
          "Sarah has nineties in her bones and she's not remotely sorry — which era do you love?",
        quote:
          "She knows every B-side from 1994. Don't test her on this either…",
      },
      retirement: {
        framing:
          "David has a theory about how eighties pop predicted modern engineering — which era do you love?",
        quote: "It's a long theory. It's also kind of right…",
      },
      wedding: {
        framing:
          "They made a playlist on their first anniversary that covered six decades without effort — which era do you love?",
        quote:
          "That playlist is still the best one either of them has ever made…",
      },
      anniversary: {
        framing:
          "Mum and Dad danced to the same music at their wedding they still put on now — which era do you love?",
        quote:
          "The era that was theirs first is still theirs. Some things don't change…",
      },
      leaving: {
        framing:
          "Priya had the energy of an era that felt like the right one for everything to change — which era do you love?",
        quote:
          "Some people belong to a particular musical moment. She was one of them…",
      },
      graduation: {
        framing:
          "Tom spent three years surrounded by the same era of music and now it's filed under 'final year' — which era do you love?",
        quote:
          "It's useful and slightly limiting. He can't hear it without thinking about structural drawings…",
      },
      christening: {
        framing: "Lily will have her own golden era — which era do you love?",
        quote: "She's yet to discover it. Tell her what yours was…",
      },
      achievement: {
        framing:
          "Marcus trained through one era of music and finished the race to another — which era do you love?",
        quote:
          "The training era was chosen for rhythm. The finish line era chose itself…",
      },
      recovery: {
        framing:
          "Claire found one era particularly useful this year — which era do you love?",
        quote:
          "Old music. Familiar. Known. It felt like the right steady ground…",
      },
      award: {
        framing:
          "Amelia believes every generation deserves to understand every era — which era do you love?",
        quote:
          "She teaches music history alongside the curriculum. Not officially. She just does it…",
      },
      promotion: {
        framing:
          "Kwame believes the music era you love most tells you everything about your working style — which era do you love?",
        quote:
          "He's got a theory. He'll tell you about it in the right setting…",
      },
      celebration: {
        framing: "Every era had its moment — which music era do you love?",
        quote:
          "An era of music that seems to have been made exactly for you — which one, and why?",
      },
      other: {
        framing:
          "Which music era do you love — and what is it about that particular sound?",
        quote:
          "An era of music that seems to have been made exactly for you — which one, and why?",
      },
      default: {
        framing:
          "Which music era do you love — and what is it about that particular sound?",
        quote:
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
        framing:
          "Belinda played piano quietly, for herself and whoever happened to be there — which instrument do you love?",
        quote:
          "She never performed. She just played. That was the whole point…",
      },
      tribute: {
        framing:
          "David loved the piano — said it was the only instrument that could hold a whole conversation — which instrument do you love?",
        quote: "He couldn't play a note. He was still completely right…",
      },
      birthday: {
        framing:
          "Sarah plays guitar badly and with tremendous enthusiasm — which instrument do you love?",
        quote:
          "She'd tell you she's getting better. Her friends would say she's consistent. Both are true…",
      },
      retirement: {
        framing:
          "David was the instrument in the firm that everything else was built around — which instrument do you love?",
        quote:
          "You only notice some instruments when they stop. The whole band feels it…",
      },
      wedding: {
        framing:
          "She's the melody. He's the chord structure beneath it — which instrument do you love?",
        quote:
          "Together it's a complete piece. Separately it's still good, but not quite right…",
      },
      anniversary: {
        framing:
          "There's been a piano in the house for the whole forty years — which instrument do you love?",
        quote:
          "Neither of them plays. It stays because it's always stayed. Some things are like that…",
      },
      leaving: {
        framing:
          "Priya was the instrument in the team you don't notice until the song starts again — which instrument do you love?",
        quote:
          "Something is missing in the arrangement. We all know which part…",
      },
      graduation: {
        framing:
          "Tom's studio played guitar in the background for three years — which instrument do you love?",
        quote:
          "Someone always had a guitar. It became the ambient sound of the degree. He misses it…",
      },
      christening: {
        framing:
          "One day Lily might play something — which instrument do you love?",
        quote: "Which one would you want her to discover?",
      },
      achievement: {
        framing:
          "Marcus says running is its own instrument — rhythm, tempo, endurance — which instrument do you love?",
        quote:
          "He's thought about this more than you'd expect. He has a case to make…",
      },
      recovery: {
        framing:
          "Claire plays piano — quietly, for herself — and says it helped more than she can explain — which instrument do you love?",
        quote:
          "She kept playing all the way through. The playing came back with everything else…",
      },
      award: {
        framing:
          "Amelia taught music for five years before moving to English — the instrument never left her — which instrument do you love?",
        quote:
          "She still plays. She doesn't mention it. The students who've heard her do…",
      },
      promotion: {
        framing:
          "Kwame says he listens to piano when he needs to think — which instrument do you love?",
        quote:
          "Specifically piano. Specifically certain kinds of piano. Very specific indeed…",
      },
      celebration: {
        framing: "Every moment deserves its instrument — which do you love?",
        quote:
          "The sound that moves something in you — which instrument, and what does it do?",
      },
      other: {
        framing: "Which instrument do you love — and what does it give you?",
        quote:
          "The sound that moves something in you — which instrument, and what does it do?",
      },
      default: {
        framing: "Which instrument do you love — and what does it give you?",
        quote:
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
        framing:
          "Belinda loved a good hymn — said they were just the best folk songs — which type of song do you love?",
        quote: "She knew every word to every hymn. Never missed a verse…",
      },
      tribute: {
        framing:
          "David always said jazz standards were the only songs worth singing — which type of song do you love?",
        quote:
          "He meant it as a principle about form. It applies more broadly than jazz…",
      },
      birthday: {
        framing:
          "Sarah has an anthem she updates every year — it's always unmistakably an anthem — which type of song do you love?",
        quote:
          "She's been working on a karaoke setlist for years. It's ambitious. It suits her completely…",
      },
      retirement: {
        framing:
          "David always said the best songs knew how to end — which type of song do you love?",
        quote:
          "He's right about this. The right ending is everything. Which song type gets it right?",
      },
      wedding: {
        framing:
          "It started as a love song, became an adventure, and it's been both ever since — which type of song do you love?",
        quote:
          "Their relationship has a particular kind of song. Which type captures it?",
      },
      anniversary: {
        framing:
          "Their song was a love song that became a hymn — which type of song do you love?",
        quote: "It changed over the years. The feeling underneath it didn't…",
      },
      leaving: {
        framing:
          "Some departures deserve a particular kind of music — which type of song do you love?",
        quote:
          "Pick the type that fits the moment. Priya deserves the right one…",
      },
      graduation: {
        framing:
          "Tom played an anthem at the end of every all-nighter to tell himself it was done — which type of song do you love?",
        quote:
          "He has one specific anthem for this purpose. It's been earned three years running…",
      },
      christening: {
        framing: "Lily will need a lullaby — which type of song do you love?",
        quote:
          "And an anthem. And a hymn. And eventually, a love song. Start with the lullaby…",
      },
      achievement: {
        framing:
          "Marcus's finish line song was an anthem — he'd planned it that way — which type of song do you love?",
        quote:
          "He knew exactly which song he wanted playing in his head at mile 26. It was the right one…",
      },
      recovery: {
        framing:
          "Claire says she needed songs that told a story — which type of song do you love?",
        quote:
          "Not escapism. Not distraction. Something with a narrative she could follow…",
      },
      award: {
        framing:
          "Amelia has a hymn she comes back to — says it's about the long game — which type of song do you love?",
        quote:
          "She means it literally and also as a metaphor for teaching. Both interpretations hold…",
      },
      promotion: {
        framing:
          "Kwame celebrated with exactly the kind of song that needed no explanation — which type of song do you love?",
        quote:
          "Not a love song. Not a ballad. Something with propulsion. Which type is yours?",
      },
      celebration: {
        framing:
          "Every celebration deserves exactly the right type of song — which do you love?",
        quote: "Love song, anthem, hymn, lullaby — which type is yours?",
      },
      other: {
        framing: "Which type of song do you love — and why that kind?",
        quote:
          "Love song, anthem, hymn, lullaby — which type is yours, and what does it give you?",
      },
      default: {
        framing: "Which type of song do you love — and why that kind?",
        quote:
          "Love song, anthem, hymn, lullaby — which type is yours, and what does it give you?",
      },
    },
  },
  {
    title: "Drink",
    description: "Their go-to cup or glass",
    is_finite: false,
    categories: ["Food & Drink", "Everyday life"],
    placeholders: {
      memorial: {
        framing:
          "Belinda's answer was always tea — proper loose leaf, pot on the table — which drink do you love?",
        quote:
          "She said everything worth talking about happened over tea. She had a point…",
      },
      tribute: {
        framing:
          "David always had a glass of something interesting to offer — which drink do you love?",
        quote:
          "He never drank alone. The drink was always the beginning of a conversation…",
      },
      birthday: {
        framing:
          "Sarah has opinions about coffee that are not appropriate for this level of conversation — which drink do you love?",
        quote:
          "She has opinions about brewing methods too. The opinions are extensive and correct…",
      },
      retirement: {
        framing:
          "David kept a good whisky for significant moments — which drink do you love?",
        quote:
          "He always said a project was finished when he poured the good stuff. There's a lot due…",
      },
      wedding: {
        framing:
          "Emma and James fell in love over terrible festival beer and have significantly upgraded since — which drink do you love?",
        quote:
          "There's still an ongoing argument about the exact moment it improved. Probably 2021…",
      },
      anniversary: {
        framing:
          "Forty years and the same cup of tea every morning — which drink do you love?",
        quote:
          "The tea hasn't changed. The brand, the mug, the time. All the same. All exactly right…",
      },
      leaving: {
        framing:
          "Priya has a drink she orders every time something good happens — which drink do you love?",
        quote: "Tonight qualifies. We know which one it is…",
      },
      graduation: {
        framing:
          "Tom says he'll drink something better than student flat coffee now — which drink do you love?",
        quote: "He has spent three years subsisting. The upgrade is overdue…",
      },
      christening: {
        framing: "We raise a glass for Lily — which drink do you love?",
        quote:
          "She'll form her own preferences eventually. For now, we drink on her behalf…",
      },
      achievement: {
        framing:
          "Marcus crossed the finish line and someone handed him a water that tasted better than anything — which drink do you love?",
        quote: "26.2 miles. The first sip of water. Which drink is yours?",
      },
      recovery: {
        framing:
          "Claire says a particular cup of tea became a ritual — which drink do you love?",
        quote:
          "Same mug, same time, same routine. The drink held the day together…",
      },
      award: {
        framing:
          "Amelia's staffroom tea is apparently legendary — which drink do you love?",
        quote:
          "She makes it once a day at exactly 11am. The staff know to be there…",
      },
      promotion: {
        framing:
          "Kwame poured a specific drink to mark the moment — which drink do you love?",
        quote:
          "He'd been saving it. That night was the occasion. Which drink would you pour?",
      },
      celebration: {
        framing: "Today calls for the right drink — which do you love?",
        quote:
          "The cup or glass that belongs to you more than any other — which one, and why?",
      },
      other: {
        framing:
          "Which drink do you love — the one that says something true about you?",
        quote: "The cup or glass that belongs to you more than any other…",
      },
      default: {
        framing:
          "Which drink do you love — the one that says something true about you?",
        quote:
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
        framing:
          "Belinda's shepherd's pie was legendary — which comfort food do you love?",
        quote:
          "She'd leave it in the oven and say she'd barely done anything. Lies, but kind ones…",
      },
      tribute: {
        framing:
          "David made exactly one dish but made it perfectly — which comfort food do you love?",
        quote:
          "He wouldn't tell anyone what was in it. The recipe died with him. The memory didn't…",
      },
      birthday: {
        framing:
          "Sarah makes no apologies for her relationship with cheese — which comfort food do you love?",
        quote:
          "She once paused a holiday to find the right local cheese. No one complained. It was worth it…",
      },
      retirement: {
        framing:
          "David ate lunch at his desk for thirty-five years. No more — which comfort food do you love?",
        quote:
          "He can eat it properly now. In a chair. With a view. With no emails…",
      },
      wedding: {
        framing:
          "They argue about pizza but always agree on pasta — which comfort food do you love?",
        quote:
          "This is probably the actual foundation of the marriage. The pasta part…",
      },
      anniversary: {
        framing:
          "Forty years and the same roast dinner on Sundays — which comfort food do you love?",
        quote:
          "The recipe is the same as her mother's. The method takes all afternoon. Worth every minute…",
      },
      leaving: {
        framing:
          "Priya once brought something in for no reason and transformed the mood in the office — which comfort food do you love?",
        quote:
          "No occasion. No explanation. Just the right thing at the right time…",
      },
      graduation: {
        framing:
          "Tom ate nothing but toast for the last week of finals — which comfort food do you love?",
        quote:
          "He has strong opinions about toast now. Strong, specific, very particular opinions…",
      },
      christening: {
        framing: "The family laid on food — which comfort food do you love?",
        quote: "Every family has its dishes. Today was no exception…",
      },
      achievement: {
        framing:
          "Marcus's post-marathon plan was a roast dinner — which comfort food do you love?",
        quote:
          "He'd been thinking about it since mile 14. He earned every bite…",
      },
      recovery: {
        framing:
          "Claire's friend always brought soup — which comfort food do you love?",
        quote:
          "She didn't have to. She always did. That's the friend, and that's the soup…",
      },
      award: {
        framing:
          "Amelia celebrates small wins with specific food — which comfort food do you love?",
        quote:
          "The bigger the win, the better the food. This particular win calls for the best version…",
      },
      promotion: {
        framing:
          "Kwame and his partner cooked together to celebrate — which comfort food do you love?",
        quote:
          "Nothing fancy. Just the thing they always made. Which is the whole point…",
      },
      celebration: {
        framing:
          "Every celebration deserves the right food — which do you love?",
        quote:
          "The food that brings you back somewhere — what is it and what does it remind you of?",
      },
      other: {
        framing:
          "Which comfort food do you love — the one that brings you back somewhere?",
        quote:
          "The food that's entirely yours — what is it and what does it remind you of?",
      },
      default: {
        framing:
          "Which comfort food do you love — the one that brings you back somewhere?",
        quote:
          "The food that's entirely yours — what is it and what does it remind you of?",
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
        framing:
          "Belinda always had hobnobs in the tin — which biscuit do you love?",
        quote:
          "She'd put the tin on the table the moment anyone came round. That was the signal everything was fine…",
      },
      tribute: {
        framing:
          "David's office always had a good tin — which biscuit do you love?",
        quote:
          "Not just any biscuit. The right biscuit, for the right conversation. He had a system…",
      },
      birthday: {
        framing:
          "Sarah says she doesn't have a favourite biscuit. This is demonstrably untrue — which biscuit do you love?",
        quote:
          "Everyone who knows her knows the answer. She just won't admit it…",
      },
      retirement: {
        framing:
          "David has earned something better than a Rich Tea — which biscuit do you love?",
        quote: "He's earned it. The question is just which one…",
      },
      wedding: {
        framing:
          "She's a chocolate digestive. He's a shortbread. Somehow this works — which biscuit do you love?",
        quote:
          "Incompatible biscuit preferences. Completely compatible in every other way…",
      },
      anniversary: {
        framing:
          "Forty years and the same biscuit in the tin — which biscuit do you love?",
        quote:
          "She buys the tin. He refills it. This is the division of labour that has sustained forty years…",
      },
      leaving: {
        framing:
          "Priya always brought the right biscuit without explaining why — which biscuit do you love?",
        quote:
          "You'd understand the moment you ate one. That was the genius of it…",
      },
      graduation: {
        framing:
          "Tom says biscuits got him through finals — which biscuit do you love?",
        quote:
          "He was specific about this. The wrong biscuit in the wrong hour was genuinely not an option…",
      },
      christening: {
        framing:
          "Someone brought biscuits. The right ones — which biscuit do you love?",
        quote:
          "The biscuit question matters more than people admit. This is just true…",
      },
      achievement: {
        framing:
          "Marcus had one particular biscuit at every post-long-run breakfast — which biscuit do you love?",
        quote: "He's very clear about which one. Don't suggest alternatives…",
      },
      recovery: {
        framing:
          "Claire's sister always brought the right biscuit — which biscuit do you love?",
        quote:
          "Not the expensive ones. Not the obvious ones. Exactly the right one. She knew…",
      },
      award: {
        framing:
          "Amelia's classroom biscuit tin is a well-known institution — which biscuit do you love?",
        quote:
          "It's never empty. She's never explained how. The students have long since stopped asking…",
      },
      promotion: {
        framing:
          "Kwame brought biscuits to the team on his first day as Head of Product — which biscuit do you love?",
        quote: "He chose them carefully. He's that kind of person…",
      },
      celebration: {
        framing: "Every gathering needs a biscuit — which do you love?",
        quote:
          "There's always a right biscuit for the right person. Which one is entirely yours?",
      },
      other: {
        framing: "Which biscuit do you love — and why that one in particular?",
        quote:
          "There's always a right biscuit for the right person. Which one is entirely yours?",
      },
      default: {
        framing: "Which biscuit do you love — and why that one in particular?",
        quote:
          "There's always a right biscuit for the right person. Which one is entirely yours?",
      },
    },
  },
  {
    title: "Sport to watch",
    description: "Game they never missed",
    is_finite: false,
    categories: ["Sport", "Everyday life"],
    placeholders: {
      memorial: {
        framing:
          "Belinda watched cricket on the radio — never the TV — which sport do you love to watch?",
        quote:
          "She could tell you the score of any Test match from 1987. It was a gift…",
      },
      tribute: {
        framing:
          "David was quietly devoted to one sport and never needed to explain why — which sport do you love to watch?",
        quote:
          "He watched alone, on his terms, with complete concentration. He didn't need company for it…",
      },
      birthday: {
        framing:
          "Sarah watches tennis with a level of engagement that concerns her friends — which sport do you love to watch?",
        quote:
          "She once lost her voice during Wimbledon and didn't notice until the next morning…",
      },
      retirement: {
        framing:
          "David missed the second half of the 2005 Ashes for a board meeting — which sport do you love to watch?",
        quote: "He hasn't forgiven anyone. Now he'll never miss another ball…",
      },
      wedding: {
        framing:
          "Emma says cricket. James says football. They've been at this for five years — which sport do you love to watch?",
        quote: "No sign of resolution. We think it might be the point…",
      },
      anniversary: {
        framing:
          "They've watched the same sport from the same seats for forty years — which sport do you love to watch?",
        quote: "The seats changed once. The sport never did…",
      },
      leaving: {
        framing:
          "Priya had three half-finished seasons in her queue — which sport do you love to watch?",
        quote:
          "The time has officially arrived. The queue can finally be cleared…",
      },
      graduation: {
        framing:
          "Tom once watched an entire cricket Test between dissertation drafts — which sport do you love to watch?",
        quote:
          "He says it helped with pacing. This is possibly correct. Certainly committed…",
      },
      christening: {
        framing:
          "Lily will one day have a sport she watches religiously — which sport do you love to watch?",
        quote:
          "She'll come to it herself. But it's not too early to introduce the options…",
      },
      achievement: {
        framing:
          "Marcus has watched every marathon broadcast he can find since completing his — which sport do you love to watch?",
        quote:
          "He notices completely different things now. The sport looks different from inside it…",
      },
      recovery: {
        framing:
          "Claire says watching sport helped — the routine of it, the rhythm — which sport do you love to watch?",
        quote:
          "Something about sport going on regardless. The world continuing in the expected way…",
      },
      award: {
        framing:
          "Amelia uses sport as a classroom metaphor regularly — which sport do you love to watch?",
        quote:
          "She means team, strategy, the long season. She applies it to everything…",
      },
      promotion: {
        framing:
          "Kwame says watching sport taught him about team structure — which sport do you love to watch?",
        quote:
          "Not the strategy. The culture. How teams actually function under pressure…",
      },
      celebration: {
        framing: "Today is pure sport — which sport do you love to watch?",
        quote: "The sport you'd never miss, whatever else was happening…",
      },
      other: {
        framing:
          "Which sport do you love to watch — and what does it give you?",
        quote: "The sport that takes you somewhere — which one?",
      },
      default: {
        framing:
          "Which sport do you love to watch — and what does it give you?",
        quote:
          "The sport you'd never miss, whatever else was happening — which one is it?",
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
        framing:
          "Belinda swam every morning until her seventies — which sport do you love to play?",
        quote:
          "She said it was the only sport where you couldn't have your phone. She loved it for exactly that reason…",
      },
      tribute: {
        framing:
          "David played bowls until his eighties and never admitted it was competitive — which sport do you love to play?",
        quote:
          "It was extremely competitive. Everyone knew. Nobody said anything…",
      },
      birthday: {
        framing:
          "Sarah plays tennis like her life depends on it — which sport do you love to play?",
        quote:
          "She once beat someone half her age and spent the following week telling people…",
      },
      retirement: {
        framing:
          "David's golf clubs have been in the car for three years — which sport do you love to play?",
        quote: "The tee times start this month. He's been ready for a while…",
      },
      wedding: {
        framing:
          "Emma and James tried playing against each other once. They don't discuss it — which sport do you love to play?",
        quote: "They play doubles now. This was the right decision…",
      },
      anniversary: {
        framing:
          "They played badminton until they didn't — which sport do you love to play?",
        quote:
          "Forty years of pretending the score didn't matter. It mattered…",
      },
      leaving: {
        framing:
          "Priya mentioned once that she used to run. Nothing stops her now — which sport do you love to play?",
        quote: "There's nothing stopping her now. That's the whole point…",
      },
      graduation: {
        framing:
          "Tom played five-a-side throughout university and said it was where he did his best thinking — which sport do you love to play?",
        quote:
          "He claims this. His teammates have opinions about whether this is accurate…",
      },
      christening: {
        framing:
          "One day Lily will play something and love it — which sport do you love to play?",
        quote:
          "The sport she finds at eight or ten or fourteen. We're curious already…",
      },
      achievement: {
        framing:
          "Marcus will always be a runner now — which sport do you love to play?",
        quote:
          "The marathon made it permanent. He came back from it different…",
      },
      recovery: {
        framing:
          "Claire got back into swimming this year — which sport do you love to play?",
        quote:
          "She'd stopped for a while. Coming back was harder than starting. She's very glad she did…",
      },
      award: {
        framing:
          "Amelia coached the school netball team for fifteen years while teaching — which sport do you love to play?",
        quote:
          "She says the two weren't unrelated. Teaching and coaching use the same part of her…",
      },
      promotion: {
        framing:
          "Kwame says five-a-side is the team exercise that makes everything else clearer — which sport do you love to play?",
        quote:
          "Every team problem he's encountered has a five-a-side equivalent. He uses both…",
      },
      celebration: {
        framing: "What sport do you love to play — and what does it give you?",
        quote: "The sport you played with real feeling — which one was yours?",
      },
      other: {
        framing:
          "Which sport do you love to play — the one that takes you somewhere?",
        quote: "The sport you played with real feeling — which one was yours?",
      },
      default: {
        framing:
          "Which sport do you love to play — the one that takes you somewhere?",
        quote: "The sport you played with real feeling — which one was yours?",
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
        framing:
          "Belinda walked every day — same route, same pace — which form of exercise do you love?",
        quote:
          "She said the walk was where she did her best thinking. The lane still feels like hers…",
      },
      tribute: {
        framing:
          "David walked everywhere and knew every route — which form of exercise do you love?",
        quote:
          "He could tell you the best way to walk between any two points in the city. Every route considered…",
      },
      birthday: {
        framing:
          "Sarah talks about swimming but actually runs — which form of exercise do you love?",
        quote:
          "She downloaded seventeen fitness apps and uses exactly one of them. The right one…",
      },
      retirement: {
        framing:
          "David has been saying he'll take up cycling since 2017 — which form of exercise do you love?",
        quote: "The bike is in the garage. The time is now. No more excuses…",
      },
      wedding: {
        framing:
          "Emma and James have never had an argument that a long walk didn't fix — which form of exercise do you love?",
        quote: "This is a well-established fact. The walks are very good…",
      },
      anniversary: {
        framing:
          "They've walked every anniversary — a tradition that started on their first date — which form of exercise do you love?",
        quote:
          "It's still the walk that matters most. It's never changed its purpose…",
      },
      leaving: {
        framing:
          "Priya has been talking about training for something for years — which form of exercise do you love?",
        quote: "The diary is now entirely hers. The training can begin…",
      },
      graduation: {
        framing:
          "Tom cycled everywhere in Manchester and arrived at everything slightly out of breath — which form of exercise do you love?",
        quote: "It was a feature, not a bug. He always arrived with energy…",
      },
      christening: {
        framing:
          "Lily will discover how she likes to move — which form of exercise do you love?",
        quote:
          "Walking, running, swimming — she'll find her thing. Which one is yours?",
      },
      achievement: {
        framing:
          "Marcus ran eight months to build for one morning — which form of exercise do you love?",
        quote:
          "Not for the race alone. For what the running gave him all the way through…",
      },
      recovery: {
        framing:
          "Claire walked every day this year — which form of exercise do you love?",
        quote:
          "Not for fitness. For the forward motion. For the being outside in the world…",
      },
      award: {
        framing:
          "Amelia swims before school on Tuesdays — which form of exercise do you love?",
        quote:
          "She's done it for twelve years. She says it sets everything else up…",
      },
      promotion: {
        framing:
          "Kwame runs when he needs to think clearly — which form of exercise do you love?",
        quote:
          "He doesn't track it. He doesn't time it. That's the whole point. Just movement…",
      },
      celebration: {
        framing:
          "How do you love to move? — which form of exercise do you love?",
        quote:
          "How someone moves through the world says something true about them…",
      },
      other: {
        framing:
          "Which form of exercise do you love — and what does it do for you?",
        quote:
          "How someone moves through the world says something true about them…",
      },
      default: {
        framing:
          "Which form of exercise do you love — and what does it do for you?",
        quote:
          "How someone moves through the world says something true about them…",
      },
    },
  },
  {
    title: "Childhood game",
    description: "What they played until dark",
    is_finite: false,
    categories: ["Childhood", "Sport"],
    placeholders: {
      memorial: {
        framing:
          "Belinda played conkers every autumn without fail — which childhood game do you love?",
        quote:
          "She had very strong feelings about the rules of conkers. Very strong…",
      },
      tribute: {
        framing:
          "David said the only game that mattered was the one you played with complete focus — which childhood game do you love?",
        quote: "He was referring to chess. He said this about chess…",
      },
      birthday: {
        framing:
          "Sarah would still play rounders tomorrow if someone organised it — which childhood game do you love?",
        quote:
          "She can still throw. She is not subtle about this. Nor should she be…",
      },
      retirement: {
        framing:
          "David always said he wanted to learn proper cricket — which childhood game do you love?",
        quote:
          "There are thirty years of free Saturday mornings ahead. Plenty of time…",
      },
      wedding: {
        framing:
          "Emma hustles at Snap. James has been trying to beat her since 2020 — which childhood game do you love?",
        quote: "He hasn't. He won't. We respect it…",
      },
      anniversary: {
        framing:
          "They played card games on their honeymoon and still do — which childhood game do you love?",
        quote:
          "Different cards. Same energy. Same completely disproportionate investment in winning…",
      },
      leaving: {
        framing:
          "Priya always won at whatever game was being played without making anyone feel bad about it — which childhood game do you love?",
        quote: "That's a very specific and rare skill. We're going to miss it…",
      },
      graduation: {
        framing:
          "Tom played hide and seek in the architecture faculty late at night and doesn't regret it — which childhood game do you love?",
        quote:
          "The building had excellent hiding places. He knows this for professional reasons too…",
      },
      christening: {
        framing:
          "Lily will learn the games — which childhood game do you love?",
        quote:
          "The one she'll play until called in. The one she'll teach her own children someday…",
      },
      achievement: {
        framing:
          "Marcus says long training runs had the quality of a childhood game — just movement, just the world — which do you love?",
        quote:
          "He hadn't thought of it that way until someone pointed it out. Now he can't unthink it…",
      },
      recovery: {
        framing:
          "Claire played card games with her family all year — which childhood game do you love?",
        quote: "They didn't talk much. They just played. Which game is yours?",
      },
      award: {
        framing:
          "Amelia says the best classrooms have the energy of a playground — which childhood game do you love?",
        quote:
          "She means it as a teaching philosophy. She also means it literally. She still knows the rules…",
      },
      promotion: {
        framing:
          "Kwame says product launches are basically the same as British bulldogs — which childhood game do you love?",
        quote:
          "Everyone running, certain collisions inevitable, somehow you get to the other side. He's right…",
      },
      celebration: {
        framing:
          "Every family has its game — which childhood game do you love?",
        quote: "The game you'd play tomorrow if someone let you…",
      },
      other: {
        framing:
          "Which childhood game do you love — the one you'd play tomorrow?",
        quote:
          "The game that says something true about who you were and probably still are…",
      },
      default: {
        framing:
          "Which childhood game do you love — the one you'd play tomorrow if someone let you?",
        quote:
          "The game that says something true about who you were and probably still are…",
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
        framing:
          "Belinda was an English teacher — but which subject do you love?",
        quote:
          "She could find a metaphor in anything. Probably Geography's fault…",
      },
      tribute: {
        framing:
          "David always said his real education happened after school — which subject do you love?",
        quote:
          "He didn't mean this critically. He just kept reading, kept learning, never stopped…",
      },
      birthday: {
        framing:
          "Sarah got detention in History for arguing with the textbook. She was right — which subject do you love?",
        quote:
          "She was always the student who asked too many questions. Still is…",
      },
      retirement: {
        framing:
          "David's team say it was Drama all along, not Maths — which school subject do you love?",
        quote: "He says Maths. His team say Drama. Both are probably right…",
      },
      wedding: {
        framing:
          "Emma got a D in Chemistry. James got a C. They've been arguing about why ever since — which subject do you love?",
        quote:
          "They met in a lab, metaphorically speaking. The chemistry was fine…",
      },
      anniversary: {
        framing: "They met at the same school — which subject do you love?",
        quote:
          "She was Science. He was History. They've been explaining things to each other ever since…",
      },
      leaving: {
        framing:
          "Priya ran every project like the best teacher runs a class — which school subject do you love?",
        quote: "Everyone learned. No one felt it happening. That's the skill…",
      },
      graduation: {
        framing:
          "Tom's love of architecture started in a school drawing lesson — which subject do you love?",
        quote:
          "The teacher kept a good stack of paper. Tom kept going after everyone else had stopped…",
      },
      christening: {
        framing:
          "The subjects Lily loves will shape her whole world — which subject do you love?",
        quote: "Too early to know hers. Not too early to share yours…",
      },
      achievement: {
        framing:
          "Marcus says the maths he used to estimate his finish time was the most useful he'd ever done — which subject do you love?",
        quote: "He's always underestimated maths. He's revising that view…",
      },
      recovery: {
        framing:
          "Claire read more this year than any year since school — which subject do you love?",
        quote:
          "She went back to the books she loved. Then the ones she'd missed…",
      },
      award: {
        framing:
          "Amelia teaches English but says every subject is really just English if you look at it right — which subject do you love?",
        quote: "She makes this case persuasively. Her colleagues mostly agree…",
      },
      promotion: {
        framing:
          "Kwame says everything he needed to know about shipping products he learned in GCSE Physics — which subject do you love?",
        quote:
          "He means force, friction, velocity. Also he means it metaphorically. Both are true…",
      },
      celebration: {
        framing:
          "The subject that shaped you is worth celebrating — which do you love?",
        quote:
          "The lesson that actually shaped you — which one, and what did it give you?",
      },
      other: {
        framing:
          "Which school subject do you love — the lesson that actually shaped you?",
        quote:
          "The subject you were made for — which one, and what did it give you?",
      },
      default: {
        framing:
          "Which school subject do you love — the lesson that actually shaped you?",
        quote:
          "The subject you were made for — which one, and what did it give you?",
      },
    },
  },
  {
    title: "Type of book",
    description: "What they loved to read",
    is_finite: false,
    categories: ["Literature", "Everyday life"],
    placeholders: {
      memorial: {
        framing:
          "Belinda read biography — proper long ones, nothing abridged — which type of book do you love?",
        quote:
          "She always had three on the go. Never confused a word from any of them…",
      },
      tribute: {
        framing:
          "David read widely but came back to biography every time — which type of book do you love?",
        quote:
          "He believed a life well documented was a gift. He tried to live that way himself…",
      },
      birthday: {
        framing:
          "Sarah reads everything but always comes back to travel writing — which type of book do you love?",
        quote:
          "She marks passages and tells people about them at dinner. This is as wonderful as it sounds…",
      },
      retirement: {
        framing:
          "David's reading pile has been growing for a decade — which type of book do you love?",
        quote:
          "The biography section alone takes up two shelves. Time to make a start…",
      },
      wedding: {
        framing:
          "She reads novels. He reads history. They read each other's out loud anyway — which type of book do you love?",
        quote: "Neither of them considers this unusual. It isn't…",
      },
      anniversary: {
        framing:
          "They've shared books for forty years — some arguments, mostly recommendations — which type do you love?",
        quote:
          "She annotates. He doesn't. They've made peace with this. Mostly…",
      },
      leaving: {
        framing:
          "Priya would write a book about her time here that you'd recommend to people you like — which type of book do you love?",
        quote: "Fast, warm, ends well. That's the book. Which type is yours?",
      },
      graduation: {
        framing:
          "Tom spent three years reading technical manuals and says he now craves something different — which type do you love?",
        quote:
          "His reading list now contains approximately zero structural calculations. The switch is complete…",
      },
      christening: {
        framing:
          "Lily's first books are already being chosen — which type do you love?",
        quote:
          "She'll grow into every kind. Tell us which one is yours and why…",
      },
      achievement: {
        framing:
          "Marcus read a running memoir during training — which type of book do you love?",
        quote:
          "He found the genre late. He's now in it completely. Highly recommended…",
      },
      recovery: {
        framing:
          "Claire read poetry this year — said it worked because it didn't demand too much — which type do you love?",
        quote:
          "Short, true, done in five minutes. She needed that. The poetry delivered…",
      },
      award: {
        framing:
          "Amelia assigns books that change how students see themselves — which type do you love?",
        quote:
          "She has a list. It changes every year. The principle never does…",
      },
      promotion: {
        framing:
          "Kwame reads only one type of business book but reads everything else — which type do you love?",
        quote:
          "He's very specific about which business books earn the distinction. Not many do…",
      },
      celebration: {
        framing: "A bookshelf is a portrait — which type of book do you love?",
        quote:
          "A bookshelf is a portrait. Which type is yours, and what does it say?",
      },
      other: {
        framing:
          "Which type of book do you love — and what kind of reader does that make you?",
        quote:
          "A bookshelf is a portrait. Which type of book is yours, and what does it say?",
      },
      default: {
        framing:
          "Which type of book do you love — and what kind of reader does that make you?",
        quote:
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
        framing:
          "Belinda always had a Mary Oliver line ready for exactly the right moment — which poet do you love?",
        quote:
          "She'd write lines on cards and leave them for people to find. You'd come across one months later…",
      },
      tribute: {
        framing:
          "David always had the right poem for the right moment — which poet do you love?",
        quote:
          "He'd produce it without making it feel like a performance. That's the hardest thing to do…",
      },
      birthday: {
        framing:
          "Sarah quoted Seamus Heaney in a birthday speech once and made someone cry — which poet do you love?",
        quote:
          "She says she doesn't read poetry. There are three collections on her bedside table…",
      },
      retirement: {
        framing:
          "A career like David's deserves the right poem — which poet do you love?",
        quote:
          "Whose voice says thirty-five years better than any speech could?",
      },
      wedding: {
        framing:
          "Emma had chosen the poem years before she met James — which poet do you love?",
        quote: "She never told him that. Until she did. It was the right poem…",
      },
      anniversary: {
        framing:
          "Their wedding had a poem — they still read it every year — which poet do you love?",
        quote:
          "The same poem. The same words. Forty years later they mean something different and exactly the same…",
      },
      leaving: {
        framing:
          "Priya deserves the right poem — not the obvious one — which poet do you love?",
        quote:
          "The one that says what everyone actually means. Whose voice is that?",
      },
      graduation: {
        framing:
          "Tom's graduation speech included a poem and nobody was embarrassed — which poet do you love?",
        quote: "He chose it well. The room was very quiet. That's the test…",
      },
      christening: {
        framing: "Every child should inherit a poem — which poet do you love?",
        quote:
          "One line that's just for her. Which poet would you want Lily to love?",
      },
      achievement: {
        framing:
          "Marcus says there's a poem that describes running a marathon better than anything written about sport — which poet do you love?",
        quote:
          "He's looked for it. He's found several candidates. He'll tell you which ones…",
      },
      recovery: {
        framing:
          "Claire found a poet who seemed to understand exactly what the year had been like — which poet do you love?",
        quote: "She read the same poem many times. It held up every time…",
      },
      award: {
        framing:
          "Amelia believes a good teacher should be able to name three poets — which poet do you love?",
        quote:
          "She has more than three. She can recite from memory. She doesn't advertise this…",
      },
      promotion: {
        framing:
          "Kwame says he reads poetry for the compression — which poet do you love?",
        quote:
          "He means the way good lines do more with less. He's applied this to product copy ever since…",
      },
      celebration: {
        framing: "Every celebration needs its poem — which poet do you love?",
        quote:
          "Some poets just speak for particular people. Which voice is yours?",
      },
      other: {
        framing: "Which poet do you love — and which poem, if you can?",
        quote:
          "Some poets just speak for particular people. Which voice is yours?",
      },
      default: {
        framing: "Which poet do you love — and which poem, if you can?",
        quote:
          "Some poets just speak for particular people. Which voice is yours?",
      },
    },
  },
  {
    title: "Hobby",
    description: "What they did just for love of it",
    is_finite: false,
    categories: ["Everyday life", "Nature"],
    placeholders: {
      memorial: {
        framing:
          "Belinda gardened like it was a form of prayer — which hobby do you love?",
        quote:
          "The garden is still there. Someone else is tending it now. They're doing their best…",
      },
      tribute: {
        framing:
          "David made furniture as a young man and gave a piece to everyone he loved — which hobby do you love?",
        quote:
          "Every house he knew had something he'd made. He never mentioned it. They always knew…",
      },
      birthday: {
        framing:
          "Sarah took up photography three years ago and now sees everything differently — which hobby do you love?",
        quote:
          "She'd be horrified if you called it a hobby. It's a discipline, she'd say…",
      },
      retirement: {
        framing:
          "David mentioned woodwork once in passing and the team have been thinking about it ever since — which hobby do you love?",
        quote:
          "Thirty-five years of work. Now time for the thing done purely for love of it…",
      },
      wedding: {
        framing:
          "Emma and James started cooking properly together and now have serious opinions about knives — which hobby do you love?",
        quote: "They found the shared thing. It feeds them in every sense…",
      },
      anniversary: {
        framing:
          "They both garden, separately, in different ways, without ever overlapping — which hobby do you love?",
        quote:
          "She does the flowers. He does the vegetables. They've never once trespassed. It works perfectly…",
      },
      leaving: {
        framing:
          "Priya once mentioned she used to paint. Three years ago. She hasn't mentioned it since — which hobby do you love?",
        quote: "The days are her own now. Maybe this is the time…",
      },
      graduation: {
        framing:
          "Tom has three hobbies he abandoned during finals and plans to return to all of them — which hobby do you love?",
        quote:
          "The list is specific. The intention is real. He's written it down…",
      },
      christening: {
        framing:
          "One day Lily will have a hobby she can't live without — which hobby do you love?",
        quote:
          "The thing she does purely for love of it. Tell us yours while we wait for hers…",
      },
      achievement: {
        framing:
          "Marcus says running went from exercise to hobby to vocation in eight months — which hobby do you love?",
        quote: "He didn't plan that. He's not complaining…",
      },
      recovery: {
        framing:
          "Claire went back to a hobby she'd stopped years ago — which hobby do you love?",
        quote:
          "She was surprised how easily it came back. Some things wait for you…",
      },
      award: {
        framing:
          "Amelia runs a book club outside school hours and says it's the best use of a Tuesday evening — which hobby do you love?",
        quote:
          "Not an extension of work. Genuinely separate. She's clear about the distinction…",
      },
      promotion: {
        framing:
          "Kwame took up cooking properly when the promotion gave him more financial room — which hobby do you love?",
        quote:
          "He's been systematic about it. He has a list of techniques. He's working through them…",
      },
      celebration: {
        framing:
          "What do you do purely for love of it? — which hobby do you love?",
        quote: "Not a job, not an obligation. The thing that's entirely yours…",
      },
      other: {
        framing:
          "Which hobby do you love — the thing you do purely for the love of it?",
        quote: "Not a job, not an obligation. The thing that's entirely yours…",
      },
      default: {
        framing:
          "Which hobby do you love — the thing you do purely for the love of it?",
        quote: "Not a job, not an obligation. The thing that's entirely yours…",
      },
    },
  },
  {
    title: "Way to spend Sunday",
    description: "Their perfect day of rest",
    is_finite: false,
    categories: ["Everyday life", "Time"],
    placeholders: {
      memorial: {
        framing:
          "Belinda's Sunday was church, garden, long lunch, Radio 4 — which is your ideal way to spend Sunday?",
        quote:
          "If you wanted her on a Sunday, you had to know the schedule. It was sacred…",
      },
      tribute: {
        framing:
          "David's Sunday was a long lunch, a long walk, and whatever he was reading — which is your ideal way to spend Sunday?",
        quote:
          "He was unavailable on Sundays. It wasn't rudeness. It was a system…",
      },
      birthday: {
        framing:
          "Sarah's ideal Sunday involves brunch, a long walk, and dinner she starts at 4pm — what's yours?",
        quote:
          "She has a Sunday playlist that lasts all day. Exactly as long as it should…",
      },
      retirement: {
        framing:
          "David has been planning his first free Sunday for thirty-five years — what's your ideal Sunday?",
        quote: "The garden is ready. The coffee is on. The plan is: no plan…",
      },
      wedding: {
        framing:
          "She wants stillness. He wants activity. They found the midpoint — what's your ideal Sunday?",
        quote:
          "The midpoint involves cooking. Long cooking. It works for both of them…",
      },
      anniversary: {
        framing:
          "Forty years of Sundays and the format has never really changed — what's your ideal Sunday?",
        quote:
          "The morning is theirs. The afternoon is theirs. The evening is theirs. Same as always…",
      },
      leaving: {
        framing:
          "Priya described the perfect Sunday in a meeting once. It starts with a proper lie-in — what's yours?",
        quote:
          "No alarms. No plans until noon. That's the Sunday she's earned…",
      },
      graduation: {
        framing:
          "Tom says the first Sunday after graduating felt like a gift he didn't know what to do with — what's your ideal Sunday?",
        quote:
          "He eventually figured it out. It involved sleeping past 9am for the first time in three years…",
      },
      christening: {
        framing:
          "Lily is currently making Sunday a very specific kind of adventure — what's your ideal Sunday?",
        quote:
          "It involves very early mornings. This is, apparently, fine. We're adjusting…",
      },
      achievement: {
        framing:
          "Marcus's first Sunday after the marathon was the most complete rest he'd had in eight months — what's your ideal Sunday?",
        quote:
          "He did absolutely nothing. He has strong feelings about how well it worked…",
      },
      recovery: {
        framing:
          "Claire found a Sunday routine this year and says it held everything together — what's your ideal Sunday?",
        quote:
          "Small, dependable, exactly the same each week. Which is why it worked…",
      },
      award: {
        framing:
          "Amelia says Sunday exists to make Monday possible — what's your ideal Sunday?",
        quote:
          "She means this practically and philosophically. Both are correct…",
      },
      promotion: {
        framing:
          "Kwame has been building his ideal Sunday for years and recently had the time to actually do it — what's your ideal Sunday?",
        quote:
          "He doesn't share the details. Whatever it involves, it's clearly working…",
      },
      celebration: {
        framing:
          "Celebrate with a proper Sunday — what's your ideal way to spend it?",
        quote: "Sunday is a portrait of a person. What does yours say?",
      },
      other: {
        framing:
          "What's your ideal way to spend Sunday — and what does that say about you?",
        quote: "Sunday is a portrait of a person. What does yours say?",
      },
      default: {
        framing:
          "What's your ideal way to spend Sunday — and what does that say about you?",
        quote: "Sunday is a portrait of a person. What does yours say?",
      },
    },
  },
  {
    title: "Smell",
    description: "Scent that took them somewhere",
    is_finite: false,
    categories: ["Nature", "Childhood", "Everyday life"],
    placeholders: {
      memorial: {
        framing:
          "Belinda's house always smelled of bread baking and lavender — which smell do you love?",
        quote:
          "You could tell what day of the week it was by what was coming from her kitchen. Wednesday was always bread…",
      },
      tribute: {
        framing:
          "David's study always smelled of books and something from the kitchen — which smell do you love?",
        quote:
          "It was entirely him. Nobody went in there and didn't notice it…",
      },
      birthday: {
        framing:
          "Sarah bought a candle that smelled of old library and burned it every evening for a month — which smell do you love?",
        quote:
          "She claims to be immune to nostalgia. The candle tells a different story…",
      },
      retirement: {
        framing:
          "David's office smelled of coffee and something indefinably calm for thirty-five years — which smell do you love?",
        quote:
          "Whoever moves in there next will notice immediately. Some smells belong to someone…",
      },
      wedding: {
        framing:
          "The wedding field smelled of cut grass, something floral, and a distant bonfire — which smell do you love?",
        quote:
          "Everyone who was there still remembers it. That's the smell of the day…",
      },
      anniversary: {
        framing:
          "Their house has smelled the same for forty years — which smell do you love?",
        quote:
          "You can't identify it exactly. You'd know it anywhere. Some smells are just a home…",
      },
      leaving: {
        framing:
          "Priya wore the same perfume for six years — which smell do you love?",
        quote:
          "The office will smell different without her. We're not quite ready to say it yet…",
      },
      graduation: {
        framing:
          "Tom says architecture studios have a specific smell he'll always find moving — which smell do you love?",
        quote:
          "Pencil shavings, model glue, cold coffee, paper. That's three years, right there…",
      },
      christening: {
        framing:
          "Lily has the very specific smell of being completely new — which smell do you love?",
        quote:
          "She'll have her own eventually. For now she has the one that belongs only to the very start…",
      },
      achievement: {
        framing:
          "Marcus says he'll always love the smell of rain on pavements now — which smell do you love?",
        quote:
          "Eight months of early mornings. Mostly cold. Mostly rain on the pavement. Mostly perfect…",
      },
      recovery: {
        framing:
          "Claire said certain smells helped — grounding, familiar, specifically comforting — which smell do you love?",
        quote:
          "She couldn't have explained why. The smells knew what they were doing…",
      },
      award: {
        framing:
          "Amelia says every classroom has its own smell and she can identify the good ones — which smell do you love?",
        quote:
          "Chalk dust, old paper, a specific kind of concentration. She could describe it exactly…",
      },
      promotion: {
        framing:
          "Kwame associates the smell of good coffee with decisions well made — which smell do you love?",
        quote:
          "He's specific about the coffee and about the decisions. Both have high standards…",
      },
      celebration: {
        framing: "Which smell belongs to today? — which smell do you love?",
        quote:
          "Scent is the most honest memory. Which smell is yours, and where does it take you?",
      },
      other: {
        framing:
          "Which smell do you love — the one that takes you somewhere instantly?",
        quote:
          "Scent is the most honest memory. Which smell is yours, and where does it take you?",
      },
      default: {
        framing:
          "Which smell do you love — the one that takes you somewhere instantly?",
        quote:
          "Scent is the most honest memory. Which smell is yours, and where does it take you?",
      },
    },
  },
  {
    title: "Weather for walk",
    description: "Conditions that got them outside",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        framing:
          "Belinda loved a crisp winter morning walk — which weather do you love for a walk?",
        quote:
          "She came back different from a cold clear morning. More herself, somehow…",
      },
      tribute: {
        framing:
          "David walked in all weathers and said the worst weather made the best walks — which walking weather do you love?",
        quote:
          "He went out in everything. He came back from all of it looking like someone who'd had a good walk…",
      },
      birthday: {
        framing:
          "Sarah once walked twelve miles in light drizzle and called it refreshing — which walking weather do you love?",
        quote:
          "She described horizontal rain as bracing once. This is technically a matter of perspective…",
      },
      retirement: {
        framing:
          "David walked to work in the dark for thirty-five years. Golden hour is finally on the table — which walking weather do you love?",
        quote:
          "The right walk in the right light. That's all it takes. He's known this for years…",
      },
      wedding: {
        framing:
          "Emma talks. James listens. Then they swap. They've solved everything this way — which walking weather do you love?",
        quote:
          "Any weather works. They've never had a bad one. The weather isn't really the point…",
      },
      anniversary: {
        framing:
          "Forty years of anniversary walks — in every weather — which walking weather do you love?",
        quote:
          "They've walked in sunshine, rain, mist, and once in a light snowfall. All of them are remembered…",
      },
      leaving: {
        framing:
          "Priya always said a good walk could sort anything out — which weather do you love for a walk?",
        quote:
          "The kind of weather that makes everything feel possible. Which one is that for you?",
      },
      graduation: {
        framing:
          "Tom walked home from his last exam in Manchester rain — which walking weather do you love?",
        quote: "He said it felt exactly right. He wasn't wrong…",
      },
      christening: {
        framing:
          "Lily will eventually have a weather she walks best in — which walking weather do you love?",
        quote:
          "Too young for opinions on this. All the adults have them, though…",
      },
      achievement: {
        framing:
          "Marcus trained in every weather but says cool and overcast was when running felt easiest — which walking weather do you love?",
        quote:
          "Not too hot, not too cold, not too bright. Just the right sky for just the right pace…",
      },
      recovery: {
        framing:
          "Claire walked every day whatever the weather — which walking weather do you love?",
        quote:
          "Some mornings the weather was terrible. She went anyway. The going anyway was the whole thing…",
      },
      award: {
        framing:
          "Amelia says the best walks are in October — which walking weather do you love?",
        quote:
          "Low sun, fallen leaves, enough cold to feel real. She plans her year around this walk…",
      },
      promotion: {
        framing:
          "Kwame walked to clear his head after the promotion news — which walking weather do you love?",
        quote:
          "It was early evening. Mild. He walked for an hour. Everything became clear…",
      },
      celebration: {
        framing:
          "The best celebration includes a walk — which walking weather do you love?",
        quote:
          "The sky that gets you out of the house and into the world — which one is yours?",
      },
      other: {
        framing:
          "Which weather do you love for a walk — and why does it suit you?",
        quote:
          "The sky that gets you out of the house and into the world — which one is yours?",
      },
      default: {
        framing:
          "Which weather do you love for a walk — and why does it suit you?",
        quote:
          "The sky that gets you out of the house and into the world — which one is yours?",
      },
    },
  },
]

const topicItems: Record<string, string[]> = {
  Colour: [
    "Red",
    "Orange",
    "Yellow",
    "Green",
    "Blue",
    "Purple",
    "Pink",
    "Brown",
    "Black",
    "White",
    "Grey",
  ],
  Season: ["Spring", "Summer", "Autumn", "Winter"],
  "Day of the week": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  "Meal of the day": [
    "Breakfast",
    "Brunch",
    "Lunch",
    "Afternoon tea",
    "Dinner",
    "Supper",
  ],
  "Time of day": [
    "Early morning",
    "Mid morning",
    "Lunchtime",
    "Afternoon",
    "Late afternoon",
    "Dusk",
    "Evening",
    "Late night",
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
  Animal: [
    "Dog",
    "Cat",
    "Horse",
    "Robin",
    "Owl",
    "Fox",
    "Elephant",
    "Dolphin",
    "Deer",
    "Hedgehog",
    "Duck",
    "Swan",
    "Rabbit",
    "Badger",
  ],
  Bird: [
    "Robin",
    "Blackbird",
    "Blue tit",
    "Kingfisher",
    "Puffin",
    "Barn owl",
    "Heron",
    "Wren",
    "Sparrow",
    "Goldfinch",
    "Swan",
    "Pheasant",
  ],
  Flower: [
    "Rose",
    "Lavender",
    "Sunflower",
    "Bluebell",
    "Daisy",
    "Poppy",
    "Sweet pea",
    "Daffodil",
    "Lily",
    "Wisteria",
    "Magnolia",
    "Peony",
    "Foxglove",
    "Primrose",
  ],
  Tree: [
    "Oak",
    "Willow",
    "Cherry blossom",
    "Silver birch",
    "Beech",
    "Horse chestnut",
    "Apple",
    "Yew",
    "Rowan",
    "Pine",
    "Elm",
    "Scots pine",
  ],
  Weather: [
    "Bright sunshine",
    "Warm rain",
    "Crisp frost",
    "Overcast and mild",
    "Thunderstorm",
    "Light snow",
    "Misty morning",
    "Blustery wind",
    "Golden autumn light",
    "Dewy spring morning",
  ],
  Landscape: [
    "Rolling hills",
    "Coastline",
    "Open moorland",
    "River valley",
    "City skyline",
    "Woodland",
    "Mountains",
    "Village green",
    "Farmland",
    "Harbour",
    "Loch",
    "Chalk downs",
  ],
  Place: [
    "Seaside",
    "Countryside",
    "Garden",
    "Pub",
    "Mountains",
    "Home",
    "Childhood home",
    "Abroad",
    "City",
    "By river",
  ],
  "Type of holiday": [
    "Beach holiday",
    "City break",
    "Countryside retreat",
    "Walking holiday",
    "Cruise",
    "Camping",
    "Staycation",
    "Winter sun",
    "Skiing",
    "Visiting family",
  ],
  "Way to travel": [
    "By train",
    "By car",
    "On foot",
    "By bicycle",
    "By boat",
    "By plane",
    "By bus",
    "On motorbike",
  ],
  Film: [
    "The Shawshank Redemption",
    "Casablanca",
    "Schindler's List",
    "It's a Wonderful Life",
    "The Sound of Music",
    "Lawrence of Arabia",
    "Brief Encounter",
    "Some Like It Hot",
    "Gone with the Wind",
    "Four Weddings and a Funeral",
    "Paddington 2",
    "Local Hero",
    "Whisky Galore",
    "The Italian Job",
    "Gregory's Girl",
  ],
  "Film genre": [
    "Comedy",
    "Drama",
    "Romance",
    "Thriller",
    "Documentary",
    "Musical",
    "Animation",
    "Science fiction",
    "War film",
    "Western",
    "Horror",
    "Crime",
  ],
  "TV show": [
    "Drama series",
    "Sitcom",
    "Nature documentary",
    "Quiz show",
    "Chat show",
    "Cooking show",
    "Crime thriller",
    "Soap opera",
    "News programme",
    "Sport",
    "Reality show",
    "Period drama",
  ],
  Song: [
    "My Way — Frank Sinatra",
    "Bohemian Rhapsody — Queen",
    "Angels — Robbie Williams",
    "Don't Look Back in Anger — Oasis",
    "Waterloo Sunset — The Kinks",
    "What a Wonderful World — Louis Armstrong",
    "Jerusalem — Parry",
    "Abide With Me — traditional",
    "Over the Rainbow — Judy Garland",
    "Wind Beneath My Wings — Bette Midler",
    "You'll Never Walk Alone — traditional",
    "Danny Boy — traditional",
  ],
  "Music genre": [
    "Classical",
    "Jazz",
    "Rock",
    "Pop",
    "Soul",
    "Folk",
    "Blues",
    "Electronic",
    "Hip-Hop",
    "Country",
    "Reggae",
    "Musical theatre",
  ],
  "Music era": [
    "Jazz age",
    "Rock and roll",
    "Swinging sixties",
    "Seventies soul and funk",
    "Eighties pop",
    "Nineties indie and dance",
    "Noughties",
    "Streaming era",
  ],
  Instrument: [
    "Piano",
    "Guitar",
    "Violin",
    "Cello",
    "Trumpet",
    "Saxophone",
    "Drums",
    "Voice",
    "Flute",
    "Accordion",
    "Harp",
    "Organ",
    "Banjo",
  ],
  "Type of song": [
    "Love song",
    "Song from childhood",
    "Hymn or spiritual",
    "Song that makes you dance",
    "Song that makes you cry",
    "Song that tells story",
    "Anthem",
    "Lullaby",
    "Folk song",
    "Show tune",
  ],
  Drink: [
    "Tea",
    "Coffee",
    "Beer",
    "Red wine",
    "White wine",
    "Whisky",
    "Gin & tonic",
    "Soft drink",
    "Champagne",
    "Hot chocolate",
    "Juice",
    "Stout",
    "Cider",
  ],
  "Comfort food": [
    "Soup",
    "Toast",
    "Roast dinner",
    "Fish and chips",
    "Pasta",
    "Beans on toast",
    "Porridge",
    "Shepherd's pie",
    "Rice pudding",
    "Bacon sandwich",
    "Scrambled eggs",
    "Cheese on toast",
    "Cottage pie",
    "Bread and butter pudding",
  ],
  Biscuit: [
    "Digestive",
    "Rich Tea",
    "Hobnob",
    "Bourbon",
    "Custard cream",
    "Chocolate digestive",
    "Shortbread",
    "Jammie Dodger",
    "Ginger nut",
    "Malted milk",
    "Tunnock's Caramel Wafer",
    "Wagon Wheel",
    "Viennese Whirl",
    "Pink Wafer",
    "Garibaldi",
  ],
  "Sport to watch": [
    "Football",
    "Cricket",
    "Tennis",
    "Rugby",
    "Athletics",
    "Cycling",
    "Swimming",
    "Horse racing",
    "Golf",
    "Snooker",
    "Bowls",
    "Darts",
  ],
  "Sport to play": [
    "Football",
    "Tennis",
    "Golf",
    "Swimming",
    "Running",
    "Cricket",
    "Cycling",
    "Badminton",
    "Bowls",
    "Walking",
    "Darts",
    "Table tennis",
  ],
  "Form of exercise": [
    "Walking",
    "Running",
    "Swimming",
    "Cycling",
    "Yoga",
    "Dancing",
    "Football",
    "Tennis",
    "Gardening",
    "Golf",
    "Pilates",
    "Tai chi",
  ],
  "Childhood game": [
    "Hide and seek",
    "Tag",
    "Conkers",
    "Hopscotch",
    "Marbles",
    "British bulldogs",
    "Rounders",
    "Skipping",
    "Stuck in the mud",
    "Card games",
    "Board games",
    "Building dens",
    "Elastics",
    "French cricket",
  ],
  "School subject": [
    "English",
    "Maths",
    "History",
    "Geography",
    "Science",
    "Art",
    "Music",
    "PE",
    "Drama",
    "Languages",
    "Woodwork or cookery",
    "RE",
  ],
  "Type of book": [
    "Novel",
    "Biography",
    "History",
    "Poetry",
    "Travel writing",
    "Crime fiction",
    "Science fiction",
    "Nature writing",
    "Self-help",
    "Short stories",
    "Children's books",
    "Memoir",
  ],
  Poet: [
    "William Shakespeare",
    "John Keats",
    "Emily Dickinson",
    "W.B. Yeats",
    "Seamus Heaney",
    "Philip Larkin",
    "Maya Angelou",
    "Dylan Thomas",
    "Wilfred Owen",
    "Mary Oliver",
    "Ted Hughes",
    "Roger McGough",
    "John Betjeman",
    "R.S. Thomas",
    "Pam Ayres",
  ],
  Hobby: [
    "Gardening",
    "Reading",
    "Cooking",
    "Walking",
    "Photography",
    "Knitting or sewing",
    "Painting or drawing",
    "Playing music",
    "Woodwork",
    "Birdwatching",
    "Crosswords or puzzles",
    "Collecting",
    "Volunteering",
    "Fishing",
    "Model making",
  ],
  "Way to spend Sunday": [
    "Long walk",
    "Roast dinner with family",
    "Reading all day",
    "Pottering in garden",
    "Watching sport",
    "Going to church",
    "Lie in",
    "Visiting somewhere new",
    "Cooking something special",
    "Doing absolutely nothing",
    "Pub lunch",
    "Drive in countryside",
  ],
  Smell: [
    "Freshly cut grass",
    "Rain on dry earth",
    "Bread baking",
    "Sea air",
    "Bonfire",
    "Old books",
    "Coffee in morning",
    "Garden after rain",
    "Lavender",
    "Woodsmoke",
    "Sunscreen",
    "Fresh laundry",
    "Petrol",
    "Old churches",
  ],
  "Weather for walk": [
    "Crisp winter morning",
    "Warm summer evening",
    "Autumn drizzle",
    "Bright spring day",
    "After rain",
    "Misty and still",
    "Blustery and wild",
    "Golden hour",
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

    const toInsert = items
      .filter((label) => !existingLabels.has(label.toLowerCase()))
      .map((label) => ({
        topic_id: topicId,
        label,
        is_master: true,
        source: "seed",
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
