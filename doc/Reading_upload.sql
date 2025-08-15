-- =========================================================
-- FULL IELTS ACADEMIC READING PAPER (3 sections, 40 Qs)
-- Slug: reading-test-38
-- =========================================================

-- 0) Open reads for passages/questions (safe public read)

-- 1) PASSAGES ---------------------------------------------------------------

insert into public.reading_passages (slug, title, difficulty, words, content)
values
(
  'reading-test-38',
  'Urban Nature, Green Roofs, and Writing Systems',
  'Academic',
  2500,
  -- Section 1 (Urban Beekeeping), Section 2 (Green Roofs), Section 3 (Writing Systems)
  -- Keep HTML simple; your UI renders as prose.
  '<h2>Section 1 — Urban Beekeeping</h2>
   <p>Urban beekeeping has expanded rapidly over the past decade as cities recognise the value of pollinators for biodiversity and food systems. Rooftop hives, community apiaries, and educational programs have made honey bees a visible emblem of urban ecology. Proponents argue that cities, with diverse flowering plants and fewer pesticides than industrial farmland, can provide reliable forage for bees. However, research cautions that unmanaged growth of honey bee colonies may increase competition with native wild pollinators. While hobbyists typically monitor hive health, colony density is not always planned at the neighbourhood scale.</p>
   <p>For readers, two skills are vital: skimming to identify relevant paragraphs and scanning to locate keywords. These strategies reduce time spent re-reading and help candidates target information precisely. Studies show that readers who preview headings and first sentences gain a mental map that improves accuracy on detail questions.</p>

   <h2>Section 2 — Green Roofs and Energy Efficiency</h2>
   <p>Green roofs—layers of vegetation installed on building rooftops—moderate temperature extremes, absorb stormwater, reduce noise, and extend roof lifespan. Extensive systems feature shallow growing media and low-maintenance plants; intensive systems support deeper soils, shrubs, and even trees, but require greater structural capacity and care. By shading and evapotranspiration, vegetation lowers surface temperatures, reducing urban heat islands. In winter, added insulation can decrease heat loss. Yet performance depends on climate, design, and maintenance. Life-cycle assessments indicate benefits often outweigh costs, particularly when co-benefits—biodiversity, amenity, and air quality—are included.</p>
   <p>City policies increasingly offer incentives or mandates for green roofs on large developments. Critics warn that without maintenance budgets, initial performance declines. Others note that in arid climates, irrigation may offset some energy savings. Still, case studies from temperate regions report consistent reductions in peak summer energy demand.</p>

   <h2>Section 3 — The History of Writing Systems</h2>
   <p>Writing systems arose independently several times in human history, notably in Mesopotamia, Mesoamerica, China, and possibly Egypt. Early scripts often began as logographic systems, where symbols represent words or morphemes. Over centuries, many evolved to include phonetic components, allowing the representation of sounds. The Phoenician alphabet, a consonantal abjad, heavily influenced the Greek alphabet, which added explicit vowels; the Latin alphabet later spread with the Roman Empire and through print culture.</p>
   <p>Contrary to the belief that alphabets are always superior, script choice reflects cultural, technological, and linguistic factors. For languages with complex syllable structures, alphabets may be efficient; for others, syllabaries or mixed systems can better encode information. Digitisation has renewed interest in universal encoding (Unicode) and the preservation of minority scripts. While some scripts fell out of daily use, they continue to shape identity and scholarship.</p>'
)
on conflict (slug) do nothing;


-- 2) QUESTIONS --------------------------------------------------------------
-- NOTE:
--  - order_no follows IELTS numbering 1..40
--  - kinds: tfng | mcq | matching | short
--  - options for mcq: array of strings
--  - options for matching: array of {left, right[]} objects
--  - answers:
--      tfng: ['True'|'False'|'Not Given']
--      mcq:  ['Correct String']
--      short: ['accepted','synonyms']
--      matching: ['ChosenRightForLeft1','ChosenRightForLeft2',...]

-- SECTION 1: Q1–13 (Urban Beekeeping)
-- Q1–7 TF/NG
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 1, 'tfng', 'Cities typically use more pesticides than industrial farmland.', null, jsonb_build_array('False'), 1),
('reading-test-38', 2, 'tfng', 'Urban hobbyists always coordinate hive numbers at the neighbourhood scale.', null, jsonb_build_array('False'), 1),
('reading-test-38', 3, 'tfng', 'Research suggests honey bees may compete with native pollinators.', null, jsonb_build_array('True'), 1),
('reading-test-38', 4, 'tfng', 'Skimming helps create a quick mental map of a passage.', null, jsonb_build_array('True'), 1),
('reading-test-38', 5, 'tfng', 'Scanning is mainly used to evaluate writer attitude.', null, jsonb_build_array('Not Given'), 1),
('reading-test-38', 6, 'tfng', 'Headings and first sentences can guide efficient reading.', null, jsonb_build_array('True'), 1),
('reading-test-38', 7, 'tfng', 'Urban beekeeping has declined in the last decade.', null, jsonb_build_array('False'), 1);

-- Q8–10 MCQ
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 8,  'mcq', 'One risk of unplanned expansion of urban honey bee colonies is:', jsonb_build_array('More honey production','Competition with wild pollinators','Higher honey prices','Increased farmland pesticides'), jsonb_build_array('Competition with wild pollinators'), 1),
('reading-test-38', 9,  'mcq', 'A key benefit of previewing headings is to:', jsonb_build_array('Reduce vocabulary load','Provide a structural overview','Reveal the answers directly','Improve handwriting'), jsonb_build_array('Provide a structural overview'), 1),
('reading-test-38', 10, 'mcq', 'Scanning is best used to:', jsonb_build_array('Understand tone','Find specific keywords','Summarise paragraphs','Predict author bias'), jsonb_build_array('Find specific keywords'), 1);

-- Q11–13 SHORT (one word/short phrase; include common variants)
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 11, 'short', 'What kind of hives are often installed on buildings in cities? (one word)', null, jsonb_build_array('rooftop','rooftops'), 1),
('reading-test-38', 12, 'short', 'Name the type of readers who <em>monitor hive health</em>. (one word)', null, jsonb_build_array('hobbyists','beekeepers'), 1),
('reading-test-38', 13, 'short', 'Which reading technique helps identify main ideas quickly? (one word)', null, jsonb_build_array('skimming'), 1);


-- SECTION 2: Q14–26 (Green Roofs)
-- Q14–18 MATCHING (match feature to description)
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 14, 'matching', 'Match each feature to the correct description:', jsonb_build_array(
  jsonb_build_object('left','Extensive roof','right', jsonb_build_array('Shallow media, low maintenance','Deep soil, trees possible','Noise reduction','Stormwater absorption')),
  jsonb_build_object('left','Intensive roof','right', jsonb_build_array('Shallow media, low maintenance','Deep soil, trees possible','Noise reduction','Stormwater absorption')),
  jsonb_build_object('left','Evapotranspiration','right', jsonb_build_array('Shading by vegetation','Water loss cooling surfaces','Extends roof lifespan','Insulation in winter')),
  jsonb_build_object('left','Insulation','right', jsonb_build_array('Shading by vegetation','Water loss cooling surfaces','Extends roof lifespan','Insulation in winter')),
  jsonb_build_object('left','Co-benefits','right', jsonb_build_array('Biodiversity/amenity/air quality','Irrigation in arid climates','Reduced structural capacity','Mandatory incentives'))
), jsonb_build_array(
  'Shallow media, low maintenance',
  'Deep soil, trees possible',
  'Water loss cooling surfaces',
  'Insulation in winter',
  'Biodiversity/amenity/air quality'
), 1);

-- Q19–22 TF/NG
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 19, 'tfng', 'Green roofs always perform well regardless of climate.', null, jsonb_build_array('False'), 1),
('reading-test-38', 20, 'tfng', 'Some cities require green roofs for large developments.', null, jsonb_build_array('True'), 1),
('reading-test-38', 21, 'tfng', 'Maintenance budgets do not affect long-term performance.', null, jsonb_build_array('False'), 1),
('reading-test-38', 22, 'tfng', 'In dry regions, watering may reduce net energy savings.', null, jsonb_build_array('True'), 1);

-- Q23–24 MCQ
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 23, 'mcq', 'Which factor is crucial for roof structural feasibility?', jsonb_build_array('Soil pH','Structural capacity','Colour of vegetation','Proximity to parks'), jsonb_build_array('Structural capacity'), 1),
('reading-test-38', 24, 'mcq', 'What do life-cycle assessments typically show?', jsonb_build_array('Costs exceed benefits','Benefits often outweigh costs','No significant differences','Only aesthetic advantages'), jsonb_build_array('Benefits often outweigh costs'), 1);

-- Q25–26 SHORT
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 25, 'short', 'Which season benefits from added thermal resistance? (one word)', null, jsonb_build_array('winter'), 1),
('reading-test-38', 26, 'short', 'Name one <em>heat island</em> mitigation mechanism. (one word)', null, jsonb_build_array('shading','evapotranspiration'), 1);


-- SECTION 3: Q27–40 (Writing Systems)
-- Q27–31 TF/NG
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 27, 'tfng', 'Writing emerged only once and then spread globally.', null, jsonb_build_array('False'), 1),
('reading-test-38', 28, 'tfng', 'Early scripts were often logographic.', null, jsonb_build_array('True'), 1),
('reading-test-38', 29, 'tfng', 'The Greek alphabet included explicit vowels.', null, jsonb_build_array('True'), 1),
('reading-test-38', 30, 'tfng', 'All languages are best served by alphabetic scripts.', null, jsonb_build_array('False'), 1),
('reading-test-38', 31, 'tfng', 'Unicode has reduced interest in minority scripts.', null, jsonb_build_array('False'), 1);

-- Q32–36 MCQ
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 32, 'mcq', 'Which script influenced the Greek alphabet?', jsonb_build_array('Latin','Cyrillic','Phoenician','Brahmi'), jsonb_build_array('Phoenician'), 1),
('reading-test-38', 33, 'mcq', 'A system where symbols represent words is called:', jsonb_build_array('Alphabet','Syllabary','Logography','Abjad'), jsonb_build_array('Logography'), 1),
('reading-test-38', 34, 'mcq', 'One reason some scripts persist despite limited daily use is:', jsonb_build_array('Ease of handwriting','Cultural identity and scholarship','Universal intelligibility','Legal requirement'), jsonb_build_array('Cultural identity and scholarship'), 1),
('reading-test-38', 35, 'mcq', 'An abjad typically:', jsonb_build_array('Represents vowels only','Represents syllables as units','Represents consonants primarily','Represents morphemes only'), jsonb_build_array('Represents consonants primarily'), 1),
('reading-test-38', 36, 'mcq', 'Digitisation has encouraged:', jsonb_build_array('Script unification only','Unicode and preservation efforts','Abandonment of non-Latin scripts','Shorter alphabets'), jsonb_build_array('Unicode and preservation efforts'), 1);

-- Q37–40 SHORT
insert into public.reading_questions (passage_slug, order_no, kind, prompt, options, answers, points) values
('reading-test-38', 37, 'short', 'Name one region where writing arose independently: (one word)', null, jsonb_build_array('Mesopotamia','Mesoamerica','China','Egypt'), 1),
('reading-test-38', 38, 'short', 'What kind of system maps symbols to syllables? (one word)', null, jsonb_build_array('syllabary'), 1),
('reading-test-38', 39, 'short', 'Which alphabet spread widely with the Romans? (one word)', null, jsonb_build_array('latin'), 1),
('reading-test-38', 40, 'short', 'What do symbols represent in logography? (one word)', null, jsonb_build_array('words','morphemes'), 1);
