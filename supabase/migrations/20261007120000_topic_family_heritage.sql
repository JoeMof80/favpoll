-- THE HERITAGE AMBIGUITY (2026-10-07)
--
-- `charity_topic_family()` picks one family from the Commission's `what`
-- codes in a fixed precedence. Measured over the 1,000 largest outreach
-- candidates, 248 of them (25%) carry MORE THAN ONE trigger code, so for a
-- quarter of the wave the precedence order IS the answer. Most of those
-- overlaps are real dual missions where a tiebreak is fair enough
-- (Animals + Nature: the RSPB, the Zoological Society).
--
-- One is not. The two commonest codes in the arts and nature families are
--
--     'Arts/culture/heritage/science'
--     'Environment/conservation/heritage'
--
-- and BOTH CONTAIN THE WORD HERITAGE. So every heritage charity carries
-- both, whether its heritage is a building or a hillside, and the pair says
-- nothing about which. 113 of the 1,000 are tagged exactly this way, and no
-- ordering can be right for them: Nature first puts the Royal Opera House,
-- RIBA and the Royal Albert Hall in Nature; Books & Arts first puts Canal &
-- River Trust, English Heritage, Historic Royal Palaces and the RHS in
-- Books & Arts.
--
-- So the floor ABSTAINS on that pair, which is what it already does where
-- the codes name nothing honest (a hospice gets nothing, deliberately).
-- Abstaining costs the correct answers it was getting by luck; that is the
-- right trade for OUTREACH, because the email offers the charity a topic,
-- and offering the Royal Opera House a nature topic is worse than not
-- writing yet. These charities are not lost — the perfect-topic suggester
-- reads their website, which CAN tell English Heritage from an opera house.
--
-- The exception is 'Animals', specific enough to decide on its own: the
-- Game & Wildlife Conservation Trust is tagged all three and is an animals
-- charity.
create or replace function charity_topic_family(p_classification jsonb)
returns text
language sql
immutable
as $$
  select case
    when p_classification->'what' ?| array[
      'The Advancement Of Health Or Saving Of Lives',
      'Disability',
      'The Prevention Or Relief Of Poverty',
      'Overseas Aid/famine Relief',
      'Accommodation/housing'
    ] then null
    when p_classification->'what' ? 'Animals' then 'Animals'
    -- Both labels carry "heritage", so holding both is not a dual mission
    -- but a vocabulary artefact. No answer is better than a coin flip.
    when p_classification->'what' ? 'Arts/culture/heritage/science'
     and p_classification->'what' ? 'Environment/conservation/heritage'
      then null
    when p_classification->'what' ? 'Environment/conservation/heritage'
      then 'Nature'
    when p_classification->'what' ? 'Amateur Sport' then 'Sport'
    when p_classification->'what' ? 'Arts/culture/heritage/science'
      then 'Books & Arts'
    when p_classification->'what' ? 'Religious Activities' then 'Music'
  end;
$$;

comment on function charity_topic_family is
  'The RULE FLOOR: one catalogue family from the register''s own What codes, or null where the codes name nothing honest — a mission code silences a subject code (a hospice gets nothing), and the arts/environment pair abstains because both labels contain "heritage" and so the pair cannot say which (2026-10-07).';
