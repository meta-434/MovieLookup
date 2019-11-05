'use strict';

const TMDB_API_KEY = "28c71925f5aad6fe8b7eb0161431ad96";
const OMDB_API_KEY = "9c9b98e3";
const NY_TIMES_API_KEY = "jIjbrgn4YdIHKu7cRx4EoufKwtsj7haJ";
const TASTEDIVE_API_KEY = "348896-movierec-7BX6163S";

/* makes calls to TMDB based on a keyword. TMDB is used for the initial
  search because it is much better at searching with incomplete titles and
  returning more results for matches than OMDB.*/
function getMovies(srcParam) {
  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${srcParam}`)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(responseJson => {
      console.log(responseJson);
      displaySearchResults(responseJson);
    })
    .catch(error => alert(`error: ${error}. search for ${srcParam} failed.`));
}

async function getNytReviews (title, openYear) {
  let response = await fetch(`https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=${title}&opening-date=${openYear}-01-01;${parseInt(openYear, 10) + 1}-01-01&api-key=${NY_TIMES_API_KEY}`);
  let data = await response.json();
  return data;
}

async function getTasteDiveRecs (srcParam) {
  let response = await fetch(`https://cors-anywhere.herokuapp.com/https://tastedive.com/api/similar?q=${srcParam}&type=movie&info=1&limit=10&k=${TASTEDIVE_API_KEY}`);
  let data = await response.json();
  return data;
}

function getOmdbReviews (imdb_id) {
  fetch(`https://www.omdbapi.com/?i=${imdb_id}&apikey=${OMDB_API_KEY}`)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(resJson => {
      displayMovieInfo(resJson);
    })
    .catch(error => alert(`error: ${error}. review search for ${imdb_id} failed.`))
}

function getImdbId (tmdb_id) {
  fetch(`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}`)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(resJson => {
      getOmdbReviews(resJson.imdb_id);
    })
    .catch(error => alert(`error: ${error}, imdb lookup for ${tmdb_id} failed.`));
}

async function displayMovieInfo(json) {
  const nytRev = await Promise.resolve(getNytReviews(json.Title, json.Year));
  const tasteRec = await Promise.resolve(getTasteDiveRecs(json.Title));
  console.log(nytRev);

  $('.results-movies').append(

    `<div id="movie" data-imdb-id="${json.imdbID}" xmlns="http://www.w3.org/1999/html">
            <h3>${json.Title} (${json.Year})<h3>
            <img src=${json.Poster} alt="movie poster" />
            <div>
                <p>Released: ${json.Released}, DVD: ${json.DVD}</p>
                <p>Starring: ${json.Actors}, Rated: ${json.Rated}</p>
                <p>Director: ${json.Director} Genre(s): ${json.Genre}</p>
                <p>Plot: ${json.Plot}</p>
                <p>-Ratings-</p>
                <ul>
                    ${json.Ratings.map(rev => `<li>Source: ${rev.Source} Score: ${rev.Value}</li>`)}
                </ul>
                <p>-Reviews-</p>
                <h4>${(nytRev.num_results > 0) ? (nytRev.results[0].headline) : (`no ny times reviews found`)}</h4>
                <a target="_blank" href=${(nytRev.num_results > 0) ? (nytRev.results[0].link.url) : (`...`)}>link</a>
                <p>${(nytRev.num_results > 0) ? (nytRev.results[0].byline) : (`...`)}</p>
                <p>${(nytRev.num_results > 0) ? (nytRev.results[0].summary_short) : (`...`)}</p>
                
                <p>-Similar Movies-</p>
                <ul>
                    ${tasteRec.Similar.Results.map(rec => { return (
                      `<li>
                            <p><a href=${rec.wUrl}>${rec.Name}</a></p>
                            <p>${rec.wTeaser}</p>
                            <iframe width="420" height="315" src=${rec.yUrl}>
                            </iframe>
                       </li>`)})}
                </ul>
            </div>
      </div>`
  );
}

function displaySearchResults(json) {
  json.results.map(item => {
    const imgUrl = (item.poster_path === null)?(`./img/no_poster.png`):(`https://image.tmdb.org/t/p/w342${item.poster_path}`);
    $('.results-movies').append(
      `<div id="movie" data-tmdb-id="${item.id}">
            <p>${item.original_title}<p>
            <img src=${imgUrl} alt="movie poster" />
      </div>`
    )
  });

  //display the results section
  $('.results').removeClass('hidden');
}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    $('.results-movies').children().detach();
    getMovies($('#input').val());
  });
}

function watchSelection() {
  $('.results-movies').on("click", "div", function (event) {
    $('.results-movies').children().detach();
    getImdbId($(event.currentTarget).data('tmdb-id'));
  });
}

$(function() {
  console.log('App loaded! Waiting for submit!');
  watchForm();
  watchSelection();
});
