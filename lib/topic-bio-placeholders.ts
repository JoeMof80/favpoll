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
}
