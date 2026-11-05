const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function extractP10Cards() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  const p10 = await doc.getPage(10);
  const text10 = (await p10.getTextContent()).items.map(it => it.str).join(' ');
  
  // Card 1:
  // Q: “I know upper limb nerves are HY . What do I need to know for USMLE without all of the bullshit.”
  // A: "You need to know the injuries associated with the nerves, and then just basic motor/sensory issues."
  const q1 = "“I know upper limb nerves are HY . What do I need to know for USMLE without all of the bullshit.”";
  const a1 = "You need to know the injuries associated with the nerves, and then just basic motor/sensory issues.";

  // What is Card 2 in screenshot?
  // Let's check what other question exists on page 10 or 13:
  // "Does USMLE care about upper limb reflexes?" à "They do show up on NBME, yes. You could be aware that if biceps reflex is weakened, they want C5 as the nerve root that’s fucked up. And if triceps reflex is weakened, it’s C6-7 that’s fucked up."
  console.log('Card 1 Q:', q1);
  console.log('Card 1 A:', a1);
}

extractP10Cards().catch(console.error);
