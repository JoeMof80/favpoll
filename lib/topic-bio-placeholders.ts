/**
 * Topic-aware bio placeholders for OCCASION_PLACEHOLDERS.
 *
 * One bio per occasion × topic combination. Keys must exactly match
 * topic titles in scripts/seed.ts and OccasionType values in lib/occasions.ts.
 *
 * Use getBioPlaceholder() from lib/occasions.ts rather than reading this
 * directly — it falls back to the generic OCCASION_PLACEHOLDERS bio when
 * a topic-specific entry is missing.
 */
export const TOPIC_BIO_PLACEHOLDERS: Record<string, Record<string, string>> = {
  // ── Category 1: Nature ────────────────────────────────────────────────────

  Colour: {
    memorial:
      "A retired teacher and mother who gave forty years to her pupils and her garden. She grew lavender in every house she ever lived in — the colour came first, then the planting plan. Marie Curie nurses cared for her at home in her final weeks.",
    tribute:
      "A mentor, colleague, and friend who spent decades shaping careers and conversations in equal measure. He had a pocket square in the same shade of deep blue at every important meeting — reliable as his advice, and just as considered.",
    birthday:
      "Sarah is turning 40 and has never made a neutral choice in her life, least of all with paint. Three weekends of deliberation, two trips to the paint shop, and she landed on sage — and has been vindicated ever since.",
    retirement:
      "Thirty-five years building engineering teams, and David made one sartorial decision in all of that time: navy. Same tie, every important meeting, for three and a half decades. He says he has no regrets. His wardrobe confirms this.",
    wedding:
      "Emma and James met at a rainy festival in 2019 and have been debating colour choices ever since. Their flat has one wall neither of them can agree on — she wants blue, he wants green. It remains unpainted, and neither of them is in a hurry.",
    engagement:
      "Callum proposed on Arthur's Seat on New Year's Day, surrounded by frozen heather. Sophie still says the colour of the hillside was the last thing on her mind. Callum has a theory about the exact shade of October lichen on the rocks and maintains it was the whole point.",
    anniversary:
      "Forty years, three houses, and a sitting room that has been repainted twice and still isn't quite right. They disagree on almost everything domestic, and it has never once been a problem.",
    leaving:
      "Priya wore coral with the confidence of someone who had worked it out years ago and never looked back. Six years in the studio and every outfit was deliberate — not a statement, just a very precise knowledge of herself.",
    graduation:
      "Tom spent four years at architecture school in Manchester developing opinions about proportion, light, and terracotta. He said the colour was a rational choice. Everyone who knows him says it was entirely instinctive.",
    christening:
      "Lily arrived in March and immediately attracted strong opinions about what colour her room should be. Everyone in the family has a view. We are saving them for when she is old enough to disagree.",
    achievement:
      "Marcus trained for eight months, mostly in the dark, mostly in the rain, wearing the same orange hi-vis vest for every run. He raised over £4,000 for the RNLI along the way. The vest has earned its retirement.",
    recovery:
      "Claire finished her treatment last month and surrounded herself with yellow while she recovered — not aggressively, just enough. She said it did something she couldn't quite explain. We believe her.",
    award:
      "Amelia has just been named Teacher of the Year, and anyone who has seen her classroom would not be surprised. She painted it yellow deliberately, read the research afterwards, and watched it work. She was right before the studies confirmed it.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He has a theory about indigo that he has applied to every product he has ever shipped. The promotion feels like the theory paying off.",
    celebration:
      "Tell their story — who they are, what makes this celebration worth having, and what their favourite colour says about them. The colour someone always comes back to is often more revealing than they expect.",
    other:
      "Tell us who this person is and why you're gathering. A favourite colour — worn deliberately, lived with, or simply loved — makes a good starting point for the rest of us.",
  },

  Season: {
    memorial:
      "A beloved mother and teacher who measured the year by the garden. She had seeds in the ground before anyone else had put away their winter coat, and the first daffodil was a private event she celebrated alone with a cup of tea.",
    tribute:
      "A mentor whose thinking always seemed most precise in autumn — something about October that suited him. He held his best conversations in the evenings of that season, and his colleagues came to associate crisp mornings with his particular kind of clarity.",
    birthday:
      "Sarah claims she's an autumn person and has done so for years. Her friends say she's clearly a summer person — she plans her whole year around it, books the holidays first, and then remembers it's autumn in October.",
    retirement:
      "Thirty-five years building an engineering team from four people to four hundred, and David always said the best work happened in autumn. Every significant project seemed to come together in October. He is now planning his October entirely differently.",
    wedding:
      "Emma and James met at a rainy festival in 2019, which has shaped their relationship with British summer in ways they are still working through. She loves spring. He maintains it's actually summer. They have been at this for five years.",
    engagement:
      "Callum chose October in the Lake District on purpose — he'd been waiting for the right autumn light on the right hillside. Sophie thought they were just going for a walk. She has since accepted that she was being extremely naive.",
    anniversary:
      "Forty years of seasons together, and they still disagree on when to plant in spring — she says March, he says April. This argument happens every year and is resolved the same way every year. Neither of them will say who wins.",
    leaving:
      "Priya arrived in January and had changed the way the whole studio worked by March. She always felt most like herself in spring, and the timing was, in retrospect, completely typical.",
    graduation:
      "Tom spent his final year in the studio and emerged, blinking, into summer — having seen very little natural light between January and June. He has since developed strong opinions about what daylight is actually for.",
    christening:
      "Lily arrived in March, just as the garden was starting, and the timing felt completely right to everyone involved. Spring has always been the most optimistic season. She came in perfectly.",
    achievement:
      "Marcus trained through every season to get to the start line — early mornings in winter, long runs through a wet spring, and then a crisp October morning when everything came together. He raised over £4,000 for the RNLI. Autumn now means something specific to him.",
    recovery:
      "Claire came through her treatment and noticed spring differently this year — the way it announces itself, the way things come back. She said it felt like the season was specifically for her. We think she might be right.",
    award:
      "Amelia has just been named Teacher of the Year, and the people who nominated her will tell you she's at her best in September. That first-week energy — the hunger, the possibility — she plans her entire year around it.",
    promotion:
      "Three years of patient, excellent work, and Kwame waited for the first warm day of spring to mark his promotion properly. He said the timing was practical. Nobody who knows him believes that.",
    celebration:
      "Tell their story — who they are, what makes this celebration worth having, and which time of year brings the best of them out. The seasonal person always has a reason.",
    other:
      "Tell us who this person is and why you're gathering. A favourite season — and what it gives them that the others don't — opens up more than you'd expect.",
  },

  Animal: {
    memorial:
      "A beloved mother and teacher whose garden was as much for the birds and creatures as it was for herself. She tolerated the foxes, encouraged the hedgehogs, and took the appearance of a robin each spring as a personal compliment.",
    tribute:
      "A mentor and friend who paid attention to things most people walked past. He once spent twenty minutes watching a red kite work a thermal above the motorway and arrived late to a meeting having not noticed the time at all.",
    birthday:
      "Sarah is turning 40, has a dog named Pepper who she describes as her most consistent relationship, and she will not be accepting alternative opinions on this. Pepper is at every dinner party and is non-negotiable.",
    retirement:
      "Thirty-five years of spreadsheets and engineering milestones, and David spent every lunch break feeding the same pair of ducks on the lake beside the office. He has now retired. The ducks have presumably noticed.",
    wedding:
      "Emma and James have been debating which animal best represents their relationship since 2020. She says otter — sociable, clever, perpetually busy. He says tortoise. Both of them believe they are paying the other a compliment.",
    engagement:
      "They got engaged on Arthur's Seat at New Year, watched from a respectful distance by a sheep who appeared entirely unimpressed. Sophie considers this part of the story. Callum prefers to leave it out.",
    anniversary:
      "Forty years together and one long-running position: Mum has always said the best pet they ever had was the cat who arrived uninvited in 1998 and stayed for seventeen years. Dad still says they weren't really a cat family. Mum ignores this.",
    leaving:
      "Priya's desk was the one with the small ceramic elephant on it — a gift from her first day that survived six years and three desk moves. It came with her when she left, which felt appropriate.",
    graduation:
      "Tom studied architecture in Manchester and spent four years drawing the same crow that sat on the library roof in the margins of his lecture notes. He has not explained why. The drawings got progressively better.",
    christening:
      "Lily's room currently features approximately seven different animal prints, a mobile with sheep on it, and a rabbit from her grandmother that is larger than Lily is. She seems unbothered by any of it.",
    achievement:
      "Marcus trained for his marathon along the same coastal route every morning, and he passed the same pair of grey herons at the two-mile mark for eight months. He named them. He raised over £4,000 for the RNLI. The herons were unmoved.",
    recovery:
      "During her recovery, Claire started leaving food out for the hedgehogs in her garden — something she had been meaning to do for years. They came every evening. She found the regularity more comforting than she expected.",
    award:
      "Amelia has just been named Teacher of the Year, and anyone who has been in her classroom will have noticed the corner with the working hive of bees behind glass. It is, she says, the best teaching aid she has ever used.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He would like it noted that he is a dog person, has always been a dog person, and considers this relevant background information.",
    celebration:
      "Tell their story — who they are, what matters to them, and whether there's an animal that says something true about them. The specific detail is always better than the general one.",
    other:
      "Tell us who this person is and why you're gathering. A favourite animal — and the reason behind it — is often more revealing than you'd expect.",
  },

  Bird: {
    memorial:
      "A retired teacher who kept a garden that was largely for other people and creatures. She logged every robin and blackbird that visited, and her notebooks — years of them — are still in the shed.",
    tribute:
      "A man who could name most birds by their call and thought this was perfectly normal knowledge for anyone to have. He once identified a nightingale in a Somerset hedgerow on a team away-day and received looks he never quite understood.",
    birthday:
      "Sarah is turning 40 with strong opinions about birds, formed almost entirely on her weekend hikes. She says the dipper is the best bird in Britain. Her hiking companions have learned not to disagree.",
    retirement:
      "After thirty-five years in an engineering company, David's retirement plan involves the bird feeders he has been meaning to put up since 2009. They are currently in the garage. This is his first week.",
    wedding:
      "Emma and James have strong and opposing views about birds — she says puffins, he says kingfishers. They went to Skomer Island in 2022 to settle it. The trip ended in a gentleman's agreement neither of them intends to keep.",
    engagement:
      "They got engaged on Arthur's Seat on New Year's Day, surrounded by red grouse at close range who appeared to have opinions about the timing. Sophie said the grouse gave their blessing. Callum accepts this version of events.",
    anniversary:
      "Forty years of mornings together, and Dad has spent most of them watching the birds at the feeder through the kitchen window while Mum reads the paper. They have never discussed what this says about them.",
    leaving:
      "Priya once stopped a team meeting to point out a peregrine falcon on the office roof. She was right, she was confident, and she was the only person in the room who knew what it was. That tells you everything.",
    graduation:
      "Tom studied architecture with a tutor who had a particular interest in how birds change the way buildings feel — nest sites, flight paths, acoustic impact. Tom now notices things that other architects walk straight past.",
    christening:
      "Lily's parents are already arguing about whether the blue tits nesting in the garden box are a good omen. Her father says yes. Her mother says it's a coincidence. Both are enjoying the argument.",
    achievement:
      "Marcus ran past the same pair of grey herons every morning for eight months on his training route. He started noting them in his running log. He raised over £4,000 for the RNLI and credits them with getting him through the worst mornings.",
    recovery:
      "During her recovery, Claire started identifying the birds in her garden with a secondhand field guide she found in a charity shop. She has now filled two notebooks. She says it was the best thing she did that year.",
    award:
      "Amelia has just been named Teacher of the Year. Her classroom has a bird feeder visible through the window and a running list on the wall of every species her students have identified since 2019. The list is now longer than several sections of the curriculum.",
    promotion:
      "Kwame celebrated his promotion to Head of Product with a long weekend in the Cairngorms — his first time in Scotland, his first sighting of a ptarmigan, and the first time in three years he had fully switched off. He came back with strong opinions about all three.",
    celebration:
      "Tell their story — who they are, what they love, and whether there's a bird that says something true about them. The small specific details are always the ones that land.",
    other:
      "Tell us who this person is and why you're gathering. A favourite bird — and a reason behind it — often opens up an unexpected conversation.",
  },

  Flower: {
    memorial:
      "A beloved mother and teacher who grew lavender in every garden she ever lived in — not as a statement, just because it was the right plant for that spot. The garden is still there. The lavender came back this spring.",
    tribute:
      "A mentor who brought flowers to every hospital visit, every celebration, and every occasion where most people would have brought a card. He always chose sweet peas in season and lilies when they weren't. He never mentioned it. People noticed anyway.",
    birthday:
      "Sarah is turning 40 with a flat she keeps stocked with peonies from April to June, because she decided some years ago that there was no reasonable argument against it. Her guests have never complained.",
    retirement:
      "David spent thirty-five years in an engineering company and is retiring with a plan to do something about the garden. Specifically: sweet peas, which his mother grew and which he has been meaning to grow for thirty years.",
    wedding:
      "Emma's flowers were anemones — dark centres, wild colours, completely her. James had strong views about this from the start, and he was right. They agreed on something floral for the first time and consider this a good sign.",
    engagement:
      "Sophie's favourite flowers are the ones that come up wild — harebells on the fells, wood anemones in spring. Callum took note. He proposed in October on Arthur's Seat when there wasn't a harebell in sight. She didn't mind at all.",
    anniversary:
      "Forty years, and Dad has bought Mum the same flowers every anniversary: sweet william, which he knows she loves and she pretends to find predictable. She has never, in forty years, said she was disappointed. He has never, in forty years, tried anything else.",
    leaving:
      "Priya's desk was always the one with fresh flowers on it — not a supermarket bunch, but whatever was in season at the market on the corner, chosen specifically. The desk has been empty since she left.",
    graduation:
      "Tom graduated with a first in architecture and a working understanding of how flowering plants have shaped the built environment — from climbing roses on Victorian terraces to contemporary planting schemes on housing estates. He has opinions.",
    christening:
      "Lily's parents chose lily of the valley for the christening — partly for the occasion, partly because her name made it irresistible. Nobody thought it was too much. It was exactly the right amount.",
    achievement:
      "Marcus ran his marathon in October, poppy season, and raised over £4,000 for the RNLI. The finish line was decorated with them. He has not mentioned this in his fundraising posts, but he noticed.",
    recovery:
      "During her recovery, Claire planted the front garden with things she had always meant to plant — dahlias, foxgloves, a climbing rose she'd been looking at in a catalogue for three years. She timed everything for late summer and it arrived exactly when she needed it.",
    award:
      "Amelia has just been named Teacher of the Year. Her classroom windowsill has had the same pot of African violets on it for eleven years. Her students know not to move it.",
    promotion:
      "After three years of work that deserved recognition, Kwame has been made Head of Product. He once had a conversation about the geometry of sunflower seeds that went on for forty minutes and resulted in a product feature nobody on the team had expected. This is not unusual for Kwame.",
    celebration:
      "Tell their story — who they are, what they love, and which flower, if any, says something specific about them. The personal detail is always the right one.",
    other:
      "Tell us who this person is and why you're gathering. A favourite flower — or a plant they always grew — can be a surprisingly revealing starting point.",
  },

  Tree: {
    memorial:
      "A beloved mother and teacher who planted things she knew she wouldn't always see fully grown. There is an apple tree in the garden that she planted the year she retired. It fruited for the first time last October.",
    tribute:
      "A mentor and friend who had a particular affection for old trees — the kind that have watched several generations of the same street change around them. He once wrote a memo about a cedar outside the office that was subsequently the reason it was not felled.",
    birthday:
      "Sarah is turning 40 and has recently become the kind of person who identifies trees while hiking. She is thorough about this. Her hiking group has decided to encourage it rather than explain how to stop.",
    retirement:
      "Thirty-five years in the same company, and David's office window looked onto a horse chestnut that he watched through every October for three and a half decades. He has retired. The tree is still there.",
    wedding:
      "Emma and James got married under an oak at a venue they chose specifically for the oak. They were told the tree was three hundred years old. James says this is probably an exaggeration. Emma says it isn't relevant either way.",
    engagement:
      "They got engaged on Arthur's Seat, looking out over a landscape that has almost no trees and is much better for it. Sophie loves a rowan, which she says is the right size for the right kind of hill. Callum agrees, and was pleased to learn its name.",
    anniversary:
      "Forty years together, and the silver birch they planted in the garden the year they moved in is now taller than the house. Mum says it was a mistake to plant it so close to the fence. Dad says he has no memory of planting it at all.",
    leaving:
      "Priya's favourite thing about the walk to the studio was the row of London planes on the main road — the way they filtered the light in summer, and the sound of the wind through them. She mentioned this on her last day. People had never noticed.",
    graduation:
      "Tom wrote his dissertation on how London plane trees shaped the character of Victorian street design. He gave it a very long title that no one can now repeat. His tutor said it was the best thing he'd written. He still has the mark.",
    christening:
      "Lily's grandparents have proposed planting a tree in the garden to mark her christening. Her parents have agreed, in principle, but have not yet agreed on which tree. This is expected to take some time.",
    achievement:
      "Marcus trained through every kind of weather along routes he now knows tree by tree — the oak at the two-mile mark, the twin beeches at eight, the ash at the turnaround. He raised over £4,000 for the RNLI. He couldn't have named most of those trees six months ago.",
    recovery:
      "During her recovery, Claire found herself stopping under trees she had walked past for years without looking up — noticing things she had always missed. She says she is not sure what changed. We think she has a better idea than she lets on.",
    award:
      "Amelia has just been named Teacher of the Year and once took her whole class outside to measure the circumference of the oak in the school grounds. The measurement is now on the wall. The tree is none the worse for it.",
    promotion:
      "Three years of good work, and Kwame has been promoted to Head of Product. He grew up in Accra and has strong views on the particular quality of light through trees in early morning — something about the angle and the colour of the dry season. He misses it, and it informs everything.",
    celebration:
      "Tell their story — who they are, what they love, and whether there's a tree that marks something in their life. A planted tree, a favourite park, a tree they pass every day — the specific detail always counts.",
    other:
      "Tell us who this person is and why you're gathering. A favourite tree — or one that marks a particular place or moment — can be an unexpectedly personal starting point.",
  },

  Weather: {
    memorial:
      "A beloved mother and teacher who was entirely unbothered by rain — she had her tea for that. She gardened in a light drizzle without complaint and said the garden preferred it. She was right about most things.",
    tribute:
      "A mentor and friend who paid attention to what the weather was doing in a way that felt almost agricultural. He would name the cloud formations in meetings without being asked. He was always right, and this was not the most unsettling thing about him.",
    birthday:
      "Sarah is turning 40 and her opinion of weather is simple: it's what you dress for. She has a waterproof for every type and has organised more picnics in miserable conditions than anyone can reasonably account for.",
    retirement:
      "Thirty-five years of commuting through everything the British climate could produce, and David has developed a considered opinion on each type. He will now be working on the garden, which means his views are about to become significantly more specific.",
    wedding:
      "Emma and James got engaged at a rainy festival and married on a day that was technically overcast but which everyone agreed was lovely. She calls this British resilience. He calls it selective memory. Both are correct.",
    engagement:
      "Callum proposed on Arthur's Seat in January, in weather that was cold, clear, and completely still. He had checked the forecast three times. Sophie had assumed they were going for a walk. The weather, for once, cooperated entirely.",
    anniversary:
      "Forty years of British weather, and they have walked in most of it — not because they particularly enjoy bad weather, but because the walk was the walk and the weather was what was happening. Neither of them has ever suggested waiting for a better day.",
    leaving:
      "Priya arrived in January in freezing drizzle and left in July sunshine, and she told anyone who would listen that she preferred the January version. She said it made the good days count more. The team have since tried this argument. It doesn't work for everyone.",
    graduation:
      "Tom has spent four years in Manchester, which means he has a detailed personal taxonomy of grey. He can distinguish between productive-grey and merely-grey, and believes this is the most useful thing architecture school gave him.",
    christening:
      "Lily arrived on a bright March morning after two weeks of rain, and everyone agreed the timing was clearly intentional. Spring came in on schedule for her. We are choosing to treat this as a sign.",
    achievement:
      "Marcus trained for eight months in all weathers — dawn runs in November frost, long runs through a wet February, and the final weeks in what passed for spring. He raised over £4,000 for the RNLI. He says he now genuinely doesn't mind bad weather. We're inclined to believe him.",
    recovery:
      "Claire started going for walks during her recovery — every day, regardless of what the weather was doing. She says the rain was actually fine. She says this with the conviction of someone who has worked it out properly.",
    award:
      "Amelia has just been named Teacher of the Year. She has strong views about weather and learning — specifically, that a rainy afternoon in November produces better thinking than a sunny Friday in June. Several of her students agree.",
    promotion:
      "Kwame grew up in Accra and has spent five years developing a working theory of British weather. He is now Head of Product and has not resolved the question. He considers it a long-term project.",
    celebration:
      "Tell their story — who they are, what they love, and what they think about weather. Whether they love it or have learned to live with it, there's always something specific to say.",
    other:
      "Tell us who this person is and why you're gathering. A view on weather — what they love about it, or what they've learned to live with — is always more revealing than expected.",
  },

  Landscape: {
    memorial:
      "A beloved mother and teacher who loved the English countryside with the quiet certainty of someone who had never felt the need to say so. She walked the same hills in Shropshire for thirty years and knew every view by name.",
    tribute:
      "A mentor who believed that where you think best is worth paying attention to. He walked the South Downs on his own every autumn and came back with decisions made and plans revised. His colleagues knew not to schedule meetings on the Monday after a walking weekend.",
    birthday:
      "Sarah is turning 40 with strong opinions about landscape formed almost entirely on her weekend hikes. She loves the Brecon Beacons, does not trust anyone who says Snowdonia is overrated, and is deeply suspicious of the flat.",
    retirement:
      "David spent thirty-five years commuting into an industrial estate and is retiring with a plan to spend more time in the Dales, where he grew up and where his best thinking has always happened. He bought new walking boots last week. They are already broken in.",
    wedding:
      "Emma and James have been arguing about Scotland versus the Continent since 2020 and have not resolved it. They got married in the English countryside and chose it specifically because it sat, diplomatically, between both positions.",
    engagement:
      "They got engaged on Arthur's Seat looking out over Edinburgh and the Firth of Forth on a January morning with no wind and perfect visibility. Callum had been planning it around the landscape for months. Sophie says she had guessed. She had not.",
    anniversary:
      "Forty years together and they have walked some version of the same countryside every year — not always the same place, but always the same kind of landscape. Open. Quiet. A view at the top worth the effort. They don't talk much on the way up.",
    leaving:
      "Priya grew up in Tamil Nadu and spent six years designing in Manchester, and the thing that surprised her most about Britain was how different the landscapes were from each other. She wrote a piece about it once. Her team didn't know she wrote.",
    graduation:
      "Tom studied architecture in Manchester and wrote extensively about how landscape shapes building — the way a moorland site produces different decisions to a valley one, the way topography becomes structure. His tutor said he thought like a geographer. He took it as a compliment.",
    christening:
      "Lily's parents chose a church in the village where her grandfather grew up — partly for the tradition, partly for the view from the churchyard, which is, on a clear day, one of the better views in the county. Both reasons were mentioned in the order of service.",
    achievement:
      "Marcus grew up near the coast and chose the RNLI because, for him, the sea is not background — it is the point. He studied the marathon course obsessively, ran it in October, and raised over £4,000. He knew every incline and every exposed stretch before he started.",
    recovery:
      "During her recovery, Claire started spending time in places she had driven past for years without stopping — a particular estuary, a stretch of common near the hospital, a canal towpath that turned out to take two hours in one direction. She has been making notes.",
    award:
      "Amelia has just been named Teacher of the Year and once took her entire year group to the Malvern Hills for a day that was, technically, unrelated to the curriculum. Several students later cited it as a turning point. She has never fully explained what she was trying to do.",
    promotion:
      "Kwame grew up in Accra and came to the UK for university, and the thing he found most startling — and now loves — is the English countryside in October. He said it looks like it was designed to make you feel small in a good way.",
    celebration:
      "Tell their story — who they are, what they love, and whether there's a landscape that says something true about them. The specific view, the particular valley, the coast they grew up near — these details matter.",
    other:
      "Tell us who this person is and why you're gathering. A favourite landscape — or the kind of place where they feel most themselves — is always worth putting in.",
  },

  // ── Category 2: Time ──────────────────────────────────────────────────────

  "Day of the week": {
    memorial:
      "A beloved mother and teacher who had made Sunday non-negotiable. Long lunch, garden, Radio 4 — in that order, without variation. If you wanted her on a Sunday, you had to know the schedule.",
    tribute:
      "A mentor who held court on Thursday evenings — those were the meetings worth attending, the conversations worth having. His colleagues built their weeks around knowing Thursday was when David was at his best.",
    birthday:
      "Sarah is turning 40 with a well-developed theory that Thursday has a better energy than any other day of the week. She makes it feel like the weekend starts early, and nobody has ever been able to explain how.",
    retirement:
      "Thirty-five years building engineering teams, and David made one counter-intuitive claim throughout: Monday was the best day. He said weekends were just Mondays with better lighting. He believed this sincerely. He is now testing the theory in retirement.",
    wedding:
      "Emma and James met on a Friday, got engaged on a Sunday, and have not resolved which day is their favourite in five years of marriage. She says Sunday. He says Friday. This argument is ongoing and enjoyed by everyone involved.",
    engagement:
      "Callum chose a Saturday deliberately — the long walk, the Lakes, the proposal. Sophie will never think of Saturday as just a day again. Callum had been planning it around the right Saturday for months.",
    anniversary:
      "Forty years of Sundays together — same cup of tea, same order of things, same argument about what to have for lunch. It has never needed to change, and neither of them has ever suggested changing it.",
    leaving:
      "Priya made Tuesday lunches feel like the best part of the week, and no one has been able to explain how she did it. Six years of Tuesdays, and the team still hasn't worked out what she was doing that they aren't.",
    graduation:
      "Tom spent four years in the studio at architecture school and emerged, reliably, every Friday with the specific satisfaction of someone who has earned the weekend. Friday meant something at university. He is now in a job where it mostly still does.",
    christening:
      "Lily arrived on a Tuesday in March, which is not anyone's first choice for a significant day. She has already made it feel significant. We are updating our opinions on Tuesdays accordingly.",
    achievement:
      "Marcus ran his marathon on a Sunday morning and finished 26.2 miles before most people had read the papers. He raised over £4,000 for the RNLI. Sundays will never feel the same to him, and he doesn't want them to.",
    recovery:
      "During her recovery, Claire started marking Mondays differently — not with dread, but as milestones. Each one a small arrival, each one its own kind of progress. She says this sounds more deliberate than it was. We think she's being modest.",
    award:
      "Amelia has just been named Teacher of the Year and has a clear view on which day a classroom works best. Thursday is when the class finds its rhythm, she says — by then they have each other's measure, and the work becomes something different.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He celebrates quietly: a good coffee, the right playlist, and the knowledge that Monday mornings feel genuinely different now.",
    celebration:
      "Tell their story — who they are, what they love, and which day of the week they've made their own. The day someone insists on being a certain way is always worth knowing.",
    other:
      "Tell us who this person is and why you're gathering. A favourite day of the week — and what they do with it — is a small detail that says a lot.",
  },

  "Meal of the day": {
    memorial:
      "A beloved mother and teacher who took lunch seriously — not just the food but the hour, the setting, the company. Sunday lunch was a production. Everyone arrived. Nobody hurried.",
    tribute:
      "A mentor who believed dinner was the meal for the conversations that mattered. He hosted dinners, convened dinners, and used dinner as the frame for his best thinking. The food was always good. The conversation was always better.",
    birthday:
      "Sarah is turning 40 with an opinion on brunch that she has been refining since 2014. She has strong views on the egg: what it should be, how it should arrive, and what should be on the table alongside it.",
    retirement:
      "Thirty-five years of working lunches, desk sandwiches, and canteen chips, and David is retiring with a plan to have a proper breakfast every morning — at the table, with the paper, without being in a hurry.",
    wedding:
      "Emma and James met at a festival, which means their relationship began in the medium of overpriced chips. They have been making up for it ever since. She makes the Sunday lunches. He makes the midweek suppers. The arrangement suits everyone.",
    engagement:
      "Callum had packed a flask and something to eat for the walk — practical, prepared, entirely him. Sophie still claims the proposal came out of nowhere. Callum points out he had planned the picnic first. She concedes the point.",
    anniversary:
      "Forty years, and breakfast has never changed — tea, toast, and whoever gets to the kitchen first puts the kettle on. The routine has outlasted three houses, four cars, and every disagreement they have ever had about anything else.",
    leaving:
      "Priya made lunch a thing the team looked forward to — not just what was ordered, but when, and with whom, and why it mattered to pause. The studio is still adjusting to lunches that are just lunch.",
    graduation:
      "Tom graduated from four years of architecture school during which he skipped more breakfasts than he can count and had dinner at times that don't technically constitute dinner. He has since made his peace with breakfast. It was a significant improvement.",
    christening:
      "Lily has arrived with strong and entirely unpredictable opinions about feeding times. Her parents are learning to be flexible about most things, including what constitutes a reasonable hour for breakfast.",
    achievement:
      "Marcus trained for eight months during which breakfast was not optional, not rushed, and not small. He raised over £4,000 for the RNLI. His post-marathon brunch was, he says, the best meal he has ever had.",
    recovery:
      "During her treatment, breakfast was the meal Claire focused on — simple, manageable, something she could control. She is now celebrating a year of recovery, and breakfast has become, quietly, her favourite part of the day.",
    award:
      "Amelia has just been named Teacher of the Year. She teaches on adrenaline until lunchtime and has strong views about what makes a good school dinner. Several of them have now been acted on.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He is a breakfast person — not because he is disciplined about mornings, but because his best thinking happens before nine and he has learned to feed it accordingly.",
    celebration:
      "Tell their story — who they are, what they love, and which meal they've made their own. Whether it's the breakfast they take seriously or the dinner they never rush, there's always something specific to say.",
    other:
      "Tell us who this person is and why you're gathering. A favourite meal of the day — and what they do with it — is a small, specific detail that often says more than expected.",
  },

  "Time of day": {
    memorial:
      "A beloved mother and teacher who was at her best in the early morning — up before anyone else, pot of tea made, garden checked. She said the first hour of the day was hers. She guarded it accordingly.",
    tribute:
      "A mentor who came alive in the evenings. His thinking was sharper, his conversations longer, his hospitality more generous. He was not a morning person, and he never pretended to be.",
    birthday:
      "Sarah is turning 40 with a clear position: she is a late-evening person and has made her peace with this. Her dinner parties start at eight and finish at midnight, and she considers both of these correct.",
    retirement:
      "Thirty-five years of early starts and David is retiring with a plan to stop setting his alarm. He has not yet done this. He suspects he may still wake up at six regardless. He is prepared to test the hypothesis.",
    wedding:
      "Emma is a morning person. James is not. They have made this work for five years through what she calls practical division of the day. It involves a lot of coffee and a clear understanding of what to expect before nine.",
    engagement:
      "Callum proposed on Arthur's Seat on New Year's Day morning — he had been planning the time of day as carefully as the place. Sophie would not describe herself as a morning person, but that particular morning she did not mind at all.",
    anniversary:
      "Forty years of evenings together — the same time, the same chairs, the same programme. The arrangement was made early and has never been renegotiated. It is, they say, one of the better decisions they made.",
    leaving:
      "Priya was the last to leave most evenings and did her best work between five and seven, once the office had quietened down. The studio will miss that particular rhythm.",
    graduation:
      "Tom spent four years discovering, at considerable cost to his health, that he works best late at night. He graduated with a first. He considers these facts related. His tutors have not confirmed this.",
    christening:
      "Lily has arrived with no discernible pattern and extremely firm opinions about which times of day are acceptable for sleep. Her parents are keeping notes and hoping for convergence.",
    achievement:
      "Marcus trained in the dark, before work, for eight months — the kind of early-morning routine that most people admire from a distance. He raised over £4,000 for the RNLI. He says he will sleep in now. He has not yet managed it.",
    recovery:
      "During her recovery, Claire started paying attention to the early evening — the particular quality of light, the way things quieted down. She said she had never really noticed it before. She notices it now.",
    award:
      "Amelia has just been named Teacher of the Year. She will tell you the best learning in her classroom happens in the mid-morning — when everyone has arrived but the day hasn't quite settled. She plans for it specifically.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He is a morning person — not performatively, just genuinely — and has been known to send messages at six that arrive with fully formed ideas inside them.",
    celebration:
      "Tell their story — who they are, what they love, and which time of day brings the best of them out. Morning people and evening people always have a reason.",
    other:
      "Tell us who this person is and why you're gathering. A favourite time of day — and what they do with it — is a small detail that often says a great deal.",
  },

  Decade: {
    memorial:
      "A beloved mother and teacher who came of age in the 1960s and carried something of that decade with her — a certain optimism about what could be changed, and a refusal to be entirely serious about any of it. She played her records until she couldn't.",
    tribute:
      "A mentor who said the 1970s got a bad press and was willing to argue the point at length. He had opinions about Afrobeat, about soul, about what British television was doing — and he was never wrong in a way that was easy to dismiss.",
    birthday:
      "Sarah is turning 40 and her favourite decade is the one she came of age in — though she will not tell you which one without some encouragement. She says the music was better then. She has evidence.",
    retirement:
      "David built his engineering career through the 1980s and remembers them with the selective affection of someone who was, for most of that decade, too busy to notice what was going on. He has opinions in retrospect.",
    wedding:
      "Emma and James have been arguing about which decade had the best music since approximately the third date. The argument has not been resolved. It has, however, generated a very good shared playlist.",
    engagement:
      "Sophie says the 90s. Callum says the 80s. They have agreed to disagree, which has been their policy on most things since Arthur's Seat. The playlist is a compromise and better for it.",
    anniversary:
      "Forty years together began in the early 1980s, and they have never quite left that decade — the music still plays, the references still land, and neither of them thinks this is a problem.",
    leaving:
      "Priya arrived at the studio with a position on the 1990s that she maintained for six years: it was the last decade to get popular culture completely right. The argument is still going on, even now that she's left.",
    graduation:
      "Tom studied architecture and developed an unexpectedly strong position on the built environment of the 1960s — not in spite of its failures, but because of what it was trying to do. He gives a good lecture on this if you ask him. Several people have.",
    christening:
      "Lily has arrived into a decade she will one day look back on as hers. Her parents already have opinions about what she'll love. They are probably wrong and they know it.",
    achievement:
      "Marcus built his marathon playlist almost entirely from one decade — the one with the songs that got him out of bed on the worst mornings. He raised over £4,000 for the RNLI. He has not been embarrassed about the playlist. He should not be.",
    recovery:
      "During her recovery, Claire went back to the music of a particular decade — not out of nostalgia, exactly, but because it was familiar and reliable in the way she needed. It did its job. She is grateful to the decade for that.",
    award:
      "Amelia has just been named Teacher of the Year. She teaches a unit on the music of the 1960s that is not on the curriculum and is the most requested lesson of the year. She has been doing it for eight years and it has never once gone the same way twice.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up with Ghanaian highlife from the 1970s alongside British pop of the same era, and has strong views about both that he considers relevant to his work. They are.",
    celebration:
      "Tell their story — who they are, what they love, and which decade they feel most themselves in. The decade someone returns to always says something about who they are.",
    other:
      "Tell us who this person is and why you're gathering. A favourite decade — for its music, its culture, or just what it felt like — is a good way in.",
  },

  // ── Category 3: Places ────────────────────────────────────────────────────

  Place: {
    memorial:
      "A beloved mother and teacher who returned to the same stretch of Shropshire countryside for thirty years and found it sufficient. She walked the same paths in different weathers and said there was always something new. There was always something new.",
    tribute:
      "A mentor who believed that the quality of a conversation had something to do with the quality of the place it happened in. He was most himself in London, on foot, with no particular destination. He walked faster when he had something to say.",
    birthday:
      "Sarah is turning 40 with a long list of places she has been meaning to visit and a shorter list of places she keeps going back to instead. She is not embarrassed about either list. She says the return visits win on quality.",
    retirement:
      "David grew up in the Yorkshire Dales and spent thirty-five years getting back there as often as he could manage. He is now retired, and the question of how often is manageable has become the most interesting one he has.",
    wedding:
      "Emma and James have been arguing about where to go next since the festival they met at in 2019. She wants Scotland. He wants Italy. They have been to both and have not resolved it. They consider this a feature of the relationship.",
    engagement:
      "Callum had visited Arthur's Seat in December, in January, and on several other occasions before he was satisfied with the view. Sophie did not know this. She does now, and considers it a very specific kind of love.",
    anniversary:
      "Forty years together and the same cottage in the same village every August. They tried other places twice. Both times they agreed, quietly, that they'd been right about the cottage all along.",
    leaving:
      "Priya grew up in Tamil Nadu, spent six years in Manchester, and says she still can't quite decide which landscape belongs to her more. She is starting her own studio. The question of where has not yet been answered.",
    graduation:
      "Tom studied architecture in Manchester and knows the city building by building, street by street — partly from his course, partly from walking it obsessively on weekends. He says knowing a place that well is its own kind of qualification.",
    christening:
      "Lily has arrived in the world with an address, a family, and a village churchyard that has been in her family for three generations. She will form her own opinions about all of this in due course.",
    achievement:
      "Marcus grew up near the Norfolk coast and has been giving to the RNLI since he was eleven — the year he watched a shout launch from Sheringham beach in a January storm. He raised over £4,000 for them when he ran his marathon. The connection is not coincidental.",
    recovery:
      "During her recovery, Claire started visiting a particular estuary near her house that she had driven past for years without stopping. She went at the same time each week. It became, she says, the most reliable thing in her diary.",
    award:
      "Amelia has just been named Teacher of the Year. She grew up in Herefordshire and took her students to the Malvern Hills on a day that was officially unscheduled and is now — unofficially — on the school calendar every year.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up in Accra, came to the UK for university, and has spent five years building a map of Britain in his head, one weekend trip at a time. The Cairngorms, he says, were the most surprising.",
    celebration:
      "Tell their story — who they are, what matters to them, and whether there's a place that says something true about them. A place someone returns to, or has been meaning to go, is always worth knowing.",
    other:
      "Tell us who this person is and why you're gathering. A favourite place — or a place that shaped them — is a good way to start.",
  },

  "Type of holiday": {
    memorial:
      "A beloved mother and teacher who took the same kind of holiday for thirty years — a cottage in the countryside, a good book, and no particular plans. She said the absence of an itinerary was the point. She was right.",
    tribute:
      "A mentor who walked long-distance paths on his own every summer and came back from each one with something worked out. He said walking holidays were for thinking, and thinking was what he was for. Both were true.",
    birthday:
      "Sarah is turning 40 with a list of holidays she has planned and not quite taken — not because she doesn't travel, but because the planning is, she admits, part of what she enjoys. She will get to all of them eventually.",
    retirement:
      "Thirty-five years of commuting, and David is retiring with a clear plan: the things he has been meaning to do on holiday but always talked himself out of. He has a notebook. The list is longer than he expected.",
    wedding:
      "Emma and James have spent their entire relationship in a friendly disagreement about what a holiday should be. She wants to walk in Scotland. He wants to eat in Italy. They have done both. The argument has not been resolved.",
    engagement:
      "They have been taking walking holidays together since the second date. Callum plans the routes. Sophie approves or adjusts them. The proposal was, in retrospect, the logical conclusion of this arrangement.",
    anniversary:
      "Forty years together and a very clear position on holidays: the same cottage, the same week in August, the same walk on the Tuesday. They have tried other arrangements twice. Both times they regretted it.",
    leaving:
      "Priya took one proper holiday in six years — a week back in Chennai that she described as restorative in ways she couldn't quite articulate. She is starting her own studio. A holiday is somewhere in the near future. She has earned it.",
    graduation:
      "Tom used his graduation summer to take a cheap flight to Portugal and walk slowly through every piece of modernist architecture he could find. He describes this as a holiday. His friends are not sure it counts.",
    christening:
      "Lily's parents have not taken a proper holiday in fourteen months. They are planning something modest for the autumn. Lily's views on travel are as yet unknown, though she has opinions about car journeys.",
    achievement:
      "Marcus spent the weeks before his marathon in a rented flat near the course, training the route section by section. He raised over £4,000 for the RNLI. He has already downloaded a trail map for the Norfolk coast. He says this is a holiday.",
    recovery:
      "During her recovery, Claire's version of a holiday was a week in a borrowed cottage in the Wye Valley with no plans and no schedule. She describes it as the best holiday she has ever taken. We believe her.",
    award:
      "Amelia has just been named Teacher of the Year. Her ideal holiday involves a walking route, a good secondhand bookshop at some point along the way, and no mobile signal. She has not always found all three at once.",
    promotion:
      "Kwame has been to Ghana every Christmas since arriving in the UK, which he calls the only holiday that is genuinely non-negotiable. He celebrated his promotion with a weekend in the Cairngorms. He is now planning his next one.",
    celebration:
      "Tell their story — who they are, what they love, and what kind of holiday brings the best of them out. Whether they need an adventure or just a good book and a quiet view, it's always worth knowing.",
    other:
      "Tell us who this person is and why you're gathering. A favourite kind of holiday — or the one they're always planning but haven't quite taken — is always a revealing detail.",
  },

  "Way to travel": {
    memorial:
      "A beloved mother and teacher who did not drive and never learned — she said the bus gave her time to think, and trains gave her time to read. She was never in a hurry to get anywhere, and she always arrived at the right moment.",
    tribute:
      "A mentor who walked wherever he possibly could and arrived at meetings slightly warm for it. He said the walk was part of the preparation. His colleagues suspected this was true.",
    birthday:
      "Sarah is turning 40 and considers a long train journey one of the finer things in life — the enforced stillness, the countryside at speed, the guilt-free hours with a book and nobody needing anything from her.",
    retirement:
      "Thirty-five years of motorway commuting, and David is retiring with a clear plan to use the car significantly less. He has a rail pass. He is starting with the Dales and working outward.",
    wedding:
      "Emma and James spent their first holiday together on a Eurostar they nearly missed and have been early for trains ever since. She prefers the train. He prefers to drive. They take the train.",
    engagement:
      "They get everywhere on foot when they can, and by train when they can't. Callum does the route planning. Sophie carries the snacks. This is a fair division and both of them know it.",
    anniversary:
      "Forty years, and Dad has always done the driving. Mum navigates. This arrangement was established in 1985 and has not been renegotiated. The sat-nav has not resolved the dynamic.",
    leaving:
      "Priya cycled to the studio for six years through everything the Manchester weather could produce. She said it was the best part of the day — the twenty minutes between home and work when nobody could reach her.",
    graduation:
      "Tom is a train person by conviction — he says the journey is part of the design, and that travelling at ground level teaches you things about cities that you can't learn any other way. He is not wrong.",
    christening:
      "Lily's parents have done a great deal of travelling in the last six months — to hospitals, to clinics, to family. They are now ready to travel somewhere of their own choosing. They haven't decided where yet.",
    achievement:
      "Marcus ran his training routes on foot and cycled to work — part habit, part discipline, part preparation. He raised over £4,000 for the RNLI. He says the marathon felt like the longest commute he'd ever done. He means this as a compliment.",
    recovery:
      "During her recovery, Claire started walking places she had previously driven — to the shops, to the park, to the canal. She said the change in pace changed what she noticed. She has kept it up.",
    award:
      "Amelia has just been named Teacher of the Year. She takes the bus, has always taken the bus, and considers the morning route part of her preparation for the day. She has read most of the great novels on the upper deck of the 47.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He walks to work when the weather allows it and says the thirty minutes are the most useful part of his day. He is known to arrive with product decisions already made.",
    celebration:
      "Tell their story — who they are, what they love, and how they prefer to get from one place to another. The way someone travels often says something true about them.",
    other:
      "Tell us who this person is and why you're gathering. How they prefer to travel — unhurried train, early flight, long walk — is always a revealing detail.",
  },
}
