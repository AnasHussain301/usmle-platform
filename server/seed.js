const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding Zetchy application database with complete Sketchy, FA, and DDx data...');

  // 1. Users
  const users = db.getUsers();
  if (users.length === 0) {
    const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
    const userPasswordHash = bcrypt.hashSync('Student123!', 10);

    db.createUser({
      name: 'Dr. System Admin',
      email: 'admin@radmed.local',
      passwordHash: adminPasswordHash,
      role: 'admin',
      tier: 'premium',
      hasCompletedTour: true,
      trialDaysRemaining: 365
    });

    db.createUser({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@usmle.com',
      passwordHash: userPasswordHash,
      role: 'user',
      tier: 'premium',
      hasCompletedTour: true,
      trialDaysRemaining: 30
    });

    db.createUser({
      name: 'Dr. Michael Chen',
      email: 'michael.chen@usmle.com',
      passwordHash: userPasswordHash,
      role: 'user',
      tier: 'free',
      hasCompletedTour: false,
      trialDaysRemaining: 2
    });
  }

  // 2. First Aid Organ Systems (12 Systems)
  db.data.firstAidSystems = [
    {
      id: 'cvs', name: 'Cardiovascular', subtitle: 'Headings by subject and page', color: '#c2410c', icon: 'heart', easy: 0, forgetting: 0,
      topics: [
        { title: 'Atherosclerosis & Coronary Artery Disease', page: 298, highYield: 'Fatty streak → fibrous plaque → complex lesion. LDL oxidation and endothelial dysfunction.' },
        { title: 'Myocardial Infarction Evolution', page: 304, highYield: '0-24h: wavy fibers, reperfusion injury. 1-3d: coagulation necrosis, neutrophils. 3-14d: macrophages, granulation. 2w+: collagen scar.' },
        { title: 'Heart Failure & Starling Curves', page: 310, highYield: 'Systolic (HFrEF, eccentric hypertrophy, S3) vs Diastolic (HFpEF, concentric hypertrophy, S4).' },
        { title: 'Cardiac Murmurs & Maneuvers', page: 314, highYield: 'Valsalva/Standing decrease most murmurs except HCM & MVP (earlier click/longer murmur).' }
      ]
    },
    {
      id: 'endo', name: 'Endocrine', subtitle: 'Headings by subject and page', color: '#a16207', icon: 'butterfly', easy: 0, forgetting: 0,
      topics: [
        { title: 'Thyroiditis Classifications', page: 340, highYield: 'Hashimoto (anti-TPO, Hurthle cells) vs Subacute Granulomatous / De Quervain (painful, jaw radiation, giant cells).' },
        { title: 'Diabetes Mellitus Type 1 & 2', page: 346, highYield: 'T1DM: HLA-DR3/DR4, islet leukocyte infiltrate. T2DM: amyloid polypeptide (IAPP) deposits in islets.' },
        { title: 'Adrenal Insufficiency & Cushing', page: 352, highYield: 'Primary adrenal insufficiency (Addison: high ACTH, hyperpigmentation, hyperkalemia) vs Secondary.' }
      ]
    },
    {
      id: 'gi', name: 'Gastrointestinal', subtitle: 'Headings by subject and page', color: '#4d7c0f', icon: 'bowl', easy: 0, forgetting: 0,
      topics: [
        { title: 'Esophageal Pathology & Dysphagia', page: 372, highYield: 'Achalasia (loss of myenteric plexus, "bird-beak" barium swallow) vs Boerhaave (transmural distal rupture).' },
        { title: 'Inflammatory Bowel Disease', page: 380, highYield: 'Crohn: transmural, skip lesions, cobblestone, noncaseating granulomas. UC: continuous, mucosal, crypt abscesses.' },
        { title: 'Cirrhosis & Portal Hypertension', page: 390, highYield: 'Stellate (Ito) cells produce collagen in Space of Disse. SAAG > 1.1 indicates portal hypertension.' }
      ]
    },
    {
      id: 'heme', name: 'Hematology & Oncology', subtitle: 'Headings by subject and page', color: '#831843', icon: 'drop', easy: 0, forgetting: 0,
      topics: [
        { title: 'Microcytic Anemias Breakdown', page: 412, highYield: 'Mentzer Index < 13 = Thalassemia trait; > 13 = Iron deficiency. Ferritin is the single best diagnostic test.' },
        { title: 'Hemolytic Anemias (Intrinsic vs Extrinsic)', page: 418, highYield: 'Hereditary spherocytosis (osmotic fragility, eosin-5-maleimide) vs G6PD deficiency (Heinz bodies, bite cells).' },
        { title: 'Leukemias & Lymphomas', page: 426, highYield: 'ALL (t(12;21), CALLA/CD10+), AML (Auer rods, t(15;17) responds to ATRA), CML (t(9;22) BCR-ABL), CLL (smudge cells).' }
      ]
    },
    {
      id: 'msk', name: 'Musculoskeletal & Skin', subtitle: 'Headings by subject and page', color: '#c2410c', icon: 'bone', easy: 0, forgetting: 0,
      topics: [
        { title: 'Inflammatory Arthritis & Connective Tissue', page: 450, highYield: 'Rheumatoid (anti-CCP, symmetric MCP/PIP sparing DIP, pannus) vs Osteoarthritis (DIP Heberden nodes).' },
        { title: 'Systemic Lupus Erythematosus (SLE)', page: 454, highYield: 'Anti-Smith (most specific), Anti-dsDNA (correlates with lupus nephritis and disease activity).' }
      ]
    },
    {
      id: 'neuro', name: 'Neurology', subtitle: 'Headings by subject and page', color: '#581c87', icon: 'brain', easy: 0, forgetting: 0,
      topics: [
        { title: 'Cerebrovascular Stroke Syndromes', page: 490, highYield: 'MCA (contralateral face & arm), ACA (contralateral leg), PICA (Wallenberg / lateral medullary syndrome).' },
        { title: 'Dementias & Movement Disorders', page: 504, highYield: 'Alzheimer (tau neurofibrillary tangles, amyloid beta), Parkinson (alpha-synuclein Lewy bodies, loss of substantia nigra).' }
      ]
    },
    {
      id: 'psych', name: 'Psychiatry', subtitle: 'Headings by subject and page', color: '#3b82f6', icon: 'smile', easy: 0, forgetting: 0,
      topics: [
        { title: 'Mood & Psychotic Disorders', page: 540, highYield: 'MDD: SIG E CAPS for >= 2 weeks. Bipolar I: >= 1 manic episode (DIG FAST for >= 1 week).' }
      ]
    },
    {
      id: 'renal', name: 'Renal', subtitle: 'Headings by subject and page', color: '#0e7490', icon: 'funnel', easy: 0, forgetting: 0,
      topics: [
        { title: 'Nephritic vs Nephrotic Syndromes', page: 580, highYield: 'Nephrotic (proteinuria > 3.5g/d, podocyte effacement) vs Nephritic (RBC casts, hematuria, hypertension).' },
        { title: 'Acid-Base & Electrolyte Disorders', page: 590, highYield: 'Winter formula: PaCO2 = 1.5 * [HCO3-] + 8 +/- 2 for metabolic acidosis respiratory compensation.' }
      ]
    },
    {
      id: 'repro', name: 'Reproductive', subtitle: 'Headings by subject and page', color: '#db2777', icon: 'baby', easy: 0, forgetting: 0,
      topics: [
        { title: 'Ovarian & Testicular Neoplasms', page: 620, highYield: 'Serous cystadenocarcinoma (psammoma bodies), Granulosa cell (Call-Exner bodies), Seminoma (fried-egg cells).' }
      ]
    },
    {
      id: 'resp', name: 'Respiratory', subtitle: 'Headings by subject and page', color: '#0284c7', icon: 'lungs', easy: 0, forgetting: 0,
      topics: [
        { title: 'Obstructive vs Restrictive Patterns', page: 660, highYield: 'Obstructive: FEV1/FVC < 0.70. Restrictive: FEV1/FVC normal or increased (> 0.80) with decreased TLC.' },
        { title: 'Pulmonary Embolism & V/Q Mismatch', page: 668, highYield: 'Westermark sign, Hampton hump. High V/Q dead space ventilation, low PaO2 with respiratory alkalosis.' }
      ]
    },
    {
      id: 'immuno', name: 'Immunology', subtitle: 'Headings by subject and page', color: '#0369a1', icon: 'shield', easy: 0, forgetting: 0,
      topics: [
        { title: 'Hypersensitivity Reactions (Types I-IV)', page: 700, highYield: 'Type I: IgE & mast cells. Type II: cytotoxic IgG/IgM. Type III: immune complex. Type IV: delayed T-cell.' }
      ]
    },
    {
      id: 'principles', name: 'General Principles', subtitle: 'Headings by subject and page', color: '#475569', icon: 'dna', easy: 0, forgetting: 0,
      topics: [
        { title: 'Autonomic Pharmacology & Receptors', page: 740, highYield: 'Alpha-1 (Gq), Alpha-2 (Gi), Beta-1 (Gs, heart), Beta-2 (Gs, bronchodilation), M2 (Gi), M3 (Gq).' }
      ]
    }
  ];

  // 3. Sketchy Path Data (9 Systems, 141 Total Sketches)
  db.data.sketchyPathData = {
    totalSketches: 141,
    systemsCount: 9,
    systems: [
      {
        id: 'sys_blood',
        name: 'Blood & Coagulation',
        totalSketches: 12,
        progress: 0,
        color: '#831843',
        subcategories: [
          {
            name: 'Microcytic anemias',
            count: 2,
            progress: 0,
            sketches: [
              {
                id: 'sketch_1_1',
                number: '1.1',
                title: 'Microcytic Anemia: Overview & Thalassemias',
                image: '/assets/sketches/thumb_thalassemia.png',
                canvasImage: '/assets/sketches/thalassemia_canvas.png',
                progress: 0,
                questionsCount: 28,
                totalSymbols: 54,
                symbols: [
                  { pin: 1, x: 12, y: 84, title: 'Dwarf Doorway Entrance', meaning: 'Definition of Microcytic Anemia: Mean Corpuscular Volume (MCV) < 80 fL resulting from impaired hemoglobin synthesis.', fact: 'Extra mitotic division occurs during erythropoiesis because hemoglobin production is delayed.' },
                  { pin: 2, x: 25, y: 79, title: 'Mediterranean Sea Galleon', meaning: 'Epidemiology: Beta-thalassemia is prevalent in Mediterranean populations; Alpha-thalassemia in Southeast Asian and African descent.', fact: 'Heterozygosity offers balanced evolutionary protection against severe Plasmodium falciparum malaria.' },
                  { pin: 3, x: 38, y: 82, title: 'Two Alpha & Two Beta Ingot Pairs', meaning: 'Hemoglobin A (HbA) structure: composed of 2 alpha and 2 beta globin chains.', fact: 'HbF is alpha2-gamma2; HbA2 is alpha2-delta2.' },
                  { pin: 4, x: 50, y: 76, title: 'Mentzer Index Balance Scale', meaning: 'Mentzer Index = MCV / RBC count. Index < 13 strongly suggests Thalassemia trait; > 13 suggests Iron Deficiency Anemia.', fact: 'Thalassemia has microcytosis with relatively high RBC count; Iron deficiency has microcytosis with low RBC count.' },
                  { pin: 5, x: 65, y: 78, title: 'Hb Bart Hydrops Fetalis Waterfall', meaning: 'Four alpha-gene deletion (--/--) leads to excess gamma-globin tetramers (Hb Barts), causing fatal hydrops fetalis in utero.', fact: 'Hb Barts has extremely high oxygen affinity and cannot release oxygen to fetal tissues.' },
                  { pin: 6, x: 80, y: 80, title: 'HbH Golf Ball Precipitates', meaning: 'Three alpha-gene deletion (--/-alpha) results in beta-globin tetramers (HbH), seen as golf-ball inclusion bodies on brilliant cresyl blue stain.', fact: 'Causes chronic moderate-to-severe microcytic hemolytic anemia with splenomegaly.' }
                ]
              },
              {
                id: 'sketch_1_2',
                number: '1.2',
                title: 'Iron Deficiency Anemia & Anemia of Chronic Disease',
                image: '/assets/sketches/thumb_iron_deficiency.png',
                canvasImage: '/assets/sketches/iron_deficiency_canvas.png',
                progress: 0,
                questionsCount: 15,
                totalSymbols: 49,
                symbols: [
                  { pin: 1, x: 7, y: 78, title: "Dwarf's Den Entrance", meaning: 'Microcytic Anemia (MCV < 80 fL) - defective hemoglobin synthesis results in an extra division of erythroid precursors producing small RBCs.', fact: 'Iron deficiency is the #1 most common nutritional deficiency worldwide.' },
                  { pin: 2, x: 20, y: 83, title: 'Diminished Iron Ingot Pile', meaning: 'Decreased Serum Iron levels due to absolute body depletion or inflammatory sequestration.', fact: 'Serum iron reflects iron bound to transferrin; drops as body stores deplete.' },
                  { pin: 3, x: 26, y: 75, title: 'Empty Iron Forge Cart', meaning: 'Elevated Total Iron Binding Capacity (TIBC) / High Serum Transferrin concentration.', fact: 'Liver synthesizes more transferrin in an attempt to capture any remaining circulating iron.' },
                  { pin: 4, x: 36, y: 80, title: 'Low Ferritin Deposit Chest', meaning: 'Low Serum Ferritin (< 30 ng/mL) is the single most sensitive and specific test for iron deficiency.', fact: 'Ferritin < 15-30 ng/mL is virtually diagnostic of iron deficiency anemia.' },
                  { pin: 5, x: 61, y: 87, title: 'Caged Iron Safe (Hepcidin)', meaning: 'Hepcidin upregulation in Anemia of Chronic Disease (ACD) blocks ferroportin.', fact: 'ACD shows elevated Ferritin and low TIBC, differentiating it from true iron deficiency.' },
                  { pin: 6, x: 51, y: 81, title: 'Red Cells with Central Pallor', meaning: 'Hypochromic erythrocytes with central pallor exceeding 1/3 of the red blood cell diameter.', fact: 'Severe iron deficiency produces pencil cells / cigar-shaped elliptocytes on peripheral smear.' },
                  { pin: 7, x: 54, y: 76, title: 'Anisocytosis Balance Scale', meaning: 'Elevated Red Cell Distribution Width (RDW > 15%).', fact: 'RDW is elevated in Iron Deficiency, but normal in uncomplicated Thalassemia trait.' },
                  { pin: 8, x: 37, y: 73, title: 'Locked Iron Gate', meaning: 'Ferroportin internalisation by Hepcidin prevents duodenal enterocyte iron absorption.', fact: 'Upregulated by IL-6, TNF-alpha, and other acute phase inflammatory cytokines.' },
                  { pin: 9, x: 60, y: 78, title: 'Rusty Iron Cauldron', meaning: 'Free Erythrocyte Protoporphyrin (FEP) accumulates because iron is unavailable to bind protoporphyrin.', fact: 'Final step of heme synthesis catalyzed by ferrochelatase in mitochondria.' },
                  { pin: 10, x: 53, y: 62, title: 'Peptic Ulcer Cavern', meaning: 'Occult gastrointestinal bleeding is the primary cause in adult males and postmenopausal females.', fact: 'Any adult male with iron deficiency anemia must undergo colonoscopy and endoscopy to rule out colorectal carcinoma.' },
                  { pin: 11, x: 62, y: 43, title: 'Menstrual Red Stream', meaning: 'Menorrhagia / abnormal uterine bleeding is the most common cause in premenopausal females.', fact: 'Ask about frequency of changing pads/tampons and passing large blood clots.' },
                  { pin: 12, x: 69, y: 68, title: 'Duodenal Celiac Steppe', meaning: 'Malabsorption due to Celiac Disease, Crohn disease, or prior gastric bypass surgery.', fact: 'Non-heme iron is absorbed primarily in the duodenum via DMT-1.' },
                  { pin: 13, x: 56, y: 37, title: 'Esophageal Web Flap', meaning: 'Plummer-Vinson Syndrome: triad of Iron deficiency anemia, Esophageal webs, and Dysphagia.', fact: 'Carries increased risk for squamous cell carcinoma of the esophagus.' },
                  { pin: 14, x: 49, y: 41, title: 'Spoon-Shaped Nails (Koilonychia)', meaning: 'Brittle, spoon-shaped concave fingernails resulting from severe chronic iron depletion.', fact: 'Often accompanied by atrophic glossitis (smooth beefy red tongue) and angular cheilitis.' },
                  { pin: 15, x: 84, y: 88, title: 'Ice Chewers Pickaxe', meaning: 'Pica (craving non-nutritive substances) & Pagophagia (compulsive ice chewing).', fact: 'Classically resolves within days of beginning oral iron replacement therapy.' }
                ]
              }
            ]
          },
          {
            name: 'Normocytic & macrocytic anemias',
            count: 5,
            progress: 0,
            sketches: [
              {
                id: 'sketch_1_3',
                number: '1.3',
                title: 'Vitamin B12 & Folate Deficiency (Megaloblastic Anemia)',
                image: '/assets/sketches/thumb_sketch_1_3.svg',
                canvasImage: '/assets/sketches/canvas_sketch_1_3.svg',
                progress: 0,
                questionsCount: 14,
                totalSymbols: 38,
                symbols: [
                  { pin: 1, x: 15, y: 75, title: 'Cobalt Shield & Liver Vault', meaning: 'B12 (cobalamin) hepatic stores last 3-5 years; folate stores deplete within months.', fact: 'Terminal ileum resection impairs B12 absorption; jejunum absorbs folate.' },
                  { pin: 2, x: 35, y: 80, title: 'Hypersegmented Knight Helmet', meaning: 'Hypersegmented neutrophils (>= 5-6 lobes) are pathognomonic on peripheral smear.', fact: 'Impaired thymidylate synthesis leads to nuclear-cytoplasmic dyssynchrony.' },
                  { pin: 3, x: 60, y: 70, title: 'Methylmalonic Acid Spine Cable', meaning: 'Elevated methylmalonic acid and homocysteine in B12; ONLY homocysteine elevated in folate.', fact: 'Subacute combined degeneration (dorsal & lateral columns) occurs only in B12 deficiency.' }
                ]
              },
              {
                id: 'sketch_1_4',
                number: '1.4',
                title: 'Sickle Cell Disease & Hemoglobinopathies',
                image: '/assets/sketches/thumb_sketch_1_4.svg',
                canvasImage: '/assets/sketches/canvas_sketch_1_4.svg',
                progress: 0,
                questionsCount: 16,
                totalSymbols: 42,
                symbols: [
                  { pin: 1, x: 20, y: 75, title: 'Valine Swordsman (6th Codon Mutation)', meaning: 'Point mutation in 6th codon of beta-globin: hydrophilic glutamate replaced by hydrophobic valine.', fact: 'Deoxygenation, dehydration, and acidosis trigger hydrophobic polymerization into rigid sickle polymers.' },
                  { pin: 2, x: 50, y: 80, title: 'Autoinfarcted Spleen Shield', meaning: 'Repeated splenic microinfarctions lead to autosplenectomy by age 5-6.', fact: 'Patients require vaccination against encapsulated organisms (S. pneumoniae, N. meningitidis, H. influenzae).' }
                ]
              },
              {
                id: 'sketch_1_5',
                number: '1.5',
                title: 'Immune Thrombocytopenia (ITP) & TTP / HUS',
                image: '/assets/sketches/thumb_sketch_1_5.svg',
                canvasImage: '/assets/sketches/canvas_sketch_1_5.svg',
                progress: 0,
                questionsCount: 15,
                totalSymbols: 36,
                symbols: [
                  { pin: 1, x: 25, y: 70, title: 'ADAMTS13 Broken Rapier', meaning: 'TTP is caused by deficient ADAMTS13 metalloprotease, leaving ultra-large vWF multimers uncleaved.', fact: 'Classic pentad: Thrombocytopenia, Microangiopathic hemolytic anemia (schistocytes), Neurologic symptoms, Fever, Renal failure.' }
                ]
              }
            ]
          },
          {
            name: 'Hemostasis & platelet disorders',
            count: 5,
            progress: 0,
            sketches: []
          }
        ]
      },
      {
        id: 'sys_cardio',
        name: 'Cardiovascular System',
        totalSketches: 16,
        progress: 0,
        color: '#9a3412',
        subcategories: [
          {
            name: 'Ischemic heart disease & Infarction',
            count: 4,
            progress: 0,
            sketches: [
              {
                id: 'sketch_cv_1', number: '2.1', title: 'Myocardial Infarction: Pathology & Timeline',
                image: '/assets/sketches/thumb_sketch_cv_1.svg', canvasImage: '/assets/sketches/canvas_sketch_cv_1.svg',
                progress: 0, questionsCount: 18, totalSymbols: 44,
                symbols: [
                  { pin: 1, x: 18, y: 75, title: 'Coronary Thrombosis Dam', meaning: 'Acute plaque rupture with superimposed thrombus blocks coronary arterial blood flow.', fact: 'LAD is most common (anterior wall & septum), followed by RCA and LCx.' },
                  { pin: 2, x: 45, y: 70, title: 'Coagulation Necrosis Hourglass', meaning: 'Histologic changes: 4-12h wavy fibers; 12-24h early necrosis & contraction bands; 1-3d dense neutrophilic infiltrate.', fact: 'Free wall rupture occurs typically 3-14 days post-MI during macrophage degradation.' }
                ]
              },
              {
                id: 'sketch_cv_2', number: '2.2', title: 'Heart Failure & Cardiomyopathies',
                image: '/assets/sketches/thumb_sketch_cv_2.svg', canvasImage: '/assets/sketches/canvas_sketch_cv_2.svg',
                progress: 0, questionsCount: 16, totalSymbols: 40, symbols: []
              },
              {
                id: 'sketch_cv_3', number: '2.3', title: 'Valvular Heart Diseases',
                image: '/assets/sketches/thumb_sketch_cv_3.svg', canvasImage: '/assets/sketches/canvas_sketch_cv_3.svg',
                progress: 0, questionsCount: 14, totalSymbols: 36, symbols: []
              },
              {
                id: 'sketch_cv_4', number: '2.4', title: 'Hypertension & Atherosclerosis',
                image: '/assets/sketches/thumb_sketch_cv_4.svg', canvasImage: '/assets/sketches/canvas_sketch_cv_4.svg',
                progress: 0, questionsCount: 12, totalSymbols: 32, symbols: []
              }
            ]
          }
        ]
      },
      {
        id: 'sys_resp',
        name: 'Respiratory System',
        totalSketches: 14,
        progress: 0,
        color: '#0284c7',
        subcategories: [
          {
            name: 'Obstructive & restrictive lung diseases',
            count: 3,
            progress: 0,
            sketches: [
              {
                id: 'sketch_resp_1', number: '3.1', title: 'COPD, Emphysema & Chronic Bronchitis',
                image: '/assets/sketches/thumb_sketch_resp_1.svg', canvasImage: '/assets/sketches/canvas_sketch_resp_1.svg',
                progress: 0, questionsCount: 15, totalSymbols: 38,
                symbols: [
                  { pin: 1, x: 25, y: 75, title: 'Centriacinar Smoke Pipe', meaning: 'Centriacinar emphysema is strongly linked to smoking (upper lobes); Panacinar linked to alpha-1 antitrypsin deficiency (lower lobes).', fact: 'Reid index > 0.5 indicates mucous gland hyperplasia in chronic bronchitis.' }
                ]
              },
              {
                id: 'sketch_resp_2', number: '3.2', title: 'Asthma & Hypersensitivity',
                image: '/assets/sketches/thumb_sketch_resp_2.svg', canvasImage: '/assets/sketches/canvas_sketch_resp_2.svg',
                progress: 0, questionsCount: 13, totalSymbols: 34, symbols: []
              },
              {
                id: 'sketch_resp_3', number: '3.3', title: 'Pneumonia & Lung Infections',
                image: '/assets/sketches/thumb_sketch_resp_3.svg', canvasImage: '/assets/sketches/canvas_sketch_resp_3.svg',
                progress: 0, questionsCount: 15, totalSymbols: 35, symbols: []
              }
            ]
          }
        ]
      },
      {
        id: 'sys_gi',
        name: 'Gastrointestinal System',
        totalSketches: 18,
        progress: 0,
        color: '#4d7c0f',
        subcategories: [
          {
            name: 'Esophageal & gastric pathology',
            count: 3,
            progress: 0,
            sketches: [
              {
                id: 'sketch_gi_1', number: '4.1', title: 'GERD, Barrett Esophagus & Adenocarcinoma',
                image: '/assets/sketches/thumb_sketch_gi_1.svg', canvasImage: '/assets/sketches/canvas_sketch_gi_1.svg',
                progress: 0, questionsCount: 14, totalSymbols: 36, symbols: []
              },
              {
                id: 'sketch_gi_2', number: '4.2', title: 'Peptic Ulcer Disease & Gastritis',
                image: '/assets/sketches/thumb_sketch_gi_2.svg', canvasImage: '/assets/sketches/canvas_sketch_gi_2.svg',
                progress: 0, questionsCount: 16, totalSymbols: 38, symbols: []
              },
              {
                id: 'sketch_gi_3', number: '4.3', title: 'IBD: Crohn Disease & Ulcerative Colitis',
                image: '/assets/sketches/thumb_sketch_gi_3.svg', canvasImage: '/assets/sketches/canvas_sketch_gi_3.svg',
                progress: 0, questionsCount: 18, totalSymbols: 42, symbols: []
              }
            ]
          }
        ]
      },
      {
        id: 'sys_renal',
        name: 'Renal System',
        totalSketches: 15,
        progress: 0,
        color: '#0e7490',
        subcategories: [
          {
            name: 'Glomerular diseases',
            count: 2,
            progress: 0,
            sketches: [
              {
                id: 'sketch_ren_1', number: '5.1', title: 'Membranous & Minimal Change Disease',
                image: '/assets/sketches/thumb_sketch_ren_1.svg', canvasImage: '/assets/sketches/canvas_sketch_ren_1.svg',
                progress: 0, questionsCount: 15, totalSymbols: 36, symbols: []
              },
              {
                id: 'sketch_ren_2', number: '5.2', title: 'Acute Kidney Injury & Tubulointerstitial Diseases',
                image: '/assets/sketches/thumb_sketch_ren_2.svg', canvasImage: '/assets/sketches/canvas_sketch_ren_2.svg',
                progress: 0, questionsCount: 14, totalSymbols: 34, symbols: []
              }
            ]
          }
        ]
      },
      {
        id: 'sys_neuro',
        name: 'Neurology & Special Senses',
        totalSketches: 20,
        progress: 0,
        color: '#581c87',
        subcategories: [
          {
            name: 'Neurodegenerative diseases & Stroke',
            count: 2,
            progress: 0,
            sketches: [
              {
                id: 'sketch_neuro_1', number: '6.1', title: 'Alzheimer Disease & Frontotemporal Dementia',
                image: '/assets/sketches/thumb_sketch_neuro_1.svg', canvasImage: '/assets/sketches/canvas_sketch_neuro_1.svg',
                progress: 0, questionsCount: 16, totalSymbols: 38, symbols: []
              },
              {
                id: 'sketch_neuro_2', number: '6.2', title: 'Stroke & Transient Ischemic Attack (TIA)',
                image: '/assets/sketches/thumb_sketch_neuro_2.svg', canvasImage: '/assets/sketches/canvas_sketch_neuro_2.svg',
                progress: 0, questionsCount: 15, totalSymbols: 36, symbols: []
              }
            ]
          }
        ]
      },
      {
        id: 'sys_msk',
        name: 'Musculoskeletal, Skin & Connective Tissue',
        totalSketches: 16,
        progress: 0,
        color: '#c2410c',
        subcategories: [
          {
            name: 'Autoimmune & Rheumatologic diseases',
            count: 1,
            progress: 0,
            sketches: [
              {
                id: 'sketch_msk_1', number: '7.1', title: 'Rheumatoid Arthritis vs Osteoarthritis',
                image: '/assets/sketches/thumb_sketch_msk_1.svg', canvasImage: '/assets/sketches/canvas_sketch_msk_1.svg',
                progress: 0, questionsCount: 14, totalSymbols: 32, symbols: []
              }
            ]
          }
        ]
      },
      {
        id: 'sys_endo',
        name: 'Endocrine System',
        totalSketches: 15,
        progress: 0,
        color: '#a16207',
        subcategories: [
          {
            name: 'Thyroid & Adrenal Pathology',
            count: 2,
            progress: 0,
            sketches: [
              {
                id: 'sketch_endo_1', number: '8.1', title: 'Thyroiditis & Thyroid Carcinomas',
                image: '/assets/sketches/thumb_sketch_endo_1.svg', canvasImage: '/assets/sketches/canvas_sketch_endo_1.svg',
                progress: 0, questionsCount: 14, totalSymbols: 34, symbols: []
              },
              {
                id: 'sketch_endo_2', number: '8.2', title: 'Diabetes Mellitus Type 1 & 2',
                image: '/assets/sketches/thumb_sketch_endo_2.svg', canvasImage: '/assets/sketches/canvas_sketch_endo_2.svg',
                progress: 0, questionsCount: 16, totalSymbols: 38, symbols: []
              }
            ]
          }
        ]
      },
      {
        id: 'sys_repro',
        name: 'Reproductive & Genitourinary',
        totalSketches: 15,
        progress: 0,
        color: '#be185d',
        subcategories: [
          {
            name: 'Gonadal Neoplasms',
            count: 1,
            progress: 0,
            sketches: [
              {
                id: 'sketch_repro_1', number: '9.1', title: 'Seminoma vs Non-Seminomatous Germ Cell Tumors',
                image: '/assets/sketches/thumb_sketch_repro_1.svg', canvasImage: '/assets/sketches/canvas_sketch_repro_1.svg',
                progress: 0, questionsCount: 12, totalSymbols: 30, symbols: []
              }
            ]
          }
        ]
      }
    ]
  };

  // 4. Sketchy Decks (Path, Micro, Pharm)
  db.data.sketchyDecks = [
    {
      id: 'sketchy_path',
      title: 'Sketchy Path',
      subtitle: '141 sketches · 9 systems',
      color: '#db2777',
      icon: 'microscope',
      progress: 0,
      sketches: []
    },
    {
      id: 'sketchy_micro',
      title: 'Sketchy Micro',
      subtitle: '139 sketches',
      color: '#166534',
      icon: 'virus',
      progress: 0,
      sketches: [
        {
          id: 'micro_staph_aureus',
          number: 'M1.1',
          title: 'Staphylococcus aureus (The Golden Staff of Moses)',
          system: 'Gram Positive Cocci',
          image: '/assets/sketches/thumb_micro_staph_aureus.svg',
          canvasImage: '/assets/sketches/canvas_micro_staph_aureus.svg',
          questionsCount: 22,
          totalSymbols: 38,
          symbols: [
            { pin: 1, x: 20, y: 75, title: 'Golden Staff of Moses', meaning: 'S. aureus produces yellow-gold carotenoid pigment colonies on blood agar.', fact: 'Gram-positive cocci in grape-like clusters.' },
            { pin: 2, x: 38, y: 80, title: 'Beta-Hemolytic Light Bulb', meaning: 'Produces complete beta-hemolysis on sheep blood agar due to hemolysins.', fact: 'Differentiates from alpha and gamma hemolytic organisms.' },
            { pin: 3, x: 55, y: 70, title: 'Catalase Positive Cat', meaning: 'Catalase positive (converts H2O2 into H2O and O2 with bubbling).', fact: 'Distinguishes Staphylococcus (catalase +) from Streptococcus (catalase -).' },
            { pin: 4, x: 72, y: 82, title: 'Coagulase Coagulating Cauldron', meaning: 'Coagulase positive (activates prothrombin to fibrin, walling off abscesses).', fact: 'Distinguishes S. aureus from coagulase-negative staphylococci (S. epidermidis, S. saprophyticus).' }
          ]
        },
        {
          id: 'micro_strep_pneumo',
          number: 'M1.2',
          title: 'Streptococcus pneumoniae (The Alpha Knight Tournament)',
          system: 'Gram Positive Cocci',
          image: '/assets/sketches/thumb_micro_strep_pneumo.svg',
          canvasImage: '/assets/sketches/canvas_micro_strep_pneumo.svg',
          questionsCount: 20,
          totalSymbols: 36,
          symbols: [
            { pin: 1, x: 22, y: 75, title: 'Lancet-Shaped Jousting Spear', meaning: 'Lancet-shaped diplococci appearing in pairs under microscopy.', fact: '#1 cause of community-acquired pneumonia, otitis media, and meningitis in adults.' },
            { pin: 2, x: 50, y: 80, title: 'Optochin Sensitive Chin Mask', meaning: 'Growth is inhibited by optochin disc (sensitive).', fact: 'Viridans streptococci are optochin resistant.' },
            { pin: 3, x: 70, y: 72, title: 'Bile Soluble Dissolving Shield', meaning: 'Soluble in bile salts (lysed by sodium deoxycholate).', fact: 'Capsule is major virulence factor; Quellung reaction positive.' }
          ]
        },
        {
          id: 'micro_pseudo',
          number: 'M2.1',
          title: 'Pseudomonas aeruginosa (The Suited Mona Lisa)',
          system: 'Gram Negative Bacilli',
          image: '/assets/sketches/thumb_micro_pseudo.svg',
          canvasImage: '/assets/sketches/canvas_micro_pseudo.svg',
          questionsCount: 18,
          totalSymbols: 34,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'Blue-Green Pyocyanin Paint', meaning: 'Produces blue-green pyocyanin and pyoverdine pigments with a sweet grape-like odor.', fact: 'Gram-negative, obligate aerobe, oxidase positive, catalase positive.' },
            { pin: 2, x: 55, y: 80, title: 'Exotoxin A Elongation Factor Robe', meaning: 'Exotoxin A inactivates EF-2 via ADP-ribosylation, halting host protein synthesis.', fact: 'Identical mechanism to Corynebacterium diphtheriae toxin.' }
          ]
        },
        {
          id: 'micro_ecoli',
          number: 'M2.2',
          title: 'Escherichia coli (The Red Gram-Negative Bazaar)',
          system: 'Gram Negative Bacilli',
          image: '/assets/sketches/thumb_micro_ecoli.svg',
          canvasImage: '/assets/sketches/canvas_micro_ecoli.svg',
          questionsCount: 19,
          totalSymbols: 35,
          symbols: [
            { pin: 1, x: 20, y: 75, title: 'Pink MacConkey Agar Milk Cart', meaning: 'Fast lactose fermenter turning MacConkey agar bright pink.', fact: 'Green metallic sheen on EMB agar.' },
            { pin: 2, x: 50, y: 70, title: 'Fimbriae Maiden Attachment Ropes', meaning: 'Fimbriae (pili) allow binding to uroepithelial receptors, causing UTI and pyelonephritis.', fact: '#1 cause of urinary tract infections worldwide.' }
          ]
        },
        {
          id: 'micro_tb',
          number: 'M3.1',
          title: 'Mycobacterium tuberculosis (The Caseous Cave)',
          system: 'Acid-Fast Bacilli',
          image: '/assets/sketches/thumb_micro_tb.svg',
          canvasImage: '/assets/sketches/canvas_micro_tb.svg',
          questionsCount: 24,
          totalSymbols: 40,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'Acid-Fast Tassel Gun', meaning: 'Acid-fast bacillus due to high mycolic acid content in cell wall; stains red with Ziehl-Neelsen.', fact: 'Cord factor induces TNF-alpha, activating macrophages to wall off granulomas.' }
          ]
        },
        {
          id: 'micro_hiv',
          number: 'M4.1',
          title: 'HIV & Retroviruses (The CD4 Castle Siege)',
          system: 'Viruses',
          image: '/assets/sketches/thumb_micro_hiv.svg',
          canvasImage: '/assets/sketches/canvas_micro_hiv.svg',
          questionsCount: 25,
          totalSymbols: 44,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'gp120 Battering Ram', meaning: 'gp120 surface glycoprotein binds to CD4 receptor and CCR5 / CXCR4 coreceptor on helper T cells.', fact: 'Homozygous CCR5-delta32 mutation confers resistance to HIV-1 infection.' }
          ]
        },
        {
          id: 'micro_influenza',
          number: 'M4.2',
          title: 'Influenza Virus (The Antigenic Winter Storm)',
          system: 'Viruses',
          image: '/assets/sketches/thumb_micro_influenza.svg',
          canvasImage: '/assets/sketches/canvas_micro_influenza.svg',
          questionsCount: 17,
          totalSymbols: 32,
          symbols: [
            { pin: 1, x: 30, y: 75, title: 'Hemagglutinin Spikes & Neuraminidase Scalpel', meaning: 'HA binds sialic acid on host cells; NA cleaves sialic acid to facilitate viral progeny release.', fact: 'Antigenic drift (minor point mutations) vs Antigenic shift (segment reassortment causing pandemics).' }
          ]
        },
        {
          id: 'micro_candida',
          number: 'M5.1',
          title: 'Candida albicans (The White Pseudohyphae Jungle)',
          system: 'Fungi',
          image: '/assets/sketches/thumb_micro_candida.svg',
          canvasImage: '/assets/sketches/canvas_micro_candida.svg',
          questionsCount: 16,
          totalSymbols: 30,
          symbols: [
            { pin: 1, x: 30, y: 75, title: 'Germ Tube Bridge at 37°C', meaning: 'Forms true germ tubes at 37°C; pseudohyphae and budding yeast at 20°C.', fact: 'Thrush, diaper rash, esophagitis in immunocompromised, vulvovaginitis.' }
          ]
        }
      ]
    },
    {
      id: 'sketchy_pharm',
      title: 'Sketchy Pharm',
      subtitle: '107 sketches · 12 systems',
      color: '#7e22ce',
      icon: 'pill',
      progress: 0,
      sketches: [
        {
          id: 'pharm_penicillin',
          number: 'P1.1',
          title: 'Penicillins & Beta-Lactams',
          system: 'Antimicrobials',
          image: '/assets/sketches/thumb_pharm_penicillin.svg',
          canvasImage: '/assets/sketches/canvas_pharm_penicillin.svg',
          questionsCount: 20,
          totalSymbols: 36,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'Transpeptidase Lock Pick', meaning: 'Inhibits penicillin-binding proteins (PBPs), blocking peptidoglycan cross-linking.', fact: 'Bactericidal; major adverse reaction is IgE-mediated Type I hypersensitivity.' }
          ]
        },
        {
          id: 'pharm_heparin',
          number: 'P2.1',
          title: 'Heparin & Anticoagulants',
          system: 'Cardiovascular & Blood',
          image: '/assets/sketches/thumb_pharm_heparin.svg',
          canvasImage: '/assets/sketches/canvas_pharm_heparin.svg',
          questionsCount: 18,
          totalSymbols: 34,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'Antithrombin III Supercharger', meaning: 'Potentiates antithrombin III, inactivating thrombin (IIa) and factor Xa.', fact: 'Reversed by Protamine sulfate; monitored by PTT.' }
          ]
        },
        {
          id: 'pharm_statins',
          number: 'P2.2',
          title: 'Statins (HMG-CoA Reductase Inhibitors)',
          system: 'Cardiovascular & Blood',
          image: '/assets/sketches/thumb_pharm_statins.svg',
          canvasImage: '/assets/sketches/canvas_pharm_statins.svg',
          questionsCount: 16,
          totalSymbols: 30,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'HMG-CoA Reductase Inhibitor Belt', meaning: 'Competitively inhibits HMG-CoA reductase (rate-limiting step of cholesterol synthesis).', fact: 'Upregulates LDL receptors; adverse effects include myopathy and elevated transaminases.' }
          ]
        },
        {
          id: 'pharm_ace',
          number: 'P2.3',
          title: 'ACE Inhibitors & Angiotensin Receptor Blockers',
          system: 'Renal & Cardiovascular',
          image: '/assets/sketches/thumb_pharm_ace.svg',
          canvasImage: '/assets/sketches/canvas_pharm_ace.svg',
          questionsCount: 18,
          totalSymbols: 32,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'Bradykinin Cough Trumpet', meaning: 'ACE breaks down bradykinin; inhibition leads to bradykinin accumulation causing dry cough and angioedema.', fact: 'Contraindicated in pregnancy (teratogenic: renal dysgenesis).' }
          ]
        },
        {
          id: 'pharm_ssri',
          number: 'P3.1',
          title: 'Antidepressants: SSRIs, SNRIs & TCAs',
          system: 'Central Nervous System',
          image: '/assets/sketches/thumb_pharm_ssri.svg',
          canvasImage: '/assets/sketches/canvas_pharm_ssri.svg',
          questionsCount: 22,
          totalSymbols: 38,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'Serotonin Reuptake Transporter Dam', meaning: 'Selectively inhibits 5-HT reuptake at the presynaptic cleft.', fact: 'Requires 4-6 weeks for clinical onset; risk of Serotonin Syndrome if combined with MAOIs.' }
          ]
        },
        {
          id: 'pharm_antiepileptic',
          number: 'P3.2',
          title: 'Antiepileptics: Phenytoin, Carbamazepine & Valproate',
          system: 'Central Nervous System',
          image: '/assets/sketches/thumb_pharm_antiepileptic.svg',
          canvasImage: '/assets/sketches/canvas_pharm_antiepileptic.svg',
          questionsCount: 20,
          totalSymbols: 36,
          symbols: [
            { pin: 1, x: 25, y: 75, title: 'Sodium Channel Inactivator Gate', meaning: 'Prolongs the inactivated state of voltage-gated Na+ channels.', fact: 'Zero-order elimination kinetics at therapeutic concentrations.' }
          ]
        }
      ]
    }
  ];

  // 5. DDx Categories (Exact match to zetchy.net screenshot: 25 Presenting Complaints total)
  db.data.ddxCategories = [
    {
      id: 'ddx_heart',
      name: 'Heart',
      color: '#c2410c',
      count: 3,
      complaints: [
        {
          name: 'Chest pain',
          completed: 0,
          total: 13,
          differentials: [
            { name: 'Acute Coronary Syndrome (STEMI / NSTEMI)', highYield: 'Retrosternal crushing pain radiating to left arm/jaw, diaphoresis. ST elevations on ECG, elevated troponin.' },
            { name: 'Aortic Dissection', highYield: 'Sudden tearing chest pain radiating to the back. Asymmetric pulses, widened mediastinum on CXR, CTA diagnostic.' },
            { name: 'Pulmonary Embolism', highYield: 'Pleuritic chest pain, dyspnea, tachycardia, deep vein thrombosis risk factors. Elevated D-dimer, CTA pulmonary.' },
            { name: 'Tension Pneumothorax', highYield: 'Sudden pleuritic pain, absent breath sounds, tracheal deviation AWAY from affected side. Immediate needle decompression.' },
            { name: 'Cardiac Tamponade', highYield: "Beck triad (hypotension, JVD, muffled heart sounds), pulsus paradoxus > 10 mmHg. Electrical alternans." },
            { name: 'Boerhaave Syndrome (Esophageal Rupture)', highYield: 'Violent retching followed by severe retrosternal pain, subcutaneous emphysema, pneumomediastinum on CXR.' },
            { name: 'Gastroesophageal Reflux Disease (GERD)', highYield: 'Burning substernal pain aggravated by supine posture, relieved by antacids.' },
            { name: 'Costochondritis', highYield: 'Reproducible chest wall tenderness on palpation of costochondral junctions.' }
          ]
        },
        {
          name: 'Palpitations',
          completed: 0,
          total: 11,
          differentials: [
            { name: 'Atrial Fibrillation / Flutter', highYield: 'Irregularly irregular rhythm, absent P waves. Risk of stroke requires CHA2DS2-VASc scoring.' },
            { name: 'Supraventricular Tachycardia (AVNRT / AVRT)', highYield: 'Sudden paroxysmal narrow-complex tachycardia, terminated by vagal maneuvers or adenosine.' },
            { name: 'Premature Ventricular Contractions (PVCs)', highYield: 'Skipped beat sensation followed by compensatory pause. Wide QRS complexes.' },
            { name: 'Hyperthyroidism', highYield: 'Sinus tachycardia, heat intolerance, tremor, weight loss. Low TSH, elevated free T4.' }
          ]
        },
        {
          name: 'Syncope',
          completed: 0,
          total: 12,
          differentials: [
            { name: 'Vasovagal Syncope (Neurocardiogenic)', highYield: 'Prodrome of nausea, warmth, diaphoresis, pallor triggered by pain, sight of blood, or prolonged standing.' },
            { name: 'Aortic Stenosis', highYield: 'Exertional syncope, angina, and dyspnea (SAD triad). Harsh crescendo-decrescendo systolic murmur at right 2nd ICS radiating to carotids.' },
            { name: 'Orthostatic Hypotension', highYield: 'Drop in SBP > 20 mmHg or DBP > 10 mmHg on standing. Dehydration or autonomic dysfunction.' }
          ]
        }
      ]
    },
    {
      id: 'ddx_lungs',
      name: 'Lungs',
      color: '#0284c7',
      count: 3,
      complaints: [
        {
          name: 'Shortness of breath',
          completed: 0,
          total: 14,
          differentials: [
            { name: 'Acute Congestive Heart Failure', highYield: 'Bilateral basal crackles, elevated JVP, S3 gallop, orthopnea, PND, elevated BNP.' },
            { name: 'COPD Exacerbation', highYield: 'Increased sputum volume, purulence, and dyspnea in a patient with smoking history.' },
            { name: 'Pneumonia', highYield: 'Fever, productive cough, localized bronchial breath sounds, dullness to percussion, focal infiltrate on CXR.' },
            { name: 'Anaphylaxis', highYield: 'Dyspnea with stridor, wheezing, urticaria, hypotension after allergen exposure. Intramuscular epinephrine.' }
          ]
        },
        {
          name: 'Cough',
          completed: 0,
          total: 12,
          differentials: [
            { name: 'Upper Airway Cough Syndrome (PND)', highYield: 'Cobblestoning of posterior oropharynx, throat clearing, responds to first-gen antihistamines.' },
            { name: 'Cough-Variant Asthma', highYield: 'Nocturnal cough triggered by cold air or exercise, methacholine challenge positive.' },
            { name: 'ACE-Inhibitor Induced Cough', highYield: 'Dry hacking cough beginning weeks to months after ACE-i initiation due to bradykinin/substance P.' }
          ]
        },
        {
          name: 'Hemoptysis',
          completed: 0,
          total: 11,
          differentials: [
            { name: 'Bronchiectasis', highYield: 'Copious foul-smelling purulent sputum with blood streaks. Tram-track sign and signet ring sign on high-res CT.' },
            { name: 'Bronchogenic Carcinoma', highYield: 'Elderly smoker with weight loss, persistent cough, and hemoptysis. Central vs peripheral mass on CT.' },
            { name: 'Tuberculosis', highYield: 'Cavitary lesions in apical/posterior segments of upper lobes, night sweats, positive AFB stain.' }
          ]
        }
      ]
    },
    {
      id: 'ddx_brain',
      name: 'Brain and nerves',
      color: '#581c87',
      count: 4,
      complaints: [
        {
          name: 'Altered consciousness',
          completed: 0,
          total: 17,
          differentials: [
            { name: 'Hypoglycemia', highYield: 'Diaphoresis, tremors, confusion. Point-of-care blood glucose is the essential first test. Give IV dextrose.' },
            { name: 'Bacterial Meningitis', highYield: 'Fever, headache, altered mental status, nuchal rigidity (Brudzinski & Kernig signs). High WBC, low glucose, high protein on LP.' },
            { name: 'Sepsis / Septic Encephalopathy', highYield: 'Systemic inflammatory response with infection source. Elevated lactate, positive blood cultures.' },
            { name: 'Subdural Hematoma', highYield: 'Elderly or alcoholic with bridging vein tear after minor head trauma. Crescent-shaped hyperdense collection crossing suture lines.' }
          ]
        },
        {
          name: 'CVA',
          completed: 0,
          total: 10,
          differentials: [
            { name: 'Acute Ischemic Stroke (LVO)', highYield: 'Sudden onset focal neurological deficit (FAST). Non-contrast head CT rules out hemorrhage; IV thrombolysis within 4.5h.' },
            { name: 'Intracerebral Hemorrhage', highYield: 'Severe headache, vomiting, rapidly progressive focal deficit in hypertensive patient. Hyperdense blood on non-contrast CT.' },
            { name: 'Subarachnoid Hemorrhage', highYield: '"Worst headache of my life" (thunderclap). Ruptured berry aneurysm in Circle of Willis.' }
          ]
        },
        {
          name: 'Headache',
          completed: 0,
          total: 13,
          differentials: [
            { name: 'Migraine', highYield: 'Unilateral pulsating headache, photophobia, phonophobia, nausea, +/- aura. Triptans for abortive therapy.' },
            { name: 'Temporal (Giant Cell) Arteritis', highYield: 'Age > 50, jaw claudication, temple tenderness, vision loss risk. High ESR/CRP. Start high-dose steroids immediately.' },
            { name: 'Cluster Headache', highYield: 'Unilateral periorbital excruciating stabbing pain with ipsilateral lacrimation, rhinorrhea, Horner syndrome. 100% O2 abortive.' }
          ]
        },
        {
          name: 'Weakness',
          completed: 0,
          total: 12,
          differentials: [
            { name: 'Guillain-Barré Syndrome', highYield: 'Ascending symmetric flaccid weakness, areflexia, post-Campylobacter or viral infection. Albuminocytologic dissociation on LP.' },
            { name: 'Myasthenia Gravis', highYield: 'Fluctuating fatigable weakness worse at end of day, ptosis, diplopia. Anti-AChR antibodies.' },
            { name: 'Amyotrophic Lateral Sclerosis (ALS)', highYield: 'Combined Upper Motor Neuron (hyperreflexia, spasticity) and Lower Motor Neuron (fasciculations, atrophy) signs without sensory loss.' }
          ]
        }
      ]
    },
    {
      id: 'ddx_gi',
      name: 'Gastrointestinal & Abdomen',
      color: '#4d7c0f',
      count: 4,
      complaints: [
        {
          name: 'Abdominal pain',
          completed: 0,
          total: 15,
          differentials: [
            { name: 'Acute Appendicitis', highYield: 'Periumbilical pain migrating to McBurney point (RLQ), rebound tenderness, Rovsing sign.' },
            { name: 'Acute Cholecystitis', highYield: 'RUQ pain radiating to right scapula after fatty meal, Murphy sign positive, ultrasound showing gallbladder wall thickening.' },
            { name: 'Acute Pancreatitis', highYield: 'Epigastric pain radiating straight to back, relieved by leaning forward. Elevated lipase > 3x upper limit.' }
          ]
        },
        {
          name: 'Jaundice',
          completed: 0,
          total: 12,
          differentials: [
            { name: 'Choledocholithiasis / Cholangitis', highYield: 'Charcot triad (fever, jaundice, RUQ pain); Reynolds pentad (+ hypotension, AMS).' },
            { name: 'Pancreatic Head Adenocarcinoma', highYield: 'Painless progressive jaundice with palpable non-tender gallbladder (Courvoisier sign) and weight loss.' }
          ]
        },
        {
          name: 'Vomiting',
          completed: 0,
          total: 10,
          differentials: [
            { name: 'Small Bowel Obstruction', highYield: 'Colicky abdominal pain, bilious vomiting, obstipation, dilated bowel loops with air-fluid levels on upright KUB.' },
            { name: 'Diabetic Ketoacidosis (DKA)', highYield: 'Nausea, vomiting, Kussmaul respirations, fruity breath, anion gap metabolic acidosis.' }
          ]
        },
        {
          name: 'Dysphagia',
          completed: 0,
          total: 11,
          differentials: [
            { name: 'Achalasia', highYield: 'Dysphagia to BOTH solids and liquids from onset, regurgitation, "bird-beak" appearance on barium esophagram.' },
            { name: 'Esophageal Carcinoma', highYield: 'Progressive dysphagia starting with solids, then progressing to liquids, weight loss.' }
          ]
        }
      ]
    },
    {
      id: 'ddx_renal',
      name: 'Renal & Urinary',
      color: '#0e7490',
      count: 3,
      complaints: [
        {
          name: 'Hematuria',
          completed: 0,
          total: 12,
          differentials: [
            { name: 'Bladder Urothelial Carcinoma', highYield: 'Painless gross hematuria in older patient with smoking or occupational chemical exposure.' },
            { name: 'IgA Nephropathy (Berger Disease)', highYield: 'Gross hematuria occurring 1-2 days after upper respiratory or GI infection (synpharyngitic).' }
          ]
        },
        {
          name: 'Acute renal failure',
          completed: 0,
          total: 13,
          differentials: [
            { name: 'Pre-renal Azotemia', highYield: 'BUN/Cr ratio > 20:1, FeNa < 1%, urine osmolality > 500 mOsm/kg. Corrects with volume resuscitation.' },
            { name: 'Acute Tubular Necrosis (ATN)', highYield: 'Muddy brown granular casts, BUN/Cr < 15:1, FeNa > 2% due to ischemic or nephrotoxic insult.' }
          ]
        },
        {
          name: 'Dysuria',
          completed: 0,
          total: 10,
          differentials: [
            { name: 'Acute Cystitis', highYield: 'Frequency, urgency, suprapubic pain, positive urine nitrites and leukocyte esterase. E. coli #1.' }
          ]
        }
      ]
    },
    {
      id: 'ddx_systemic',
      name: 'Systemic & Endocrine',
      color: '#a16207',
      count: 4,
      complaints: [
        {
          name: 'Fever of unknown origin',
          completed: 0,
          total: 14,
          differentials: [
            { name: 'Infective Endocarditis', highYield: 'New regurgitant murmur, Janeway lesions, Osler nodes, Roth spots, positive Duke criteria.' },
            { name: 'Adult-Onset Still Disease', highYield: 'High quotidian fevers, salmon-pink evanescent rash, arthritis, markedly elevated ferritin.' }
          ]
        },
        {
          name: 'Weight loss',
          completed: 0,
          total: 12,
          differentials: [
            { name: 'Occult Malignancy', highYield: 'Unintentional loss > 5% body weight in 6-12 months. Cachexia mediated by TNF-alpha (cachectin).' }
          ]
        },
        {
          name: 'Fatigue',
          completed: 0,
          total: 11,
          differentials: [
            { name: 'Severe Anemia', highYield: 'Pallor, conjunctival rim pallor, exertional dyspnea, tachycardia, low Hb/Hct.' },
            { name: 'Primary Hypothyroidism', highYield: 'Cold intolerance, constipation, dry skin, delayed relaxation of deep tendon reflexes, elevated TSH.' }
          ]
        },
        {
          name: 'Joint pain',
          completed: 0,
          total: 13,
          differentials: [
            { name: 'Septic Arthritis', highYield: 'Monoarticular warm, red, exquisitely tender joint with severe restriction of passive ROM. Synovial WBC > 50,000.' },
            { name: 'Gout', highYield: 'Podagra (1st MTP joint), negatively birefringent needle-shaped crystals under polarized light.' }
          ]
        }
      ]
    },
    {
      id: 'ddx_skin',
      name: 'Skin & Allergy',
      color: '#db2777',
      count: 4,
      complaints: [
        {
          name: 'Rash',
          completed: 0,
          total: 14,
          differentials: [
            { name: 'Stevens-Johnson Syndrome / TEN', highYield: 'Full-thickness epidermal sloughing, positive Nikolsky sign, involvement of >= 2 mucosal surfaces.' }
          ]
        },
        {
          name: 'Pruritus',
          completed: 0,
          total: 10,
          differentials: [
            { name: 'Cholestatic Jaundice', highYield: 'Bile salt deposition in skin causing generalized intractable pruritus worse on palms/soles.' }
          ]
        },
        {
          name: 'Anaphylaxis / Angioedema',
          completed: 0,
          total: 10,
          differentials: [
            { name: 'C1-Esterase Inhibitor Deficiency', highYield: 'Hereditary angioedema: recurrent episodes of swelling without urticaria or pruritus, low C4.' }
          ]
        },
        {
          name: 'Petechiae / Purpura',
          completed: 0,
          total: 11,
          differentials: [
            { name: 'Meningococcemia', highYield: 'Purpuric rash with fever, rapid progression to septic shock and DIC (Waterhouse-Friderichsen syndrome).' }
          ]
        }
      ]
    }
  ];

  db.save();
  console.log('✅ Zetchy database successfully seeded with complete Path, Micro, Pharm, First Aid, and 25 DDx complaints!');
}

module.exports = seed;

if (require.main === module) {
  seed();
}
