# Subset completion, 28 September 2026

The completion pass (`scripts/complete-subsets.ts`, PR #953) read every
approved and proposed subset against its parent's full list and asked two
questions. Run after the founder's first review: 127 approved, 107
rejected, Curry still proposed. The pass writes only to PROPOSED subsets,
so it added one member (Chips and curry sauce → Curry) and reported the
rest here.

## Approved subsets missing members the parent already lists

Items already on the parent's list that the model judged plainly belong.
Nothing was changed: these subsets were approved as they stood. Applying
them is a bulk join-row write once the founder says so, or chip by chip
in admin.

- **Drink › Alcoholic drink (16)**: Sherry, Mulled wine, Pimm's, Stout
- **Landmark or building › Ancient ruin (7)**: Hadrian's Wall, Great Wall of China, Pyramids of Giza
- **Footballer › Arsenal footballer (10)**: Frank Lampard
- **Sound › ASMR sound (6)**: Rain on a tent, Bacon sizzling, Bees in a garden
- **Sport to play › Ball sport (9)**: Badminton, Table tennis, Pool, Squash, Rugby, Padel
- **Dance › Ballroom dance (7)**: Cha-cha
- **City › Beach city (9)**: Los Angeles, San Francisco, Melbourne
- **Beer › Bitter (10)**: Bass, Adnams Ghost Ship
- **Beach › British beach (16)**: Brighton, Bournemouth, Tenby, West Wittering, Woolacombe, Porthcurno, Scarborough, Cromer
- **Comic or annual › British comic (16)**: Bunty, Eagle, Match, Nutty, Roy of the Rovers, Topper, Whizzer and Chips
- **Poet › British poet (16)**: William Shakespeare, John Keats, Dylan Thomas, Elizabeth Bishop
- **Band or artist › British rock band (8)**: Rolling Stones, The Kinks, Status Quo
- **Footballer › Celtic footballer (6)**: Ally McCoist, John Greig, Roy Keane
- **Footballer › Chelsea footballer (6)**: David Seaman
- **Author › Children's author (7)**: C.S. Lewis, Bram Stoker
- **Biscuit › Chocolate biscuit (10)**: Chocolate chip cookie, Digestive, Malted milk
- **Author › Classic author (8)**: C.S. Lewis, Bram Stoker, George Orwell, Aldous Huxley, Evelyn Waugh
- **Board game › Classic board game (6)**: Scrabble, Monopoly, Cluedo
- **Aircraft › Classic British aircraft (7)**: Gloster Meteor, Mosquito, Sopwith Camel
- **Car › Classic car (12)**: Triumph Spitfire, Jaguar XJ, Aston Martin DB5, Ford Cortina, Porsche 911, Mercedes-Benz SL, Mini Cooper, Volkswagen Golf, Land Rover Defender, Rolls-Royce, Bentley
- **Comedian › Classic comedian (10)**: Morecambe and Wise, Victoria Wood, Joan Rivers
- **Actor › Classic Hollywood actor (11)**: Sean Connery, Peter Sellers, Clint Eastwood
- **Sitcom › Classic sitcom (10)**: One Foot in the Grave, Keeping Up Appearances
- **Book › Coming of age (6)**: Jane Eyre, Great Expectations, The Kite Runner
- **Cricket team › County cricket team (16)**: Worcestershire, Kent
- **Hobby › Creative craft (7)**: Baking, Model making
- **Footballer › England footballer (16)**: Jimmy Greaves, Bobby Moore, Neville Southall
- **Castle › English castle (15)**: Kenilworth
- **Sporting moment › English sporting moment (6)**: Bannister's four-minute mile, Botham's Ashes 1981, Euro 96, Leicester City win the league, Manchester United's treble 1999, Super Saturday 2012
- **Football team › European football team (10)**: Chelsea, Liverpool, Manchester United, Arsenal, Tottenham Hotspur
- **Footballer › Everton footballer (6)**: Alan Shearer
- **Dog breed › Family dog breed (6)**: Boxer, British Bulldog, Corgi, Dachshund, Labradoodle, Old English Sheepdog
- **Animal › Farm animal (6)**: Rabbit, Guinea pig
- **Dance › Folk dance (6)**: Country line dancing, Swing
- **Song › Funeral song (6)**: Bridge Over Troubled Water — Simon & Garfunkel, What a Wonderful World — Louis Armstrong
- **Bird › Garden bird (16)**: Siskin, Bullfinch, Collared dove, House sparrow, Starling, Jay, Magpie, Treecreeper
- **Fairy tale › Grimm fairy tale (6)**: Little Red Riding Hood, The Frog Prince, Thumbelina
- **Sport to play › Individual sport (8)**: Tennis, Table tennis, Snooker, Pool
- **Song › Karaoke song (6)**: I Will Always Love You — Whitney Houston, Imagine — John Lennon, Let It Be — The Beatles, Bridge Over Troubled Water — Simon & Garfunkel, My Way — Frank Sinatra, Abide With Me — traditional
- **Beer › Lager (16)**: San Miguel, Foster's, Super Bock
- **Famous painting › Landscape painting (6)**: A Sunday on La Grande Jatte, The Garden of Earthly Delights, Water Lilies, Sunflowers
- **F1 driver › Legendary F1 driver (13)**: Lewis Hamilton, Sebastian Vettel, Fernando Alonso, Kimi Räikkönen, Max Verstappen
- **Book › Love story (8)**: Persuasion, Wuthering Heights, Emma, Great Expectations
- **Footballer › Manchester City footballer (6)**: Bukayo Saka
- **Footballer › Manchester United footballer (8)**: Cristiano Ronaldo, Paul Gascoigne, Kevin Keegan, Jude Bellingham, Erling Haaland, Frank Lampard
- **Superhero › Marvel superhero (8)**: Captain America
- **Painter or artist › Modern artist (8)**: Munch, van Gogh, Klimt, Frida Kahlo
- **Play › Modern play (7)**: Waiting for Godot, Copenhagen, Arcadia
- **Radio station › Music radio station (13)**: Radio 1, 6 Music
- **Name for a grandparent › Name for a grandmother (6)**: Grandma
- **Sound › Nature sound (8)**: Rain on the window, Crunching snow
- **Footballer › Newcastle United footballer (7)**: Ian Wright
- **Regional or dialect word › Northern English word (8)**: Mither, Nesh
- **Painter or artist › Old Master (9)**: Turner
- **Form of exercise › Outdoor activity (6)**: Tennis, Jogging, Badminton, Swimming
- **Hobby › Outdoor activity (8)**: Gardening, Golf, Stargazing
- **Board game › Party board game (6)**: Uno, Boggle
- **Animal › Pet (9)**: Horse, Goat, Pig, Donkey
- **Place › Place for a day out (8)**: Countryside, Woodland, City, Pub, Sports ground
- **Place › Place for an outdoor activity (8)**: Garden
- **Place › Quiet place (6)**: Museum, Countryside, Home, Park
- **Footballer › Rangers footballer (6)**: Kenny Dalglish
- **Beer › Real ale (10)**: Bass, Wainwright
- **Wine › Red wine (14)**: Bordeaux
- **Part of a roast dinner › Roast dinner meat (7)**: Nut roast
- **Part of a roast dinner › Roast dinner vegetable (10)**: Cauliflower cheese
- **Pie › Savoury pie (7)**: Chicken and mushroom pie, Cottage pie, Fish pie, Chicken pie, Meat and potato pie, Shepherd's pie
- **Footballer › Scottish footballer (7)**: Henrik Larsson, Paul McStay, Richard Gough
- **Play › Shakespeare play (7)**: Rosencrantz and Guildenstern Are Dead
- **Dog breed › Small dog breed (8)**: Jack Russell, Cavalier King Charles Spaniel, French Bulldog, Beagle, Schnauzer
- **Animal › Small furry (8)**: Rabbit, Hare, Weasel, Stoat, Badger, Otter, Mole
- **Bird › Songbird (10)**: Blackcap, Chaffinch, Dunnock, Goldcrest, Great tit, Linnet, Marsh tit, Redwing, Siskin, Stonechat, Waxwing
- **Cuisine › Spicy cuisine (6)**: Vietnamese, Ethiopian, Persian, Indonesian
- **Car › Sports car (11)**: BMW M3, Jaguar XJ, Ford Mustang, MG MGB, Jensen Interceptor
- **Fruit › Stone fruit (6)**: Date
- **Instrument › String instrument (13)**: Accordion, Fiddle
- **Sport to watch › Team sport to watch (10)**: Baseball, Ice hockey
- **Tennis player › Tennis Grand Slam winner (16)**: Rafael Nadal, Stefan Edberg, Venus Williams, John McEnroe, Steffi Graf, Carlos Alcaraz
- **Fruit › Tropical fruit (6)**: Banana
- **TV programme › TV Comedy (10)**: Porridge
- **TV programme › TV Drama (10)**: Doctor Who
- **Sandwich › Vegetarian sandwich (11)**: Tuna melt
- **Bird › Water bird (16)**: Curlew, Gannet, Grey wagtail, Herring gull, Little owl, Oystercatcher, Redwing, Snipe, Dipper
- **Song › Wedding song (6)**: Time to Say Goodbye — Andrea Bocelli, Bridge Over Troubled Water — Simon & Garfunkel, Wonderwall — Oasis, Wind Beneath My Wings — Bette Midler, What a Wonderful World — Louis Armstrong
- **Wine › White wine (9)**: Vinho Verde
- **Flower › Wild flower (8)**: Violet, Forget-me-not, Anemone, Crocus
- **River › World river (11)**: Rhine, Tweed
- **Aircraft › World War Two fighter aircraft (6)**: Avro Lancaster

## Items the catalogue lacks, by subset

Suggestions only. A subset never justifies an item: each must earn its
place on the parent by the topic rules (a name an ordinary person reaches
for first, at the basic level). The founder strikes what he doesn't want;
what survives goes into the seed and then onto the subset.


- **Drink › Alcoholic drink** (20): Wine, Liqueur, Cocktail
- **Landmark or building › Ancient ruin** (10): Roman Forum
- **Sound › ASMR sound** (9): Whispering, Page turning, Tapping, Brushing
- **Sport to play › Ball sport** (15): Baseball, Softball, Pickleball
- **City › Beach city** (12): Miami, Bali, Maldives, Ibiza, Cancun
- **Fruit › Berry** (8): Mulberry
- **Beer › Bitter** (12): Marstons Pedigree, Wychwood Hobgoblin Ruby
- **Author › Children's author** (9): Beatrix Potter, Dr. Seuss, Lewis Carroll
- **Fruit › Citrus fruit** (7): Mandarin
- **Board game › Classic board game** (9): Mahjong, Checkers
- **Aircraft › Classic British aircraft** (10): Bristol Beaufighter, Supermarine Seafire
- **Car › Classic car** (23): Alfa Romeo Giulietta, Peugeot 404, Vauxhall Viva, Triumph 2000, Singer Gazelle
- **Comedian › Classic comedian** (13): Bob Hope, Lucille Ball, Charlie Chaplin
- **Actor › Classic Hollywood actor** (14): Ingrid Bergman, Grace Kelly, Vivien Leigh, James Dean, Ava Gardner
- **Colour › Colour of the rainbow** (7): Indigo
- **Book › Coming of age** (9): The Catcher in the Rye, Speak, The Perks of Being a Wallflower
- **Hobby › Creative craft** (9): Embroidery, Sculpture, Jewelry making
- **Takeaway › Curry** (6): Vindaloo, Tandoori chicken, Tikka masala sauce
- **Cuisine › European cuisine** (11): Swiss, Belgian, Dutch, Austrian
- **Animal › Farm animal** (8): Chicken, Duck, Turkey
- **Superhero › Female superhero** (6): Wonder Girl, She-Hulk, Captain Marvel
- **Dance › Folk dance** (8): Square dance, Contra dance
- **Song › Funeral song** (8): Pie Jesu — Andrew Lloyd Webber, In Paradisum — Gabriel Fauré, The Lord is My Shepherd — traditional
- **Bird › Garden bird** (24): Sparrow, Tit
- **Sport to play › Individual sport** (12): Gymnastics, Athletics, Martial arts
- **Song › Karaoke song** (12): Sweet Caroline — Neil Diamond, Don't Stop Believin' — Journey, Livin' on a Prayer — Bon Jovi, Teenage Dirtbag — Wheatus, Uptown Funk — Mark Ronson ft. Bruno Mars, Walking on Sunshine — Katrina & The Waves
- **Beer › Lager** (19): Tsingtao, Chang, Singha
- **Famous painting › Landscape painting** (10): The Night Café, Starry Night Over the Rhône, Wheat Field with Cypresses
- **Dance › Latin dance** (6): Merengue, Bachata, Cumbia
- **Book › Love story** (12): The Notebook, Outlander, Me Before You, The Time Traveler's Wife
- **Play › Modern play** (10): Hansberry's A Raisin in the Sun, Miller's All My Sons
- **Sound › Nature sound** (10): Ocean waves, Thunder storm, Running water/stream
- **Painter or artist › Old Master** (10): Leonardo da Vinci
- **Form of exercise › Outdoor activity** (10): Bowling
- **Hobby › Outdoor activity** (11): Hiking, Kayaking, Surfing
- **Board game › Party board game** (8): Codenames, Jackbox Party Packs
- **Animal › Pet** (13): Parrot, Fish, Budgie, Turtle
- **Place › Place for a day out** (13): Zoo, Theme park, Lake
- **Place › Place for an outdoor activity** (9): Lake, River, Mountain, Field
- **Place › Quiet place** (10): Bedroom, Nature reserve
- **Footballer › Rangers footballer** (7): Ian Ferguson, Graeme Souness, Gary Stevens
- **Beer › Real ale** (12): Bitter, Ale, Best Bitter
- **Pie › Savoury pie** (13): Steak and gravy pie, Turkey pie, Vegetable pie
- **Footballer › Scottish footballer** (10): Jim Baxter, Charlie Nicholas, Graeme Souness
- **Island › Scottish island** (12): Hebrides
- **Item of clothing › Shoe** (6): Sandals, Sneakers, Heels, Flip-flops
- **Dog breed › Small dog breed** (13): Maltese, Pekingese, Miniature Pinscher
- **Animal › Small furry** (15): Chipmunk, Gerbil, Shrew, Vole
- **Bird › Songbird** (21): Thrush, Lark, Finch
- **Cuisine › Spicy cuisine** (10): Sichuan, Szechuan, Hunan
- **Car › Sports car** (16): Corvette, Dodge Charger, Chevrolet Camaro
- **Fruit › Stone fruit** (7): Avocado
- **Instrument › String instrument** (15): Lute, Oud
- **Pie › Sweet pie** (9): Custard pie, Blackberry pie, Strawberry pie
- **Sport to watch › Team sport to watch** (12): Softball, Lacrosse
- **Fruit › Tropical fruit** (7): Coconut, Guava, Prickly pear
- **TV programme › TV Comedy** (11): It's Always Sunny in Philadelphia, The IT Crowd, Extras
- **TV programme › TV Drama** (11): Breaking Bad, Game of Thrones, The Sopranos
- **Bird › Water bird** (25): Grebe, Shelduck, Wigeon, Shoveler, Bittern, Crane
- **Song › Wedding song** (11): All of Me — John Legend, At Last — Etta James, The Way You Look Tonight — Frank Sinatra, Thinking Out Loud — Ed Sheeran, Make You Feel My Love — Adele
- **Castle › Welsh castle** (6): Caerphilly
- **Flower › Wild flower** (12): Cowslip, Yarrow, Lupine
- **River › World river** (13): Tigris, Euphrates, Colorado
- **Aircraft › World War Two fighter aircraft** (7): Messerschmitt Bf 109, Focke-Wulf Fw 190
