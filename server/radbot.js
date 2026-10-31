// AI Rad Bot - Specialized Radiology & USMLE Clinical Reasoning Engine

const RADIOLOGY_KNOWLEDGE_BASE = {
  signs: [
    {
      name: "Sail Sign (Thymic sail)",
      modality: "Chest X-Ray (Pediatric)",
      pathology: "Normal thymus in infants",
      description: "A triangular radiopacity projecting from the superior mediastinum over the cardiac silhouette.",
      clinicalPearl: "Normal variant in children < 2 years. Do NOT confuse with cardiomegaly or mediastinal mass."
    },
    {
      name: "Spinnaker-Sail Sign (Angel Wing Sign)",
      modality: "Pediatric CXR",
      pathology: "Pneumomediastinum in neonate",
      description: "Thymic lobes elevated and laterally displaced by mediastinal air like spinnaker sails of a boat.",
      clinicalPearl: "Often seen with mechanical ventilation or respiratory distress syndrome."
    },
    {
      name: "Steeple Sign (Wine bottle sign)",
      modality: "AP Neck Radiograph",
      pathology: "Croup (Laryngotracheobronchitis)",
      description: "Subglottic tracheal narrowing due to mucosal edema, resembling a church steeple.",
      clinicalPearl: "Caused by Parainfluenza virus. Barking cough, inspiratory stridor. Treat with cool mist, dexamethasone, and nebulized racemic epinephrine for severe cases."
    },
    {
      name: "Thumbprint Sign",
      modality: "Lateral Neck Radiograph",
      pathology: "Acute Epiglottitis",
      description: "Enlarged, edematous epiglottis protruding into airway, resembling an adult thumb.",
      clinicalPearl: "Classically Haemophilus influenzae type b (or Streptococcus in immunized). Medical emergency! Keep patient calm, prepare for surgical airway/intubation. IV ceftriaxone + vancomycin."
    },
    {
      name: "Hampton Hump & Westermark Sign",
      modality: "Chest X-Ray",
      pathology: "Pulmonary Embolism with pulmonary infarction",
      description: "Hampton Hump is a wedge-shaped pleural-based opacity pointing toward hilum. Westermark sign is focal oligemia (decreased vascular markings) distal to occlusion.",
      clinicalPearl: "CXR is most often normal in PE (sinus tach on ECG). Gold standard diagnostic test is CT Pulmonary Angiography (CTPA). V/Q scan if severe renal failure or pregnancy."
    },
    {
      name: "Rigler Sign (Double Wall Sign)",
      modality: "Abdominal Radiograph (Supine)",
      pathology: "Pneumoperitoneum (Free intraperitoneal air)",
      description: "Both internal and external surfaces of the bowel wall are outlined by gas, making bowel wall distinctly visible.",
      clinicalPearl: "Indicates gastrointestinal perforation (e.g. perforated duodenal ulcer or diverticulitis). Emergent surgical consultation required."
    },
    {
      name: "Coffee Bean Sign (Bent Inner Tube)",
      modality: "Abdominal Radiograph",
      pathology: "Sigmoid Volvulus",
      description: "Massively distended loop of sigmoid colon originating from pelvis and pointing toward right upper quadrant, resembling a huge coffee bean.",
      clinicalPearl: "Common in elderly, chronically constipated, or neuropsychiatric patients. Initial management: endoscopic sigmoid decompression/detorsion if no signs of gangrene."
    },
    {
      name: "Apple Core Sign",
      modality: "Barium Enema / CT Abdomen",
      pathology: "Colorectal Adenocarcinoma (Colonic malignancy)",
      description: "Annular, circumferential constricting lesion with overhanging mucosal borders (shoulders), resembling an eaten apple core.",
      clinicalPearl: "Most common in left colon / rectosigmoid. Watch for pencil-thin stools, anemia, and obstruction in elderly patients."
    },
    {
      name: "Target Sign (Donut / Pseudokidney Sign)",
      modality: "Abdominal Ultrasound",
      pathology: "Intussusception",
      description: "Concentric rings of bowel-within-bowel (hypoechoic outer ring representing sheath/intussuscipiens, hyperechoic inner intussusceptum).",
      clinicalPearl: "Most common cause of intestinal obstruction in infants 6-36 months. Currant jelly stools, intermittent colic. Diagnostic & therapeutic: Air or contrast enema."
    },
    {
      name: "Biconvex / Lentiform Extra-axial Hyperdensity",
      modality: "Non-contrast Head CT",
      pathology: "Epidural Hematoma (EDH)",
      description: "Lens-shaped hyperdense collection that DOES NOT cross suture lines (confined by dural attachments) but CAN cross venous sinuses/falx.",
      clinicalPearl: "Middle meningeal artery rupture following pterion fracture. Classic lucid interval followed by rapid deterioration. Emergent craniotomy evacuation."
    },
    {
      name: "Crescent-shaped / Concave Extra-axial Hyperdensity",
      modality: "Non-contrast Head CT",
      pathology: "Subdural Hematoma (SDH)",
      description: "Crescent-shaped collection that CAN cross cranial suture lines, but is limited by the falx cerebri / tentorium.",
      clinicalPearl: "Tearing of bridging veins. Seen in elderly (cerebral atrophy), shaken infants, and alcoholics. Chronic SDH appears hypodense."
    },
    {
      name: "Star of David / Spider Hyperdensity in Basal Cisterns",
      modality: "Non-contrast Head CT",
      pathology: "Subarachnoid Hemorrhage (SAH)",
      description: "High-attenuation acute blood filling the sulci, Sylvian fissures, and basal cisterns.",
      clinicalPearl: "Rupture of saccular (berry) aneurysm, often at ACOM. 'Worst headache of my life' (thunderclap). If CT negative <6 hrs and suspicion high, perform lumbar puncture for xanthochromia."
    },
    {
      name: "Ring-Enhancing Brain Lesions",
      modality: "Brain MRI with IV Gadolinium / Contrast CT",
      pathology: "Mnemonic: MAGIC DR (Metastasis, Abscess, Glioblastoma, Infarction, Contusion, Demyelinating, Radiation necrosis/Lymphoma)",
      description: "Peripheral hyperintense rim surrounding a central non-enhancing hypodense necrotic core with prominent vasogenic edema.",
      clinicalPearl: "In HIV/AIDS: Multiple lesions = Toxoplasmosis (treat empirically with pyrimethamine/sulfadiazine). Single periventricular lesion = Primary CNS Lymphoma (EBV+)."
    },
    {
      name: "Bilateral Hilar Lymphadenopathy (1-2-3 Sign / Garland Triad)",
      modality: "Chest Radiograph / Chest CT",
      pathology: "Sarcoidosis (Löfgren syndrome)",
      description: "Symmetric enlargement of right paratracheal, right hilar, and left hilar lymph nodes.",
      clinicalPearl: "Non-caseating granulomas, elevated ACE levels, CD4+/CD8+ > 3.5 in BAL fluid, hypercalcemia (1-alpha-hydroxylase in macrophages)."
    }
  ],
  systematicGuides: {
    cxr: "Chest X-Ray ABCDE: A=Airway (trachea midline, carina angle), B=Bones/Soft tissues (fractures, subcutaneous emphysema), C=Cardiac silhouette (cardiothoracic ratio < 0.5, borders), D=Diaphragms (costophrenic angles sharp, free air under right dome), E=Equal fields & Extraneous tubes (infiltrates, pneumothorax, lines).",
    headCT: "Non-Contrast Head CT: 1. Blood (hyperdense acute hemorrhage: EDH, SDH, SAH, IPH). 2. Can (Cisterns: effacement, herniation). 3. Be (Brain parenchyma: midline shift, gray-white differentiation loss in acute stroke). 4. Very (Ventricles: hydrocephalus, compression). 5. Bad (Bone: skull fractures, pneumocephalus).",
    abdominalXRay: "Abdominal Plain Film: 1. Gas pattern (small bowel normal caliber < 3cm, colon < 6cm, cecum < 9cm rule of 3/6/9). 2. Extraluminal gas (pneumoperitoneum under diaphragm or Rigler sign, portal venous gas). 3. Calcifications (kidney stones, gallstones, appendicolith, vascular calcifications). 4. Soft tissue masses and organomegaly."
  }
};

class RadBotEngine {
  constructor() {
    this.kb = RADIOLOGY_KNOWLEDGE_BASE;
  }

  generateResponse(userQuery, activeQuestion = null) {
    const q = (userQuery || '').toLowerCase().trim();

    // 1. If asking about the current question on screen
    if (activeQuestion && (q.includes('this question') || q.includes('why') || q.includes('explain') || q.includes('clue') || q.includes('hint'))) {
      return this.explainActiveQuestion(activeQuestion, q);
    }

    // 2. Search for direct radiological sign matches
    for (const sign of this.kb.signs) {
      const matchWords = sign.name.toLowerCase().split(/[\s\(\)\/]+/).filter(w => w.length > 3);
      const isMatch = matchWords.some(w => q.includes(w)) || q.includes(sign.name.toLowerCase());
      if (isMatch) {
        return `### 🩺 Radiology Deep Dive: **${sign.name}**\n\n` +
               `* **Primary Modality:** ${sign.modality}\n` +
               `* **Classic Pathology:** **${sign.pathology}**\n` +
               `* **Radiological Appearance:** ${sign.description}\n\n` +
               `> 💡 **High-Yield Board Pearl:** ${sign.clinicalPearl}\n\n` +
               `*Would you like me to walk through the differential diagnosis or test you on a related case?*`;
      }
    }

    // 3. Systematic Approach request
    if (q.includes('abcde') || q.includes('approach cxr') || q.includes('read chest x-ray') || q.includes('chest x-ray approach')) {
      return `### 🩻 Systematic Approach: Chest Radiograph (ABCDE)\n\n` +
             `* **A - Airway:** Assess tracheal alignment (is it shifted away as in tension pneumothorax or towards as in atelectasis?). Check carina (<100°).\n` +
             `* **B - Bones & Soft Tissue:** Inspect clavicles, ribs (posterior rib fractures in abuse, flail chest), lytic/blastic lesions, and subcutaneous emphysema.\n` +
             `* **C - Cardiac Silhouette & Mediastinum:** Cardiothoracic ratio on PA view should be < 50%. Inspect aortic knob and mediastinal widening (>8cm = suspect aortic dissection/mediastinitis).\n` +
             `* **D - Diaphragms & Pleura:** Sharp costophrenic angles (blunting = >200-300 mL pleural effusion). Check for crescentic lucency under right hemidiaphragm (pneumoperitoneum).\n` +
             `* **E - Equal Lung Fields & Everything Else:** Compare bilateral symmetry, look for consolidations, air bronchograms, pneumothorax (absent lung markings laterally), and confirm endotracheal/nasogastric tube placements.`;
    }

    if (q.includes('head ct') || q.includes('approach head ct') || q.includes('brain ct')) {
      return `### 🧠 Systematic Approach: Non-Contrast Head CT ("Blood Can Be Very Bad")\n\n` +
             `* **1. Blood:** Look for hyperdensity. Epidural (lens/biconvex, sutures limit), Subdural (crescent, crosses sutures), Subarachnoid (sulci/cisterns, 'Star of David'), Intracerebral/Parenchymal (basal ganglia in Charcot-Bouchard/hypertension).\n` +
             `* **2. Cisterns:** Inspect perimesencephalic and suprasellar cisterns. Effacement signals impending transtentorial herniation.\n` +
             `* **3. Brain Parenchyma:** Check for loss of the insular ribbon or blur of gray-white junction (earliest signs of MCA ischemic stroke within 6 hours). Check for midline shift.\n` +
             `* **4. Ventricles:** Check lateral, third, and fourth ventricles for effacement, hydrocephalus, or intraventricular blood.\n` +
             `* **5. Bone:** Switch to bone window. Inspect for calvarial fractures, skull base basilar fractures (hemotympanum, Battle sign), and facial bones.`;
    }

    // 4. Differential diagnosis request
    if (q.includes('differential') || q.includes('ddx')) {
      return this.generateDifferential(q);
    }

    // 5. Quiz or case challenge
    if (q.includes('quiz') || q.includes('case') || q.includes('test me')) {
      return this.generateCaseChallenge();
    }

    // 6. Common USMLE topics
    if (q.includes('epidural') || q.includes('subdural')) {
      return `### ⚡ High-Yield Comparison: Epidural vs. Subdural Hematoma\n\n` +
             `| Feature | Epidural Hematoma (EDH) | Subdural Hematoma (SDH) |\n` +
             `| :--- | :--- | :--- |\n` +
             `| **Vessel Ruptured** | Middle Meningeal Artery (branch of maxillary a.) | Bridging veins (cortical bridging dural veins) |\n` +
             `| **Etiology** | Pterion skull fracture (temporoparietal trauma) | Acceleration-deceleration shear (elderly, shaken baby, alcoholics) |\n` +
             `| **CT Appearance** | **Biconvex / Lentiform** hyperdensity | **Crescent-shaped / Concave** hyperdensity |\n` +
             `| **Suture Lines** | **Cannot cross suture lines** (dura tightly adhered) | **Crosses suture lines** (unrestricted by sutures) |\n` +
             `| **Clinical Course** | Lucid interval → rapid coma & herniation (blown pupil) | Gradual headache, confusion, fluctuating neuro deficits |\n` +
             `| **Emergency Rx** | Immediate surgical craniotomy evacuation | Burr hole or craniotomy if significant mass effect / shift |`;
    }

    if (q.includes('pneumothorax')) {
      return `### 🫁 Pneumothorax: High-Yield Radiology & Management\n\n` +
             `* **Classic Finding:** Visceral pleural line visible with **absence of peripheral lung markings** (vascular arborization stops at the pleural stripe).\n` +
             `* **Supine CXR Finding:** **Deep Sulcus Sign** (deep, radiolucent costophrenic angle projecting down towards hypochondrium).\n` +
             `* **Tension Pneumothorax Signs:** Tracheal deviation to the **contralateral (opposite)** side, mediastinal shift, diaphragm depression, hypotension (decreased venous return).\n` +
             `* **Management Rule:** Tension pneumothorax is a **clinical diagnosis**! Never delay for an X-ray: perform immediate needle thoracostomy (2nd intercostal space midclavicular line or 5th intercostal anterior axillary line), followed by tube thoracostomy (chest tube).`;
    }

    // Default intelligent clinical assistant response
    return `### 🤖 Rad Bot Clinical Assistant\n\n` +
           `Hello! I am your specialized **Radiology & USMLE AI Assistant**.\n\n` +
           `Here are some things you can ask me:\n` +
           `* **"Explain this question"** *(when viewing any QBank case)*\n` +
           `* **"Differential for ring-enhancing brain lesion"**\n` +
           `* **"Compare epidural vs subdural hematoma on CT"**\n` +
           `* **"What is the Steeple sign vs Thumbprint sign?"**\n` +
           `* **"Systematic approach to Chest X-Ray (ABCDE)"**\n` +
           `* **"Quiz me on a high-yield radiology case"**\n\n` +
           `What medical concept or imaging finding would you like to explore?`;
  }

  explainActiveQuestion(q, userQuery) {
    const correctLetter = ['A', 'B', 'C', 'D', 'E'][q.correctIndex] || 'Correct Option';
    const correctAnswerText = q.options[q.correctIndex] || '';

    return `### 🩺 Rad Bot Case Breakdown\n\n` +
           `**Correct Answer:** **(${correctLetter}) ${correctAnswerText}**\n\n` +
           `#### 🔍 Clinical & Radiologic Reasoning:\n` +
           `${q.explanation}\n\n` +
           `#### 💎 High-Yield USMLE Board Pearl:\n` +
           `> ${q.highYieldPearl || 'Correlate patient clinical presentation directly with classic pathognomonic imaging findings.'}\n\n` +
           `*Need clarification on why the distractor options are incorrect, or want to review similar board cases?*`;
  }

  generateDifferential(query) {
    if (query.includes('ring') || query.includes('brain lesion')) {
      return `### 🧠 Differential Diagnosis: Ring-Enhancing Brain Lesions\n` +
             `**High-Yield Mnemonic: "MAGIC DR"**\n\n` +
             `1. **M - Metastasis:** Most common overall (often multiple, gray-white junction, grey/white border with extensive vasogenic edema. Primary: Lung > Breast > Melanoma > Renal > Colon).\n` +
             `2. **A - Abscess:** Smooth, thin, regular rim enhancement. Shows marked restriction on DWI (bright DWI / dark ADC due to thick purulent debris).\n` +
             `3. **G - Glioblastoma (GBM):** Thick, irregular, nodular ring enhancement with central necrosis. Crosses corpus callosum ('Butterfly glioma'). Astrocytic GFAP+.\n` +
             `4. **I - Infarct (subacute):** Resolving cerebral infarction ( luxury perfusion stage at 1-2 weeks).\n` +
             `5. **C - Contusion:** Hemorrhagic trauma with peripheral resolving rim.\n` +
             `6. **D - Demyelinating disease:** Incomplete or 'open-ring' enhancement (horseshoe pointing toward cortex).\n` +
             `7. **R - Radiation necrosis / Lymphoma:** In immunocompromised (HIV/AIDS, CD4 < 50), differentiate Toxoplasmosis (multiple, basal ganglia) vs Primary CNS Lymphoma (periventricular, solitary, EBV+).`;
    }

    if (query.includes('mediastinal') || query.includes('mass')) {
      return `### 🫀 Differential Diagnosis: Anterior Mediastinal Mass\n` +
             `**High-Yield Mnemonic: The 4 T's**\n\n` +
             `1. **Thymoma:** Associated with Myasthenia Gravis, pure red cell aplasia, and hypogammaglobulinemia.\n` +
             `2. **Teratoma (and other Germ Cell Tumors):** May contain fat, calcification, teeth, or fluid levels on CT. Elevated beta-hCG, AFP.\n` +
             `3. **Thyroid (Substernal Goiter):** Extends from cervical thyroid down into thoracic inlet; hyperdense on non-contrast CT due to iodine.\n` +
             `4. **Terrible Lymphoma:** Hodgkin or Non-Hodgkin lymphoma with constitutional B-symptoms (fever, drenching night sweats, weight loss).`;
    }

    return `### 📋 Differential Diagnosis Guide\n` +
           `To generate an accurate differential, please specify the anatomical region or imaging finding (e.g. *"solitary pulmonary nodule"*, *"hypoechoic thyroid nodule"*, *"widened mediastinum"*, or *"interstitial lung opacity"*).`;
  }

  generateCaseChallenge() {
    const randomSigns = this.kb.signs[Math.floor(Math.random() * this.kb.signs.length)];
    return `### 🏆 Rad Bot Board Challenge!\n\n` +
           `A patient presents with acute distress. On imaging (${randomSigns.modality}), you observe:\n` +
           `> *"${randomSigns.description}"*\n\n` +
           `**Questions for you:**\n` +
           `1. What is the classic name of this radiological sign?\n` +
           `2. What is the most likely diagnosis / pathology?\n` +
           `3. What is the immediate next best step or pharmacological treatment?\n\n` +
           `*(Reply with your diagnosis, or type 'Reveal' if you want the answer and high-yield explanation!)*`;
  }
}

module.exports = new RadBotEngine();
