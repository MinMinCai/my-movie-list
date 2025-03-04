const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


function renderMovieList(data) {
  let rawHTML = ''

  // processing
  data.forEach((item) => {
    //title, image
    // console.log(item)
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  // send request to show api
  axios.get(INDEX_URL + '/' + id).then((response) => {
    // response.data.result
    const data = response.data.results
    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function removeFromFavorite(id) {
  // 防止 movies 是空陣列,若movies長度為0(沒有內容), 則返回
  if (!movies || !movies.length) return //防止 movies 是空陣列的狀況

  // 利用陣列比對清單中是否存在電影id
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if(movieIndex === -1) return // 沒有的話(=-1)就停止執行，不做任何動作

  // 有的話就會存入 movieIndex 
  movies.splice(movieIndex, 1) // 利用splice刪除 movies中符合movieIndex 內所有的值
  localStorage.setItem('favoriteMovies', JSON.stringify(movies)) // 將movies轉換為JSON格式的字串,以localStorage存入favoriteMovies中
  renderMovieList(movies) // 呼叫更新後的函式
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)