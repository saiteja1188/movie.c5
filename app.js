const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')

let db = null

const initialazeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}

initialazeDBAndServer()

// All Movies

app.get('/movies/', async (request, response) => {
  const movieArrayQuery = `
    SELECT 
        *
    FROM
        movie;
    `
  const movieArray = await db.all(movieArrayQuery)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
  //response.send(movieArray)
})

const converObjToResponseObj = eachMovie => {
  return {
    movieName: eachMovie.movie_name,
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    leadActor: eachMovie.lead_actor,
  }
}

//Sigle movies Names
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieSingleQuery = `
  SELECT
    *
  FROM 
    movie
  WHERE
    movie_id = ${movieId};
  `
  const singleQuery = await db.get(movieSingleQuery)
  response.send(converObjToResponseObj(singleQuery))
})

// Creat movie

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const createMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES (
    ${directorId},
    "${movieName}",
    "${leadActor}" 
    );
  `
  await db.run(createMovieQuery)
  response.send('Movie Successfully Added')
})

// Update Moive

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateQuery = `
  UPDATE
    movie 
  SET 
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
  WHERE
    movie_id = ${movieId};
  `
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

// delete movie

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};
  `
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

// directors all

app.get('/directors/', async (request, response) => {
  const directorQuery = `
  SELECT 
    *
  FROM
    director
  `
  const directorArray = await db.all(directorQuery)
  //response.send(coventDirectorObjToResponseObj(directorArray))
  //response.send(directorArray)
  response.send(
    directorArray.map(directorAll => ({
      directorId: directorAll.director_id,
      directorName: directorAll.director_name,
    })),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorMovieQuery = `
  SELECT 
    movie_name
  FROM 
    movie
  WHERE 
    director_id = ${directorId};
  `
  const directorMovies = await db.all(directorMovieQuery)
  response.send(directorMovies.map(each => ({movieName: each.movie_name})))
})

module.exports = app
