// ---------------------------------------------------------------------------
// Regenerated topic placeholders — REGISTER-KEYED (5 keys), one consistent voice.
//
// Replaces the occasion-keyed placeholder source. Each topic carries exactly 5
// register sets: remembering, celebrating_one, celebrating_many, cause, neutral.
// Rules followed throughout:
//   • about TEASES the topic domain + withholds the specific favourite (the hook)
//   • reveal delivers the specific — and NAMES A REAL ITEM from that topic's list
//   • CHARITY-FREE (placeholders are shared across all charities)
//   • tense/number per register: remembering past/singular; celebrating_one
//     present/singular; celebrating_many present/plural; cause guest-facing (no
//     protagonist); neutral light/present
//
// SEED CHANGE REQUIRED: store these 5 register keys directly (do not route through
// normalizeTopicPlaceholders' occasion mapping — cause + celebrating_many have no
// occasion to derive from).
//
// STATUS: batch 1 of N — 6 finite + 6 Nature. Remaining categories to follow in
// the same voice (Places, Film & TV, Music, Food & Drink, Sport, Childhood,
// Literature, Everyday life), then the newer batch-file topics.
// ---------------------------------------------------------------------------

type Register =
  | "remembering"
  | "celebrating_one"
  | "celebrating_many"
  | "cause"
  | "neutral"

type Ph = { about: string; reveal: string }

export const regeneratedPlaceholders: Record<string, Record<Register, Ph>> = {
  Colour: {
    remembering: {
      about:
        "A teacher and mother with a precise eye for what belonged where — in a room, a garden border, an outfit. Forty years of getting it exactly right.",
      reveal:
        "Hers was purple. She wore it to every occasion that mattered, and grew lavender wherever she could.",
    },
    celebrating_one: {
      about:
        "She's turning forty and has never once made a neutral choice — three weekends deliberating over a single wall, and not a flicker of regret since.",
      reveal:
        "Hers is green. Two trips to the paint shop, no second thoughts. She still brings it up.",
    },
    celebrating_many: {
      about:
        "Two years into the flat and one wall remains unpainted, because they have never agreed on a colour and are in no hurry to.",
      reveal:
        "Hers is blue, his is green, the wall stays white. Not a problem they intend to solve.",
    },
    cause: {
      about:
        "Pick the colour you'd argue for and pledge what it's worth to you. Some of these choices say more about a person than they realise.",
      reveal:
        "Our pick to start things off: yellow — the one that refuses to be ignored.",
    },
    neutral: {
      about:
        "Some people have known their answer to this since childhood and have never felt the need to revisit it.",
      reveal: "Theirs is red. No particular reason. It simply always wins.",
    },
  },

  Season: {
    remembering: {
      about:
        "A keen gardener who measured the year by what was coming back, and was always ready for it before anyone else had noticed.",
      reveal:
        "Hers was spring. She'd have seeds in the ground before the rest of us had thought about it.",
    },
    celebrating_one: {
      about:
        "She plans her whole year around long evenings and warm weekends, then claims, every autumn, to have meant something else entirely.",
      reveal:
        "Hers is summer, whatever she says. The people who know her aren't fooled.",
    },
    celebrating_many: {
      about:
        "They've disagreed about the best time of year since roughly their third date, and show no sign of resolving it.",
      reveal: "Hers is spring, his is summer. Five years in, still unsettled, still enjoyed.",
    },
    cause: {
      about:
        "Pick the season you'd defend and pledge what it's worth. Everyone's certain they're right about this one.",
      reveal: "Our pick to start: autumn — the one that knows how to make an exit.",
    },
    neutral: {
      about:
        "Some people are entirely loyal to one season, and a little suspicious of anyone who isn't.",
      reveal: "Theirs is winter. They like the quiet, and the excuse to stay in.",
    },
  },

  "Day of the week": {
    remembering: {
      about:
        "She had one day of the week entirely her own — a long-established, non-negotiable routine the whole family knew to respect.",
      reveal:
        "Hers was Sunday. Long lunch, garden, radio, in that order, without variation.",
    },
    celebrating_one: {
      about:
        "He has a theory about which day has the best energy that no colleague has yet managed to disprove.",
      reveal:
        "His is Friday. He makes the whole office feel the weekend's started by lunch.",
    },
    celebrating_many: {
      about:
        "They met on one day, got engaged on another, and have been gently arguing about which is better ever since.",
      reveal: "Hers is Saturday, his is Friday. The argument is part of the marriage now.",
    },
    cause: {
      about:
        "Pick the day you'd defend and pledge what it's worth. Everyone has a favourite; few will admit why.",
      reveal: "Our pick to start: Tuesday — quietly the most underrated day there is.",
    },
    neutral: {
      about:
        "Some people have strong, immovable feelings about the days of the week and will share them unprompted.",
      reveal: "Theirs is Sunday. The one day nobody is allowed to schedule anything.",
    },
  },

  "Meal of the day": {
    remembering: {
      about:
        "She treated one meal of the day as a serious commitment — the one where the real conversations happened, long after the plates were cleared.",
      reveal:
        "Hers was dinner. Still at the table at nine most nights. That was when the day properly began.",
    },
    celebrating_one: {
      about:
        "She approaches one meal in particular with an enthusiasm her friends find both baffling and infectious.",
      reveal:
        "Hers is brunch. Two hours minimum, good coffee, no rushing. She considers this a moral position.",
    },
    celebrating_many: {
      about:
        "Their first proper date was an argument about where to eat that ended somewhere neither suggested and both loved. The template has held.",
      reveal:
        "Theirs is dinner — the longer and later the better. Midnight at the table counts as a good evening.",
    },
    cause: {
      about:
        "Pick the meal you'd defend and pledge what it's worth. It says more about a person than you'd think.",
      reveal:
        "Our pick to start: breakfast — the meal that decides how the rest of the day goes.",
    },
    neutral: {
      about:
        "Some people will reorganise an entire day around protecting one particular meal.",
      reveal:
        "Theirs is lunch. Properly sat down, never at a desk. That part is non-negotiable.",
    },
  },

  "Time of day": {
    remembering: {
      about:
        "She'd claimed one hour of the day long before anyone else in the house was awake. The shape of her morning was not to be interrupted.",
      reveal:
        "Hers was early morning. Garden done, thinking done, tea made — all before the world woke up.",
    },
    celebrating_one: {
      about:
        "She's at her most vivid in the hours when most people are winding down, and has been known to start dinner at ten.",
      reveal:
        "Hers is evening. The later the better. She says everything gets more interesting after nine.",
    },
    celebrating_many: {
      about:
        "They protect one hour of the day that belongs to nobody else and carries no agenda. It has never once been cancelled.",
      reveal:
        "Theirs is lunchtime. Same hour, same table, no phones. That hour has held them together.",
    },
    cause: {
      about:
        "Pick the hour you'd defend and pledge what it's worth. Morning people and night owls, this is your moment.",
      reveal: "Our pick to start: dusk — the hour the day finally lets its shoulders down.",
    },
    neutral: {
      about:
        "Some people know exactly when they're at their best and arrange their lives around it without apology.",
      reveal: "Theirs is late night. That's when the good thinking happens, they'll tell you.",
    },
  },

  Decade: {
    remembering: {
      about:
        "She came of age in a decade she always said had changed everything, and kept a box of photographs from it she'd show to anyone who asked.",
      reveal:
        "Hers was the 1960s. She could tell you exactly where she was when each thing happened.",
    },
    celebrating_one: {
      about:
        "She has never pretended to be neutral about the decade that shaped her, and delivers her views on its music with full conviction.",
      reveal:
        "Hers is the 1980s. She knows every word of every song from 1986 and considers this useful.",
    },
    celebrating_many: {
      about:
        "They grew up to the same music without knowing each other existed, and discovered it on a second date that ran long.",
      reveal: "Theirs is the 2000s. The wedding playlist made the overlap embarrassingly plain.",
    },
    cause: {
      about:
        "Pick the decade that shaped you and pledge what it's worth. Everyone thinks theirs was the best one.",
      reveal: "Our pick to start: the 1970s — loud, certain, and not remotely sorry.",
    },
    neutral: {
      about:
        "Some people belong, culturally, to one decade and have quietly stayed there ever since.",
      reveal: "Theirs is the 1990s. They'll defend it at length, given the smallest opening.",
    },
  },

  Animal: {
    remembering: {
      about:
        "A mother and teacher whose garden was as much for the creatures as for herself, with strong opinions about which animals deserved more of our attention.",
      reveal:
        "Hers was the fox. They came to her garden reliably and she always stopped to watch.",
    },
    celebrating_one: {
      about:
        "She's turning forty and still stops dead on every walk for one particular creature, exactly as she has since she was small.",
      reveal:
        "Hers is the owl. She says it's the only one that looks like it's thinking something over.",
    },
    celebrating_many: {
      about:
        "They have a settled, much-enjoyed argument about which animal best suits them, and neither has ever conceded.",
      reveal: "Hers is the deer, his is the dog. They've agreed only never to agree.",
    },
    cause: {
      about:
        "Pick the creature you'd defend in an argument and pledge what it's worth. Some of these choices will be controversial.",
      reveal:
        "Our pick to start: the hedgehog — small, determined, and entirely unbothered by any of this.",
    },
    neutral: {
      about:
        "Some people keep a favourite animal the way others keep a favourite chair — settled, and ready when asked.",
      reveal: "Theirs is the dog. No elaborate reasoning. The dog was always going to win.",
    },
  },

  Bird: {
    remembering: {
      about:
        "She kept a garden largely for other creatures and logged every bird that visited. Decades of notebooks are still in the shed.",
      reveal: "Hers was the robin. She could name a bird by its song before it appeared.",
    },
    celebrating_one: {
      about:
        "She's accumulated opinions about birds on weekend walks for years, and a list she insists she doesn't take seriously.",
      reveal:
        "Hers is the puffin. She spotted one from a moving ferry and talked about it for an hour.",
    },
    celebrating_many: {
      about:
        "They went away specifically to settle a long-running disagreement about birds, and came back exactly as divided.",
      reveal: "Hers is the kingfisher, his is the puffin. The trip resolved nothing, happily.",
    },
    cause: {
      about:
        "Pick the bird you'd stop to watch and pledge what it's worth. Quiet devotion welcome.",
      reveal:
        "Our pick to start: the heron — patient, unbothered, always exactly where it means to be.",
    },
    neutral: {
      about:
        "Some people notice the birds everyone else walks past, and have a clear favourite ready.",
      reveal: "Theirs is the blackbird. Clear voice, unhurried, entirely itself.",
    },
  },

  Flower: {
    remembering: {
      about:
        "She grew the same plant in every garden she ever had — same spot where she could manage it, same care each year.",
      reveal: "Hers was lavender. The smell is still entirely hers.",
    },
    celebrating_one: {
      about:
        "She keeps the flat stocked with one particular bloom from April to June, having decided years ago there's no reasonable argument against it.",
      reveal: "Hers is the peony. Nobody has yet challenged the policy.",
    },
    celebrating_many: {
      about:
        "She'd chosen her flower years before they met; he agreed the moment he heard it, which she found suspicious.",
      reveal: "Theirs is wisteria. She'd known long before the wedding. He knew better than to disagree.",
    },
    cause: {
      about: "Pick the bloom that stops you in your tracks and pledge what it's worth.",
      reveal: "Our pick to start: the sunflower — impossible to be in a bad mood near.",
    },
    neutral: {
      about: "Some people have a flower that's simply theirs, no occasion required.",
      reveal: "Theirs is the rose. Predictable, they'll admit. Also correct.",
    },
  },

  Tree: {
    remembering: {
      about:
        "She planted a sapling decades ago and watched it shade a whole lawn. A garden without a proper tree, she'd say, is just a lawn with ambitions.",
      reveal: "Hers was the oak. It is now older than most of the people who knew her.",
    },
    celebrating_one: {
      about:
        "She planted hers in her first garden for the structure and the autumn berries, and considers it one of her better decisions.",
      reveal: "Hers is the rowan. The berries each autumn are her annual vindication.",
    },
    celebrating_many: {
      about:
        "They planted one together on their first anniversary, in the wrong spot, and have argued about moving it ever since.",
      reveal: "Theirs is the silver birch. Still in the wrong place. Still not moving.",
    },
    cause: {
      about: "Pick the tree you'd sit under and pledge what it's worth.",
      reveal:
        "Our pick to start: the beech — all that canopy, all that shade, nothing asked in return.",
    },
    neutral: {
      about:
        "Some people have a tree they'd choose without hesitation, usually for reasons they can't fully explain.",
      reveal: "Theirs is the willow. You don't notice how much shade it gives until it's gone.",
    },
  },

  Weather: {
    remembering: {
      about:
        "She had a particular relationship with cold, clear mornings — the kind of day she was most herself in.",
      reveal:
        "Hers was crisp frost. Clear sky, cold air, the garden white. She said the best thinking happened then.",
    },
    celebrating_one: {
      about:
        "She has a favourite kind of weather most people wouldn't choose, and will explain at length why they're wrong.",
      reveal: "Hers is warm rain. Brief, unexpected, the best quality of light. She's not wrong.",
    },
    celebrating_many: {
      about:
        "They married on a day the forecast had called uncertain, which turned out exactly right — typical, they both agree, of the whole relationship.",
      reveal:
        "Theirs is overcast and mild. Not the day they were promised. Exactly the day they wanted.",
    },
    cause: {
      about: "Pick the sky that lifts your spirit and pledge what it's worth.",
      reveal:
        "Our pick to start: golden autumn light — the only light that makes the world look finished.",
    },
    neutral: {
      about:
        "Some people have a kind of weather they'd happily live inside, whatever everyone else thinks of it.",
      reveal: "Theirs is the thunderstorm. They'll stand at the window for the whole thing.",
    },
  },

  Landscape: {
    remembering: {
      about:
        "She loved the English countryside with the quiet certainty of someone who'd never felt the need to say so, and walked the same hills for thirty years.",
      reveal: "Hers was rolling hills. She still found something new to notice every time.",
    },
    celebrating_one: {
      about:
        "Her opinions on landscape were formed almost entirely on weekend walks, and she's suspicious of anyone who prefers the flat.",
      reveal: "Hers is mountains. The only landscape, she says, that asks something of you.",
    },
    celebrating_many: {
      about:
        "They argued about where to get married for a year and chose the one kind of view neither could object to.",
      reveal: "Theirs is the coastline. The single answer that ended the argument.",
    },
    cause: {
      about: "Pick the view that takes your breath away and pledge what it's worth.",
      reveal:
        "Our pick to start: open moorland — space to think, without being told what to think.",
    },
    neutral: {
      about:
        "Some people have a landscape that returns them to themselves, and know exactly where it is.",
      reveal: "Theirs is woodland. Something about the way the light moves in it.",
    },
  },
}
