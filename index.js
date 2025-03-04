const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12 // 每一頁只顯示12筆資料

const movies = []
let filteredMovies = [] // 存放搜尋到的結果

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

// 計算movies的總頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  
  for (let page = 1;page <= numberOfPages; page ++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

// 當輸入一個Page，會回傳該Page的所有資料
function getMoviesByPage(page) {
  // 如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies
  const data = filteredMovies.length ? filteredMovies : movies

  // page 1 >> movies 0 - 11
  // page 2 >> movies 12 - 23
  // ...
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

function addTOFavorite(id) {
  // console.log(id)
  function isMovieIdMatched(movie) {
    return movie.id === id
  }

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // 如果沒有"favoriteMovies"的話，則回傳空陣列
  const movie = movies.find(isMovieIdMatched)
  // const movie = movies.find((movie) => movie.id === id) >> 箭頭函式

  if (list.some((movie) => movie.id === id)) {
    return alert('This movie already exists in the list.')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  // const jsonString = JSON.stringify(list)
  // console.log('json string: ', jsonString)
  // console.log('json object: ', JSON.parse(jsonString))
  alert('Added to my list successfully.')
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addTOFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  // console.log(event.target.dataset.page)
  const page = Number(event.target.dataset.page)

  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase() // 希望搜尋詞不分大小寫都可以搜尋到

  // 使用filter()方法進行過濾
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  // 迴圈的做法:
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 當未輸入任何字時，跳出以下警示
  // if (!keyword.length) {
  //   return alert('Please enter valid string')
  // }

  // 當未輸入任何字時，跳出以下警示
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1)) // 先顯示第一頁的搜尋結果
})

axios.get(INDEX_URL).then((response) => {
  // Array(80)
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})
