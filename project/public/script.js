function toggleBuildDetails(element) {
    const buildDetails = element.querySelector('.build-details');
    buildDetails.style.display = buildDetails.style.display === 'none'? 'block' : 'none';
  }
  let currentIndex = 0;
  let containerWidth = document.querySelector('.whole_container').offsetWidth;
  let autoScrollEnabled = true;

  document.getElementById('auto-scroll-checkbox').addEventListener('change', () => {
    autoScrollEnabled = document.getElementById('auto-scroll-checkbox').checked;
  });

  setInterval(() => {
    if (autoScrollEnabled) {
      currentIndex = (currentIndex + 1) % document.querySelectorAll('.whole_container > *').length;
      document.querySelector('.whole_container').scrollTo({
        left: currentIndex * containerWidth,
        behavior: 'smooth'
      });
    }
  }, 5000);

  //formating time duration of builds
  // script.js
function formatDuration(duration) {
  const seconds = Math.floor(duration / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemaining = seconds % 60;

  return `${hours}h ${minutes}m ${secondsRemaining}s`;
}

// Make the function globally accessible
window.formatDuration = formatDuration;