const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding Zetchy application database...');

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

    console.log('Created default accounts: admin@radmed.local, sarah.jenkins@usmle.com, michael.chen@usmle.com');
  }

  // 2. First Aid Organ Systems
  if (!db.data.firstAidSystems || db.data.firstAidSystems.length === 0) {
    db.data.firstAidSystems = [
      {
        id: 'fa_cvs',
        name: 'Cardiovascular',
        color: '#9a3412', // Rust / Terra Cotta
        icon: 'heart',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Cardiac Cycle & Wiggers Diagram', page: 'FA 290', highYield: 'Aortic stenosis shows late-peaking systolic ejection murmur with slow carotid upstroke (pulsus parvus et tardus).' },
          { title: 'Congenital Heart Diseases', page: 'FA 302', highYield: 'Tetralogy of Fallot: PROVe (Pulmonary infundibular stenosis, RVH, Overriding aorta, VSD). Squatting increases SVR to reduce R->L shunt.' },
          { title: 'Ischemic Heart Disease & ECG Localization', page: 'FA 310', highYield: 'LAD occlusion leads to V1-V4 anterior wall STEMI. RCA leads to II, III, aVF inferior STEMI (check for RV infarction).' },
          { title: 'Heart Failure & Cardiomyopathies', page: 'FA 316', highYield: 'Dilated = eccentric hypertrophy, systolic dysfxn. Hypertrophic = asymmetric septal hypertrophy, sudden death in young athletes.' }
        ]
      },
      {
        id: 'fa_endo',
        name: 'Endocrine',
        color: '#a16207', // Mustard / Ochre
        icon: 'butterfly',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Thyroid Pathology (Hashimoto vs Graves)', page: 'FA 344', highYield: 'Graves: TSH-receptor autoantibodies (stimulatory), exophthalmos, pretibial myxedema. Hashimoto: Anti-TPO, hurthle cells, lymphoma risk.' },
          { title: 'Adrenal Disorders & Cushing Syndrome', page: 'FA 352', highYield: 'High-dose dexamethasone suppresses Cushing Disease (pituitary ACTH adenoma) but fails to suppress ectopic ACTH (Small cell lung cancer).' },
          { title: 'Diabetes Mellitus & DKA vs HHS', page: 'FA 358', highYield: 'DKA: Type 1, anion gap metabolic acidosis, Kussmaul respirations, potassium shifted extracellularly (total body K is depleted).' }
        ]
      },
      {
        id: 'fa_gi',
        name: 'Gastrointestinal',
        color: '#4d7c0f', // Olive Green
        icon: 'bowl',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Esophageal Pathology & Dysphagia', page: 'FA 380', highYield: 'Achalasia: loss of Auerbach (myenteric) plexus, birds beak on barium swallow, failure of LES relaxation.' },
          { title: 'Inflammatory Bowel Disease (Crohn vs UC)', page: 'FA 390', highYield: 'Crohns: transmural, skip lesions, cobblestone, noncaseating granulomas, fistulas. UC: continuous mucosal, lead pipe, pseudopolyps, PSC.' },
          { title: 'Cirrhosis, Portal Hypertension & Jaundice', page: 'FA 400', highYield: 'SAAG >= 1.1 g/dL indicates portal hypertension (cirrhosis, Budd-Chiari, CHF).' }
        ]
      },
      {
        id: 'fa_heme',
        name: 'Hematology & Oncology',
        color: '#831843', // Deep Crimson
        icon: 'drop',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Microcytic & Macrocytic Anemias', page: 'FA 420', highYield: 'Iron deficiency: low ferritin, high TIBC. Lead poisoning: basophilic stippling. B12 deficiency: hypersegmented PMNs, high methylmalonic acid.' },
          { title: 'Leukemias & Translocations', page: 'FA 436', highYield: 't(9;22) BCR-ABL in CML (imatinib). t(15;17) PML-RARA in APL (all-trans retinoic acid). t(8;14) c-myc in Burkitt lymphoma.' }
        ]
      },
      {
        id: 'fa_msk',
        name: 'Musculoskeletal & Skin',
        color: '#c2410c', // Amber / Orange
        icon: 'bone',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Bone Tumors & Radiology Signs', page: 'FA 464', highYield: 'Osteosarcoma: sunburst pattern, Codman triangle. Ewing sarcoma: t(11;22), onion skin periosteal reaction.' },
          { title: 'Autoimmune Joint Diseases (RA vs OA vs Gout)', page: 'FA 472', highYield: 'Gout: negatively birefringent needle-shaped crystals under polarized light (yellow when parallel). Pseudogout: rhomboid, positively birefringent.' }
        ]
      },
      {
        id: 'fa_neuro',
        name: 'Neurology',
        color: '#581c87', // Purple
        icon: 'brain',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Intracranial Hemorrhages', page: 'FA 508', highYield: 'Epidural = middle meningeal artery, lucid interval, biconvex lens, sutures stop. Subdural = bridging veins, crescentic.' },
          { title: 'Stroke Syndromes & Cerebral Circulation', page: 'FA 514', highYield: 'MCA = contralateral face/arm > leg, aphasia (dominant) or hemineglect (non-dominant). ACA = contralateral leg > arm.' }
        ]
      },
      {
        id: 'fa_psych',
        name: 'Psychiatry',
        color: '#312e81', // Indigo
        icon: 'smile',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Mood Disorders (MDD & Bipolar)', page: 'FA 560', highYield: 'SIGECAPS for MDD (>= 2 weeks). Bipolar I requires only 1 manic episode (DIG FAST).' },
          { title: 'Antipsychotics & Neuroleptic Malignant Syndrome', page: 'FA 572', highYield: 'NMS: lead-pipe rigidity, hyperthermia, high CK. Treat with dantrolene or bromocriptine.' }
        ]
      },
      {
        id: 'fa_renal',
        name: 'Renal',
        color: '#0e7490', // Teal
        icon: 'funnel',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Nephritic vs Nephrotic Syndromes', page: 'FA 602', highYield: 'Minimal change: effacement of podocyte foot processes on EM. Post-strep: subepithelial humps on EM, starry sky IF.' },
          { title: 'Acid-Base Disorders & Winter Formula', page: 'FA 594', highYield: 'Winters formula for respiratory compensation in metabolic acidosis: Expected PaCO2 = 1.5 * [HCO3-] + 8 ± 2.' }
        ]
      },
      {
        id: 'fa_repro',
        name: 'Reproductive',
        color: '#be185d', // Magenta
        icon: 'baby',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Ovarian & Uterine Neoplasms', page: 'FA 640', highYield: 'Serous cystadenocarcinoma: Psammoma bodies. Granulosa cell tumor: Call-Exner bodies, produces estrogen.' }
        ]
      },
      {
        id: 'fa_resp',
        name: 'Respiratory',
        color: '#0284c7', // Steel Blue
        icon: 'lungs',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Obstructive vs Restrictive Lung Disease', page: 'FA 670', highYield: 'Obstructive: FEV1/FVC < 0.70. Restrictive: FEV1/FVC normal or increased (>0.70), reduced TLC and FVC.' },
          { title: 'Pulmonary Embolism & Diagnostic Workup', page: 'FA 678', highYield: 'CT Pulmonary Angiography is gold standard. S1Q3T3 on ECG, respiratory alkalosis with PaO2 drop.' }
        ]
      },
      {
        id: 'fa_immuno',
        name: 'Immunology',
        color: '#1e40af', // Navy Blue
        icon: 'shield',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Hypersensitivity Reactions (Types I-IV)', page: 'FA 112', highYield: 'Type I: IgE, anaphylaxis. Type II: cytotoxic antibodies (Goodpasture, Rh). Type III: immune complexes (SLE, serum sickness). Type IV: T-cell mediated (PPD, poison ivy).' }
        ]
      },
      {
        id: 'fa_gen',
        name: 'General Principles',
        color: '#475569', // Charcoal
        icon: 'dna',
        subtitle: 'Headings by subject and page',
        easy: 0,
        forgetting: 0,
        topics: [
          { title: 'Pharmacokinetics & Enzyme Inhibitors', page: 'FA 230', highYield: 'CYP450 inducers (Ken rides his green Corvette): Phenytoin, Carbamazepine, Rifampin, St. Johns wort, Barbiturates.' }
        ]
      }
    ];
    console.log('Seeded First Aid organ systems.');
  }

  // 3. Sketchy Decks (Screenshot 3)
  if (!db.data.sketchyDecks || db.data.sketchyDecks.length === 0) {
    db.data.sketchyDecks = [
      {
        id: 'sketchy_path',
        title: 'Sketchy Path',
        subtitle: '141 sketches · 9 systems',
        color: '#db2777', // Rose / Pink
        icon: 'microscope',
        progress: 0,
        sketches: [
          { title: 'Atherosclerosis & Coronary Artery Disease', system: 'Cardiac', symbols: ['Golden plaque', 'Foam cells (macrophages engulfing oxidized LDL)', 'Fibrous cap rupture'] },
          { title: 'Glomerulonephritis & Nephrotic Spectrum', system: 'Renal', symbols: ['Lumpy bumpy fence', 'Spike and dome baseball player', 'Tram-track railroad'] },
          { title: 'Pneumonias (Lobar vs Interstitial vs Atypical)', system: 'Pulmonary', symbols: ['Rust colored sputum', 'Legionnaire soldier with water tank', 'Walking mycoplasma stick figure'] }
        ]
      },
      {
        id: 'sketchy_micro',
        title: 'Sketchy Micro',
        subtitle: '139 sketches',
        color: '#15803d', // Forest Green
        icon: 'virus',
        progress: 0,
        sketches: [
          { title: 'Staphylococcus aureus (The Golden Staff of Moses)', system: 'Gram Positive Cocci', symbols: ['Golden color = carotenoid pigment', 'Beta hemolytic light bulb', 'Catalase cat', 'Coagulase coagulating liquid'] },
          { title: 'Streptococcus pneumoniae (The Alpha Knight Tournament)', system: 'Gram Positive Cocci', symbols: ['Lancet shaped diplococci', 'Alpha hemolytic green armor', 'Optochin sensitive chin mask', 'Bile soluble'] },
          { title: 'Pseudomonas aeruginosa (The Suited Mona Lisa)', system: 'Gram Negative Bacilli', symbols: ['Grape fruity odor candy', 'Blue-green pyocyanin paint', 'Oxidase blue ring', 'CF pulmonary infections', 'Ecthyma gangrenosum'] }
        ]
      },
      {
        id: 'sketchy_pharm',
        title: 'Sketchy Pharm',
        subtitle: '107 sketches · 12 systems',
        color: '#7e22ce', // Violet
        icon: 'pill',
        progress: 0,
        sketches: [
          { title: 'Beta-Lactams & Penicillins (Princess Penicillins Castle)', system: 'Antimicrobials', symbols: ['Transpeptidase wall builders inhibited', 'Allergic rash suit', 'Interference with peptidoglycan crosslinking'] },
          { title: 'ACE Inhibitors & ARBs (The Casino Dealership)', system: 'Cardiovascular', symbols: ['Angiotensin I to II converter blocked', 'Bradykinin coughing lungs', 'Hyperkalemic bananas', 'Angioedema big lips'] },
          { title: 'Loop & Thiazide Diuretics (The Loop-de-Loop Rollercoaster)', system: 'Renal', symbols: ['Na+/K+/2Cl- cotransporter blocked in thick ascending limb', 'Hypokalemia', 'Ototoxicity gong', 'Sulfa allergy egg'] }
        ]
      }
    ];
    console.log('Seeded Sketchy decks.');
  }

  // 4. DDx Categories (Screenshot 5)
  if (!db.data.ddxCategories || db.data.ddxCategories.length === 0) {
    db.data.ddxCategories = [
      {
        id: 'ddx_heart',
        name: 'Heart',
        color: '#c2410c', // Orange / Rust
        count: 3,
        complaints: [
          {
            name: 'Chest pain',
            completed: 0,
            total: 13,
            differentials: [
              { name: 'Acute Coronary Syndrome (STEMI / NSTEMI)', highYield: 'Substernal pressure radiating to left arm/jaw, diaphoresis. Elevated troponin I/T, ECG ST-elevations or depressions. Immediate chewable aspirin 325 mg + heparin + cath lab.' },
              { name: 'Aortic Dissection (Stanford Type A / B)', highYield: 'Sudden tearing chest pain radiating to back between scapulae. Asymmetric blood pressure in arms (>20 mmHg difference). Mediastinal widening on CXR. CTA gold standard. Beta-blocker first (esmolol).' },
              { name: 'Pulmonary Embolism with Infarction', highYield: 'Sudden pleuritic pain, dyspnea, tachycardia, hypoxemia. Wells score, D-dimer vs CT Pulmonary Angiogram.' },
              { name: 'Acute Pericarditis', highYield: 'Sharp pain improved by leaning forward, worsened by recumbency. Friction rub. Diffuse PR depression & ST elevations. NSAIDs + Colchicine.' },
              { name: 'Tension Pneumothorax', highYield: 'Sudden sharp unilateral pain, absent breath sounds, tracheal deviation opposite side, hypotension. Emergent needle thoracostomy.' },
              { name: 'Gastroesophageal Reflux Disease (GERD)', highYield: 'Burning retrosternal discomfort postprandial or reclining, relieved by antacids. Trial of PPI.' }
            ]
          },
          {
            name: 'Palpitations',
            completed: 0,
            total: 11,
            differentials: [
              { name: 'Atrial Fibrillation / Flutter', highYield: 'Irregularly irregular rhythm, absent P waves. Rate control with Beta-blocker or Diltiazem. Anticoagulate based on CHA2DS2-VASc.' },
              { name: 'Supraventricular Tachycardia (AVNRT)', highYield: 'Sudden onset regular rapid HR (150-250 bpm). Vagal maneuvers first line, then IV Adenosine rapid push.' },
              { name: 'Premature Ventricular Contractions (PVCs)', highYield: 'Skipped beat sensation. Wide bizarre QRS complexes. Reassurance and avoid caffeine/nicotine.' }
            ]
          },
          {
            name: 'Syncope',
            completed: 0,
            total: 12,
            differentials: [
              { name: 'Vasovagal Syncope (Neurocardiogenic)', highYield: 'Emotional stress, prolonged standing, warm room with prodrome of nausea/pallor/diaphoresis.' },
              { name: 'Aortic Stenosis', highYield: 'Exertional syncope, angina, dyspnea (SAD triad). Harsh systolic cresc-decresc murmur radiating to carotids.' },
              { name: 'Hypertrophic Cardiomyopathy (HOCM)', highYield: 'Young athlete syncope during exercise. Murmur increases with Valsalva and standing (decreased preload).' }
            ]
          }
        ]
      },
      {
        id: 'ddx_lungs',
        name: 'Lungs',
        color: '#0284c7', // Steel Blue
        count: 3,
        complaints: [
          {
            name: 'Shortness of breath',
            completed: 0,
            total: 14,
            differentials: [
              { name: 'Acute Heart Failure / Pulmonary Edema', highYield: 'Dyspnea, orthopnea, PND, crackles, elevated BNP, cephalization and Kerley B lines on CXR. IV Furosemide + oxygen.' },
              { name: 'Asthma Exacerbation', highYield: 'Expiratory wheezing, prolonged expiratory phase. Albuterol + Ipratropium + systemic steroids.' },
              { name: 'Community-Acquired Pneumonia', highYield: 'Fever, productive cough, focal consolidation on CXR with air bronchograms. Ceftriaxone + Azithromycin.' }
            ]
          },
          {
            name: 'Cough',
            completed: 0,
            total: 12,
            differentials: [
              { name: 'Upper Airway Cough Syndrome (Post-nasal drip)', highYield: 'Cobblestoning of posterior oropharynx, throat clearing. First-gen antihistamine-decongestant.' },
              { name: 'Gastroesophageal Reflux (GERD)', highYield: 'Nocturnal dry cough, water brash, hoarseness. Trial of omeprazole.' },
              { name: 'ACE Inhibitor Cough', highYield: 'Dry hacking cough due to bradykinin accumulation. Switch to ARB (Losartan).' }
            ]
          },
          {
            name: 'Hemoptysis',
            completed: 0,
            total: 11,
            differentials: [
              { name: 'Bronchitis / Bronchiectasis', highYield: 'Bronchiectasis: chronic copious purulent sputum with blood, signet ring sign on high-res chest CT.' },
              { name: 'Bronchogenic Carcinoma', highYield: 'Smoker > 50 yo, weight loss, hemoptysis, solitary pulmonary nodule or hilar mass.' },
              { name: 'Mycobacterium tuberculosis', highYield: 'Apical cavitary lesions on CXR, fever, night sweats, acid-fast bacillus stain. RIPE therapy.' },
              { name: 'Pulmonary Embolism with Infarction', highYield: 'Wedge-shaped pleural opacity (Hampton hump) on CXR with hemoptysis and pleuritic pain.' }
            ]
          }
        ]
      },
      {
        id: 'ddx_brain',
        name: 'Brain and nerves',
        color: '#581c87', // Purple
        count: 4,
        complaints: [
          {
            name: 'Altered consciousness',
            completed: 0,
            total: 17,
            differentials: [
              { name: 'Hypoglycemia', highYield: 'Diaphoresis, tremors, confusion. Check fingerstick glucose immediately! IV Dextrose 50% or IM Glucagon.' },
              { name: 'Opioid Toxicity', highYield: 'Triad: CNS depression, miosis (pinpoint pupils), respiratory depression. Naloxone IV titration.' },
              { name: 'Sepsis / Septic Encephalopathy', highYield: 'Fever or hypothermia, leukocytosis, elevated lactate, hypotension. Blood cultures + broad spectrum IV antibiotics within 1 hr.' },
              { name: 'Acute Ischemic / Hemorrhagic Stroke', highYield: 'Focal neurological deficits, gaze deviation. Non-contrast head CT immediately.' }
            ]
          },
          {
            name: 'CVA',
            completed: 0,
            total: 10,
            differentials: [
              { name: 'Ischemic Stroke (MCA / ACA / PCA)', highYield: 'Thrombolysis with IV tPA/TNK within 4.5 hrs if no contraindications; mechanical thrombectomy within 24 hrs for large vessel occlusion.' },
              { name: 'Intracerebral Hemorrhage', highYield: 'Hypertension in basal ganglia / Charcot-Bouchard. Lower BP gently, neurosurgical consult.' }
            ]
          },
          {
            name: 'Headache',
            completed: 0,
            total: 13,
            differentials: [
              { name: 'Subarachnoid Hemorrhage', highYield: 'Worst headache of life (thunderclap), nuchal rigidity. Non-contrast CT (hyperdensity in cisterns); if negative, lumbar puncture for xanthochromia.' },
              { name: 'Temporal (Giant Cell) Arteritis', highYield: 'Elderly patient, unilateral temporal headache, jaw claudication, elevated ESR/CRP. Start high-dose steroids immediately to prevent blindness.' },
              { name: 'Migraine without Aura', highYield: 'Unilateral, pulsating, photophobia, phonophobia, nausea. Triptans for acute abortion.' }
            ]
          },
          {
            name: 'Weakness',
            completed: 0,
            total: 12,
            differentials: [
              { name: 'Myasthenia Gravis', highYield: 'Fluctuating fatigable weakness worsening with repetition. Ptosis, diplopia. Anti-AChR antibodies. Edrophonium or pyridostigmine.' },
              { name: 'Guillain-Barré Syndrome', highYield: 'Ascending symmetric paralysis post-Campylobacter or viral infection. Areflexia. Albuminocytologic dissociation on LP.' }
            ]
          }
        ]
      }
    ];
    console.log('Seeded DDx Categories.');
  }

  db.save();
  console.log('Zetchy Database seeding complete!');
}

module.exports = seed;

if (require.main === module) {
  seed();
}
