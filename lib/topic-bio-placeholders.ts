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

  // ── Category 4: Film & TV ─────────────────────────────────────────────────

  Film: {
    memorial:
      "A beloved mother and teacher who went to the cinema every birthday, alone, as a treat she gave herself for thirty years. She preferred black-and-white films and had strong views about soundtracks. She was usually right.",
    tribute:
      "A mentor who had a film he recommended to everyone he mentored — not always the same one, always the right one. He chose them carefully and never explained his reasoning. Nobody ever needed him to.",
    birthday:
      "Sarah is turning 40 and has a list of films she insists people see before claiming to have opinions about cinema. The list is longer than most people expect and shorter than it was before she curated it.",
    retirement:
      "Thirty-five years of engineering, and David has sat through approximately six hundred films he did not choose. He is retiring with a plan to spend time watching the ones he actually wants to see, without compromise.",
    wedding:
      "Emma and James once spent a full weekend watching their respective top five films in a mutually agreed running order. The weekend settled nothing but produced a very good list. They have updated it twice since then.",
    engagement:
      "They have a film they watch at the end of every long walk — the same one, every time, regardless of what else is on. Callum can quote most of it. Sophie pretends she can't. She can.",
    anniversary:
      "Forty years together, and the television after nine o'clock on a weeknight has always been Mum's domain. Dad watches cricket when she's not looking. She has always known about the cricket.",
    leaving:
      "Priya organised the office film nights for four of her six years and kept the ratings spreadsheet running long after anyone else remembered it existed. The data still lives somewhere in the shared drive.",
    graduation:
      "Tom wrote 400 words in his final-year portfolio about the city in Blade Runner — the rain, the neon, the layering of time in space. His tutor left a note that said 'stay in architecture'. He took it as encouragement.",
    christening:
      "Lily's parents have a list of films they're planning to show her in roughly the right order as she grows up. They've been arguing about the order for months. The list is excellent.",
    achievement:
      "Marcus rewatched Chariots of Fire the night before his marathon, which he has told very few people. He raised over £4,000 for the RNLI. He maintains the film was relevant. He is not wrong.",
    recovery:
      "During her recovery, Claire watched films she had already seen before — not out of nostalgia, but because she didn't have the energy for stories she didn't already know the ending of. She has a list of the ones she went back to.",
    award:
      "Amelia has just been named Teacher of the Year. She has shown the same film to her class on the last day of every year she has taught. She says it is about what to do with your life. Her students believe her.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He has strong views about film structure that he applies openly to product decisions and has stopped pretending they are unrelated.",
    celebration:
      "Tell their story — who they are, what they love, and whether there's a film that says something true about them. A favourite film is never just a film.",
    other:
      "Tell us who this person is and why you're gathering. A film they return to, or one that meant something at a particular moment, is always worth including.",
  },

  "Film genre": {
    memorial:
      "A beloved mother and teacher who loved a film she could predict — not because she lacked imagination, but because she'd earned the right to an untroubled evening by the time she sat down for one. Anything too frightening was not permitted after dark.",
    tribute:
      "A mentor who took documentaries seriously enough to recommend them to colleagues who had not asked. He had a gift for choosing exactly the right one for exactly the right person. Nobody ever complained.",
    birthday:
      "Sarah is turning 40 with a well-established position on horror films: not under any circumstances, not for any reason, not after a conversation about something else she's misread as a thriller. She has strong views.",
    retirement:
      "Thirty-five years of engineering decisions, and David's preferred genre has always been the thriller — the pleasure of a problem being solved correctly, with authority, in under two hours. He applies similar criteria to his reading.",
    wedding:
      "Emma is a documentary person. James is a thriller person. They find common ground in heist films, which they both believe combine the best of both positions. They have watched every Soderbergh film together.",
    engagement:
      "They agree on almost everything to do with film except genre — he prefers something tense, she prefers something that makes her laugh. They have spent several years in productive negotiation. The results are usually good.",
    anniversary:
      "Forty years, and the genre question was resolved long ago: nothing too violent after nine, nothing with a sad ending if Mum's had a difficult week, and no sci-fi in general. Dad says this was a reasonable compromise. Mum says she just told him what she liked.",
    leaving:
      "Priya's film taste was something the team debated for six years without consensus. She liked experimental cinema and anything with a good heist in it, and had opinions about Indian cinema that she rarely volunteered but were always worth hearing.",
    graduation:
      "Tom studied architecture and has a corresponding position on films set in significant buildings. The Shining, he says, would be nothing without the Overlook Hotel. His housemates have learned to accept this as a conversation opener.",
    christening:
      "Lily's parents have decided, with some deliberation, to begin her film education with animation and let her lead from there. Her father has a hidden agenda involving Jurassic Park at approximately age seven. Her mother is aware of this.",
    achievement:
      "Marcus's film taste runs to sports documentaries — the kind that explain, in detail, what people are actually doing when they push through mile eighteen. He raised over £4,000 for the RNLI. He found the research useful.",
    recovery:
      "During her recovery, Claire discovered she had a greater appetite for comedy than she'd previously admitted to herself. She made a list, worked through it, and has since recommended it to other people in similar situations.",
    award:
      "Amelia has just been named Teacher of the Year and has a particular affection for films where a teacher changes a life — not because she thinks teaching is heroic, but because she knows the small version of what those films show is real.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up watching Nigerian films alongside British ones and has strong views about genre that draw from both traditions. He gives a very good recommendation when asked.",
    celebration:
      "Tell their story — who they are, what they love, and what kind of film says something true about them. Genre is always more revealing than it seems.",
    other:
      "Tell us who this person is and why you're gathering. What kind of film they reach for — and why — is a detail worth including.",
  },

  "TV show": {
    memorial:
      "A beloved mother and teacher who organised her week around two things: the garden, and the television on a Sunday evening. She considered a good drama series a serious commitment and did not take it lightly.",
    tribute:
      "A mentor who had opinions about television that he rarely shared until asked, at which point they were extensive and almost entirely correct. He had watched everything worth watching and remembered all of it.",
    birthday:
      "Sarah is turning 40 and is a reliable source of television recommendations that always arrive slightly ahead of the conversation. She has a gift for watching the right thing at exactly the right time.",
    retirement:
      "Thirty-five years of early starts meant David missed most of what happened after nine o'clock on a weeknight. He is retiring with a genuine backlog of television he is looking forward to working through.",
    wedding:
      "Emma and James have a shared list and a private list, and the distinction between them is taken seriously. Anything on the shared list requires agreement. Anything on the private list is watched in the bath or on the commute, alone, without discussion.",
    engagement:
      "They started watching a series together on the second date and it became the format for their relationship — ongoing, episodic, with occasional cliffhangers. They are now engaged. The series has been renewed.",
    anniversary:
      "Forty years, and the television in the sitting room has been the backdrop to most of their evenings. They have strong and entirely compatible views about what they like. This is, they say, the secret.",
    leaving:
      "Priya's television recommendations were always worth taking — she watched selectively, remembered everything she'd seen, and had a particular gift for knowing which series a specific person would love. The team benefited from this for six years.",
    graduation:
      "Tom has a complicated relationship with television — too busy during term, then watching four episodes at a time during the holidays. He has seen approximately half of everything he's started. He is sanguine about this.",
    christening:
      "Lily's parents have strong views about how much television is appropriate for a small child. They have agreed on a position. They reserve the right to revise it when they are more tired.",
    achievement:
      "Marcus watched a documentary about marathon running in week two of training and spent forty minutes pausing it to look things up. He raised over £4,000 for the RNLI. The documentary was, he says, part of the preparation.",
    recovery:
      "During her recovery, Claire worked through a television series she'd been putting off for three years. She watched it slowly, an episode at a time, and says it was one of the most reliable pleasures of a difficult period.",
    award:
      "Amelia has just been named Teacher of the Year. She watches documentaries about education with the specific interest of someone looking for things to disagree with. She usually finds them, and finds the disagreement useful.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He watches television strategically — one series at a time, finished before starting another — and applies the same logic to product decisions. His team has noticed.",
    celebration:
      "Tell their story — who they are, what they love, and which television programme says something true about them. A series someone returns to is always worth knowing.",
    other:
      "Tell us who this person is and why you're gathering. A favourite television programme — the one they always recommend, or the one they've watched three times — is a detail that opens up a conversation.",
  },

  // ── Category 5: Music ─────────────────────────────────────────────────────

  Song: {
    memorial:
      "A beloved mother and teacher who kept a small selection of records she played when she thought no one could hear. She knew every word to songs she wouldn't have admitted to liking. Her children knew the playlist.",
    tribute:
      "A mentor who had a song for every occasion — he said it as a joke and meant it entirely. His team learned that Waterloo Sunset meant he was thinking about London, and that London meant something was being decided.",
    birthday:
      "Sarah is turning 40 with a carefully maintained playlist she updates monthly and would share with anyone who asks. She has strong feelings about which songs go where. The order is non-negotiable.",
    retirement:
      "David has played the same three albums on the drive home every Friday night for thirty-five years. He is retiring. The drive home is becoming the drive to the course. The music is staying.",
    wedding:
      "Emma and James spent an entire evening arguing about which song to play first at their wedding and compromised on something that was neither of their first choices and turned out to be perfect. They are both very good at this.",
    engagement:
      "There is a song that came on in a coffee shop in the second week of their relationship that they have both, independently, admitted is theirs. They did not tell each other this for over a year. They found out at a wedding.",
    anniversary:
      "Forty years, and there is a song from 1984 that still comes on and makes them both stop what they're doing. They have never discussed this. They don't need to.",
    leaving:
      "Priya put together a leaving playlist for herself and shared it with exactly no one until the party, at which point it turned out to be the best thing anyone had heard at a work do. Several people asked for the list. She sent it.",
    graduation:
      "Tom graduated from four years of architecture school with a playlist that functioned as a complete autobiography of the degree. He played it on the train home. He has played it three times since.",
    christening:
      "Lily's parents have been singing to her since she was born — different songs, different voices, no particular consensus on what counts as appropriate. She seems, as far as anyone can tell, unbothered by the selection.",
    achievement:
      "Marcus trained to music for eight months, and the playlist got him through the worst mornings. He raised over £4,000 for the RNLI and stands by every track on it.",
    recovery:
      "Vienna by Ultravox played on repeat for months during Claire's treatment — not at full volume, not constantly, but reliably. It did something she couldn't quite explain. She is not embarrassed about the choice. She shouldn't be.",
    award:
      "Amelia has just been named Teacher of the Year. She has a song she plays at the end of the last lesson of every term that she has never named to her students. They now associate it with the moment the holidays begin.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He listens to music when he's thinking at his desk and has a playlist for each kind of problem. The playlists are colour-coded. This is not metaphorical.",
    celebration:
      "Tell their story — who they are, what they love, and which song says something true about this moment. The right song at the right time is always specific.",
    other:
      "Tell us who this person is and why you're gathering. A favourite song — or the one that means something particular to them — is a good way to start.",
  },

  "Music genre": {
    memorial:
      "A beloved mother and teacher who had opinions about music that surprised people who didn't know her well. She tolerated a great deal of Radio 2 cheerfully and drew a firm line at anything after the mid-90s. Both positions were deeply held.",
    tribute:
      "A mentor who could talk about jazz with the same precision he brought to everything else — where it had come from, where it had gone wrong, and why it had always been better than people who didn't know it thought.",
    birthday:
      "Sarah is turning 40 with a music taste that doesn't resolve into a single genre and never has. She knows exactly what she likes and is difficult to surprise, which is the way she prefers it.",
    retirement:
      "Thirty-five years of morning radio and David's musical opinions are largely a product of the M62 at seven in the morning. He knows more about 80s soft rock than he intended to, and has stopped being embarrassed about this.",
    wedding:
      "Emma and James had a long conversation on their third date about whether folk counts as a genre or a sensibility. Neither of them can remember how it started. They agreed to disagree and consider it a good sign.",
    engagement:
      "Callum's music taste is extremely specific. Sophie has expanded it by approximately 40% in the time they have been together, and he is grateful for this without being willing to say so directly.",
    anniversary:
      "Forty years, and the radio in the kitchen has always been on Radio 2. The music does not need to be good. It needs to be there. This is a position they share entirely.",
    leaving:
      "Priya listened to classical Indian music when she was working alone and kept this private for most of her time at the studio. She put one track on at her leaving do, very quietly, for about forty-five seconds. Several people asked what it was.",
    graduation:
      "Tom's music taste was formed almost entirely in the studio at two in the morning, when the default playlist ran out and someone had to make a decision. He made a lot of decisions and has strong opinions as a result.",
    christening:
      "Lily's parents disagree about what to play in the house. Her father says the baby can't tell. Her mother says that's exactly why it matters. This argument has not been resolved.",
    achievement:
      "Marcus trained to a very specific rotation of music — rock for the long runs, electronic for the intervals, and nothing at all for the hills, because he needed to hear himself breathe. He raised over £4,000 for the RNLI. The system worked.",
    recovery:
      "During her recovery, Claire's relationship with music changed. She stopped being able to listen to some things she had always liked and found others she'd dismissed suddenly working. She does not overthink this. She just follows it.",
    award:
      "Amelia has just been named Teacher of the Year. She teaches the history of popular music as part of a unit on postwar Britain that is technically about something else. The music section is always the longest. No one complains.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up with highlife, comes from a musical family, and plays bass in a band that performs exactly twice a year at venues that seat fifty people. He loves it.",
    celebration:
      "Tell their story — who they are, what they love, and what kind of music they gravitate towards. Genre is always more personal than it appears.",
    other:
      "Tell us who this person is and why you're gathering. The kind of music they listen to — or can't stand — is always worth knowing.",
  },

  "Music era": {
    memorial:
      "A beloved mother and teacher who came of age listening to the radio in the 1960s and never fully left that decade behind. She kept her records through every house move and played them without apology.",
    tribute:
      "A mentor who believed the 1970s produced the most interesting music anyone had made and was prepared to argue this at considerable length. He was consistently good company when doing so.",
    birthday:
      "Sarah is turning 40 and her relationship with music eras is practical: she knows what she liked then and she knows what she likes now, and she sees no reason to resolve them into a hierarchy.",
    retirement:
      "David spent the 1980s working too hard to pay proper attention to what was playing, and is now, in retirement, going back through it. He says it's better than he remembered. It is.",
    wedding:
      "Emma and James have a music era argument that has run for the length of their relationship. It is warm, recurring, and neither of them expects to win. This is the arrangement.",
    engagement:
      "Callum has strong opinions about 90s Britpop that he delivers with complete conviction. Sophie has let this run and only occasionally intervenes. When she does, she is always right.",
    anniversary:
      "Forty years together began in the early 1980s, and they met to the music of that decade. It still plays sometimes and makes them both stop. They have never discussed which era is their favourite. They don't need to.",
    leaving:
      "Priya's relationship to music eras was genuinely complicated — she'd grown up between two musical traditions, two decades, and two very different ideas about what pop music was supposed to do. She had opinions about all of it.",
    graduation:
      "Tom graduated from architecture school with the conviction that nothing musically interesting had happened in the years he was studying. He has since been corrected. He is catching up.",
    christening:
      "Lily's parents have agreed that she will be raised in a house that plays music from a wide range of eras, so she can form her own opinions. They have agreed to disagree about which era gets the most airtime.",
    achievement:
      "Marcus's training playlist was largely formed in a particular era — the kind of anthems that were made to be played at high volume while doing something difficult. He raised over £4,000 for the RNLI. The era chose him.",
    recovery:
      "During her recovery, Claire went back to the music she had loved at a specific point in her life — the era when everything felt urgent. She played it quietly. It did what it was supposed to do.",
    award:
      "Amelia has just been named Teacher of the Year. She teaches a unit on the music of the 1960s that is the most requested lesson of the year. She says the era matters because it was the first time teenagers understood they were a generation. Her students always feel this applies to them.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He has a map of musical eras he can walk you through from highlife in the 60s to Afrobeats now, and finds it genuinely useful for understanding how culture changes.",
    celebration:
      "Tell their story — who they are, what they love, and which musical era they feel most themselves in. The era someone returns to is always the one that shaped them.",
    other:
      "Tell us who this person is and why you're gathering. A favourite musical era — and what it gave them — is always worth including.",
  },

  Instrument: {
    memorial:
      "A beloved mother and teacher who played the piano badly and with great enjoyment for fifty years. She said she had never been good and had never needed to be. Her children learned to ignore the wrong notes.",
    tribute:
      "A mentor who played guitar — nothing impressive, always enough. He kept one at the office for twelve years and used it to end difficult meetings by changing the subject abruptly. This worked more often than it should have.",
    birthday:
      "Sarah is turning 40 and plays the violin with more ambition than the neighbours would describe as appropriate for a Tuesday evening. She has been doing so since she was eight. She has no plans to stop.",
    retirement:
      "David is retiring with a plan to return to the piano he played until he was twenty-two, put down, and never properly picked up again. The piano is still in the sitting room. It has been waiting.",
    wedding:
      "Emma plays piano. James does not play anything, but has been known to provide backing vocals at sufficient volume that neighbours have knocked. This is their domestic arrangement and both of them are happy with it.",
    engagement:
      "Neither of them plays an instrument, which they have decided is fine. Callum has discussed learning the guitar on approximately six occasions. Sophie has been supportive. No guitar has yet been purchased.",
    anniversary:
      "Mum played piano until she was twenty-five. She says she doesn't miss it. She has said this for forty years. The sheet music is still in the box under the spare room bed.",
    leaving:
      "Priya played tabla as a child and says she never got good enough for it to matter. Her colleagues who heard her play at the studio's summer do disagree. She says they're being polite. They are not.",
    graduation:
      "Tom played French horn in his school orchestra for six years and considers this the thing he most regrets giving up. He is not sure what he would do with it now. He thinks about it occasionally.",
    christening:
      "Lily's grandmother has already suggested piano lessons. Her parents have said they'll wait and see what Lily gravitates towards. Her grandmother has said this is a reasonable position and also that the piano is available.",
    achievement:
      "Marcus can play the piano to a basic standard — enough to play one song well at a party and then politely decline to play more. He raised over £4,000 for the RNLI. The piano was not part of the training plan.",
    recovery:
      "During her recovery, Claire started playing the piano again for the first time since her twenties — slowly, quietly, from memory. She says it was not for anyone else to hear. She says this is why it helped.",
    award:
      "Amelia has just been named Teacher of the Year and once arranged for a string quartet to play in her classroom on the last day of term, funded by arts budget she'd been quietly not spending for three years. Her students still mention it.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He plays bass guitar in a band that gigs twice a year in small venues and takes it seriously enough that he practises twice a week without fail.",
    celebration:
      "Tell their story — who they are, what they love, and whether there's an instrument that says something true about them. Played, given up, or just admired — it's always a good detail.",
    other:
      "Tell us who this person is and why you're gathering. A favourite instrument — or one they play, or wish they'd learned — is a detail that opens up something interesting.",
  },

  "Type of song": {
    memorial:
      "A beloved mother and teacher who knew every lullaby and every hymn and could move between them without transition. She sang in the kitchen without noticing she was doing it. Her children knew every word before they knew they did.",
    tribute:
      "A mentor who could always choose the right song for a moment — the send-off, the celebration, the leaving do. He had an instinct for the anthemic that nobody could quite explain. He would have been modest about this.",
    birthday:
      "Sarah is turning 40 and has a clear position on birthday songs: they must be in the right key, sung with conviction, and not ended awkwardly. She has attended enough birthday dinners to have strong opinions about all three.",
    retirement:
      "Thirty-five years in the same company, and David sat through the send-off they gave him with the composure of someone who had been quietly dreading the singing part. He was wrong to worry. They got it right.",
    wedding:
      "Emma and James discussed their first dance song for six months and landed on something nobody expected, that turned out to be perfect, and that is now their answer to every question about what makes a good song.",
    engagement:
      "Callum proposed with no song playing — just wind on Arthur's Seat and two red grouse in the heather. Sophie has since decided this was the right call. Callum had not planned for ambient sound. It worked anyway.",
    anniversary:
      "Forty years, and the song from their wedding still plays sometimes and makes them both stop what they're doing. They have never agreed on what type of song it is. They agree it's still theirs.",
    leaving:
      "Priya put together her own leaving playlist and nobody was surprised that it was excellent or that it mixed genres in ways that shouldn't work and did. She sent it to the group chat. Several people still listen to it.",
    graduation:
      "Tom's graduation playlist was built for the train home and consisted almost entirely of songs that felt like endings. He was very happy that day. He says this is not a contradiction.",
    christening:
      "Lily's parents have been debating which songs to sing to her. They've landed on a combination of pop songs, traditional hymns, and at least one from a film they both love. She seems, as far as anyone can tell, content with the selection.",
    achievement:
      "Marcus has a very specific relationship with anthems — the kind of song that, heard at the right moment, at the right volume, makes you believe you can do it. He raised over £4,000 for the RNLI. He knows exactly which songs those are.",
    recovery:
      "During her recovery, Claire found herself unable to listen to sad songs and unable to listen to aggressively cheerful ones either. She found a third category she hadn't previously named, and it got her through.",
    award:
      "Amelia has just been named Teacher of the Year. She has a song she plays at the end of the last lesson of every term that she has never named to her students. They have been Shazaming it for years. She knows. They know she knows.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He plays bass, which means he has views on songs that most people don't have — what makes a line work, what makes a song hold. He applies this to presentations. It shows.",
    celebration:
      "Tell their story — who they are, what they love, and what kind of song this occasion calls for. The type of song that fits a moment is always worth knowing.",
    other:
      "Tell us who this person is and why you're gathering. What kind of song belongs to this occasion — or to this person — is a good way to start.",
  },

  // ── Category 6: Food & Drink ──────────────────────────────────────────────

  Drink: {
    memorial:
      "A beloved mother and teacher who made tea the way she did everything — without ceremony, without asking what you wanted, and absolutely correctly. The kettle was always on. The cup was always right.",
    tribute:
      "A mentor who had a whisky he liked and did not apologise for knowing exactly which one it was. He kept it at home, served it to people who arrived for the right kind of conversation, and understood the difference between an occasion and a regular evening.",
    birthday:
      "Sarah is turning 40 with strong opinions about coffee that she has been developing, refining, and defending for most of her adult life. She is not a snob about it. She is simply right.",
    retirement:
      "Thirty-five years of bad office coffee, and David is retiring with a plan to finally use the coffee machine he has been ignoring since Christmas 2021. He has been told it is very good. He is prepared to find out.",
    wedding:
      "Emma and James met at a festival, where the coffee was inadequate. They have been compensating for this ever since. She has strong opinions about coffee. He has equally strong opinions about tea. The flat has both.",
    engagement:
      "Callum packed a thermos for the walk up Arthur's Seat on New Year's Day. Sophie, at the top, with the ring in her face, accepted a cup of hot coffee from a man who had planned everything correctly. She has not forgotten this.",
    anniversary:
      "Forty years, and the pot of tea after dinner has been the same ritual every evening of all of them. Whoever finishes first puts the kettle on. This is not a rule. It has never needed to be.",
    leaving:
      "Priya always had strong opinions about the coffee in the studio — specific, accurate, and entirely correct. Six years of getting it right, and she spent her last morning in the building making a round for everyone before she left.",
    graduation:
      "Tom graduated from four years of architecture school on approximately the same amount of caffeine it took to build the Sydney Opera House. He has since discovered the natural sleep cycle. He is in favour of it.",
    christening:
      "Lily's parents are running entirely on coffee at present. They are grateful for coffee. They are grateful for everyone who has made them coffee. Lily is, as yet, on a different programme.",
    achievement:
      "Marcus monitored his hydration with a seriousness that his training partner called excessive and that the sports science research validates entirely. He raised over £4,000 for the RNLI. He knows exactly what he drank at every mile marker.",
    recovery:
      "During her treatment, Claire's relationship with drinks simplified: whatever was warm, whatever stayed down, whatever felt like a small ordinary pleasure. Tea, mostly. She is now celebrating a year of recovery and has expanded the list considerably.",
    award:
      "Amelia has just been named Teacher of the Year. She runs on tea from approximately seven in the morning and has a specific mug she uses throughout the school day that her students have been told not to touch. Nobody has ever tested this.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He drinks a flat white, two sugars, every morning at precisely the same time. This has not wavered once in three years. He considers consistency a virtue.",
    celebration:
      "Tell their story — who they are, what they love, and what they drink. The drink someone has without thinking about it is always more revealing than the one they order to impress.",
    other:
      "Tell us who this person is and why you're gathering. A favourite drink — the everyday one, not the occasion one — is a small detail that often says a lot.",
  },

  "Comfort food": {
    memorial:
      "A beloved mother and teacher who cooked for people because feeding someone was how she showed she had been thinking about them. She had a soup she made in winter that people asked about for decades. Nobody has ever quite replicated it.",
    tribute:
      "A mentor who understood that the right food at the right moment was a form of care. He arrived with good bread and good cheese at every occasion that required it. He always knew which occasions those were.",
    birthday:
      "Sarah is turning 40 and has never met a cheese she didn't like. She describes this as a philosophy rather than a preference. Her dinner party cheese boards are the kind people talk about on the way home.",
    retirement:
      "David's comfort food is the fish and chips from a van on the seafront where he grew up — something he has been trying to explain to people for thirty-five years. They agree the description is compelling. They have not made the journey. They should.",
    wedding:
      "Emma and James have been arguing about the best pizza in Naples since 2019. They have, at this point, eaten their way through a reasonable portion of the city and have not resolved it. They consider the research ongoing.",
    engagement:
      "After every long walk, Callum makes soup. He has been doing this since the second date. Sophie did not know it was deliberate until the proposal. It was always deliberate.",
    anniversary:
      "Forty years, and the Sunday roast has never changed in recipe, method, or timing. Mum does the meat. Dad does the roasties. The vegetable question has been in negotiation since 1987 and shows no sign of resolution.",
    leaving:
      "Priya said dal made any flat feel like home — not fancy dal, the kind her mother made, the kind that didn't need explaining. She cooked a batch for the studio leaving do. People have been asking for the recipe for three months.",
    graduation:
      "Tom survived four years of architecture school on the contents of exactly two recipe books and considers himself a reasonable cook as a result. He has strong opinions about what constitutes a meal and what does not.",
    christening:
      "Lily's grandmothers have both offered to cook in the weeks ahead, and both have strong views about what a new mother should be eating. Lily's parents are grateful. They are also navigating this carefully.",
    achievement:
      "Marcus spent eight months thinking very carefully about what he ate and when, and raised over £4,000 for the RNLI. He says the carb-loading dinner the night before the marathon was the most he has ever enjoyed a bowl of pasta. He is not exaggerating.",
    recovery:
      "During her treatment, eating was sometimes difficult and sometimes fine and rarely predictable. Claire made a list of the food that worked. She is now celebrating a year of recovery and slowly cooking her way back through everything she missed.",
    award:
      "Amelia has just been named Teacher of the Year. She has been known to bring homemade biscuits to parents' evenings and denies doing this strategically. She is strategic about everything. The biscuits work.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He cooks jollof rice and stew on Sundays — the things his grandmother made — and says this is the meal that holds the week together. Several colleagues have been invited and have not forgotten it.",
    celebration:
      "Tell their story — who they are, what they love, and what they reach for when they need feeding properly. Comfort food is always personal, always specific, always worth knowing.",
    other:
      "Tell us who this person is and why you're gathering. A favourite comfort food — the thing they make or order when they most need it — is a detail that says something real.",
  },

  Biscuit: {
    memorial:
      "A beloved mother and teacher who considered a Digestive the correct biscuit for almost every occasion and held this position with quiet authority. She didn't argue the point. She just put them on the plate.",
    tribute:
      "A mentor who had a biscuit he preferred, kept them at his desk, and offered them to people during difficult conversations. This was known to work. Nobody has been able to explain why.",
    birthday:
      "Sarah is turning 40 with very firm opinions about biscuits, formed over many years and not open to revision. She has been known to eat four packets of Bourbons in one sitting without apology. She considers this relevant context.",
    retirement:
      "Thirty-five years of biscuits at meetings, and David has eaten more Digestives in one building than he can reasonably account for. He is retiring. He says he will not miss them. He may be wrong about this.",
    wedding:
      "Emma and James have a biscuit disagreement that is purely theoretical because neither of them buys biscuits regularly enough to test it. They agree they should do more testing. They have not yet managed this.",
    engagement:
      "Callum packed biscuits for the New Year's Day walk — the same ones, every long walk, for as long as they've been walking together. Sophie knows the brand. She would not accept a substitution.",
    anniversary:
      "Forty years, and the biscuit tin has always been in the same cupboard with the same contents. Mum puts them on the plate. Dad eats them. This is not in question.",
    leaving:
      "Priya was very clear about biscuits. She had a preferred brand, knew her reasons, and kept them at her desk not as a statement but as a fact. The desk is empty. The preferred brand is still correct.",
    graduation:
      "Tom survived architecture school partly on biscuits and caffeine, and is only now appreciating that this was not a sustainable strategy. He has not given up biscuits. He has merely contextualised them.",
    christening:
      "Lily's parents have been sustained, in part, by the biscuits that have appeared on their doorstep from various family members over the past three months. They are grateful for all of them. All biscuits are welcome.",
    achievement:
      "Marcus says a biscuit at mile twenty-two is a more complex emotional experience than it sounds. He raised over £4,000 for the RNLI. He had a specific biscuit in mind for the finish line. He has not named it publicly. He chose correctly.",
    recovery:
      "During her treatment, there were things Claire could eat and things she couldn't. Biscuits were almost always on the right side of the line. She has strong feelings about this category as a result.",
    award:
      "Amelia has just been named Teacher of the Year and has been bringing biscuits to parents' evenings since 2017. She denies doing this strategically. This is not credible. The biscuits work every time.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He does not eat biscuits at his desk. He has strong opinions about which ones he would eat if he did. His team has found this information more useful than expected.",
    celebration:
      "Tell their story — who they are, what they love, and which biscuit, if any, says something true about them. Biscuit opinions are always more revealing than they appear.",
    other:
      "Tell us who this person is and why you're gathering. A biscuit preference — or the complete absence of one — is a small detail that always gets a response.",
  },

  // ── Category 7: Sport ─────────────────────────────────────────────────────

  "Sport to watch": {
    memorial:
      "A beloved mother and teacher who watched cricket on the radio, not the television, and considered this perfectly normal. She followed every ball of a Test match and could discuss the day's play with authority. Her colleagues at school found this surprising. It was not.",
    tribute:
      "A mentor who had been to every major football ground in England by the time he was thirty and had strong views about each one. He was not a stadiums person. He was a football person. The distinction mattered to him.",
    birthday:
      "Sarah is turning 40 and watches tennis every summer with the seriousness of someone who knows exactly what's happening and feels no need to explain it. She has opinions about most players. She shares them selectively.",
    retirement:
      "David has followed the same football club since he was seven years old and spent thirty-five years listening to commentary on the motorway. He is retiring. He now has time. He has not worked out what to do with this.",
    wedding:
      "Emma and James have exactly one sport they both watch, discovered on their second holiday, at the back of a pub in rural Portugal, watching a match neither of them could have predicted they would care about. They have watched it together ever since.",
    engagement:
      "Callum watches rugby. Sophie watches athletics. They are both extremely invested in these positions and show no signs of converging. This is considered a feature of the relationship.",
    anniversary:
      "Forty years, and the sport on the television has always been Dad's department. Mum reads on the other sofa and is more informed than anyone expects when the conversation turns to it.",
    leaving:
      "Priya's desk had a printed IPL fixture list pinned to it every season, and she defended this scheduling choice without apology. The office became, during those weeks, slightly more familiar with cricket. She considered this an improvement.",
    graduation:
      "Tom followed his home football club from two hundred miles away throughout his degree and considers this a form of loyalty that architecture school did nothing to test. He made it to three away games in four years. He is proud of this.",
    christening:
      "Lily's parents have agreed that they will not impose their sporting loyalties on her — she will be free to choose. Lily's grandfather has noted this agreement and is acting accordingly.",
    achievement:
      "Marcus watched the London Marathon as a spectator three times before running it himself. He said watching it is completely different once you've done it. He raised over £4,000 for the RNLI. He now says both things are true.",
    recovery:
      "During her recovery, Claire started watching sport in a way she never had before — not obsessively, but gratefully. The rhythm of a game, the time it took, the fact that it demanded nothing of her. She found this more useful than she expected.",
    award:
      "Amelia has just been named Teacher of the Year. She coaches netball on Thursday afternoons and considers this entirely unrelated to her teaching award, even though it is not.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He follows Ghanaian football and the Premier League with equal seriousness and has strong views about both. He is usually right.",
    celebration:
      "Tell their story — who they are, what they love, and which sport they follow. The sport tells you something about the person; the team tells you everything else.",
    other:
      "Tell us who this person is and why you're gathering. A sport they follow — and how they follow it — is always worth knowing.",
  },

  "Sport to play": {
    memorial:
      "A beloved mother and teacher who played tennis until she was sixty-two and stopped only when her knees decided for her. She was competitive in the way that people who insist they play purely for the enjoyment of it always are.",
    tribute:
      "A mentor who played squash for thirty years, stopped, and immediately became evangelical about walking. He brought the same intensity to both. His colleagues enjoyed the transition.",
    birthday:
      "Sarah is turning 40 with a hiking habit that she does not describe as a sport but which involves specialist gear, carefully planned routes, and a level of commitment that suggests otherwise.",
    retirement:
      "David is retiring and picking up his golf clubs for good. He has played off twelve for fifteen years and has never once been satisfied with a round. He is looking forward to having more time to be unsatisfied in better locations.",
    wedding:
      "Emma plays in a five-a-side team on Tuesday evenings and will not reorganise her schedule for anything that is not a wedding, a flight, or a family emergency. James considers this admirable. The team agrees.",
    engagement:
      "They walk together every weekend, with a very clear division of responsibility: Callum plans the route and pace, Sophie decides when to stop for lunch. This has never caused an argument. It has prevented several.",
    anniversary:
      "Forty years together and they've always taken a walk on a Sunday — not quite a sport, just a walk. They've kept it up through every kind of weather and every kind of year.",
    leaving:
      "Priya ran three mornings a week, quietly, without telling anyone about it, for most of her time at the studio. Her colleagues found out when her Strava appeared in someone's contacts and were uniformly unsurprised.",
    graduation:
      "Tom plays five-a-side with the same group he met in freshers' week and considers this one of the more useful things university gave him. He is not a natural athlete. He is very committed. His team appreciates the distinction.",
    christening:
      "Lily's father was a decent county-level rower in his twenties and has spent three months telling himself this qualifies him for parenthood. It does not. He is discovering this. He remains in good physical shape.",
    achievement:
      "Marcus ran his first marathon in October after eight months of training — mostly before dawn, mostly in the rain — and raised over £4,000 for the RNLI. He says he is now a runner. He was always a runner. He just needed the marathon to confirm it.",
    recovery:
      "During her recovery, Claire started with short walks and built from there. By spring she was doing a weekly yoga class. She describes this as discovering the whole category of sport she had not previously been interested in. She is now interested.",
    award:
      "Amelia has just been named Teacher of the Year. She plays netball on Thursday afternoons and runs the lunchtime table tennis club, both of which she takes seriously and neither of which she considers sport so much as infrastructure.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He plays basketball on Sunday mornings with a group he has played with for four years. He says it is the only time of the week he is not thinking about product. This is probably not true.",
    celebration:
      "Tell their story — who they are, what they love, and which sport says something true about them. The sport someone plays is always more revealing than the sport they watch.",
    other:
      "Tell us who this person is and why you're gathering. A sport they play — or played, or wish they'd taken further — is a detail worth including.",
  },

  "Form of exercise": {
    memorial:
      "A beloved mother and teacher who walked everywhere and did not consider this exercise. She considered it transport and fresh air. The effect was the same. She was, in her eighties, still outpacing most people on a footpath.",
    tribute:
      "A mentor who walked the full length of the South Downs Way alone every summer and arrived back to work on Monday as if he had merely had a reasonable weekend. His colleagues eventually stopped pretending not to be impressed.",
    birthday:
      "Sarah is turning 40 and hikes with a dedication that her friends describe as admirable and her joints describe as optimistic. She considers this a false distinction and sees no reason to slow down.",
    retirement:
      "David is retiring with a plan to walk the golf course rather than take the buggy. He has thought about this for a long time. He says golf played properly is simply walking with objectives. This is not wrong.",
    wedding:
      "Emma runs. James cycles. They have had this conversation many times and have agreed they are both right and both wrong in approximately equal measure. The commitment to each activity is not in question.",
    engagement:
      "They have been walking together since the second date and have never once discussed whether walking counts as exercise. It counts as the point. The fitness is incidental and welcome.",
    anniversary:
      "Forty years, and the Sunday walk has never been cancelled. Not for weather, not for illness. The walk is the walk. It has been the walk for forty years.",
    leaving:
      "Priya cycled to the studio every day for six years regardless of what the Manchester weather was doing. Several colleagues tried it after her leaving do. Several are still going.",
    graduation:
      "Tom walked everywhere at university — partly because he had no money for anything else, partly because he was studying the built environment and walking was, he maintains, research. He still walks wherever he can.",
    christening:
      "Lily's parents have been informed that pushing a pram is excellent cardiovascular exercise. They are grateful for this framing. They are also very tired.",
    achievement:
      "Marcus ran eight months of early-morning training in preparation for the marathon and raised over £4,000 for the RNLI. He says running is the closest thing he's found to thinking. He is not the first person to have discovered this.",
    recovery:
      "During her recovery, Claire built her way back to exercise slowly and deliberately — short walks first, then longer ones, then swimming once a week. She describes this as discovering what her body could do again. She is still finding out.",
    award:
      "Amelia has just been named Teacher of the Year. She walks to school every day, has always walked to school, and considers the twenty-five minutes each way the best preparation for teaching she has found.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He plays basketball on Sunday mornings, walks to work when the weather allows, and considers both forms of exercise necessary rather than optional.",
    celebration:
      "Tell their story — who they are, what they love, and how they move. The form of exercise someone chooses — or refuses to call exercise — is always specific.",
    other:
      "Tell us who this person is and why you're gathering. A favourite form of exercise — the one they actually do, not the one they say they're going to start — is always a revealing detail.",
  },

  // ── Category 8: Childhood ─────────────────────────────────────────────────

  "Childhood game": {
    memorial:
      "A beloved mother and teacher who remembered every playground game she had ever played and could be persuaded to explain the rules of conkers to anyone who asked. She had been a formidable conkers player. She admitted this freely.",
    tribute:
      "A mentor who talked about childhood games with the authority of someone who had thought carefully about what they were teaching. He had strong opinions about hide and seek. The opinions were, on reflection, about leadership.",
    birthday:
      "Sarah is turning 40 and is the kind of adult who gets genuinely invested in board games at Christmas and has never once let anyone win. Her family has described this variously. She considers it consistency.",
    retirement:
      "David grew up in an era when the street itself was the playground, and is fond of describing games that his children's generation has never heard of. His grandchildren have become more interested in this than he expected.",
    wedding:
      "Emma and James discovered on their first Christmas together that they have entirely different relationships to competitive games. He wins quietly. She wins loudly. Both of them enjoy this more than they expected.",
    engagement:
      "Sophie was particularly good at orienteering as a child, which, she says, is exactly the kind of preparation for life that it sounds like. Callum has since learned to read a topographic map. He agrees with her assessment.",
    anniversary:
      "Forty years, and they still play cards on long evenings — the same games, the same pack. The score has never been formally tracked. Both of them have a number in their head.",
    leaving:
      "Priya once organised a team game for an away day that involved clues, a map of Manchester, and a level of logistical complexity she executed entirely from a spreadsheet. It was the best away day anyone could remember. She never explained how she did it.",
    graduation:
      "Tom played cricket in the summer and football in the winter for most of his childhood and says both taught him something about how a team should work. He applied this to group projects throughout his degree with mixed results.",
    christening:
      "Lily's room is already full of the toys her parents have decided she will love. She will probably love none of them and develop a strong opinion about a toy no one expected. This is considered a feature of childhood.",
    achievement:
      "Marcus grew up near the coast and spent much of his childhood in informal swimming races and waterside games that required no equipment and produced no record. He gave to the RNLI because the sea was always the point. He raised over £4,000 for them when he ran his marathon.",
    recovery:
      "During her recovery, Claire started thinking about games she had played as a child — not playing them, just thinking about them. She said it was useful to remember what it felt like to be fully absorbed in something that didn't matter.",
    award:
      "Amelia has just been named Teacher of the Year. She uses games in her classroom with intention and has a theory about which childhood games produce better collaboration than others. The theory is correct. She has tested it.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up playing oware — a Ghanaian strategy game — and says it taught him more about product thinking than any course he has taken. He is not wrong.",
    celebration:
      "Tell their story — who they are, what they love, and which childhood game says something true about them. The games we played earliest are often the ones that show us most.",
    other:
      "Tell us who this person is and why you're gathering. A favourite childhood game — and what it says about how they think — is a detail worth including.",
  },

  "School subject": {
    memorial:
      "A beloved mother and teacher who loved English — not because she taught it, but because she had loved it since she was nine years old and never stopped. She could recite whole poems from memory until the end. She was never asked to prove this. She always did.",
    tribute:
      "A mentor who had been best at history, which everyone who knew him would have guessed immediately. He believed that understanding the past was the only honest preparation for the future. He applied this to everything.",
    birthday:
      "Sarah is turning 40 and maintains that geography was the only school subject that ever made her feel like she was learning something useful. She has since taken this position on a great many hiking routes. It has proved correct.",
    retirement:
      "David loved mathematics from the first lesson and has never stopped loving it. Thirty-five years of engineering was, he says, just applied maths. He is correct, and he always knew it.",
    wedding:
      "Emma was best at English. James was best at physics. They have since agreed that this explains most things about their relationship, and cannot agree on which is which.",
    engagement:
      "Callum was best at geography, which Sophie says explains the meticulous route planning, the topographic map reading, and the fact that he chose the exact right hillside in October. He accepts this analysis.",
    anniversary:
      "Forty years together, and it turns out they were best at entirely different things at school — a fact they discovered on about the third date and found, and continue to find, quite interesting.",
    leaving:
      "Priya was best at art, which anyone who has worked with her would immediately recognise. She spent six years applying this at the studio in ways that made the building feel different. The building feels different now that she's gone.",
    graduation:
      "Tom was best at art and maths at school and considers this entirely consistent with going into architecture. He has explained this to anyone who has asked. Several people have found it illuminating.",
    christening:
      "Lily's parents have strong and conflicting views about which school subjects matter most. They plan to let her decide for herself. They are, in practice, already preparing arguments for their respective positions.",
    achievement:
      "Marcus was best at biology at school, which is the only subject he will tell you prepared him for the marathon — eight months of understanding exactly what his body was doing. He raised over £4,000 for the RNLI. He considers this relevant.",
    recovery:
      "During her recovery, Claire found herself reading things she hadn't read since school — not out of nostalgia, exactly, but because they required a level of effort she could control. She made her way through several poets. She says she should have paid more attention the first time.",
    award:
      "Amelia has just been named Teacher of the Year. She loved English at school and says she became a teacher because of one English lesson, aged fourteen, that she still remembers word for word. She has tried to give the same lesson to her own students. Several of them remember it.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He was best at maths at school and says this is the least interesting thing about him. He is probably right. He is also very good at maths.",
    celebration:
      "Tell their story — who they are, what they love, and which school subject said something true about them. The subject someone was best at is rarely the one they expected.",
    other:
      "Tell us who this person is and why you're gathering. A favourite school subject — or the one that shaped them most — is a small detail that opens up a conversation.",
  },

  // ── Category 9: Literature ────────────────────────────────────────────────

  "Type of book": {
    memorial:
      "A beloved mother and teacher who read steadily throughout her life and was never without a book. She preferred novels to almost everything else, and particularly novels where things happened slowly. She said the slow ones were the honest ones.",
    tribute:
      "A mentor who read widely and recommended precisely. He once gave a colleague a book of African history at a moment when the colleague needed it and has never explained how he knew. The colleague has never forgotten it.",
    birthday:
      "Sarah is turning 40 with a reading pile that is, by her own estimate, three years deep. She manages it without guilt. She reads whatever she wants, when she wants, and considers this the correct approach to all reading.",
    retirement:
      "David read engineering texts throughout his working life and is retiring with a plan to read everything else. He has a list. The list is organised by category, then by priority within each category. He started on Monday.",
    wedding:
      "Emma reads fiction. James reads non-fiction. They have never read the same thing at the same time and have been exchanging the results of this arrangement for five years. Both are better-read as a result.",
    engagement:
      "Callum reads maps and route guides the way other people read novels — hungrily, at pace, making notes in the margins. Sophie reads actual novels. They have agreed these are not competing activities.",
    anniversary:
      "Forty years, and there has always been a book on each bedside table — different books, different tastes, no obligation to share. They recommend things to each other sometimes. They don't always agree. This is fine.",
    leaving:
      "Priya had a book at her desk at all times and was known to read during every lunch break she took. She was protective of this habit and the team was protective of her lunch breaks. This was a mutually beneficial arrangement.",
    graduation:
      "Tom spent four years reading about buildings and is now reading about everything else. He is making up for lost time with the specific urgency of someone who has just realised how much there is.",
    christening:
      "Lily's shelves are already full. She has books from four grandparents, two godparents, several family friends, and a pile from her parents that they bought before she arrived. The reading programme has already been debated.",
    achievement:
      "Marcus read extensively about marathon running before he started training — the physiology, the psychology, the stories of people who had done it badly and then done it right. He raised over £4,000 for the RNLI. He considered the reading preparation.",
    recovery:
      "During her treatment, Claire read slowly, sometimes the same pages twice, occasionally not at all. She found that what she could read shifted as the weeks went on, and that tracking this was, unexpectedly, a way of measuring how she was doing.",
    award:
      "Amelia has just been named Teacher of the Year. She has been reading fiction aloud to her class for eleven years — one chapter at a time, after lunch on Fridays. She says it is the most useful thing she does. Several ex-students have told her they remember every book.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He reads one book at a time, always finishes it, and does not begin the next one until he has thought about the previous one for at least a week. His team finds this disciplined. He finds it natural.",
    celebration:
      "Tell their story — who they are, what they love, and what kind of book says something true about them. A reading habit is always a window into something.",
    other:
      "Tell us who this person is and why you're gathering. A favourite type of book — or the kind they always come back to — is a detail worth including.",
  },

  Poet: {
    memorial:
      "A beloved mother and teacher who could recite poetry from memory across six decades. She didn't announce it. She just produced the lines when they were needed. People learned to recognise when they were needed.",
    tribute:
      "A mentor who loved poetry and said so without apology. He kept a collection on his desk — not for show — and used it in the same way other people use conversations: to see if you were paying attention.",
    birthday:
      "Sarah is turning 40 with exactly one poet she actively recommends and approximately forty she's been meaning to read. She is working through the list. She says she's in no hurry. She is in a hurry.",
    retirement:
      "David would not have described himself as a poetry person until he read something his daughter gave him at sixty-two that he has not been able to get out of his head since. He now has three collections on his bedside table. He is not sure what to do with this.",
    wedding:
      "Emma read a poem at their ceremony that she had written herself, which James only found out about the night before. He considered this the best possible surprise. He still does.",
    engagement:
      "Callum carries a small anthology of walking poetry in his rucksack — not every walk, but enough that Sophie has stopped finding it surprising. She read one once. She asked to read another. She has said nothing further about this.",
    anniversary:
      "Forty years together, and Mum reads poetry. Dad reads it with her, sometimes, and does not tell her how much he gets from it. She knows. He knows she knows.",
    leaving:
      "Priya left a printed poem on each desk on her last morning. No explanation, no note. People found them when they arrived. Everyone remembered which one they got. Several have kept them.",
    graduation:
      "Tom's architecture tutor told his class that all architects should read more poetry because poetry does in six lines what architecture tries to do in six storeys. Tom has been thinking about this for four years.",
    christening:
      "Lily's parents have memorised exactly one poem for the christening, which they will recite at an appropriate moment. They are not sure when the appropriate moment is. They have been practising.",
    achievement:
      "Marcus says the experience of running alone for hours changes your relationship to language — things that would otherwise be sentimental become simply accurate. He raised over £4,000 for the RNLI. He has since read more poetry than he expected to.",
    recovery:
      "During her recovery, Claire found that short things worked better than long things. Poetry, particularly. She read a great deal of it, slowly, in the middle of the night, and found it sufficient. She still reads it.",
    award:
      "Amelia has just been named Teacher of the Year. She begins every academic year with a poem and has done so for eleven years. The poem changes. The reason for doing it doesn't.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He read extensively at university and has maintained the habit, including poetry, which he reads for the same reason he reads everything: to understand how people think.",
    celebration:
      "Tell their story — who they are, what they love, and whether there's a poet who says something true about them. A favourite poet is rarely just a preference.",
    other:
      "Tell us who this person is and why you're gathering. A poet they love, or a poem that mattered at a particular moment, is always worth including.",
  },

  // ── Category 10: Everyday life ────────────────────────────────────────────

  Hobby: {
    memorial:
      "A beloved mother and teacher whose hobby was her garden — not casually, but seriously, with notebooks and seed catalogues and a working knowledge of soil pH. She said it was the only thing she did that was entirely for herself.",
    tribute:
      "A mentor who read as a hobby, walked as a hobby, and cooked as a hobby — all of them pursued with the same precision he brought to his work. He said the distinction between work and leisure was a useful fiction.",
    birthday:
      "Sarah is turning 40 with an elaborate dinner-party habit that her friends describe as a hobby and she describes as a passion. She plans menus weeks in advance and considers no detail too small to think about. The food is always excellent.",
    retirement:
      "David is retiring and picking up his golf clubs for good. He has also been intending to build a model railway in the garage since approximately 2015. He now has time for both. He is starting with the golf.",
    wedding:
      "Emma and James both have hobbies they pursue alone — she runs, he plays guitar — and consider this excellent infrastructure for a relationship. Neither has ever suggested the other's hobby is less important. This has been noticed.",
    engagement:
      "Their shared hobby is walking, though they would both resist this word — it's less a leisure activity and more the frame through which they see the world. They plan routes. They argue about routes. They walk anyway.",
    anniversary:
      "Forty years, and both of them have had hobbies the other has supported without particularly sharing. Dad's garden has always been his. Mum's reading group has always been hers. Neither fact has ever been a problem.",
    leaving:
      "Priya's hobby — outside of design, which she would not have called a hobby — was cooking, specifically the kind that took most of a Sunday. She brought the results into the studio periodically. This was appreciated more than she knew.",
    graduation:
      "Tom's hobby is architecture — not the job version, but the looking-at-buildings-for-no-reason version. He walks new cities and maps them in his head. His friends have learned to allow extra time for this.",
    christening:
      "Lily's parents have recently discovered that their hobbies, as previously understood, are temporarily unavailable to them. They are in the process of developing new ones that can be done in twenty-minute windows. Progress is ongoing.",
    achievement:
      "Marcus's hobby — if you can call it that — was running before the marathon. It is now something else: a thing he did that changed what he thought he was capable of. He raised over £4,000 for the RNLI. He is working out what comes next.",
    recovery:
      "During her recovery, Claire started hobbies she had been meaning to start for years — bird identification, crosswords, a garden she actually tended. She says she didn't have time for them before. She suspects this was an excuse.",
    award:
      "Amelia has just been named Teacher of the Year. Her hobby is reading, but specifically reading while walking, which she considers an efficient use of time and which her colleagues consider mildly dangerous. She has not fallen over.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He plays bass guitar twice a week and considers this the most important two hours of his week. He has not explained why to anyone. He doesn't need to.",
    celebration:
      "Tell their story — who they are, what they love, and which hobby they've made their own. A hobby someone has kept for years, or picked up late, says something specific about them.",
    other:
      "Tell us who this person is and why you're gathering. A hobby — the thing they do that is entirely for themselves — is always worth including.",
  },

  "Way to spend Sunday": {
    memorial:
      "A beloved mother and teacher who had made Sunday non-negotiable. Long lunch, garden, Radio 4 — in that order, without variation. If you wanted her on a Sunday, you had to know the schedule.",
    tribute:
      "A mentor whose Sunday belonged to no one in particular — not a schedule exactly, but a particular quality of pace. He walked, he cooked, he read. He answered no emails. His colleagues respected this in the way people respect a rule that is clearly working.",
    birthday:
      "Sarah is turning 40 and her ideal Sunday involves a long morning, a late breakfast that becomes lunch, and an afternoon where nothing is decided in advance. She has not always managed this. She is working on it.",
    retirement:
      "David spent thirty-five years arriving at the office on a Monday. He is retiring and is now discovering what Sunday can be when it isn't mostly about Monday. He says this is going well. He says it every Sunday.",
    wedding:
      "Emma and James have Sunday down to an art — she runs in the morning, he makes the coffee, they eat something elaborate by noon, and the afternoon is unscheduled. This arrangement was achieved in year two and has not been renegotiated.",
    engagement:
      "Their Sunday usually involves a long walk and ends with Callum making soup. It has never once been cancelled for convenience. This is not a rule. It has never needed to be.",
    anniversary:
      "Forty years of Sundays together — same cup of tea, same walk, same argument about what to have for lunch. The afternoon settles by two o'clock. The evening follows naturally from there.",
    leaving:
      "Priya's Sunday involved cooking — not quickly, not for efficiency, but at the pace that produces something worth eating at the end. She brought the results in on Monday sometimes. People were always glad when she did.",
    graduation:
      "Tom spent four years barely distinguishing Sunday from any other day, which he now recognises as a design flaw. He is correcting this. Sunday now involves daylight and at least one meal that required effort.",
    christening:
      "Lily's parents' Sundays have been reorganised entirely. They are adapting. They say it is fine. They are adapting.",
    achievement:
      "Marcus's Sunday, for eight months, involved a long training run before anyone was awake. He ran his marathon on a Sunday and raised over £4,000 for the RNLI. He now uses Sundays for other things. He is still working out which things.",
    recovery:
      "During her recovery, Claire started paying close attention to Sundays — not to fill them, but to let them be what they were. A walk. A book. Something warm to drink. She says Sunday became the best day of the week. She is not entirely sure when this happened.",
    award:
      "Amelia has just been named Teacher of the Year. Her Sunday involves marking, reading, and exactly one hour where she does neither. She guards that hour with a professionalism her students would recognise.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. His Sunday involves basketball in the morning, cooking in the afternoon, and the next week's thinking done by Sunday evening. He says this is leisure. It looks like leisure.",
    celebration:
      "Tell their story — who they are, what they love, and how they spend a Sunday. The Sunday someone has made their own is always a revealing detail.",
    other:
      "Tell us who this person is and why you're gathering. A favourite way to spend Sunday — the ritual they've made their own — is a small detail that says a lot.",
  },

  Smell: {
    memorial:
      "A beloved mother and teacher whose smell was lavender — from the garden, from the soap she liked, from something altogether harder to name. It is the smell of her house, still.",
    tribute:
      "A mentor whose office had a particular smell — good coffee, paperbacks, and something herbal he couldn't have named — that his colleagues associate with every decent conversation they ever had in that room.",
    birthday:
      "Sarah is turning 40 with strong opinions about scent the way she has strong opinions about most things: specific, considered, and not open to revision. She has been wearing the same perfume since she was twenty-seven. She is right about it.",
    retirement:
      "David associates a specific smell with the end of a good week — not cologne, not cleaning products, but the particular combination of fresh air and a properly made coffee on a Friday morning. He has been trying to pin it down for thirty-five years.",
    wedding:
      "Emma and James — in a conversation they discovered they'd been having separately — both associate the smell of cut grass with their wedding afternoon. Neither of them had expected this.",
    engagement:
      "The Lake District in October has a particular smell — bracken, cold air, wet stone — that Callum has tried to explain on multiple occasions. Sophie says she knows exactly what he means and doesn't need the explanation. She is right.",
    anniversary:
      "Forty years together and there is a smell — the particular combination of a Sunday lunch in that specific kitchen — that their children associate with every good Sunday of their childhoods. Mum has been making it since 1986.",
    leaving:
      "Priya's studio smelled like good coffee and a specific candle she kept on her desk. Her colleagues noticed when the candle wasn't there. They noticed again when she took it with her.",
    graduation:
      "Tom has a specific theory about the smell of architecture — wet concrete, cut timber, fresh plaster — which he developed by spending an unusual amount of time in buildings under construction. He considers it research. It was research.",
    christening:
      "The smell of Lily's room, her parents say, is the best smell in the house. They say this with the certainty of people who have not slept for three months and are not currently in a position to be objective.",
    achievement:
      "Marcus says the most vivid memory of the marathon is not the crowd or the finish line but the smell of the city at six in the morning, before anyone was awake, at the start. He raised over £4,000 for the RNLI. He has been back to that street once since.",
    recovery:
      "During her recovery, Claire's sense of smell changed — things that had been neutral became unbearable, and some things she'd never noticed became important. She made a list of the good ones. It is a very specific list.",
    award:
      "Amelia has just been named Teacher of the Year. She has worn the same scent to school for eleven years. Several former students have said they can't smell it without thinking of her. She considers this a reasonable legacy.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up in Accra and says the smell that most consistently transports him is the smell of rain on hot dust — something that only exists there. He has not tried to explain this to most people.",
    celebration:
      "Tell their story — who they are, what they love, and whether there's a smell that says something true about them. Smell is the detail that lands last and lasts longest.",
    other:
      "Tell us who this person is and why you're gathering. A favourite smell — the one that takes them somewhere — is always a revealing and unexpected detail.",
  },

  "Weather for walk": {
    memorial:
      "A beloved mother and teacher who walked in all weathers and considered the weather irrelevant to the decision to walk. She had a waterproof for the rain, warm layers for the cold, and a cup of tea waiting at the end. The weather was not the point.",
    tribute:
      "A mentor who preferred to walk in weather that required some effort — overcast, cool, perhaps a light rain. He said good weather was for other people. His colleagues learned not to feel sorry for him on grey mornings.",
    birthday:
      "Sarah is turning 40 with a hiking habit that has taken her through conditions her friends would not describe as welcoming. She describes them as bracing. She has specific views on good walking weather. They are not widely shared.",
    retirement:
      "David commuted through thirty-five British winters and has developed what he calls a working relationship with weather. He will now be walking in it, rather than arriving in it. He considers this an improvement.",
    wedding:
      "Emma and James met at a festival in the rain and consider rain a fact about Britain that they have accommodated. Their wedding was technically overcast and is remembered by everyone present as a beautiful day. They consider this the appropriate attitude.",
    engagement:
      "Callum proposed on Arthur's Seat on New Year's Day in weather that was cold, clear, and still. He had been waiting for that specific forecast. Sophie thought they were going for a walk. The weather cooperated completely.",
    anniversary:
      "Forty years of walks in all conditions, and they have never cancelled one for the weather. Not once. The appropriate gear is in the cupboard under the stairs. This has been the position for forty years.",
    leaving:
      "Priya cycled to work in every weather Manchester produced for six years and never, that her colleagues witnessed, arrived looking as though the journey had been difficult. Nobody has been able to explain this.",
    graduation:
      "Tom studied in Manchester for four years and emerged with a detailed knowledge of what it is like to try to build things in a range of difficult weather conditions. He considers this excellent preparation. He is probably right.",
    christening:
      "Lily's parents have discovered that weather is not an obstacle when you have a pram and a good waterproof and nowhere specific to be. They walk in whatever is happening. Lily appears unbothered by this.",
    achievement:
      "Marcus trained in every kind of weather over eight months — dawn frost in November, driving rain in February, and what passed for a warm morning in April. He raised over £4,000 for the RNLI. He says he genuinely doesn't mind any of it now. We believe him.",
    recovery:
      "During her recovery, Claire walked every day regardless of the weather. She says the rain, specifically, was useful — it demanded just enough attention that she couldn't think about anything else. She still walks in the rain.",
    award:
      "Amelia has just been named Teacher of the Year. She walks to school every day and has a personal taxonomy of walking weather that she applies to the twenty-five minutes between her house and the school gate. She has opinions about each type.",
    promotion:
      "After three years of excellent work, Kwame has been promoted to Head of Product. He grew up in Accra and says the British habit of walking in bad weather is one of the things he finds most genuinely admirable about this country. He has since joined them.",
    celebration:
      "Tell their story — who they are, what they love, and what kind of weather they prefer for a walk. The weather someone walks in says something specific about them.",
    other:
      "Tell us who this person is and why you're gathering. A preference for walking weather — however specific or surprising — is always a good detail.",
  },
}
