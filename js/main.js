"use strict";

const TMDB_API_KEY = "28c71925f5aad6fe8b7eb0161431ad96";
const OMDB_API_KEY = "9c9b98e3";
const NY_TIMES_API_KEY = "jIjbrgn4YdIHKu7cRx4EoufKwtsj7haJ";
const TASTEDIVE_API_KEY = "348896-movierec-7BX6163S";

/* makes calls to TMDB based on a keyword. TMDB is used for the initial
  search because it is much better at searching with incomplete titles and
  returning more results for matches than OMDB.*/
function getMovies(srcParam) {
  fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${srcParam}`
  )
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(responseJson => {
      // console.log(responseJson);
      if (responseJson.total_results === 0) {
        $(".results-movies").append(`<h2>Bad search term ${srcParam}<h2>`)
        throw new Error(
          `no results for ${srcParam}. Please try a different movie. @getMovies()`
        );
      }
      displaySearchResults(responseJson);
    })
    .catch(error => alert(`error: ${error}. search for ${srcParam} failed.`));
}

/* getNytReviews() makes a request to the New York Times'
 * movie review API given a title and an opening date range
 * calculated from a calendar year from the opening date.
 * i.e. rel. date= 10/15/2019, date range = 2019-2020.
 */
async function getNytReviews(title, openYear) {
  let response = await fetch(
    `https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=${title}&opening-date=${openYear}-01-01;${parseInt(
      openYear,
      10
    ) + 1}-01-01&api-key=${NY_TIMES_API_KEY}`
  );
  let data = await response.json();
  return data;
}

/* getTasteDiveRecs() makes a request to TasteDive to
 * find recommendations for specifically movies related to
 * the OMDb title of the movie.
 */
async function getTasteDiveRecs(srcParam) {
  let response = await fetch(
    `https://cors-anywhere.herokuapp.com/https://tastedive.com/api/similar?q=${srcParam}&type=movie&info=1&limit=10&k=${TASTEDIVE_API_KEY}`
  );
  let data = await response.json();
  return data;
}

/* getOmdbReviews() uses the imdb id found from getImdbId() to
 * find associated reviews (metacritic, etc.) for the selected
 * movie.
 */
function getOmdbReviews(imdb_id) {
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
    .catch(error =>
      alert(`error: ${error}. review search for ${imdb_id} failed.`)
    );
}

/* getImdbId is called once a movie is selected. the TMDb id that
 * was put in the data-* attribute is used to look up the IMDb id,
 * which is reference-able by both TMDb and IMDb.
 */
function getImdbId(tmdb_id) {
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
    .catch(error =>
      alert(`error: ${error}, imdb lookup for ${tmdb_id} failed.`)
    );
}

/* displayMovieInfo() is an async function (it awaits results from
 * getNytReviews() and getTasteDiveRecs() before attaching any html)
 * and effectively displays all of the collected info (omdb info, review scores
 * NYT reviews, and TasteDive recommendations).
 */
async function displayMovieInfo(json) {
  const nytRev = await Promise.resolve(getNytReviews(json.Title, json.Year));
  const tasteRec = await Promise.resolve(getTasteDiveRecs(json.Title));
  // console.log(nytRev.num_results);
  $(".indiv-movie")
    .children()
    .detach();
  $(".indiv-movie").append(
    `<div id="movie" data-imdb-id="${
      json.imdbID
    }" xmlns="http://www.w3.org/1999/html">
            <h2>${json.Title} (${json.Year})<h2>
            <img
                src="${
                  (json.Poster !== "N/A")
                  ? (json.Poster)
                  : ("img/no_poster.png")
                }"
                alt="movie poster"
            />
            <div>
                <p>Released: ${json.Released}, DVD: ${json.DVD}</p>
                <p>Starring: ${json.Actors}, Rated: ${json.Rated}</p>
                <p>Director: ${json.Director} Genre(s): ${json.Genre}</p>
                <p>Plot: ${json.Plot}</p>
                <br />

                <h4>-Ratings-</h4>
                <div id="ratings">
                  <ul>
                      ${
                        (!!json.Ratings && !!json.Ratings[0])
                        ? (json.Ratings.map(rev => `<li>${rev.Source} Score: ${rev.Value}</li>`).join(""))
                        :(`no ratings found...`)
                      }
                  </ul>
                </div>
                <br />
                <h3>-Reviews-</h3>
                <h4>${
      nytRev.num_results > 0
        ? nytRev.results[0].headline
        : `no ny times reviews found...`
    }</h4>
                <p>${
      nytRev.num_results > 0 ? nytRev.results[0].byline : `no byline found...`
    }</p>
                <p>${
      nytRev.num_results > 0
        ? nytRev.results[0].summary_short
        : ``
    }</p>
                ${
                  (nytRev.num_results > 0)
                  ?(`<a target="_blank" href="${nytRev.results[0].link.url}">Link to NYT Movie Review</a>`)
                  :('')
                }

                <br />

                <h4>-Similar Movies-</h4>
                <div id="recommendations">
                  <ul>
                  ${
                    (!!tasteRec.Similar.Results[0])
                    ?('')
                    :('no similar items found...')
                  }
                      ${tasteRec.Similar.Results.map(rec => {
                        return (
                          `<li id="${rec.Name}">
                            <p><a href="${rec.wUrl}">${rec.Name}</a></p>
                            <p id="rec-p">${rec.wTeaser}</p>
                            ${renderTrailer(rec.yUrl)}
                          </li>`
                        );
                      }).join("")}
                  </ul>
                </div>
            </div>
      </div>`
  );
}

const renderTrailer = (source) => {
  if (source) {
    return `<iframe allow="autoplay" allowfullscreen width="300" height="255" src="${source}"></iframe>`
  }
  return '<p>no trailer found</p>'
}

/* displaySearchResults() uses the TMDb info returned from
 * getMovies() to find posters for the associated results.
 * the TMDb ID is included as a data-* attribute for future
 * reference. If a movie doesn't have a poster image in the tmdb
 * database, a placeholder image is used instead.
 */
function displaySearchResults(json) {
  json.results.map(item => {
    const imgUrl =
      item.poster_path === null
        ? `img/no_poster.png`
        : `https://image.tmdb.org/t/p/w342${item.poster_path}`;
    $(".results-movies").append(
      `<div id="movie" data-tmdb-id="${item.id}">
            <p>${item.original_title}<p>
            <img src="${imgUrl}" alt="movie poster" />
      </div>`
    );
  });

  //display the results section
  $(".results").removeClass("hidden");
}

/* watchForm() listens to the form for a submission event
 * at which point it will clear the results div, and then call
 * getMovies() with the parameter being the input field's value
 */
function watchForm() {
  $("form").submit(event => {
    event.preventDefault();
    $(".results-movies")
      .children()
      .detach();
    $(".indiv-movie")
      .children()
      .detach();
    getMovies($("#input").val());
  });
}

/* watchSelection() listens to the div that contains the full
 * list of movies that are returned by getMovies(). Once any of
 * the elements inside the div that holds a result's poster and
 * title are clicked, the results are cleared from the page, a
 * loading animation is started, and getImdbId() is called using
 * the TMDb id that has been injected into the data-tmdb-id attribute
 * for a search results' div.
 */
function watchSelection() {
  $(".results-movies").on("click", "div", function(event) {
    $(".results-movies")
      .children()
      .detach();
    $(".indiv-movie").append(`<img src="img/loading.gif" />`);
    getImdbId($(event.currentTarget).data("tmdb-id"));
  });
}

$(function() {
  watchForm();
  watchSelection();
});
