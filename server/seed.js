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

  // 3. Sketchy Path Data + Micro + Pharm Decks
  // Built dynamically from authentic sketches_meta.json (358 sketches)
  require('./rebuild_sketches');

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
