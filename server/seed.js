const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding Zetchy application database with complete Sketchy, FA, and DDx data...');

  // 1. Users — Production Admin Setup
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  const legacyEmails = ['admin@radmed.local', 'sarah.jenkins@usmle.com', 'michael.chen@usmle.com'];
  
  // Remove legacy test users
  db.data.users = (db.data.users || []).filter(u => !legacyEmails.includes(u.email));
  for (const user of db.data.users || []) {
    if (user.role === 'admin' && !ADMIN_EMAILS.includes(String(user.email || '').toLowerCase())) {
      user.role = 'user';
      if (user.tier === 'admin') user.tier = 'trial';
      user.trialEndsAt = user.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }
  db.save();

  // Ensure super admins exist with all-access admin role
  for (const email of ADMIN_EMAILS) {
    const existing = db.getUserByEmail(email);
    if (!existing) {
      db.createUser({
        name: email.split('@')[0],
        email,
        googleId: null,
        role: 'admin',
        tier: 'admin',
        authProvider: 'google',
        passwordHash: null,
        status: 'active',
        trialEndsAt: null,
        hasCompletedTour: true
      });
      console.log('[Seed] Super Admin initialized:', email);
    } else if (existing.role !== 'admin' || existing.tier !== 'admin') {
      db.updateUser(existing.id, { role: 'admin', tier: 'admin' });
      console.log('[Seed] Super Admin updated:', email);
    }
  }

  // 2. First Aid Organ Systems & UWorld Tables/Images
  require('./parse_fa');

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
