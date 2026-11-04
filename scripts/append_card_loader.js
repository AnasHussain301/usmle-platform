// Add support for external extracted zetchy_cards.json
(async function initCardsFromDisk() {
  try {
    const res = await fetch('/api/fa/cards');
    if (res.ok) {
      const data = await res.json();
      if (data && data.cards) {
        Object.assign(FA_HEADING_QUESTIONS, data.cards);
        console.log('✅ Loaded', Object.keys(data.cards).length, 'custom card sets from server');
      }
    }
  } catch(e) {}
})();
