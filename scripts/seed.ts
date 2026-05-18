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
        framing:
          "Belinda had a colour she came back to all her life — which colour do you love?",
        quote:
          "Hers was purple. She grew lavender in every garden she ever had, and wore it to every occasion that mattered.",
      },
      tribute: {
        framing:
          "David always came back to the same one — which colour do you love?",
        quote:
          "His was a particular shade of deep blue. The pocket square, always the same, at every meeting that counted. Nobody ever asked why.",
      },
      birthday: {
        framing:
          "Sarah has been known to redecorate entire rooms around a single colour — which colour do you love?",
        quote:
          "Hers is sage. Three weekends of deliberation, two trips to the paint shop, and no regrets. She still brings it up.",
      },
      retirement: {
        framing:
          "David had a colour he trusted above all others — which colour do you love?",
        quote:
          "His was navy. Same tie, every important meeting, thirty-five years. He never wavered once.",
      },
      wedding: {
        framing:
          "They have one wall they still can't agree on — which colour do you love?",
        quote:
          "Hers is blue. His is green. The wall remains unpainted. This is not a problem they're in any hurry to solve.",
      },
      anniversary: {
        framing:
          "They've repainted the sitting room twice and it's still not quite right — which colour do you love?",
        quote:
          "Theirs keeps changing. The sitting room has been repainted twice. The colour is still not quite right, apparently.",
      },
      leaving: {
        framing:
          "Priya wore colour like she meant it — which colour do you love?",
        quote:
          "Hers was coral — worn deliberately, always exactly right. The office felt greyer the day she left.",
      },
      graduation: {
        framing:
          "Tom had a colour palette he'd been refining for three years — which colour do you love?",
        quote:
          "His was terracotta. He said he chose it logically. It was clearly entirely instinctive.",
      },
      christening: {
        framing:
          "Lily has just arrived in a world full of colour — which colour do you love?",
        quote:
          "We've all got opinions on what her room should be. We're saving them for the right moment.",
      },
      achievement: {
        framing:
          "Marcus wore the same colour for every training run — which colour do you love?",
        quote:
          "His was orange. Hi-vis, visible to the cars, worn for eight months of dark early mornings. It's earned its place.",
      },
      recovery: {
        framing:
          "Claire found a colour that helped when everything felt grey — which colour do you love?",
        quote:
          "Hers was yellow. She surrounded herself with it — not aggressively, just enough. It did something.",
      },
      award: {
        framing:
          "Dr. Amelia Grant has a colour she believes changes how students think — which colour do you love?",
        quote:
          "Hers is yellow. She chose it deliberately and watched it work. She knew it before the research backed her up.",
      },
      promotion: {
        framing:
          "Kwame always said design begins with colour — which colour do you love?",
        quote:
          "His is indigo. He has a whole theory about it, applied to every product he's ever shipped.",
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
          "Belinda had a season she came alive in — which season do you love?",
        quote:
          "Hers was spring. She'd have seeds in the ground before anyone else had put away their winter coat.",
      },
      tribute: {
        framing:
          "David had a time of year that suited him above all others — which season do you love?",
        quote:
          "His was autumn. He was the kind of person who suited October — something about the quality of the light.",
      },
      birthday: {
        framing:
          "Sarah says she loves autumn, but her friends say she's actually a summer person — which season do you love?",
        quote:
          "Hers is summer, if you ask the people who know her. She plans her whole year around it, whatever she says.",
      },
      retirement: {
        framing:
          "David had a season when the best work always got done — which season do you love?",
        quote:
          "His was autumn. The best project always came together in October. Every year, without fail.",
      },
      wedding: {
        framing:
          "Emma and James met at a rainy festival — but which season do you actually love?",
        quote:
          "Hers is spring. His is summer. They've been at this for five years with no sign of resolution.",
      },
      anniversary: {
        framing:
          "They've had forty seasons together and still disagree about when to plant — which season do you love?",
        quote:
          "Theirs is spring, though they can't agree on exactly when. She plants in March. He says April.",
      },
      leaving: {
        framing:
          "Priya felt most herself in a particular season — which season do you love?",
        quote:
          "Hers was spring. She arrived in January and changed everything by March. That tracks.",
      },
      graduation: {
        framing:
          "Tom spent his whole final year in the studio and emerged, blinking, into a particular season — which season do you love?",
        quote:
          "His is summer. He saw very little daylight between January and May. Summer was particularly welcome.",
      },
      christening: {
        framing:
          "Lily arrived in a particular season — which season do you love?",
        quote:
          "She came in spring, just as the garden was starting. The timing felt perfect.",
      },
      achievement: {
        framing:
          "Marcus trained through every season, but one morning changed how he thinks about them — which season do you love?",
        quote:
          "His is autumn. The marathon was a crisp October morning, and he'll always associate it with finishing something.",
      },
      recovery: {
        framing:
          "Claire said one season felt different this year — which season do you love?",
        quote:
          "Hers is spring. She noticed things she'd never noticed before — the season felt like it was specifically for her.",
      },
      award: {
        framing:
          "Dr. Amelia Grant has a season when her students are hungriest — which season do you love?",
        quote:
          "Hers is autumn. September energy, first week back. She plans her whole year around that feeling.",
      },
      promotion: {
        framing:
          "Kwame chose the exact right moment to mark his promotion — which season do you love?",
        quote:
          "His is spring. He waited for the first warm day of the year, and it happened to be perfect.",
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
          "Belinda had a day of the week that was entirely hers — which day do you love?",
        quote:
          "Hers was Sunday. Long lunch, garden, Radio 4 — in that order. If you wanted her, you had to know the schedule.",
      },
      tribute: {
        framing:
          "David had a day he returned to, reliably — which day do you love?",
        quote:
          "His was Thursday. He held court on Thursday evenings, and everyone knew that was the night for a proper conversation.",
      },
      birthday: {
        framing:
          "Sarah has a day she insists has the best energy — which day do you love?",
        quote:
          "Hers is Thursday. She makes it feel like the weekend starts early. No one has ever been able to explain how.",
      },
      retirement: {
        framing:
          "David had a day he'd spent thirty-five years perfecting — which day do you love?",
        quote:
          "His was Monday. He always said weekends were just Mondays with better lighting. He believed this sincerely.",
      },
      wedding: {
        framing:
          "Emma and James have never quite agreed on a favourite day — which day do you love?",
        quote:
          "Hers is Sunday. His is Friday. They met on a Friday, got engaged on a Sunday, and haven't resolved it since.",
      },
      anniversary: {
        framing:
          "Mum and Dad have built forty years around the same day — which day do you love?",
        quote:
          "Theirs is Sunday. Same routine, same cup of tea, same order of things. It has never needed to change.",
      },
      leaving: {
        framing:
          "Priya had a way of making one day of the week feel like an event — which day do you love?",
        quote:
          "Hers was Tuesday. She made Tuesday lunches feel like the best part of the week. We're still not sure how.",
      },
      graduation: {
        framing:
          "Tom had a day that felt earned at university — which day do you love?",
        quote:
          "His was Friday. Five days in the studio, then Friday arrived like a reward he'd worked for.",
      },
      christening: {
        framing: "Lily was born on a Tuesday — which day do you love?",
        quote:
          "She arrived on a Tuesday and immediately made it feel significant.",
      },
      achievement: {
        framing:
          "Marcus ran the marathon on one particular day — which day do you love?",
        quote:
          "His is Sunday now. He finished 26.2 miles before the papers were read. Sundays will never feel the same.",
      },
      recovery: {
        framing:
          "Claire started counting a particular day differently this year — which day do you love?",
        quote:
          "Hers became Monday. Each one a milestone, each one its own small arrival.",
      },
      award: {
        framing:
          "Dr. Amelia Grant has a day when everything clicks — which day do you love?",
        quote:
          "Hers is Thursday. By then the class has found its rhythm and she has theirs. She wouldn't swap it.",
      },
      promotion: {
        framing:
          "Kwame had a day he couldn't wait to arrive — which day do you love?",
        quote:
          "His is Monday. He got the news on a Wednesday and spent Thursday and Friday waiting to tell the team. Worth every minute.",
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
          "Belinda had a meal she never rushed and never skipped — which meal do you love?",
        quote:
          "Hers was Sunday lunch. Still at the table at three, every week without fail. That was the whole point of the day.",
      },
      tribute: {
        framing:
          "David had a meal he treated as something worth doing properly — which meal do you love?",
        quote:
          "His was lunch. Never at a desk, always with someone. He believed no important conversation should happen on an empty stomach.",
      },
      birthday: {
        framing:
          "Sarah treats one meal like a performance — which meal do you love?",
        quote:
          "Hers is dinner. She once cancelled a lunch to spend the afternoon making proper stock. No regrets.",
      },
      retirement: {
        framing:
          "David spent thirty-five years treating one meal as an afterthought — which meal do you love?",
        quote:
          "His was lunch — eaten at his desk for thirty-five years. He's already planning the standing reservation.",
      },
      wedding: {
        framing:
          "Emma and James have strong opinions about one meal in particular — which meal do you love?",
        quote:
          "Theirs is brunch — though they've argued for three years about whether it counts as a meal. It does, obviously.",
      },
      anniversary: {
        framing:
          "Mum and Dad have had the same meal every Sunday for forty years — which meal do you love?",
        quote:
          "Theirs is Sunday lunch. The gravy debate is ongoing. Everything else about Sunday lunch is completely settled.",
      },
      leaving: {
        framing:
          "Priya made one meal feel like the best part of the working day — which meal do you love?",
        quote:
          "Hers was lunch. She had a way of turning a lunch break into something worth looking forward to.",
      },
      graduation: {
        framing:
          "Tom survived on questionable late-night food and now holds one meal sacred — which meal do you love?",
        quote:
          "His is dinner. Three years of toast and reheated pasta. The world is full of better options now.",
      },
      christening: {
        framing:
          "The family gathered for a meal to welcome Lily — which meal do you love?",
        quote: "Some meals are just meals. This one was for something bigger.",
      },
      achievement: {
        framing:
          "Marcus had one meal in mind from mile fourteen onwards — which meal do you love?",
        quote:
          "His was a roast dinner. 26.2 miles and he'd been planning it since Deptford. He earned every bite.",
      },
      recovery: {
        framing:
          "Claire says one meal tastes different now — in the best possible way — which meal do you love?",
        quote:
          "Hers is breakfast. Some meals become something more than food. That one did.",
      },
      award: {
        framing:
          "Dr. Amelia Grant takes one meal seriously and says it sets the tone for everything — which meal do you love?",
        quote:
          "Hers is lunch. She's been known to collect a colleague from their desk and insist they come too.",
      },
      promotion: {
        framing:
          "Kwame chose one meal to mark the moment — which meal do you love?",
        quote:
          "His was dinner. He chose the restaurant, he chose the table. It was exactly right.",
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
          "Belinda had a time of day that was entirely hers — which time do you love?",
        quote:
          "Hers was early morning. Half the garden done before the world woke up. She said the best thinking happened before anyone else was awake.",
      },
      tribute: {
        framing:
          "David had an hour of the day when he was most himself — which time of day do you love?",
        quote:
          "His was late afternoon. He'd always be there at five with something worth saying. The timing was never an accident.",
      },
      birthday: {
        framing:
          "Sarah has a time of day when she properly comes alive — which time of day do you love?",
        quote:
          "Hers is late evening. She's been known to start an elaborate dinner at ten. No one has ever complained.",
      },
      retirement: {
        framing:
          "David had an hour of the day when his best thinking happened — which time of day do you love?",
        quote:
          "His was 7am. Fresh coffee, full focus. He'd solved the hardest problems before the rest of the team had parked their cars.",
      },
      wedding: {
        framing:
          "Emma and James each have a favourite time of day and haven't agreed on it yet — which time do you love?",
        quote:
          "Hers is golden hour. His is late evening. They're happiest when neither of them thinks to check the time.",
      },
      anniversary: {
        framing:
          "Mum and Dad share a time of day that has held forty years together — which time of day do you love?",
        quote:
          "Theirs is early morning. Tea, no phones, no plans. That's been the whole foundation of it.",
      },
      leaving: {
        framing:
          "Priya had a way of making one hour feel like the beginning of something — which time of day do you love?",
        quote:
          "Hers was 3pm. That hour belonged to her. The office felt it most around then.",
      },
      graduation: {
        framing:
          "Tom had a time of day when the best work always happened — which time of day do you love?",
        quote:
          "His was midnight. Three years of 2am renders and decisions that looked different in the morning. All worth it.",
      },
      christening: {
        framing:
          "Lily has strong opinions about what time of day matters — which time do you love?",
        quote: "She's made her views very clear, mostly between 2am and 4am.",
      },
      achievement: {
        framing:
          "Marcus set off at a particular hour and it changed how he thinks about time — which time of day do you love?",
        quote:
          "His is 8am. He was on mile twelve before most people had checked their phones. There's something in that.",
      },
      recovery: {
        framing:
          "Claire found a particular time of day felt different this year — which time of day do you love?",
        quote:
          "Hers became morning. Lighter, quieter, more noticed. She started paying attention properly.",
      },
      award: {
        framing:
          "Dr. Amelia Grant has a lesson slot she plans everything around — which time of day do you love?",
        quote:
          "Hers is 9am. Everyone awake, everyone up for it. She builds the whole day from that first hour.",
      },
      promotion: {
        framing:
          "Kwame has found the hours that are entirely his — which time of day do you love?",
        quote:
          "His best thinking is at 6am. His best presenting is at 10. Everything else is scheduled around those two hours.",
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
          "Belinda had a decade she always said changed everything — which decade do you love?",
        quote:
          "Hers was the sixties. She kept a box of photos from 1968 that she'd show anyone who asked. And many who didn't.",
      },
      tribute: {
        framing:
          "David had an era he always returned to — which decade do you love?",
        quote:
          "His was the nineties. That was when he found his voice, he said. His theory ran from Coltrane to Radiohead.",
      },
      birthday: {
        framing:
          "Sarah has an era she's rooted in and makes no apology for — which decade do you love?",
        quote:
          "Hers is the eighties. She knows every word to every song from 1986. Don't test her on this.",
      },
      retirement: {
        framing:
          "David had a decade he always said was when the real work got done — which decade do you love?",
        quote:
          "His was the nineties. He joined the firm in 1989. The engineers who were there would agree.",
      },
      wedding: {
        framing:
          "Emma and James are both shaped by one decade and neither would admit it — which decade do you love?",
        quote:
          "Theirs is the nineties. Their first date playlist covered entirely the wrong decade for both of them. It worked anyway.",
      },
      anniversary: {
        framing:
          "Mum and Dad got married in a particular decade and have been adding to the story ever since — which decade do you love?",
        quote:
          "Theirs was the seventies. Forty years makes you a time traveller. Ask them about every decade since.",
      },
      leaving: {
        framing:
          "Priya had a decade she always said was underrated — which decade do you love?",
        quote:
          "Hers was the noughties. She arrived already shaped by it. We just got lucky with the timing.",
      },
      graduation: {
        framing:
          "Tom has strong opinions about which decade matters — which decade do you love?",
        quote:
          "His is the noughties. He has views on architecture's relationship with each decade. It's a long but worthwhile conversation.",
      },
      christening: {
        framing:
          "Lily is the first person in this family born in the 2020s — which decade do you love?",
        quote:
          "She starts her story in a new decade. The rest of us have our own.",
      },
      achievement: {
        framing:
          "Marcus found one decade's energy got him through the training — which decade do you love?",
        quote:
          "His is the 2000s. Something about getting up before dawn in the cold felt specifically like that era.",
      },
      recovery: {
        framing:
          "Claire said one decade already felt different — in the best sense — which decade do you love?",
        quote:
          "Hers is this one. It's still early, and it's already earning its place.",
      },
      award: {
        framing:
          "Dr. Amelia Grant has a decade she believes was when education got interesting — which decade do you love?",
        quote:
          "Hers is the nineties. She has very specific reasons. They're worth asking her about.",
      },
      promotion: {
        framing:
          "Kwame has a decade he argues was when product thinking finally grew up — which decade do you love?",
        quote:
          "His is the 2010s. He'll defend this position. He's also probably right.",
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
          "Belinda had an animal she always felt something for — which animal do you love?",
        quote:
          "Hers was the fox. They'd always turn up in her garden, and she always stopped to watch. She said animals knew things people didn't.",
      },
      tribute: {
        framing:
          "David had an animal quality people noticed and admired — which animal do you love?",
        quote:
          "His was the heron. Patient, watchful, always in exactly the right place. He knew when to stay still and when to move.",
      },
      birthday: {
        framing:
          "Sarah has always said she's one animal, but behaves like another — which animal do you love?",
        quote:
          "Hers is the dog, if you ask anyone who knows her. She claims cat person. Her behaviour says otherwise.",
      },
      retirement: {
        framing:
          "David had an animal quality his colleagues always recognised — which animal do you love?",
        quote:
          "His was the old labrador. Steady, loyal, never fussed. You always knew where you stood.",
      },
      wedding: {
        framing:
          "Emma and James each love a different animal and have never agreed on it — which animal do you love?",
        quote:
          "Hers is the otter. His is the dog. They haven't resolved it. We don't think they intend to.",
      },
      anniversary: {
        framing:
          "After forty years Mum and Dad have agreed on some things but not on their favourite animal — which animal do you love?",
        quote:
          "Theirs is dogs — that much is settled. The breed question remains open. Everything else has been resolved.",
      },
      leaving: {
        framing:
          "Priya always described herself as a particular kind of animal in a house of quite different ones — which animal do you love?",
        quote:
          "Hers was the fox. She said it as a compliment to everyone involved. Knowing her, it was.",
      },
      graduation: {
        framing:
          "Tom's tutors always compared him to a particular kind of creature — which animal do you love?",
        quote:
          "His was the migratory bird. First-class degree, immediately wanted to be somewhere else. Classic.",
      },
      christening: {
        framing:
          "Everyone has an animal they think Lily will love — which animal do you love?",
        quote:
          "She'll make up her own mind. But it's worth starting the conversation now.",
      },
      achievement: {
        framing:
          "Marcus found an animal he identified with around mile twenty — which animal do you love?",
        quote:
          "His was the horse. Just keeping going, just the rhythm. He'll look back on that and know something true.",
      },
      recovery: {
        framing:
          "Claire found one animal started to mean something to her this year — which animal do you love?",
        quote:
          "Hers was the bird. She started noticing them everywhere. Noticing them properly.",
      },
      award: {
        framing:
          "Dr. Amelia Grant's classroom has always had a particular creature on the wall — which animal do you love?",
        quote:
          "Hers is the owl. Patient, wide-eyed, good with the dark. She says it makes students think about instinct.",
      },
      promotion: {
        framing:
          "Kwame has a particular animal he thinks the best teams resemble — which animal do you love?",
        quote:
          "His is the border collie. Focused, energetic, excellent at herding things that need herding. A compliment to everyone involved.",
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
        framing:
          "Belinda had a bird she always stopped for — which bird do you love?",
        quote:
          "Hers was the robin. She could identify a bird by its song before it appeared. It seemed impossible, until you knew her.",
      },
      tribute: {
        framing:
          "David had a bird quality people always noticed — which bird do you love?",
        quote:
          "His was the blackbird. Clear voice, unhurried. He could fill a room without raising his volume.",
      },
      birthday: {
        framing:
          "Sarah has a bird she'd spot anywhere and tell everyone about — which bird do you love?",
        quote:
          "Hers is the puffin. She spotted one from a moving ferry and talked about it for an hour. She has a list she claims not to take seriously.",
      },
      retirement: {
        framing:
          "David had a bird quality his colleagues always recognised — which bird do you love?",
        quote:
          "His was the heron. Patient, watchful, then exactly right. You'd hear him described the same way by everyone who worked with him.",
      },
      wedding: {
        framing:
          "Emma and James are each a different kind of bird and somehow it makes perfect sense — which bird do you love?",
        quote:
          "Hers is the swallow. His is the heron. Separately they're completely different. Together it works.",
      },
      anniversary: {
        framing:
          "Mum and Dad have watched the same birds in the same garden for forty years — which bird do you love?",
        quote:
          "Theirs is the robin. It comes back every year. They leave crumbs on the same wall. It has never not returned.",
      },
      leaving: {
        framing:
          "Priya always had a bird she identified with — which bird do you love?",
        quote:
          "Hers was the swift. Always moving, hard to pin down. The kind of bird that makes you notice the sky more when they're gone.",
      },
      graduation: {
        framing:
          "Tom's tutors always compared him to a particular bird — which bird do you love?",
        quote:
          "His was the hawk. Detail, precision, always scanning. Three years of training that eye. It's now very, very sharp.",
      },
      christening: {
        framing:
          "Lily came into a world full of birdsong — which bird do you love?",
        quote:
          "The garden was loud the morning she arrived. A good sign, from a particularly vocal robin.",
      },
      achievement: {
        framing:
          "Marcus found a bird he identified with around mile eighteen — which bird do you love?",
        quote:
          "His was the swift. Just instinct and movement. He didn't think. He just ran.",
      },
      recovery: {
        framing:
          "Claire started paying attention to a particular bird this year — which bird do you love?",
        quote:
          "Hers is the robin. She started birdwatching. She says it teaches you to be where you are. She's not wrong.",
      },
      award: {
        framing:
          "Dr. Amelia Grant has a bird she compares herself to — which bird do you love?",
        quote:
          "Hers is the owl. Patient, wide-eyed, good with the dark. She means it as a compliment to owls.",
      },
      promotion: {
        framing:
          "Kwame has a bird he uses as a metaphor for good thinking — which bird do you love?",
        quote:
          "His is the red kite. The big view, the wide circle, nothing missed. He's used it in three job interviews. It always landed.",
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
          "Belinda had a flower she grew every year without exception — which flower do you love?",
        quote:
          "Hers was lavender. She grew it in every garden she ever had, and she'd fill the house with it every summer. The smell is still entirely hers.",
      },
      tribute: {
        framing:
          "David always arrived with flowers — which flower do you love?",
        quote:
          "His was the anemone. Nothing flashy, always exactly right. He had a florist he trusted completely.",
      },
      birthday: {
        framing:
          "Sarah grew a whole windowsill of one flower just to prove she could — which flower do you love?",
        quote:
          "Hers is lavender. She could. She was very casual about telling everyone about it.",
      },
      retirement: {
        framing:
          "David had a flower on his desk for fifteen years — which flower do you love?",
        quote:
          "His was the peace lily. He kept the same pot plant for the whole career. It outlasted most colleagues.",
      },
      wedding: {
        framing:
          "Emma had a flower she'd chosen years before she met James — which flower do you love?",
        quote:
          "Hers was wildflowers. She'd known since long before the wedding. That tells you everything.",
      },
      anniversary: {
        framing:
          "There's a flower that arrives at Mum and Dad's every anniversary, same as always — which flower do you love?",
        quote:
          "Theirs is the rose. Same flower, same vase, forty years running. The order never changes. It doesn't need to.",
      },
      leaving: {
        framing:
          "Priya always brought flowers when something was worth celebrating — which flower do you love?",
        quote:
          "Hers was freesia. The office had flowers the day she arrived. It still does. That's her legacy.",
      },
      graduation: {
        framing:
          "Tom's mum brought flowers to the degree show — which flower do you love?",
        quote:
          "Hers were tulips. He said she shouldn't have apologised. He was right. The flowers were exactly the thing.",
      },
      christening: {
        framing:
          "Lily arrived to a room full of flowers — which flower do you love?",
        quote:
          "Everyone had brought something. It always should be that way, for an arrival like this.",
      },
      achievement: {
        framing:
          "Marcus crossed the finish line to flowers from his sister — which flower do you love?",
        quote:
          "Hers were sunflowers. 26.2 miles and they were waiting. He said nothing had ever looked better.",
      },
      recovery: {
        framing:
          "Claire had one flower she kept on the windowsill all year — which flower do you love?",
        quote:
          "Hers was the sunflower. All that height, all that reaching. She never let the window go without one.",
      },
      award: {
        framing:
          "Dr. Amelia Grant's students left flowers on her desk the morning the award was announced — which flower do you love?",
        quote:
          "Theirs were daffodils. Nobody organised it. It just happened. That's who they are.",
      },
      promotion: {
        framing:
          "Kwame's team sent flowers and he didn't quite know what to do with himself — which flower do you love?",
        quote:
          "His were peonies. He put them on his desk. They were there all week. We noticed.",
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
          "Belinda planted a tree as a sapling and watched it grow — which tree do you love?",
        quote:
          "Hers was the oak. She planted it in her garden decades ago and it's still there. She used to say a garden without a proper tree is just a lawn with ambitions.",
      },
      tribute: {
        framing:
          "David had something of the oak about him — which tree do you love?",
        quote:
          "His was the oak. Everybody's shade, nobody's obstacle. That was the tree, and that was the man.",
      },
      birthday: {
        framing:
          "Sarah planted a rowan in her first garden and said she needed something with structure — which tree do you love?",
        quote:
          "Hers is the rowan. She planted it herself, watched it take hold, and tells people about it at parties. They're always glad she did.",
      },
      retirement: {
        framing:
          "David was always oak — deep-rooted, reliable, shelter for everyone — which tree do you love?",
        quote:
          "His was the oak. He never took up much space but the whole team was in his shade. That's the tree.",
      },
      wedding: {
        framing:
          "Emma and James planted a tree together on their first anniversary — which tree do you love?",
        quote:
          "Theirs is a silver birch. Two saplings that found the same patch of light. Watch them grow.",
      },
      anniversary: {
        framing:
          "There's a tree in Mum and Dad's garden they planted the year they got married — which tree do you love?",
        quote:
          "Theirs is an apple tree. Forty years. It's enormous now. They still argue about whether they planted it in the right place.",
      },
      leaving: {
        framing:
          "Priya was always the tree in the room that made everything feel calmer — which tree do you love?",
        quote:
          "Hers is the willow. You don't notice how much shade they gave until they're gone. We're noticing.",
      },
      graduation: {
        framing:
          "Tom designed his final-year project around a particular tree — which tree do you love?",
        quote:
          "His was the silver birch. It was in the brief. He made it the whole piece. His tutors still mention it.",
      },
      christening: {
        framing:
          "Every family needs a tree to grow alongside — which tree do you love?",
        quote:
          "Lily has her whole life to find hers. She might already have one.",
      },
      achievement: {
        framing:
          "Marcus ran past the same tree at mile three every training morning — which tree do you love?",
        quote:
          "His was the oak. It became the landmark the run was organised around. He has very strong feelings about that oak.",
      },
      recovery: {
        framing:
          "Claire said she noticed trees differently this year — their patience, their permanence — which tree do you love?",
        quote:
          "Hers is the beech. Something about knowing it had been there before and would be there after. She found that useful.",
      },
      award: {
        framing:
          "Dr. Amelia Grant uses trees as a metaphor in every year group — which tree do you love?",
        quote:
          "Hers is the oak. The lesson is always about roots, reach, and the long game. She means it for the students. Also for herself.",
      },
      promotion: {
        framing:
          "Kwame said great product teams are like a tree — deep roots, visible canopy — which tree do you love?",
        quote:
          "His is the cedar. He uses this metaphor at least once a month. It holds up.",
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
          "Belinda had a kind of weather she always came alive in — which weather do you love?",
        quote:
          "Hers was a crisp winter morning — clear sky, cold air. She always said the best thinking happened before anyone else was awake.",
      },
      tribute: {
        framing:
          "David had a kind of weather he always said suited him — which weather do you love?",
        quote:
          "His was the rain. He didn't mind it at all. He had the quality of someone who simply didn't notice bad weather.",
      },
      birthday: {
        framing:
          "Sarah has a kind of weather she always says is her weather — which weather do you love?",
        quote:
          "Hers is warm rain — unexpected but always right. She has the quality of a day that starts overcast and turns into the best of summer.",
      },
      retirement: {
        framing:
          "David was steady weather — the kind you could rely on — which weather do you love?",
        quote:
          "His was a long golden autumn. Retirement might be the first one after a very long, dependable summer.",
      },
      wedding: {
        framing:
          "It rained at Emma and James's wedding — which weather do you love?",
        quote:
          "Theirs was rain, that day. It lasted ten minutes and they didn't notice. That's what you need to know about them.",
      },
      anniversary: {
        framing:
          "Mum and Dad have had every kind of weather together in forty years — which do you love?",
        quote:
          "Theirs is sunshine — the kind that comes back reliably. The storms passed. Same as ever.",
      },
      leaving: {
        framing:
          "Priya had the quality of a bright cold morning — you felt more awake when she walked in — which weather do you love?",
        quote:
          "Hers was a bright, cold morning. The office had her particular weather for six years. We'll notice the change.",
      },
      graduation: {
        framing:
          "Tom walked out of his degree show into a particular Manchester sky — which weather do you love?",
        quote:
          "His was overcast. He said the grey suited the city. The city agreed.",
      },
      christening: {
        framing:
          "The weather the day Lily arrived was entirely irrelevant — which weather do you love?",
        quote:
          "She arrived. That was the weather. Everything else was background.",
      },
      achievement: {
        framing:
          "Marcus ran the marathon and says the weather made it — which weather do you love?",
        quote:
          "His was cool and overcast. Not too hot, not too cold. He'd trained in worse. It was exactly right.",
      },
      recovery: {
        framing:
          "Claire said she started noticing the weather more this year — like seeing it properly for the first time — which weather do you love?",
        quote:
          "Hers became clear winter light. Something about the specific quality of cold morning air. She noticed it all.",
      },
      award: {
        framing:
          "Dr. Amelia Grant says the best lessons happen in the worst weather — which weather do you love?",
        quote:
          "Hers is November rain on school windows. Central heating on, everyone in. Perfect conditions.",
      },
      promotion: {
        framing:
          "Kwame walked home in a particular kind of weather after the promotion news — which weather do you love?",
        quote:
          "His was light rain. Not dramatic. Just right. That's what the moment needed.",
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
          "Belinda always went back to the same landscape — which landscape do you love?",
        quote:
          "Hers was the Lake District fells. She said they reminded her to be patient. She walked them every year for fifty years.",
      },
      tribute: {
        framing:
          "David had a landscape he always returned to in conversation — which landscape do you love?",
        quote:
          "His was the West African coast. He'd quote geography the way other people quote poetry. It meant just as much to him.",
      },
      birthday: {
        framing:
          "Sarah dreams of one landscape but lives in the city — which landscape do you love?",
        quote:
          "Hers is the Scottish Highlands. She has moorland in her soul and no particular plans to act on it. The moors can wait.",
      },
      retirement: {
        framing:
          "David kept a photo on his desk for thirty-five years of a landscape he meant to visit — which landscape do you love?",
        quote:
          "His was the Dordogne. Thirty-five years of the same commute. Now the world is landscape-shaped and waiting.",
      },
      wedding: {
        framing:
          "Emma and James are happiest near water — which landscape do you love?",
        quote:
          "They've been arguing about coast versus mountains since their second date. Both are still winning.",
      },
      anniversary: {
        framing:
          "Mum and Dad have walked the same stretch of coast every anniversary — which landscape do you love?",
        quote:
          "Theirs is the coastal path. Forty years of the same route. Still finding new things to notice.",
      },
      leaving: {
        framing:
          "Priya always said wide open spaces were where she thought most clearly — which landscape do you love?",
        quote:
          "Hers was open moorland. She brought something expansive to everything she did. There's a landscape for that.",
      },
      graduation: {
        framing:
          "Tom said architecture only makes sense in relation to landscape — which landscape do you love?",
        quote:
          "His is the urban landscape. He believes this profoundly. His degree show was partly about proving it.",
      },
      christening: {
        framing:
          "The landscape Lily grows up in will shape her — which landscape do you love?",
        quote: "We each have one. She'll find hers. What's yours?",
      },
      achievement: {
        framing:
          "Marcus ran a particular landscape and says it changed him — which landscape do you love?",
        quote:
          "His is parkland and river paths. He noticed none of it during the race, and then noticed everything after.",
      },
      recovery: {
        framing:
          "Claire says open landscape helped — the space, the horizon — which landscape do you love?",
        quote:
          "Hers is open countryside. She walked somewhere new every week. The landscape was doing something the walls couldn't.",
      },
      award: {
        framing:
          "Dr. Amelia Grant takes her class outside whenever the weather allows — she says landscape is the best classroom — which landscape do you love?",
        quote:
          "Hers is the field behind the school. The class has learned a great deal in that field.",
      },
      promotion: {
        framing:
          "Kwame grew up near the sea and says it's still where he thinks best — which landscape do you love?",
        quote:
          "His is the coast. He hasn't lived near it in years. Doesn't matter. It's still the one.",
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
          "Belinda was happiest in a particular place — which place do you love?",
        quote:
          "Hers was her kitchen table. Every conversation worth having happened there. We all still come back to it.",
      },
      tribute: {
        framing:
          "David was a person of particular places — which place do you love?",
        quote:
          "His was a corner table in a particular pub. You'd always find him there. He was extremely consistent about this.",
      },
      birthday: {
        framing:
          "Sarah has been to thirty countries and still has one place she says nothing beats — which place do you love?",
        quote:
          "Hers is her grandmother's kitchen in Cork. She plans every trip carefully. That one she'd never planned at all.",
      },
      retirement: {
        framing:
          "David had a map on his office wall for thirty-five years — which place do you love?",
        quote:
          "His was the Dordogne. He'd look at the map every year and go back to his desk. Not anymore.",
      },
      wedding: {
        framing:
          "Emma and James keep going back to the field where they met — which place do you love?",
        quote:
          "Theirs is a field in Somerset. Not for the festival anymore. Just because it's theirs now.",
      },
      anniversary: {
        framing:
          "Mum and Dad went back to the place they got married for their fortieth — which place do you love?",
        quote:
          "Theirs is the village church in Shropshire. Same place, different people. In all the best ways.",
      },
      leaving: {
        framing:
          "Priya has had the same flight saved in her browser for two years — which place do you love?",
        quote: "Hers is Kerala. We think it's time. We're holding her to it.",
      },
      graduation: {
        framing:
          "Tom has a building in Manchester he calls his — which place do you love?",
        quote:
          "His is the John Rylands Library. It's not his. He just knows exactly why it's good. He could explain it for an hour.",
      },
      christening: {
        framing:
          "Lily will grow up learning what it means to love a place — which place do you love?",
        quote: "We each have one. We're curious about hers already.",
      },
      achievement: {
        framing:
          "The finish line of the marathon is now a place Marcus considers his — which place do you love?",
        quote:
          "His is the Mall in London. He'll go back. He might not run again. But he'll go back to that place.",
      },
      recovery: {
        framing:
          "Claire found a place she went to every day this year — which place do you love?",
        quote:
          "Hers is a bench in the park. The same view. Twenty minutes. Whatever the weather.",
      },
      award: {
        framing:
          "Dr. Amelia Grant's classroom is a place her students describe long after they've left — which place do you love?",
        quote:
          "Hers is Room 14. Thirty-seven cards from former students. All mention the room.",
      },
      promotion: {
        framing:
          "Kwame keeps going back to the coffee shop where he said yes to this job three years ago — which place do you love?",
        quote:
          "His is that corner table by the window. Same order. He owes that table something.",
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
          "Belinda had a kind of holiday she always came back to — which kind of holiday do you love?",
        quote:
          "Hers was a walking holiday — maps, no signal, proper boots. She once turned a week in the Lakes into a navigation exercise. Best holiday anyone had ever had.",
      },
      tribute: {
        framing:
          "David introduced a whole circle of friends to one kind of holiday — which kind of holiday do you love?",
        quote:
          "His was the road trip. He'd pack badly, navigate confidently, and stop at everything interesting. Perfect company.",
      },
      birthday: {
        framing:
          "Sarah books one kind of holiday with military precision — which kind of holiday do you love?",
        quote:
          "Hers is the city break. She has seventeen open tabs about her next trip at any given moment. This is not an exaggeration.",
      },
      retirement: {
        framing:
          "David has always said he'd do one particular kind of holiday when he retired — which holiday do you love?",
        quote:
          "His is the long slow train journey. Somewhere enormous, with nothing booked past the first night. He's known it for years.",
      },
      wedding: {
        framing:
          "Emma wanted adventure and James wanted good food — which kind of holiday do you love?",
        quote:
          "Theirs is always both. They've never been somewhere that didn't deliver on both counts. Somehow.",
      },
      anniversary: {
        framing:
          "Mum and Dad have had forty years of holidays, most of them compromises, all of them memorable — which kind do you love?",
        quote:
          "Theirs tends toward the cultural city break. She wanted culture. He wanted beach. They always found a way.",
      },
      leaving: {
        framing:
          "Priya has been talking about a proper long trip for six years — which kind of holiday do you love?",
        quote:
          "Hers is the slow extended trip with no fixed itinerary. The excuses have finally run out. The trip can finally happen.",
      },
      graduation: {
        framing:
          "Tom is planning something long and unstructured now that the degree is done — which holiday do you love?",
        quote:
          "His is the slow backpacking trip. No brief. No deadline. No one to present to. He's figuring out what that feels like.",
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
          "His is the complete rest holiday — beach, nothing booked, no running. He's earned it. Eight months of dark early mornings.",
      },
      recovery: {
        framing:
          "Claire has been planning a trip since January — which kind of holiday do you love?",
        quote:
          "Hers is the solo trip somewhere quiet. No deadlines, no itinerary. Just somewhere, and time, and herself.",
      },
      award: {
        framing:
          "Dr. Amelia Grant takes exactly one holiday a year and plans it in complete detail — which kind do you love?",
        quote:
          "Hers is the cultural city break. Teachers who plan. We shouldn't be surprised. The holidays are apparently excellent.",
      },
      promotion: {
        framing:
          "Kwame's first act after the promotion news was to book a long weekend — which kind of holiday do you love?",
        quote:
          "His is the city long weekend. Decision made in thirty minutes. No overthinking. Good instinct.",
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
          "Belinda had a way of travelling she never questioned — which way do you love to travel?",
        quote:
          "Hers was the train. She always said you miss everything if you're in a hurry. She was right about that too.",
      },
      tribute: {
        framing:
          "David had a way of travelling he always insisted on — which way do you love to travel?",
        quote:
          "His was the train. He'd be in the quiet carriage, reading, completely at ease with the journey taking as long as it took.",
      },
      birthday: {
        framing:
          "Sarah once walked fourteen miles to a restaurant rather than take the bus — how do you love to travel?",
        quote:
          "Hers is on foot. She says this was reasonable. The restaurant was worth it. Both may be true.",
      },
      retirement: {
        framing:
          "David drove to work for thirty-five years — how do you love to travel?",
        quote:
          "His is now slow roads and no motorways. The car stays. The rushing can go.",
      },
      wedding: {
        framing:
          "Emma likes the journey and James likes arriving — how do you love to travel?",
        quote:
          "Theirs is by car — she reads, he drives, then they swap. Somehow they've always agreed on this.",
      },
      anniversary: {
        framing:
          "Mum and Dad have driven to the same place every year — which way do you love to travel?",
        quote:
          "Theirs is by car. Same road. Same songs on the radio. Slightly different speed.",
      },
      leaving: {
        framing:
          "Priya said she'd learn to cycle properly once she left — how do you love to travel?",
        quote:
          "Hers will be by bike. We're holding her to it. The bike is already on her list.",
      },
      graduation: {
        framing:
          "Tom cycled across Manchester every day for three years — which way do you love to travel?",
        quote:
          "His is by bike. He timed every route. He knows exactly which roads to avoid and at what time.",
      },
      christening: {
        framing:
          "Lily's world is small right now, but it will expand — which way do you love to travel?",
        quote:
          "For now she goes everywhere in someone's arms. This will not last long.",
      },
      achievement: {
        framing:
          "Marcus has run so many miles that running still feels like a natural way to get places — how do you love to travel?",
        quote:
          "His is on foot. He's been known to run to places most people drive to. This is a choice he makes freely.",
      },
      recovery: {
        framing:
          "Claire started walking places she used to drive — not for the exercise, just for the different quality of arrival — how do you love to travel?",
        quote:
          "Hers is on foot now. Something about arriving having covered the ground yourself.",
      },
      award: {
        framing:
          "Dr. Amelia Grant cycles to school — she says it's the right way to arrive — which way do you love to travel?",
        quote:
          "Hers is by bike. It sets the tone for the day. She's noticed the difference.",
      },
      promotion: {
        framing:
          "Kwame upgraded his travel for the first time after the promotion news — which way do you love to travel?",
        quote:
          "His is first class on the train. He'll say it was just an upgrade. It was also a small moment of arrival.",
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
          "Belinda had a film she came back to every year — which film do you love?",
        quote:
          "Hers was Brief Encounter. She could quote it entirely from memory. It never seemed to get less affecting.",
      },
      tribute: {
        framing:
          "David once watched the same film seven times in one month to understand why it worked — which film do you love?",
        quote:
          "His was Tokyo Story. He eventually explained it. The explanation was better than the film.",
      },
      birthday: {
        framing:
          "Sarah has a film she's watched so many times she knows every line — which film do you love?",
        quote:
          "Hers is When Harry Met Sally. She watches it whenever she needs reminding that some decisions are worth making.",
      },
      retirement: {
        framing:
          "David always said the best projects had the structure of a good heist film — which film do you love?",
        quote:
          "His was The Italian Job. He still believes this. He has evidence. It's a long conversation.",
      },
      wedding: {
        framing:
          "Emma and James argued about a film for an hour before they'd even introduced themselves — which film do you love?",
        quote:
          "Hers was right, he eventually admitted. Three years later. It was Before Sunrise.",
      },
      anniversary: {
        framing:
          "Mum and Dad have a film they watch on every anniversary — which film do you love?",
        quote:
          "Theirs is Casablanca. Forty viewings. Different things noticed each time. Still the same feeling at the end.",
      },
      leaving: {
        framing:
          "Someone said Priya's leaving felt like the end of a great arc in a brilliant film — which film do you love?",
        quote:
          "Not the ending. Just that particular chapter. We're still watching.",
      },
      graduation: {
        framing:
          "Tom says architecture school ruined certain films for him in the best possible way — which film do you love?",
        quote:
          "His is Blade Runner. He can't watch a building on screen without having opinions. This is both a gift and a burden.",
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
          "His was Chariots of Fire. He'll tell you it was coincidence. It wasn't.",
      },
      recovery: {
        framing:
          "Claire watched films she'd been avoiding for years this year — which film do you love?",
        quote:
          "Hers was Amélie. She worked through the whole list. Some were worth the wait. That one in particular.",
      },
      award: {
        framing:
          "Dr. Amelia Grant uses films in class regularly — says the best ones teach without feeling like teaching — which film do you love?",
        quote:
          "Hers is Dead Poets Society. She's got a list. It's organised by theme, then year. It's a very good list.",
      },
      promotion: {
        framing:
          "Kwame said the best product launches feel like the third act of a well-made film — which film do you love?",
        quote:
          "His is The Social Network. He means it as a design principle. The films he uses as examples are always perfect choices.",
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
          "Belinda had a film genre she always came back to — which genre do you love?",
        quote:
          "Hers was the documentary. She said they were the only honest films. She lived in fine detail. The kind that makes the best ones.",
      },
      tribute: {
        framing:
          "David had a film genre he always said was the most honest — which genre do you love?",
        quote:
          "His was the biographical drama. He'd always name three you'd never seen and somehow they were all exactly right.",
      },
      birthday: {
        framing:
          "Sarah's life is clearly a caper film — charming, one step ahead, always — which genre do you love?",
        quote:
          "Hers is the romantic comedy, if you ask anyone who knows her. She'd say drama. Her friends say otherwise.",
      },
      retirement: {
        framing:
          "David always said his career had the structure of a good thriller — which genre do you love?",
        quote:
          "His was the thriller. Procedural with occasional moments of genuine horror. His words. Probably right.",
      },
      wedding: {
        framing:
          "Emma says romance, James says adventure — which genre do you love?",
        quote:
          "Hers is romance. His is adventure. They've been arguing about this since the second date. They're both right.",
      },
      anniversary: {
        framing:
          "Mum and Dad have watched every genre together over forty years and still haven't agreed — which genre do you love?",
        quote:
          "Hers is romance. His is thriller. They watch both. This is the system.",
      },
      leaving: {
        framing:
          "Priya's time here was fast-paced, warm, and had a few genuinely brilliant set pieces — which genre do you love?",
        quote:
          "Hers was comedy-drama. We know the genre. The question is what comes next in the series.",
      },
      graduation: {
        framing:
          "Tom's architecture thesis included a chapter on film and space — which genre do you love?",
        quote:
          "His is noir. He's written 4,000 words about the relationship between noir and brutalism. He'll tell you about it.",
      },
      christening: {
        framing:
          "We'll recommend genres to Lily for years — which genre do you love?",
        quote: "Start them young on the right ones. That's the task.",
      },
      achievement: {
        framing:
          "Marcus says a good sports documentary is in a genre of its own — which genre do you love?",
        quote:
          "His is the sports documentary. He's watched every marathon one in existence. Some twice.",
      },
      recovery: {
        framing:
          "Claire says one genre got her through as much as anything — which genre do you love?",
        quote:
          "Hers was comedy. Not escapism. Just genuine laughter. She chose it deliberately.",
      },
      award: {
        framing:
          "Dr. Amelia Grant says the best genre for teaching empathy is drama — which genre do you love?",
        quote:
          "Hers is drama. She uses drama films like some teachers use textbooks. The results speak for themselves.",
      },
      promotion: {
        framing:
          "Kwame only watches things he calls 'structurally interesting' — which genre do you love?",
        quote:
          "His is the heist film. This is somehow not as narrow as it sounds. His taste is excellent.",
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
          "Belinda had a TV show she watched with total commitment — which TV show do you love?",
        quote:
          "Hers was Midsomer Murders. She could identify the murderer inside fifteen minutes. It was impressive and slightly alarming.",
      },
      tribute: {
        framing:
          "David watched exactly one TV show at a time and watched it properly — which TV show do you love?",
        quote:
          "His was The Wire. No multitasking. Fully present. He said it was the only respectful way to watch.",
      },
      birthday: {
        framing:
          "Sarah rewatched a whole series to write one paragraph to a friend — which TV show do you love?",
        quote:
          "Hers is Schitt's Creek. She did not consider this excessive. It wasn't.",
      },
      retirement: {
        framing:
          "David has a watch list that's been building for fifteen years — which TV show do you love?",
        quote:
          "His starts with The Sopranos. There's a list. It's long. The time has finally come.",
      },
      wedding: {
        framing:
          "Emma picks one show, James picks one — which TV show do you love?",
        quote:
          "They haven't argued about it once. This is the foundation of the marriage.",
      },
      anniversary: {
        framing:
          "Mum and Dad have a show they've been watching together since their first flat — which TV show do you love?",
        quote:
          "Theirs started with Fawlty Towers. The show changed over the years. The routine hasn't. Same sofa. Same time.",
      },
      leaving: {
        framing:
          "Priya got all the best lines in every meeting — which TV show do you love?",
        quote:
          "Every team has the character who makes every scene better. That was her.",
      },
      graduation: {
        framing:
          "Tom watched a particular documentary series in his final week and called it revision — which TV show do you love?",
        quote:
          "His was Abstract: The Art of Design. It was technically revision. He also just really liked the show.",
      },
      christening: {
        framing:
          "One day Lily will have a favourite show — which TV show do you love?",
        quote: "For now she has opinions about ceiling fans. This will evolve.",
      },
      achievement: {
        framing:
          "Marcus watched nature documentaries on rest days because they required nothing — which TV show do you love?",
        quote:
          "His was Planet Earth. Rest days needed something genuinely restful. David Attenborough delivered.",
      },
      recovery: {
        framing:
          "Claire says one particular show got her through the hardest weeks — which TV show do you love?",
        quote:
          "Hers was Fleabag. She couldn't have said why. It just worked. Which show does that for you?",
      },
      award: {
        framing:
          "Dr. Amelia Grant recommends TV shows to her students the way other teachers recommend books — which TV show do you love?",
        quote:
          "Hers is The Crown. She's never recommended a bad one. The students have checked.",
      },
      promotion: {
        framing:
          "Kwame started a show the night he got promoted and watched it through over the next month — which TV show do you love?",
        quote:
          "His was Succession. He hadn't let himself start it until then. Some things are worth saving.",
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
          "Belinda had a song she always played on Sunday mornings — which song do you love?",
        quote:
          "Hers was Jerusalem. She'd sing along under her breath. Every time. Always the same verse first.",
      },
      tribute: {
        framing:
          "David introduced so many people to a particular song — which song do you love?",
        quote:
          "His was My Favourite Things. He'd play it without context and watch people react. It never failed to work.",
      },
      birthday: {
        framing:
          "Sarah turns the volume up every time a particular song comes on — which song do you love?",
        quote:
          "Hers is Dancing Queen. She has a playlist called The Big One. It has exactly one song. Now you know which.",
      },
      retirement: {
        framing:
          "David always said good music should say what people can't — which song do you love?",
        quote:
          "His was Waterloo Sunset. There's a song that says thirty-five years better than any speech could. That's the one.",
      },
      wedding: {
        framing:
          "Emma had been saving a particular song for years — which song do you love?",
        quote:
          "Hers was This Will Be. The moment it played, everyone at the wedding understood why. That was the one.",
      },
      anniversary: {
        framing:
          "Mum and Dad's song hasn't changed in forty years — which song do you love?",
        quote:
          "Theirs was Can't Help Falling in Love. First dance. Same song. They've never needed another.",
      },
      leaving: {
        framing:
          "There's a song that belongs to Priya now, irreversibly — which song do you love?",
        quote:
          "Hers is Gold by Spandau Ballet. Ask her why. The answer is worth hearing.",
      },
      graduation: {
        framing:
          "Tom played the same song on the morning of every deadline — which song do you love?",
        quote:
          "His was Pyramid Song by Radiohead. It started as superstition. It became ritual. It apparently always worked.",
      },
      christening: {
        framing:
          "Every person in this room has a song they'd want Lily to know — which song do you love?",
        quote: "She'll find her own. But there's time to share yours.",
      },
      achievement: {
        framing:
          "Marcus had a song he played in the final kilometre — which song do you love?",
        quote:
          "His was Mr. Brightside. It belonged to the finish line before it belonged to anything else.",
      },
      recovery: {
        framing:
          "Claire says there was one song more than any other that got her through — which song do you love?",
        quote:
          "Hers was Vienna by Ultravox. She played it on repeat for months. It held up every time.",
      },
      award: {
        framing:
          "Dr. Amelia Grant played a song at the start of every term for years — which song do you love?",
        quote:
          "Hers was Here Comes the Sun. Year 7s who've since graduated still remember it. That song did something.",
      },
      promotion: {
        framing:
          "Kwame played a song on the walk home after the promotion news — which song do you love?",
        quote:
          "His was Higher Ground by Stevie Wonder. He made the decision on that walk too. The song was present for both.",
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
          "Belinda had a music genre she always came back to — which genre do you love?",
        quote:
          "Hers was folk. She said it was the only genre that told the truth. She had strong opinions about what made a good song. Folk always won.",
      },
      tribute: {
        framing:
          "David had a music genre he lived in and thought everyone should — which genre do you love?",
        quote:
          "His was jazz. He wasn't evangelical about it. He just quietly played the right things until you understood.",
      },
      birthday: {
        framing:
          "Sarah's taste is eclectic but there's always a gravitational centre — which genre do you love?",
        quote:
          "Hers is nineties pop, if you ask the playlist. She'll tell you she listens to everything. Her Spotify says otherwise. In the best way.",
      },
      retirement: {
        framing:
          "David had the same CDs in the car for twenty years — which genre do you love?",
        quote:
          "His was classic rock. Twenty years and not once did it change. That's the genre.",
      },
      wedding: {
        framing:
          "Emma and James are each a different genre and together something without a name — which genre do you love?",
        quote:
          "Hers is jazz. His is indie. Together it sounds exactly right, whatever it's called.",
      },
      anniversary: {
        framing:
          "Mum and Dad have forty years of shared music — which genre do you love?",
        quote:
          "Hers is soul. His is folk. Together it sounds like something entirely different and entirely theirs.",
      },
      leaving: {
        framing:
          "Priya had the quality of a genre you didn't know you needed until it started playing — which genre do you love?",
        quote:
          "Hers was Afrobeats. We know the genre now. We'll miss the sound.",
      },
      graduation: {
        framing:
          "Tom's playlist from final year tells the whole story — which genre do you love?",
        quote:
          "His is post-rock. It carries the whole degree. Three years in one playlist.",
      },
      christening: {
        framing: "Music will fill Lily's life — which genre do you love?",
        quote: "Every person here has one they'd want her to discover.",
      },
      achievement: {
        framing:
          "Marcus ran to one genre for eight months — which genre do you love?",
        quote:
          "His was drum and bass. It carried every kilometre. He can't listen to it now without feeling like he's moving.",
      },
      recovery: {
        framing:
          "Claire found one genre worked better than anything else — which genre do you love?",
        quote:
          "Hers was classical. She couldn't say why logically. She just knew it was the one.",
      },
      award: {
        framing:
          "Dr. Amelia Grant believes music education is the most important kind — which genre do you love?",
        quote:
          "Hers is folk. She has strong feelings about this. Backed by thirty years of watching students.",
      },
      promotion: {
        framing:
          "Kwame says jazz and product thinking have more in common than people realise — which genre do you love?",
        quote:
          "His is jazz. He's given a version of this talk at three different companies. It's always well received.",
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
          "Belinda had a music era she always said was the one — which era do you love?",
        quote:
          "Hers was the seventies. She could tell you where she was when she heard every important record from 1971 to 1979.",
      },
      tribute: {
        framing:
          "David had a music era he always said was his — which era do you love?",
        quote:
          "His was the mid-seventies — specifically 1975. He had evidence for this. The evidence was compelling.",
      },
      birthday: {
        framing:
          "Sarah has nineties in her bones and she's not remotely sorry — which era do you love?",
        quote:
          "Hers is the nineties. She knows every B-side from 1994. Don't test her on this either.",
      },
      retirement: {
        framing:
          "David has a theory about how one era of music predicted modern engineering — which era do you love?",
        quote:
          "His is the eighties. It's a long theory. It's also kind of right.",
      },
      wedding: {
        framing:
          "Emma and James made a playlist on their first anniversary that covered six decades without effort — which era do you love?",
        quote:
          "That playlist is still the best one either of them has ever made.",
      },
      anniversary: {
        framing:
          "Mum and Dad danced to the same music at their wedding and still put it on now — which era do you love?",
        quote:
          "Theirs is the late seventies. The era that was theirs first is still theirs. Some things don't change.",
      },
      leaving: {
        framing:
          "Priya had the energy of a particular musical era — which era do you love?",
        quote:
          "Hers was the early 2000s. Some people belong to a particular musical moment. She was one of them.",
      },
      graduation: {
        framing:
          "Tom spent three years surrounded by the same era of music — which era do you love?",
        quote:
          "His is the early 2000s indie era. It's filed under 'final year' now. He can't hear it without thinking about structural drawings.",
      },
      christening: {
        framing: "Lily will have her own golden era — which era do you love?",
        quote: "She's yet to discover it. Tell her what yours was.",
      },
      achievement: {
        framing:
          "Marcus trained through one era of music and finished the race to another — which era do you love?",
        quote:
          "His training era was the nineties — chosen for rhythm. The finish line era chose itself.",
      },
      recovery: {
        framing:
          "Claire found one era particularly useful this year — which era do you love?",
        quote:
          "Hers was the seventies. Old music. Familiar. Known. It felt like the right steady ground.",
      },
      award: {
        framing:
          "Dr. Amelia Grant believes every generation deserves to understand every era — which era do you love?",
        quote:
          "Hers is the sixties. She teaches music history alongside the curriculum. Not officially. She just does it.",
      },
      promotion: {
        framing:
          "Kwame believes the music era you love most tells you everything about your working style — which era do you love?",
        quote:
          "His is the late nineties. He's got a theory. He'll tell you about it in the right setting.",
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
          "Belinda had an instrument she played quietly, just for herself — which instrument do you love?",
        quote:
          "Hers was the piano. She never performed. She just played. That was the whole point.",
      },
      tribute: {
        framing:
          "David had an instrument he loved above all others — which instrument do you love?",
        quote:
          "His was the piano. He couldn't play a note. He was still completely right about it.",
      },
      birthday: {
        framing:
          "Sarah plays one instrument badly and with tremendous enthusiasm — which instrument do you love?",
        quote:
          "Hers is the guitar. She'd tell you she's getting better. Her friends would say she's consistent. Both are true.",
      },
      retirement: {
        framing:
          "David was the instrument in the firm that everything else was built around — which instrument do you love?",
        quote:
          "His was the bass guitar. You only notice some instruments when they stop. The whole band feels it.",
      },
      wedding: {
        framing:
          "Emma is the melody and James is the chord structure beneath it — which instrument do you love?",
        quote:
          "Together it's a complete piece. Separately it's still good, but not quite right.",
      },
      anniversary: {
        framing:
          "There's been a piano in Mum and Dad's house for the whole forty years — which instrument do you love?",
        quote:
          "Theirs is the piano. Neither of them plays. It stays because it's always stayed. Some things are like that.",
      },
      leaving: {
        framing:
          "Priya was the instrument in the team you don't notice until the song starts again — which instrument do you love?",
        quote:
          "Hers was the cello. Something is missing in the arrangement. We all know which part.",
      },
      graduation: {
        framing:
          "Tom's studio had one instrument playing in the background for three years — which instrument do you love?",
        quote:
          "His is the guitar. Someone always had one. It became the ambient sound of the degree. He misses it.",
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
          "His is the drum. He's thought about this more than you'd expect. He has a case to make.",
      },
      recovery: {
        framing:
          "Claire plays one instrument quietly, for herself — and says it helped more than she can explain — which instrument do you love?",
        quote:
          "Hers is the piano. She kept playing all the way through. The playing came back with everything else.",
      },
      award: {
        framing:
          "Dr. Amelia Grant taught music for five years before moving to English — the instrument never left her — which instrument do you love?",
        quote:
          "Hers is the violin. She still plays. She doesn't mention it. The students who've heard her do.",
      },
      promotion: {
        framing:
          "Kwame says he listens to one instrument when he needs to think — which instrument do you love?",
        quote:
          "His is the piano. Specifically piano. Specifically certain kinds. Very specific indeed.",
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
          "Belinda had a type of song she always came back to — which type of song do you love?",
        quote:
          "Hers was the hymn. She said they were just the best folk songs. She knew every word to every one. Never missed a verse.",
      },
      tribute: {
        framing:
          "David had a type of song he always said was the only kind worth singing — which type of song do you love?",
        quote:
          "His was the jazz standard. He meant it as a principle about form. It applies more broadly than jazz.",
      },
      birthday: {
        framing:
          "Sarah has a type of song she returns to every year — it's always unmistakably hers — which type of song do you love?",
        quote:
          "Hers is the anthem. She's been working on a karaoke setlist for years. It's ambitious. It suits her completely.",
      },
      retirement: {
        framing:
          "David always said the best songs knew how to end — which type of song do you love?",
        quote:
          "His was the ballad. He's right about the ending. The right kind takes its time and earns it.",
      },
      wedding: {
        framing:
          "Emma and James's story started as a love song and became something else — which type of song do you love?",
        quote:
          "Theirs is the love song. It started there and it's stayed there. The best ones do.",
      },
      anniversary: {
        framing:
          "Mum and Dad's song was a love song that became a hymn — which type of song do you love?",
        quote:
          "Theirs is the love song. It changed over the years. The feeling underneath it didn't.",
      },
      leaving: {
        framing:
          "Priya deserves exactly the right type of song for this moment — which type of song do you love?",
        quote:
          "Hers is the anthem. Pick the type that fits the moment. This one earns it.",
      },
      graduation: {
        framing:
          "Tom played a particular type of song at the end of every all-nighter to tell himself it was done — which type of song do you love?",
        quote:
          "His was the anthem. One specific one, earned three years running. It always worked.",
      },
      christening: {
        framing: "Lily will need a lullaby — which type of song do you love?",
        quote:
          "And an anthem. And a hymn. And eventually, a love song. Start with the lullaby.",
      },
      achievement: {
        framing:
          "Marcus's finish line song was a particular type — he'd planned it that way — which type of song do you love?",
        quote:
          "His was the anthem. He knew exactly which one he wanted playing in his head at mile 26. It was the right one.",
      },
      recovery: {
        framing:
          "Claire says she needed a particular type of song this year — which type of song do you love?",
        quote:
          "Hers was the ballad. Not escapism. Not distraction. Something with a narrative she could follow.",
      },
      award: {
        framing:
          "Dr. Amelia Grant has a type of song she comes back to — says it's about the long game — which type of song do you love?",
        quote:
          "Hers is the hymn. She means it literally and also as a metaphor for teaching. Both interpretations hold.",
      },
      promotion: {
        framing:
          "Kwame celebrated with a particular type of song that needed no explanation — which type of song do you love?",
        quote:
          "His was the anthem. Not a ballad. Not a love song. Something with propulsion. Exactly right.",
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
          "Belinda had a drink she always came back to — which drink do you love?",
        quote:
          "Hers was tea — proper loose leaf, pot on the table. She said everything worth talking about happened over tea. She had a point.",
      },
      tribute: {
        framing:
          "David always had a glass of something interesting to offer — which drink do you love?",
        quote:
          "His was a good single malt. He never drank alone. The drink was always the beginning of a conversation.",
      },
      birthday: {
        framing:
          "Sarah has opinions about one drink that are not appropriate for this level of conversation — which drink do you love?",
        quote:
          "Hers is coffee. She has opinions about brewing methods too. The opinions are extensive and correct.",
      },
      retirement: {
        framing:
          "David kept a good drink for significant moments — which drink do you love?",
        quote:
          "His was whisky. He always said a project was finished when he poured the good stuff. There's a lot due.",
      },
      wedding: {
        framing:
          "Emma and James fell in love over terrible festival beer and have significantly upgraded since — which drink do you love?",
        quote:
          "Theirs is now good wine, mostly. There's still an ongoing argument about the exact moment it improved. Probably 2021.",
      },
      anniversary: {
        framing:
          "Mum and Dad have had the same drink every morning for forty years — which drink do you love?",
        quote:
          "Theirs is tea. The brand, the mug, the time — all the same. All exactly right.",
      },
      leaving: {
        framing:
          "Priya has a drink she orders every time something good happens — which drink do you love?",
        quote: "Hers is a negroni. Tonight qualifies. We know which one it is.",
      },
      graduation: {
        framing:
          "Tom says he'll drink something better than student flat coffee now — which drink do you love?",
        quote:
          "His will be a proper flat white. He has spent three years subsisting. The upgrade is overdue.",
      },
      christening: {
        framing: "We raise a glass for Lily — which drink do you love?",
        quote:
          "She'll form her own preferences eventually. For now, we drink on her behalf.",
      },
      achievement: {
        framing:
          "Marcus crossed the finish line and someone handed him a drink that tasted better than anything — which drink do you love?",
        quote:
          "His was water. Just water. 26.2 miles. The first sip. Nothing has ever tasted better.",
      },
      recovery: {
        framing:
          "Claire says a particular drink became a ritual that held the day together — which drink do you love?",
        quote:
          "Hers is tea. Same mug, same time, same routine. The drink held the day together.",
      },
      award: {
        framing:
          "Dr. Amelia Grant's staffroom tea is apparently legendary — which drink do you love?",
        quote:
          "Hers is tea — made once a day at exactly 11am. The staff know to be there.",
      },
      promotion: {
        framing:
          "Kwame poured a specific drink to mark the moment — which drink do you love?",
        quote:
          "His was a flat white, two sugars. He'd been making it that way since year one. That night he made it extra slowly. He'd earned the time.",
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
          "Belinda had a comfort food she always made for anyone who needed it — which comfort food do you love?",
        quote:
          "Hers was shepherd's pie. She'd leave it in the oven and say she'd barely done anything. Lies, but kind ones.",
      },
      tribute: {
        framing:
          "David made exactly one dish but made it perfectly — which comfort food do you love?",
        quote:
          "His was a jollof rice that nobody else could replicate. He wouldn't tell anyone what was in it. The recipe died with him. The memory didn't.",
      },
      birthday: {
        framing:
          "Sarah makes no apologies for her relationship with one comfort food — which comfort food do you love?",
        quote:
          "Hers is cheese. She once paused a holiday to find the right local one. No one complained. It was worth it.",
      },
      retirement: {
        framing:
          "David ate lunch at his desk for thirty-five years — which comfort food do you love?",
        quote:
          "His was a proper ploughman's. He can eat it now. In a chair. With a view. With no emails.",
      },
      wedding: {
        framing:
          "Emma and James argue about pizza but always agree on one comfort food — which comfort food do you love?",
        quote:
          "Theirs is Neapolitan pizza — the best they had in Naples. The argument is about which place was better. The pizza is not in question.",
      },
      anniversary: {
        framing:
          "Mum and Dad have had the same comfort food on Sundays for forty years — which comfort food do you love?",
        quote:
          "Theirs is the Sunday roast. The recipe is the same as her mother's. The method takes all afternoon. Worth every minute.",
      },
      leaving: {
        framing:
          "Priya once brought something in for no reason and transformed the mood in the office — which comfort food do you love?",
        quote:
          "Hers was dal. No occasion. No explanation. Just the right thing at the right time. It made any flat feel like home.",
      },
      graduation: {
        framing:
          "Tom ate nothing but toast for the last week of finals — which comfort food do you love?",
        quote:
          "His is toast. He has strong opinions about it now. Strong, specific, very particular opinions.",
      },
      christening: {
        framing: "The family laid on food — which comfort food do you love?",
        quote: "Every family has its dishes. Today was no exception.",
      },
      achievement: {
        framing:
          "Marcus had a post-marathon comfort food planned from mile fourteen — which comfort food do you love?",
        quote:
          "His was a roast dinner. He'd been thinking about it since mile 14. He earned every bite.",
      },
      recovery: {
        framing:
          "Claire's friend always brought one particular comfort food — which comfort food do you love?",
        quote:
          "Hers was soup. Her friend brought it every time, without being asked. That's the friend, and that's the soup.",
      },
      award: {
        framing:
          "Dr. Amelia Grant celebrates wins with specific food — which comfort food do you love?",
        quote:
          "Hers is a proper Victoria sponge. The bigger the win, the better the cake. This win calls for the best version.",
      },
      promotion: {
        framing:
          "Kwame and his partner cooked together to celebrate — which comfort food do you love?",
        quote:
          "His was jollof rice. Nothing fancy. Just the thing they always made together. Which is the whole point.",
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
          "Belinda always had a tin of biscuits on the table for visitors — which biscuit do you love?",
        quote:
          "Hers were hobnobs. She'd put the tin down the moment anyone came round. That was the signal everything was fine.",
      },
      tribute: {
        framing:
          "David's office always had a good tin — which biscuit do you love?",
        quote:
          "His was the digestive. Not just any biscuit. The right biscuit, for the right conversation. He had a system.",
      },
      birthday: {
        framing:
          "Sarah says she doesn't have a favourite biscuit — which biscuit do you love?",
        quote:
          "Hers is the Bourbon. Everyone who knows her knows the answer. She just won't admit it.",
      },
      retirement: {
        framing:
          "David has earned something better than a Rich Tea — which biscuit do you love?",
        quote:
          "His will be a proper shortbread. He's earned it. The question is just which one.",
      },
      wedding: {
        framing:
          "Emma and James have incompatible biscuit preferences — which biscuit do you love?",
        quote:
          "Hers is the chocolate digestive. His is the shortbread. Somehow this works. Completely compatible in every other way.",
      },
      anniversary: {
        framing:
          "Mum and Dad have had the same biscuit in the tin for forty years — which biscuit do you love?",
        quote:
          "Theirs is the custard cream. She buys the tin. He refills it. This is the division of labour that has sustained forty years.",
      },
      leaving: {
        framing:
          "Priya always brought the right biscuit without explaining why — which biscuit do you love?",
        quote:
          "Hers was the cardamom biscuit from the bakery down the road. You'd understand the moment you ate one. That was the genius of it.",
      },
      graduation: {
        framing:
          "Tom says biscuits got him through finals — which biscuit do you love?",
        quote:
          "His was the rich tea. He was specific about this. The wrong biscuit in the wrong hour was genuinely not an option.",
      },
      christening: {
        framing: "Someone brought biscuits — which biscuit do you love?",
        quote:
          "The biscuit question matters more than people admit. This is just true.",
      },
      achievement: {
        framing:
          "Marcus had one particular biscuit at every post-long-run breakfast — which biscuit do you love?",
        quote:
          "His was the hobnob. He's very clear about which one. Don't suggest alternatives.",
      },
      recovery: {
        framing:
          "Claire's sister always brought the right biscuit — which biscuit do you love?",
        quote:
          "Hers were Bourbons. Not the expensive ones. Not the obvious ones. Exactly the right one. She knew.",
      },
      award: {
        framing:
          "Dr. Amelia Grant's classroom biscuit tin is a well-known institution — which biscuit do you love?",
        quote:
          "Hers is the ginger nut. It's never empty. She's never explained how. The students have long since stopped asking.",
      },
      promotion: {
        framing:
          "Kwame brought biscuits to the team on his first day as Head of Product — which biscuit do you love?",
        quote:
          "His were chocolate hobnobs. He chose them carefully. He's that kind of person.",
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
          "Belinda had a sport she followed with total devotion — which sport do you love to watch?",
        quote:
          "Hers was cricket — on the radio, never the TV. She could tell you the score of any Test match from 1987. It was a gift.",
      },
      tribute: {
        framing:
          "David was quietly devoted to one sport and never needed to explain why — which sport do you love to watch?",
        quote:
          "His was football. He watched alone, on his terms, with complete concentration. He didn't need company for it.",
      },
      birthday: {
        framing:
          "Sarah watches one sport with a level of engagement that concerns her friends — which sport do you love to watch?",
        quote:
          "Hers is tennis. She once lost her voice during Wimbledon and didn't notice until the next morning.",
      },
      retirement: {
        framing:
          "David missed the second half of a match he'll never forgive himself for — which sport do you love to watch?",
        quote:
          "His is cricket. He missed the 2005 Ashes for a board meeting. He hasn't forgiven anyone. Now he'll never miss another ball.",
      },
      wedding: {
        framing:
          "Emma and James haven't agreed on a sport in five years — which sport do you love to watch?",
        quote:
          "Hers is cricket. His is football. No sign of resolution. We think it might be the point.",
      },
      anniversary: {
        framing:
          "Mum and Dad have watched the same sport from the same seats for forty years — which sport do you love to watch?",
        quote: "Theirs is rugby. The seats changed once. The sport never did.",
      },
      leaving: {
        framing:
          "Priya had three half-finished seasons in her queue — which sport do you love to watch?",
        quote:
          "Hers is Formula 1. The time has officially arrived. The queue can finally be cleared.",
      },
      graduation: {
        framing:
          "Tom once watched an entire cricket Test between dissertation drafts — which sport do you love to watch?",
        quote:
          "His is cricket. He says it helped with pacing. This is possibly correct. Certainly committed.",
      },
      christening: {
        framing:
          "Lily will one day have a sport she watches religiously — which sport do you love to watch?",
        quote:
          "She'll come to it herself. But it's not too early to introduce the options.",
      },
      achievement: {
        framing:
          "Marcus has watched every marathon broadcast he can find since completing his — which sport do you love to watch?",
        quote:
          "His is marathon running now. He notices completely different things. The sport looks different from inside it.",
      },
      recovery: {
        framing:
          "Claire says watching sport helped — the routine of it, the rhythm — which sport do you love to watch?",
        quote:
          "Hers is swimming. Something about sport going on regardless. The world continuing in the expected way.",
      },
      award: {
        framing:
          "Dr. Amelia Grant uses sport as a classroom metaphor regularly — which sport do you love to watch?",
        quote:
          "Hers is cricket. She means team, strategy, the long season. She applies it to everything.",
      },
      promotion: {
        framing:
          "Kwame says watching sport taught him about team structure — which sport do you love to watch?",
        quote:
          "His is basketball. Not the strategy. The culture. How teams actually function under pressure.",
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
          "Belinda had a sport she played every morning until her seventies — which sport do you love to play?",
        quote:
          "Hers was swimming. She said it was the only sport where you couldn't have your phone. She loved it for exactly that reason.",
      },
      tribute: {
        framing:
          "David played one sport until his eighties and never admitted it was competitive — which sport do you love to play?",
        quote:
          "His was bowls. It was extremely competitive. Everyone knew. Nobody said anything.",
      },
      birthday: {
        framing:
          "Sarah plays one sport like her life depends on it — which sport do you love to play?",
        quote:
          "Hers is tennis. She once beat someone half her age and spent the following week telling people.",
      },
      retirement: {
        framing:
          "David's golf clubs have been in the car for three years — which sport do you love to play?",
        quote:
          "His is golf. The tee times start this month. He's been ready for a while.",
      },
      wedding: {
        framing:
          "Emma and James tried playing against each other once — which sport do you love to play?",
        quote: "They play doubles now. This was the right decision.",
      },
      anniversary: {
        framing:
          "Mum and Dad played one sport together for years until they didn't — which sport do you love to play?",
        quote:
          "Theirs was badminton. Forty years of pretending the score didn't matter. It mattered.",
      },
      leaving: {
        framing:
          "Priya mentioned once that she used to run — which sport do you love to play?",
        quote:
          "Hers is running. Nothing stops her now. That's the whole point.",
      },
      graduation: {
        framing:
          "Tom played five-a-side throughout university and said it was where he did his best thinking — which sport do you love to play?",
        quote:
          "His is five-a-side. He claims this. His teammates have opinions about whether this is accurate.",
      },
      christening: {
        framing:
          "One day Lily will play something and love it — which sport do you love to play?",
        quote:
          "The sport she finds at eight or ten or fourteen. We're curious already.",
      },
      achievement: {
        framing:
          "Marcus will always be a runner now — which sport do you love to play?",
        quote:
          "His is running. The marathon made it permanent. He came back from it different.",
      },
      recovery: {
        framing:
          "Claire got back into a sport she'd stopped for a while — which sport do you love to play?",
        quote:
          "Hers is swimming. Coming back was harder than starting. She's very glad she did.",
      },
      award: {
        framing:
          "Dr. Amelia Grant coached the school netball team for fifteen years while teaching — which sport do you love to play?",
        quote:
          "Hers is netball. She says the two weren't unrelated. Teaching and coaching use the same part of her.",
      },
      promotion: {
        framing:
          "Kwame says five-a-side is the team exercise that makes everything else clearer — which sport do you love to play?",
        quote:
          "His is five-a-side. Every team problem he's encountered has a five-a-side equivalent. He uses both.",
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
          "Belinda had a form of exercise she never skipped — which form of exercise do you love?",
        quote:
          "Hers was the daily walk — same route, same pace. She said the walk was where she did her best thinking. The lane still feels like hers.",
      },
      tribute: {
        framing:
          "David walked everywhere and knew every route — which form of exercise do you love?",
        quote:
          "His was walking. He could tell you the best way between any two points in the city. Every route considered.",
      },
      birthday: {
        framing:
          "Sarah talks about swimming but actually does something else entirely — which form of exercise do you love?",
        quote:
          "Hers is running. She downloaded seventeen fitness apps and uses exactly one of them. The right one.",
      },
      retirement: {
        framing:
          "David has been saying he'll take up one form of exercise since 2017 — which form of exercise do you love?",
        quote:
          "His will be cycling. The bike is in the garage. The time is now. No more excuses.",
      },
      wedding: {
        framing:
          "Emma and James have never had an argument that a long walk didn't fix — which form of exercise do you love?",
        quote:
          "Theirs is walking. This is a well-established fact. The walks are very good.",
      },
      anniversary: {
        framing:
          "Mum and Dad have walked every anniversary — a tradition that started on their first date — which form of exercise do you love?",
        quote:
          "Theirs is walking. It's still the walk that matters most. It's never changed its purpose.",
      },
      leaving: {
        framing:
          "Priya has been talking about training for something for years — which form of exercise do you love?",
        quote:
          "Hers will be running. The diary is now entirely hers. The training can begin.",
      },
      graduation: {
        framing:
          "Tom cycled everywhere in Manchester and arrived at everything slightly out of breath — which form of exercise do you love?",
        quote:
          "His is cycling. It was a feature, not a bug. He always arrived with energy.",
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
          "His is running. Not for the race alone. For what the running gave him all the way through.",
      },
      recovery: {
        framing:
          "Claire walked every day this year — which form of exercise do you love?",
        quote:
          "Hers is walking. Not for fitness. For the forward motion. For the being outside in the world.",
      },
      award: {
        framing:
          "Dr. Amelia Grant swims before school on Tuesdays — which form of exercise do you love?",
        quote:
          "Hers is swimming. She's done it for twelve years. She says it sets everything else up.",
      },
      promotion: {
        framing:
          "Kwame runs when he needs to think clearly — which form of exercise do you love?",
        quote:
          "His is running. He doesn't track it. He doesn't time it. That's the whole point. Just movement.",
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
        is_canonical: true,
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
