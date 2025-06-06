document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('user-search');
    const resultsList = document.getElementById('search-results');
    const form = document.getElementById('search-form');
  
    if (!searchInput || !resultsList || !form) return;
  
    form.addEventListener('submit', e => e.preventDefault());
  
    searchInput.addEventListener('input', async () => {
      const query = searchInput.value.trim();
      if (!query) {
        resultsList.innerHTML = '';
        resultsList.style.display = 'none';
        return;
      }
  
      const res = await fetch(`/search-users?q=${encodeURIComponent(query)}`);
      const users = await res.json();
  
      resultsList.innerHTML = '';
      if (users.length > 0) {
        users.forEach(user => {
          const li = document.createElement('li');
          li.textContent = user.username;
          li.onclick = () => {
            window.location.href = `/profile/${user.id}`;
          };
          resultsList.appendChild(li);
        });
        resultsList.style.display = 'block';
      } else {
        resultsList.style.display = 'none';
      }
    });
  });
  