'use strict';

const TMDB_API_KEY = "28c71925f5aad6fe8b7eb0161431ad96";
const OMDB_API_KEY = "9c9b98e3";

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
      displayResults(responseJson);
    })
    .catch(error => alert(`error: ${error}. search for ${srcParam} failed.`));
}

function getReviews (imdb_id) {
  fetch(`https://www.omdbapi.com/?i=${imdb_id}&apikey=${OMDB_API_KEY}`)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(resJson => {
      console.log(resJson);
    })
    .catch(error => alert(`error: ${error}.`))
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
      getReviews(resJson.imdb_id);
    })
    .catch(error => alert(`error: ${error}`));
}

function displayResults(json) {
  json.results.map(item => {
    const imgUrl = `http://image.tmdb.org/t/p/w342${item.poster_path}`;
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
