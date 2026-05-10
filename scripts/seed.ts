import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const charities = [
  { name: 'Macmillan Cancer Support', description: 'Support for people living with cancer', registered_number: '261017' },
  { name: 'Marie Curie', description: 'Care and support for people living with terminal illness', registered_number: '207994' },
  { name: 'Cancer Research UK', description: 'Research to prevent, diagnose and treat cancer', registered_number: '1089464' },
  { name: 'British Heart Foundation', description: 'Research and support for heart and circulatory diseases', registered_number: '225971' },
  { name: 'Age UK', description: 'Supporting older people to love later life', registered_number: '1128267' },
  { name: "Alzheimer's Society", description: 'Support and research for people affected by dementia', registered_number: '296645' },
  { name: 'Oxfam', description: 'Working to end the injustice of poverty', registered_number: '202918' },
  { name: 'Shelter', description: 'Fighting homelessness and bad housing', registered_number: '263710' },
  { name: 'RNLI', description: 'Saving lives at sea', registered_number: '209603' },
  { name: 'Dogs Trust', description: "The UK's largest dog welfare charity", registered_number: '227523' },
  { name: 'RSPCA', description: 'Preventing cruelty and promoting kindness to animals', registered_number: '219099' },
  { name: "St Mungo's", description: 'Helping people to recover from homelessness', registered_number: '1079126' },
]

type TopicSeed = { title: string; description: string; is_finite: boolean }

const topics: TopicSeed[] = [
  { title: 'Favourite colour', description: 'What colour spoke to them most?', is_finite: true },
  { title: 'Favourite season', description: 'The time of year they loved most', is_finite: true },
  { title: 'Favourite day of the week', description: 'The day that felt most like them', is_finite: true },
  { title: 'Favourite meal of the day', description: 'The meal they never skipped', is_finite: true },
  { title: 'Favourite time of day', description: 'When they were at their best', is_finite: true },
  { title: 'Favourite decade', description: 'The era that shaped them most', is_finite: true },
  { title: 'Favourite film', description: 'The film they could watch again and again', is_finite: false },
  { title: 'Favourite song', description: 'The song that reminds you of them', is_finite: false },
  { title: 'Favourite place', description: 'Where they were happiest', is_finite: false },
  { title: 'Favourite drink', description: 'Their go-to cup or glass', is_finite: false },
]

// Canonical CSS colour names — label.toLowerCase() is a valid CSS color
const topicItems: Record<string, string[]> = {
  'Favourite colour': ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Black', 'White', 'Grey'],
  'Favourite season': ['Spring', 'Summer', 'Autumn', 'Winter'],
  'Favourite day of the week': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  'Favourite meal of the day': ['Breakfast', 'Brunch', 'Lunch', 'Afternoon tea', 'Dinner', 'Supper'],
  'Favourite time of day': ['Early morning', 'Morning', 'Afternoon', 'Evening', 'Night'],
  'Favourite decade': ['1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  'Favourite film': [
    'The Shawshank Redemption', 'Casablanca', "Schindler's List", "It's a Wonderful Life",
    'The Sound of Music', 'Lawrence of Arabia', 'Brief Encounter', 'Some Like It Hot',
    'Gone with the Wind', 'Four Weddings and a Funeral',
  ],
  'Favourite song': [
    'My Way — Frank Sinatra', 'Bohemian Rhapsody — Queen', 'Angels — Robbie Williams',
    "Don't Look Back in Anger — Oasis", 'Waterloo Sunset — The Kinks',
    'What a Wonderful World — Louis Armstrong', 'Jerusalem — Parry',
    'Abide With Me — traditional', 'Over the Rainbow — Judy Garland',
    'Wind Beneath My Wings — Bette Midler',
  ],
  'Favourite place': [
    'The seaside', 'The countryside', 'Their garden', 'A favourite pub',
    'Paris', 'Scotland', 'The mountains', 'Home', 'A childhood village', 'Somewhere abroad',
  ],
  'Favourite drink': [
    'Tea', 'Coffee', 'A pint of ale', 'Red wine', 'White wine',
    'Whisky', 'Gin & tonic', 'Lemonade', 'Champagne', 'Hot chocolate',
  ],
}

async function seed() {
  console.log('Seeding charities…')
  const { data: existingCharities } = await supabase.from('charities').select('name')
  const existingNames = new Set((existingCharities ?? []).map((c) => c.name))
  const newCharities = charities.filter((c) => !existingNames.has(c.name))

  if (newCharities.length > 0) {
    const { error } = await supabase.from('charities').insert(newCharities)
    if (error) console.error('Charity seed failed:', error.message)
    else console.log(`✓ ${newCharities.length} charities seeded`)
  } else {
    console.log('  charities already seeded')
  }

  console.log('Seeding topics…')
  for (const topic of topics) {
    const { data: existing } = await supabase
      .from('topics')
      .select('id')
      .eq('title', topic.title)
      .maybeSingle()

    let topicId: string

    if (existing) {
      await supabase.from('topics').update({ is_finite: topic.is_finite }).eq('id', existing.id)
      topicId = existing.id
      console.log(`  updated: ${topic.title}`)
    } else {
      const { data, error } = await supabase.from('topics').insert(topic).select('id').single()
      if (error || !data) { console.error(`  failed: ${topic.title}:`, error?.message); continue }
      topicId = data.id
      console.log(`  ✓ topic: ${topic.title}`)
    }

    const items = topicItems[topic.title]
    if (!items) continue

    const { data: existingItems } = await supabase
      .from('topic_items').select('label').eq('topic_id', topicId)

    const existingLabels = new Set((existingItems ?? []).map((i) => i.label))
    const newItems = items
      .filter((label) => !existingLabels.has(label))
      .map((label) => ({ topic_id: topicId, label, source: 'seed', is_master: true }))

    if (newItems.length > 0) {
      const { error } = await supabase.from('topic_items').insert(newItems)
      if (error) console.error(`  failed items for ${topic.title}:`, error.message)
      else console.log(`  ✓ ${newItems.length} items for: ${topic.title}`)
    } else {
      console.log(`  items already exist for: ${topic.title}`)
    }
  }

  console.log('\nDone.')
}

seed()
