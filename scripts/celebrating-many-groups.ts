// ---------------------------------------------------------------------------
// celebrating_many group tagging.
//
// Every celebrating_many entry carries a `group` tag: "pair" (a couple) or
// "set" (a team / club / class / group). Default is "pair" — the personas were
// written as couples. The topics below are the exceptions: their celebrating_many
// persona is rewritten as a GROUP and tagged "set", so group events get a group
// persona and a group example name ("The Wednesday Walkers"), not "Joan & Arthur".
//
// Apply: for each title here, replace that topic's `celebrating_many` entry with
// the object below. For every celebrating_many entry NOT listed here, add
// `group: "pair"`. Reveals keep valid seed items.
//
// This is a reversible product default — move any topic between pair and set by
// editing this list.
// ---------------------------------------------------------------------------

type Ph = {
  pronouns: "they"
  group: "set"
  about: string
  reveal: string
}

export const celebratingManySetOverrides: Record<string, Ph> = {
  "Football team": {
    pronouns: "they",
    group: "set",
    about: "A five-a-side side, together fifteen years, that splits clean down the middle the moment a derby is mentioned.",
    reveal: "Half swear by Liverpool, half by Arsenal. The group chat is unusable on match day.",
  },
  Footballer: {
    pronouns: "they",
    group: "set",
    about: "A Sunday-league team that has argued the greatest-of-all-time question in the same clubhouse for two decades.",
    reveal: "Some hold out for George Best, some for Bobby Moore. Nobody has been persuaded yet.",
  },
  "Cricket team": {
    pronouns: "they",
    group: "set",
    about: "A village side whose post-match pint always comes round to the same argument about whose era was best.",
    reveal: "The old guard hold out for the West Indies; the rest say England.",
  },
  "Rugby team": {
    pronouns: "they",
    group: "set",
    about: "A club whose committee has run on the same union-versus-league argument since before half of them joined.",
    reveal: "Theirs is Leicester Tigers. Welford Road, the whole coach, every home game.",
  },
  "F1 driver": {
    pronouns: "they",
    group: "set",
    about: "A friendship group who each adopted a different driver and conduct race weekends as a full group event.",
    reveal: "Split between Lewis Hamilton and Max Verstappen. Lights-out is chaos in the group chat.",
  },
  "Tennis player": {
    pronouns: "they",
    group: "set",
    about: "A doubles club that splits, every Grand Slam, along generational lines about the greatest of all time.",
    reveal: "The younger half back Rafael Nadal; the rest hold out for Billie Jean King.",
  },
  "Sports star": {
    pronouns: "they",
    group: "set",
    about: "A coaching team that has argued the greatest-athlete question across every sport for as long as they've worked together.",
    reveal: "It comes down, every time, to Muhammad Ali versus Mo Farah.",
  },
  "Sporting moment": {
    pronouns: "they",
    group: "set",
    about: "A whole pub of regulars who each have the one moment they'd put back on the big screen right now.",
    reveal: "Half the room wants Usain Bolt in Beijing 2008; the other half, England win the Cricket World Cup 2019.",
  },
  "Sport to watch": {
    pronouns: "they",
    group: "set",
    about: "A supporters' group that turns up to the same fixture together, in the same block of seats, and has for years.",
    reveal: "Theirs is rugby. The same seats, the same songs, every home game.",
  },
  "Sport to play": {
    pronouns: "they",
    group: "set",
    about: "A club side that has played together long enough to argue about the rules with total authority.",
    reveal: "Theirs is badminton. Wednesday nights, mixed doubles, fiercely contested.",
  },
}
