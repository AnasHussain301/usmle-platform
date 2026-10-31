const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding RadMed database...');

  // Reset or initialize if empty
  const users = db.getUsers();
  if (users.length === 0) {
    const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
    const userPasswordHash = bcrypt.hashSync('Student123!', 10);

    const admin = db.createUser({
      name: 'System Administrator',
      email: 'admin@radmed.local',
      passwordHash: adminPasswordHash,
      role: 'admin',
      tier: 'premium',
      specialty: 'Diagnostic Radiology & Medical Education',
      institution: 'RadMed Academic Medical Center'
    });

    const sarah = db.createUser({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@usmle.com',
      passwordHash: userPasswordHash,
      role: 'user',
      tier: 'premium',
      specialty: 'MS4 / Radiology Applicant',
      institution: 'Johns Hopkins SOM'
    });

    const michael = db.createUser({
      name: 'Dr. Michael Chen',
      email: 'michael.chen@usmle.com',
      passwordHash: userPasswordHash,
      role: 'user',
      tier: 'free',
      specialty: 'MS3 / Internal Medicine Bound',
      institution: 'Baylor College of Medicine'
    });

    console.log('Created default users: admin@radmed.local, sarah.jenkins@usmle.com, michael.chen@usmle.com');
  }

  // Seed Questions if empty
  const questions = db.getQuestions();
  if (questions.length === 0) {
    const sampleQuestions = [
      {
        title: "Acute Trauma Following Sporting Injury",
        system: "Neurology / Neurosurgery",
        discipline: "Radiology",
        difficulty: "Medium",
        isPremium: false,
        vignette: "A 22-year-old male is brought to the emergency department after getting hit on the temporal region with a baseball bat. Initially, he experienced a brief 2-minute loss of consciousness, but subsequently regained full alertness and conversational ability. Three hours later in the observation unit, he becomes acutely somnolent with an ipsilateral dilated, non-reactive right pupil and contralateral hemiparesis. An emergent non-contrast head CT demonstrates a lenticular, biconvex hyperdense extra-axial collection along the right temporoparietal convexity that does not cross the cranial sutures.",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Lenticular biconvex hyperdensity constrained by cranial suture lines in the temporoparietal region.",
        options: [
          "Rupture of bridging cortical veins",
          "Laceration of the middle meningeal artery",
          "Rupture of an anterior communicating artery berry aneurysm",
          "Thrombosis of the superior sagittal sinus",
          "Diffuse axonal injury with petechial shear hemorrhages"
        ],
        correctIndex: 1,
        explanation: "The clinical presentation (lucid interval following temporal bone trauma followed by acute neurological decline and uncal herniation with 'blown' pupil) combined with the classic biconvex (lens-shaped) hyperdensity on non-contrast CT is pathognomonic for an Epidural Hematoma (EDH). EDH typically occurs following fracture of the pterion, leading to laceration of the middle meningeal artery (a branch of the maxillary artery). Because the dura mater is tightly bound to the inner calvarium at cranial sutures, the hematoma cannot cross suture lines.",
        highYieldPearl: "Middle meningeal artery laceration = Pterion fracture = Biconvex lens-shaped collection on CT = Does NOT cross suture lines. Requires emergent surgical craniotomy decompression."
      },
      {
        title: "Sudden Dyspnea and Sharp Chest Pain in a Tall Smoker",
        system: "Pulmonology / Thoracic Surgery",
        discipline: "Radiology",
        difficulty: "Easy",
        isPremium: false,
        vignette: "A 21-year-old tall, slender male with a 4 pack-year smoking history presents to the emergency department with sudden-onset right-sided pleuritic chest pain and shortness of breath that began while resting at home. Vital signs: BP 122/78 mmHg, HR 104/min, RR 24/min, SpO2 93% on room air. Physical exam reveals hyperresonance to percussion and severely diminished vesicular breath sounds over the right hemithorax. Trachea is strictly midline. An erect chest radiograph shows a thin, sharp white line representing the visceral pleura with complete absence of peripheral pulmonary vascular markings beyond this margin.",
        imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Right visceral pleural line with absent peripheral lung markings; lung partially collapsed toward hilum.",
        options: [
          "Rupture of apical subpleural blebs",
          "Infection with Mycobacterium tuberculosis",
          "Deep venous thrombosis embolization to pulmonary trunk",
          "Bacterial consolidation with air bronchograms",
          "Idiopathic pulmonary arterial hypertension"
        ],
        correctIndex: 0,
        explanation: "Primary spontaneous pneumothorax typically occurs in tall, thin young males in their 20s due to the rupture of subpleural apical blebs or bullae. Chest radiography demonstrates a visible visceral pleural line with absent lung markings lateral to it. Because the trachea is midline and the patient is hemodynamically stable without hypotension or JVD, this is a non-tension pneumothorax.",
        highYieldPearl: "Primary spontaneous pneumothorax: tall, thin young males, rupture of apical subpleural blebs. Absence of peripheral vascular markings. If tension develops (trachea shifts opposite side, hypotension), perform immediate needle decompression before imaging."
      },
      {
        title: "Severe Abdominal Distension in a Nursing Home Resident",
        system: "Gastroenterology / General Surgery",
        discipline: "Radiology",
        difficulty: "Medium",
        isPremium: true,
        vignette: "A 78-year-old male with chronic Parkinson's disease and chronic constipation residing in a nursing facility presents with progressive abdominal distension, obstipation, and cramping abdominal pain over the past 48 hours. Abdominal examination reveals a massively distended, tympanitic abdomen with high-pitched tinkling bowel sounds. Digital rectal examination shows an empty rectal vault. An abdominal plain radiograph reveals a hugely dilated, inverted U-shaped loop of bowel without haustra originating from the pelvis and extending toward the right upper quadrant, forming a classic 'coffee bean' appearance.",
        imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Massive coffee-bean shaped loop of distended large bowel apex pointing to right upper quadrant.",
        options: [
          "Emergency exploratory laparotomy with total colectomy",
          "Sigmoidoscopy with rectal tube insertion for decompression",
          "High-dose intravenous polyethylene glycol",
          "Immediate percutaneous transhepatic drainage",
          "Oral barium swallow study"
        ],
        correctIndex: 1,
        explanation: "The clinical presentation and radiograph showing the 'coffee bean sign' or 'bent inner tube sign' (distended sigmoid colon originating in pelvis with apex pointed toward RUQ) are classic for Sigmoid Volvulus. In a stable patient without peritoneal signs, bowel ischemia, or perforation, the first-line treatment is flexible sigmoidoscopy to untwist the volvulus and place a rectal decompression tube, followed by elective resection during the same admission due to high recurrence rates.",
        highYieldPearl: "Sigmoid volvulus: Coffee bean sign pointing to RUQ, common in elderly/neuropsychiatric/constipated patients. Initial management = endoscopic detorsion/decompression. In contrast, Cecal volvulus points to LUQ."
      },
      {
        title: "Stridor, High Fever, and Drooling in an Unvaccinated Child",
        system: "Pediatrics / Otolaryngology",
        discipline: "Radiology",
        difficulty: "Medium",
        isPremium: false,
        vignette: "A 4-year-old boy whose parents declined routine childhood vaccinations is brought to the emergency department with high fever (39.8°C / 103.6°F), severe sore throat, difficulty breathing, and refusal to swallow secretions. The child is sitting upright, leaning forward with his neck extended and mouth open, actively drooling. An anxious physician orders a portable lateral soft tissue neck radiograph under careful monitoring, which reveals a rounded, swollen, thumb-like soft tissue mass projecting into the supraglottic airway.",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Swollen epiglottis producing the classic Thumbprint sign in the hypopharynx.",
        options: [
          "Viral laryngotracheobronchitis (Croup)",
          "Acute bacterial epiglottitis",
          "Retropharyngeal abscess with widened prevertebral space",
          "Foreign body aspiration into right main bronchus",
          "Peritonsillar abscess with uvular deviation"
        ],
        correctIndex: 1,
        explanation: "Acute epiglottitis is characterized by the 3 D's: Dysphagia, Drooling, and Distress with the 'tripod position' and high fever. The lateral neck radiograph demonstrates the pathognomonic 'Thumbprint sign' representing marked edema of the aryepiglottic folds and epiglottis. Most classically caused by Haemophilus influenzae type b (Hib) in unvaccinated children. The priority is securing the airway in an operating room environment; never agitate the child or perform forceful tongue blade examination.",
        highYieldPearl: "Thumbprint sign on lateral neck X-ray = Acute Epiglottitis. Tripod position, drooling, high fever. Keep child calm, prepare surgical airway, treat with IV 3rd gen cephalosporin (Ceftriaxone) + Vancomycin."
      },
      {
        title: "Barking Cough and Inspiratory Stridor in a 14-Month-Old",
        system: "Pediatrics / Infectious Disease",
        discipline: "Radiology",
        difficulty: "Easy",
        isPremium: false,
        vignette: "A 14-month-old female is brought to urgent care at 2:00 AM due to a sudden harsh, 'seal-like' barking cough, hoarseness, and inspiratory stridor that woke her from sleep. She has had a low-grade fever and clear rhinorrhea for the past 2 days. An anteroposterior (AP) neck radiograph shows symmetric tapering and subglottic tracheal narrowing.",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Subglottic tracheal narrowing creating the classic 'Steeple Sign' (wine bottle sign).",
        options: [
          "Steeple sign caused by Parainfluenza virus",
          "Thumbprint sign caused by Haemophilus influenzae",
          "Membranous tracheal casts caused by Corynebacterium diphtheriae",
          "Carotid sheath displacement caused by Streptococcus pyogenes",
          "Deep sulcus sign caused by respiratory syncytial virus"
        ],
        correctIndex: 0,
        explanation: "Laryngotracheobronchitis (Croup) most commonly affects children aged 6 months to 3 years and is caused by Parainfluenza virus (paramyxovirus family, enveloped -ssRNA). The subglottic tracheal mucosal edema causes narrowing on AP neck radiograph known as the 'Steeple sign' (or pencil-point / wine-bottle sign). Treatment includes a single dose of oral or IM dexamethasone, with nebulized racemic epinephrine for moderate-to-severe stridor at rest.",
        highYieldPearl: "Steeple sign on AP neck film = Croup (Parainfluenza virus). Seal-like barking cough, inspiratory stridor. Treat with Dexamethasone ± Nebulized Racemic Epinephrine."
      },
      {
        title: "Intermittent Colicky Pain and 'Currant Jelly' Stools in an Infant",
        system: "Pediatrics / Pediatric Surgery",
        discipline: "Radiology",
        difficulty: "Hard",
        isPremium: true,
        vignette: "An 8-month-old infant boy is brought to the clinic for severe episodes of inconsolable crying during which he draws his knees up to his chest. Between these episodic spasms, he appears lethargic and calm. His mother notes that his last diaper change contained dark red, mucus-laden stool ('currant jelly' appearance). Physical exam reveals a palpable sausage-shaped mass in the right upper abdomen. An abdominal ultrasound demonstrates concentric alternating hypoechoic and hyperechoic rings in transverse section resembling a donut or target.",
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Target sign / Donut sign representing intussusceptum invaginating into intussuscipiens.",
        options: [
          "Diagnostic and therapeutic air or water-soluble contrast enema",
          "Immediate open appendectomy and bowel resection",
          "Intravenous high-dose methylprednisolone pulse therapy",
          "Upper gastrointestinal series with barium follow-through",
          "Oral erythromycin for gastrointestinal motility enhancement"
        ],
        correctIndex: 0,
        explanation: "This infant presents with the classic triad of Intussusception: intermittent abdominal pain with knee flexion, sausage-shaped RUQ mass, and 'currant jelly' (blood and mucus) stools. The pathognomonic ultrasound finding is the 'Target sign' (or 'Donut sign' / 'Pseudokidney sign') showing telescoping of bowel. The initial step is air (pneumatic) or contrast hydrostatic enema, which is both diagnostic and curative in >85% of uncomplicated cases.",
        highYieldPearl: "Target/donut sign on ultrasound = Intussusception. Most common lead point in infants is hypertrophied Peyer patches (post-viral gastroenteritis or rotavirus). Air enema is both diagnostic & therapeutic."
      },
      {
        title: "Microcytic Anemia and Narrowing of Bowel Caliber",
        system: "Gastroenterology / Oncology",
        discipline: "Radiology",
        difficulty: "Hard",
        isPremium: true,
        vignette: "A 67-year-old male presents with worsening constipation, fatigue, and an unintentional 15-pound weight loss over 4 months. He notes that his stools have become remarkably thin ('pencil-caliber'). Laboratory evaluation demonstrates hemoglobin of 9.1 g/dL with MCV of 72 fL (microcytic hypochromic anemia) and positive fecal occult blood. A fluoroscopic barium enema examination demonstrates a short, sharply demarcated, circumferential constricting lesion in the sigmoid colon with shelf-like overhanging margins.",
        imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Annular constriction with shouldered borders known as the classic Apple Core sign.",
        options: [
          "Apple-core lesion representing Colorectal Adenocarcinoma",
          "Lead pipe colon representing Ulcerative Colitis",
          "String sign representing terminal ileal Crohn's disease",
          "Bird's beak sign representing primary Achalasia",
          "Paucity of gas representing Hirschsprung disease"
        ],
        correctIndex: 0,
        explanation: "The 'Apple Core lesion' (napkin-ring lesion) on barium enema or CT colonography is classic for annular, constricting Colorectal Adenocarcinoma, most commonly in the descending/sigmoid colon. Left-sided colon cancers tend to grow circumferentially, presenting with altered bowel habits, 'pencil-thin' stools, and partial colonic obstruction. Right-sided lesions present with occult bleeding and iron deficiency anemia.",
        highYieldPearl: "Apple-core sign = Left-sided Colorectal Adenocarcinoma (annular napkin-ring constriction, pencil-thin stools). Right-sided cancers bleed (iron deficiency anemia); left-sided cancers obstruct."
      },
      {
        title: "Bilateral Hilar Prominence and Erythema Nodosum in a Young Female",
        system: "Pulmonology / Rheumatology",
        discipline: "Radiology",
        difficulty: "Medium",
        isPremium: true,
        vignette: "A 32-year-old African American female presents with painful, tender erythematous nodules over her bilateral pretibial shins, bilateral ankle arthralgias, and a mild dry cough. A routine posteroposterior chest radiograph demonstrates symmetric, well-defined enlargement of the right paratracheal, right hilar, and left hilar lymph nodes with clear lung parenchyma. Serum calcium is 11.2 mg/dL (elevated).",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        imageAnnotation: "Symmetric bilateral hilar and right paratracheal lymphadenopathy (Garland triad / 1-2-3 sign).",
        options: [
          "Systemic Sarcoidosis (Löfgren Syndrome)",
          "Small cell lung carcinoma with oat cell histology",
          "Primary Mycobacterium avium complex infection",
          "Goodpasture disease with anti-GBM antibodies",
          "Idiopathic pulmonary fibrosis (Usual Interstitial Pneumonia)"
        ],
        correctIndex: 0,
        explanation: "Löfgren syndrome is an acute, self-limiting form of Sarcoidosis characterized by the classic triad of: 1) Bilateral hilar lymphadenopathy (BHL), 2) Erythema nodosum, and 3) Migratory polyarthralgias (typically ankles). Radiographically, this is the Garland triad ('1-2-3 sign': right paratracheal, right hilar, and left hilar nodes). Hypercalcemia occurs because activated epithelioid macrophages in non-caseating granulomas express 1-alpha-hydroxylase, synthesizing active 1,25-(OH)2-vitamin D3 independently of PTH control.",
        highYieldPearl: "Bilateral hilar lymphadenopathy + erythema nodosum = Löfgren syndrome (Sarcoidosis). Non-caseating granulomas, elevated ACE, hypercalcemia from 1-alpha-hydroxylase in macrophages."
      }
    ];

    sampleQuestions.forEach(q => db.createQuestion(q));
    console.log(`Seeded ${sampleQuestions.length} comprehensive USMLE questions.`);
  }

  // Seed sample activity logs for admin dashboard
  const logs = db.getActivityLogs();
  if (logs.length === 0) {
    db.logActivity('usr_demo1', 'Dr. Sarah Jenkins', 'login', { device: 'MacBook Pro 16', browser: 'Chrome 122' }, '192.168.1.45', 'Mozilla/5.0 Mac OS X');
    db.logActivity('usr_demo1', 'Dr. Sarah Jenkins', 'test_started', { mode: 'Timed Exam', questionsCount: 40, system: 'Radiology / Neuro' }, '192.168.1.45');
    db.logActivity('usr_demo1', 'Dr. Sarah Jenkins', 'question_answered', { questionId: 'q_1', result: 'correct', timeSpentSeconds: 48 }, '192.168.1.45');
    db.logActivity('usr_demo1', 'Dr. Sarah Jenkins', 'radbot_query', { query: 'Compare epidural vs subdural hematoma on CT' }, '192.168.1.45');
    db.logActivity('usr_demo2', 'Dr. Michael Chen', 'login', { device: 'iPad Air 5th Gen', browser: 'Safari Mobile' }, '10.0.0.12', 'Mozilla/5.0 iPad');
    db.logActivity('usr_demo2', 'Dr. Michael Chen', 'test_started', { mode: 'Tutor Mode', questionsCount: 15, system: 'Pulmonology' }, '10.0.0.12');
    db.logActivity('usr_demo2', 'Dr. Michael Chen', 'radbot_query', { query: 'Systematic approach to Chest X-Ray (ABCDE)' }, '10.0.0.12');
    console.log('Seeded sample activity logs.');
  }

  console.log('Database seeding complete!');
}

module.exports = seed;

if (require.main === module) {
  seed();
}
