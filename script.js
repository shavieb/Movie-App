const apiKey = "66368ae4";

let currentPage = 1;
let currentSearch = "";
let isLoading = false;

document.getElementById("searchBtn").addEventListener("click", () => {
  const title = document.getElementById("movieInput").value.trim();
  const type = document.getElementById("typeFilter").value;
  const year = document.getElementById("yearFilter").value;

  if (!title) return;

  currentSearch = title;
  currentPage = 1;

  loadMovies(currentSearch, currentPage, type, year);
});

document.getElementById("viewFavsBtn").addEventListener("click", () => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    document.getElementById("movieResult").innerHTML = "<p>No favorites saved.</p>";
    return;
  }

  showLoader(true);

  const movieDetailsPromises = favorites.map(title =>
    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
      .then(res => res.json())
  );

  Promise.all(movieDetailsPromises).then(movies => {
    showLoader(false);
    const validMovies = movies.filter(m => m.Response === "True");
    displayMovies(validMovies, true); 
  });
});


function loadMovies(title, page, type, year) {
  if (isLoading) return;
  isLoading = true;
  showLoader(true);

  let url = `https://www.omdbapi.com/?s=${title}&apikey=${apiKey}&page=${page}`;
  if (type) url += `&type=${type}`;
  if (year) url += `&y=${year}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      showLoader(false);
      isLoading = false;

      if (data.Response === "True") {
        if (page === 1) {
          document.getElementById("movieResult").innerHTML = "";
        }
        displayMovies(data.Search);
      } else if (page === 1) {
        document.getElementById("movieResult").innerHTML = `<p>No results found.</p>`;
      }
    });
}

function displayMovies(movies, isFavoritesView = false) {
  const container = document.getElementById("movieResult");
  container.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
      <h2>${movie.Title} (${movie.Year})</h2>
      <button class="${isFavoritesView ? 'remove-btn' : 'fav-btn'}" data-title="${movie.Title}">
        ${isFavoritesView ? '❌ Remove' : '❤️ Save'}
      </button>
    `;

    container.appendChild(card);
  });

  if (isFavoritesView) {
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const title = btn.getAttribute("data-title");
        removeFromFavorites(title);
        const card = btn.closest(".movie-card");
  card.classList.add("removing");
  setTimeout(() => card.remove(), 300); 
      });
    });
  } else {
    document.querySelectorAll(".fav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        saveToFavorites(btn.getAttribute("data-title"));
      });
    });
  }
}


function saveToFavorites(title) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(title)) {
    favorites.push(title);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${title} added to favorites!`);
  } else {
    alert(`${title} is already in favorites.`);
  }
}

function removeFromFavorites(title) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(item => item !== title);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert(`${title} removed from favorites.`);
}

function showLoader(isLoading) {
  const loader = document.getElementById("loader");
  loader.style.display = isLoading ? "block" : "none";
}

function runSearch() {
  const title = document.getElementById("movieInput").value.trim();
  const type = document.getElementById("typeFilter").value;
  const year = document.getElementById("yearFilter").value;

  if (!title) return;

  currentSearch = title;
  currentPage = 1;

  loadMovies(currentSearch, currentPage, type, year);
}
document.getElementById("movieInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runSearch();
  }
});


window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    if (currentSearch) {
      currentPage++;
      const type = document.getElementById("typeFilter").value;
      const year = document.getElementById("yearFilter").value;
      loadMovies(currentSearch, currentPage, type, year);
    }
  }
});
