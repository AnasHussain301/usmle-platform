const fs = require('fs');
const mapped = JSON.parse(fs.readFileSync('data/mehlman_cards_mapped.json', 'utf8'));

// Exact match for MSK Upper extremity nerves (as shown in user screenshot: 1/2 cards)
mapped['msk|450|Upper extremity nerves'] = [
  {
    q: '“I know upper limb nerves are HY . What do I need to know for USMLE without all of the bullshit.”',
    a: 'You need to know the injuries associated with the nerves, and then just basic motor/sensory issues.'
  },
  {
    q: '“Does USMLE care about upper limb reflexes?”',
    a: 'They do show up on NBME, yes. You could be aware that if biceps reflex is weakened, they want C5 as the nerve root that’s fucked up. And if triceps reflex is weakened, it’s C6-7 that’s fucked up.'
  }
];

fs.writeFileSync('data/mehlman_cards_mapped.json', JSON.stringify(mapped, null, 2));
console.log('Successfully set exact cards for Upper extremity nerves!');
