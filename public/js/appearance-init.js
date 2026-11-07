(function () {
  const legacyThemes = {
    light: 'clean-focus',
    auto: 'clean-focus',
    dark: 'night-study',
    black: 'max-contrast'
  };
  const themes = new Set([
    'clean-focus',
    'warm-paper',
    'night-study',
    'calm-mint',
    'max-contrast'
  ]);
  let savedTheme = 'clean-focus';

  try {
    savedTheme = localStorage.getItem('synapse_theme') || savedTheme;
  } catch (error) {
    console.warn('Appearance preference could not be read.', error);
  }

  savedTheme = legacyThemes[savedTheme] || savedTheme;
  if (!themes.has(savedTheme)) savedTheme = 'clean-focus';

  document.documentElement.classList.add(`appearance-${savedTheme}`);
})();
