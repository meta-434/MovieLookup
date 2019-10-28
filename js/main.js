'use strict';

const TMDB_API_KEY = "28c71925f5aad6fe8b7eb0161431ad96";
const OMDB_API_KEY = "9c9b98e3";

/* makes calls to TMDB based on a keyword. TMDB is used for the initial
  search because it is much better at searching with incomplete titles and
  returning more results for matches than OMDB.*/
function getMoviesTMDB(srcParam) {
  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${srcParam}`)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      // fetch more reviews from OMDb
      // fetch NYT reviews
      // fetch related movies / products
    })
    .catch(error => alert(`error: ${error}. search for ${srcParam} failed.`));
}

function displayResults(responseJson) {
  //console.log(responseJson);
  responseJson.map(item => {
    console.log(`${item.name} , url:${item.html_url}, isFork?:${item.fork}`);
    $('.results-repos').append(
      `<p>${item.name} , url:${item.html_url}, isFork?:${item.fork}<p>`
    )
  })

  //display the results section
  $('.results').removeClass('hidden');
}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    $('.results-movies').children().detach();
    getMoviesTMDB($('#input').val());
  });
}

function watchSelection() {
  // watch for clicks on a movie result
}

$(function() {
  console.log('App loaded! Waiting for submit!');
  watchForm();
});
