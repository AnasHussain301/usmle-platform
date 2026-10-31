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

  // 2. Comprehensive Sketchy Systems & Sketches
  db.data.sketchyPathData = {
    totalSketches: 141,
    systemsCount: 9,
    systems: [
      {
        id: 'sys_blood',
        name: 'Blood & Coagulation',
        totalSketches: 12,
        progress: 0,
        color: '#831843', // Magenta / Deep Crimson
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
                canvasImage: '/assets/sketches/thumb_thalassemia.png',
                progress: 0,
                questionsCount: 12,
                totalSymbols: 35,
                symbols: [
                  { pin: 1, title: 'Dwarf Doorway', meaning: 'Microcytic anemia definition: Mean Corpuscular Volume (MCV) < 80 fL.', fact: 'Always calculate Mentzer index: MCV / RBC count. If < 13, suspect Thalassemia trait; if > 13, suspect Iron Deficiency.' },
                  { pin: 2, title: 'Grecian Sea Painting', meaning: 'Thalassemia epidemiology: Mediterranean (beta) & Southeast Asian / African (alpha) ancestry.', fact: 'Confers partial resistance against Plasmodium falciparum malaria.' },
                  { pin: 3, title: 'Two Alpha Chains / Two Beta Chains', meaning: 'Normal adult Hemoglobin A (HbA) structure: alpha-2, beta-2.', fact: 'HbF is alpha-2, gamma-2. HbA2 is alpha-2, delta-2.' }
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
                  { pin: 1, x: 8, y: 79, title: "Dwarf's Den Entrance", meaning: 'Microcytic Anemia (MCV < 80 fL) - defective hemoglobin synthesis results in an extra division of erythroid precursors.', fact: 'Iron deficiency is the #1 most common nutritional deficiency worldwide.' },
                  { pin: 2, x: 22, y: 84, title: 'Diminished Iron Ingot Pile', meaning: 'Decreased Serum Iron levels due to absolute body depletion or inflammatory sequestration.', fact: 'Initial phase of iron deficiency shows normal serum iron; bone marrow iron stores deplete first.' },
                  { pin: 3, x: 27, y: 77, title: 'Empty Iron Forge Cart', meaning: 'Elevated Total Iron Binding Capacity (TIBC) / High Serum Transferrin concentration.', fact: 'Liver synthesizes more transferrin in an attempt to capture any remaining circulating iron.' },
                  { pin: 4, x: 39, y: 82, title: 'Low Ferritin Deposit Chest', meaning: 'Low Serum Ferritin (< 30 ng/mL) is the single most sensitive and specific test for iron deficiency.', fact: 'Ferritin < 15-30 ng/mL is virtually diagnostic of iron deficiency anemia.' },
                  { pin: 5, x: 64, y: 88, title: 'Caged Iron Safe (Hepcidin)', meaning: 'Hepcidin upregulation in Anemia of Chronic Disease (ACD) blocks ferroportin.', fact: 'ACD shows elevated Ferritin and low TIBC, differentiating it from true iron deficiency.' },
                  { pin: 6, x: 52, y: 82, title: 'Red Cells with Central Pallor', meaning: 'Hypochromic erythrocytes with central pallor exceeding 1/3 of the red blood cell diameter.', fact: 'Severe iron deficiency produces pencil cells / cigar-shaped elliptocytes on peripheral smear.' },
                  { pin: 7, x: 57, y: 78, title: 'Anisocytosis Balance Scale', meaning: 'Elevated Red Cell Distribution Width (RDW > 15%).', fact: 'RDW is elevated in Iron Deficiency, but normal in uncomplicated Thalassemia trait.' },
                  { pin: 8, x: 38, y: 74, title: 'Locked Iron Gate', meaning: 'Ferroportin internalisation by Hepcidin prevents duodenal enterocyte iron absorption.', fact: 'Upregulated by IL-6, TNF-alpha, and other acute phase inflammatory cytokines.' },
                  { pin: 9, x: 62, y: 80, title: 'Rusty Iron Cauldron', meaning: 'Free Erythrocyte Protoporphyrin (FEP) accumulates because iron is unavailable to bind protoporphyrin.', fact: 'Final step of heme synthesis catalyzed by ferrochelatase in mitochondria.' },
                  { pin: 10, x: 55, y: 64, title: 'Peptic Ulcer Cavern', meaning: 'Occult gastrointestinal bleeding is the primary cause in adult males and postmenopausal females.', fact: 'Any adult male with iron deficiency anemia must undergo colonoscopy and endoscopy to rule out colorectal carcinoma.' },
                  { pin: 11, x: 64, y: 44, title: 'Menstrual Red Stream', meaning: 'Menorrhagia / abnormal uterine bleeding is the most common cause in premenopausal females.', fact: 'Ask about frequency of changing pads/tampons and passing large blood clots.' },
                  { pin: 12, x: 70, y: 70, title: 'Duodenal Celiac Steppe', meaning: 'Malabsorption due to Celiac Disease, Crohn disease, or prior gastric bypass surgery.', fact: 'Non-heme iron is absorbed primarily in the duodenum via DMT-1.' },
                  { pin: 13, x: 57, y: 38, title: 'Esophageal Web Flap', meaning: 'Plummer-Vinson Syndrome: triad of Iron deficiency anemia, Esophageal webs, and Dysphagia.', fact: 'Carries increased risk for squamous cell carcinoma of the esophagus.' },
                  { pin: 14, x: 50, y: 42, title: 'Spoon-Shaped Nails (Koilonychia)', meaning: 'Brittle, spoon-shaped concave fingernails resulting from severe chronic iron depletion.', fact: 'Often accompanied by atrophic glossitis (smooth beefy red tongue) and angular cheilitis.' },
                  { pin: 15, x: 86, y: 90, title: 'Ice Chewers Pickaxe', meaning: 'Pica (craving non-nutritive substances) & Pagophagia (compulsive ice chewing).', fact: 'Classically resolves within days of beginning oral iron replacement therapy.' }
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
                image: '/assets/sketches/thumb_iron_deficiency.png',
                canvasImage: '/assets/sketches/iron_deficiency_canvas.png',
                progress: 0,
                questionsCount: 14,
                totalSymbols: 38,
                symbols: [
                  { pin: 1, title: 'Cobalt Cobaltine Mineral', meaning: 'Vitamin B12 (Cobalamin) deficiency: takes 3-5 years to deplete hepatic stores.', fact: 'Folate deficiency develops within months due to limited liver reserves.' },
                  { pin: 2, title: 'Segmented Knight Helmet', meaning: 'Hypersegmented neutrophils (>= 5-6 lobes) is the hallmark on peripheral blood smear.', fact: 'Elevated homocysteine in both B12 and Folate deficiency; elevated methylmalonic acid ONLY in B12 deficiency.' }
                ]
              },
              {
                id: 'sketch_1_4',
                number: '1.4',
                title: 'Sickle Cell Disease & Hemoglobinopathies',
                image: '/assets/sketches/thumb_thalassemia.png',
                canvasImage: '/assets/sketches/thumb_thalassemia.png',
                progress: 0,
                questionsCount: 16,
                totalSymbols: 42,
                symbols: [
                  { pin: 1, title: 'Glutamic Acid to Valine Switch', meaning: 'Point mutation in 6th codon of beta-globin gene: GAG to GTG replacing hydrophilic glutamate with hydrophobic valine.', fact: 'Deoxygenation causes polymerisation into sickle-shaped polymers.' }
                ]
              }
            ]
          },
          {
            name: 'Hemostasis & platelet disorders',
            count: 5,
            progress: 0,
            sketches: [
              {
                id: 'sketch_1_5',
                number: '1.5',
                title: 'Immune Thrombocytopenia (ITP) & TTP / HUS',
                image: '/assets/sketches/thumb_thalassemia.png',
                canvasImage: '/assets/sketches/thumb_thalassemia.png',
                progress: 0,
                questionsCount: 15,
                totalSymbols: 36,
                symbols: [
                  { pin: 1, title: 'ADAMTS13 Sword', meaning: 'TTP is caused by deficiency of ADAMTS13 metalloprotease, leading to uncleaved ultra-large vWF multimers.', fact: 'Classic pentad: Thrombocytopenia, Microangiopathic hemolytic anemia (schistocytes), Neurologic symptoms, Fever, Renal impairment.' }
                ]
              }
            ]
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
              { id: 'sketch_cv_1', number: '2.1', title: 'Myocardial Infarction: Pathology & Timeline', image: '/assets/sketches/thumb_thalassemia.png', progress: 0, symbols: [] }
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
            count: 4,
            progress: 0,
            sketches: [
              { id: 'sketch_resp_1', number: '3.1', title: 'COPD, Emphysema & Chronic Bronchitis', image: '/assets/sketches/thumb_iron_deficiency.png', progress: 0, symbols: [] }
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
            count: 4,
            progress: 0,
            sketches: [
              { id: 'sketch_gi_1', number: '4.1', title: 'GERD, Barrett Esophagus & Adenocarcinoma', image: '/assets/sketches/thumb_thalassemia.png', progress: 0, symbols: [] }
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
            name: 'Glomerular diseases (Nephritic vs Nephrotic)',
            count: 4,
            progress: 0,
            sketches: [
              { id: 'sketch_ren_1', number: '5.1', title: 'Membranous & Minimal Change Disease', image: '/assets/sketches/thumb_iron_deficiency.png', progress: 0, symbols: [] }
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
            name: 'Neurodegenerative diseases & Demantia',
            count: 4,
            progress: 0,
            sketches: [
              { id: 'sketch_neuro_1', number: '6.1', title: 'Alzheimer Disease & Frontotemporal Dementia', image: '/assets/sketches/thumb_thalassemia.png', progress: 0, symbols: [] }
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
            name: 'Autoimmune & Rheumatologic Diseases',
            count: 4,
            progress: 0,
            sketches: [
              { id: 'sketch_msk_1', number: '7.1', title: 'Rheumatoid Arthritis vs Osteoarthritis', image: '/assets/sketches/thumb_iron_deficiency.png', progress: 0, symbols: [] }
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
            count: 4,
            progress: 0,
            sketches: [
              { id: 'sketch_endo_1', number: '8.1', title: 'Thyroiditis & Thyroid Carcinomas', image: '/assets/sketches/thumb_thalassemia.png', progress: 0, symbols: [] }
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
            name: 'Ovarian & Testicular Neoplasms',
            count: 4,
            progress: 0,
            sketches: [
              { id: 'sketch_repro_1', number: '9.1', title: 'Seminoma vs Non-Seminomatous Germ Cell Tumors', image: '/assets/sketches/thumb_thalassemia.png', progress: 0, symbols: [] }
            ]
          }
        ]
      }
    ]
  };

  db.save();
  console.log('Seeded complete Sketchy Path systems, sketches, and pins.');
}

module.exports = seed;

if (require.main === module) {
  seed();
}
