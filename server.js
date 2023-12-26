import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// Express Config:

const corsOptions = {
  origin: [
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
  ],
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


// Express Routing:
app.get('/nono', (req, res) => res.redirect('/'))

// REST API for toys

//NEW toy LIST
app.get('/api/toy', (req, res) => {
  console.log("req.query.params:", req.query)
  const { filterBy = {}, sort = {} } = req.query.params

  toyService.query(filterBy, sort)
      .then(toys => {
          res.send(toys)
      })
      .catch(err => {
          console.log('Had issues getting toys', err);
          res.status(400).send({ msg: 'Had issues getting toys' })
      })
})
// GET SINGLE A TOY
app.get('/api/toy/:id', (req, res) => {
  console.log('detail');
  const toyId = req.params.id
  toyService.getById(toyId)
      .then(toy => {
          res.send(toy)
      })
      .catch(err => {
          console.log('Had issues getting toy', err);
          res.status(400).send({ msg: 'Had issues getting toy' })
      })
})

// toy DELETE
app.delete('/api/toy/:id', (req, res) => {
  const toyId = req.params.id
  toyService.remove(toyId)
        .then(() => {
            loggerService.info(`toy ${toyId} removed`)
            res.send('Removed!')
        })
        .catch((err) => {
            loggerService.error('Cannot remove toy', err)
            res.status(400).send('Cannot remove toy')
        })

})



// toy CREATE
app.post('/api/toy', (req, res) => {
  const toy = req.body
  toyService.save(toy)
      .then(savedToy => {
          res.send(savedToy)
      })
      .catch(err => {
          console.log('Had issues adding toy', err);
          res.status(400).send({ msg: 'Had issues adding toy' })
      })
})

// toy UPDATE
app.put('/api/toy/:id', (req, res) => {
  const toy = req.body
  toyService.save(toy)
      .then(savedToy => {
          res.send(savedToy)
      })
      .catch(err => {
          console.log('Had issues updating toy', err);
          res.status(400).send({ msg: 'Had issues updating toy' })
      })
})



// AUTH API
app.get('/api/user', (req, res) => {
    userService.query()
        .then((users) => {
            res.send(users)
        })
        .catch((err) => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                loggerService.info('Invalid Credentials', credentials)
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                loggerService.info('Cannot signup', credentials)
                res.status(400).send('Cannot signup')
            }
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})


app.put('/api/user', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(400).send('No logged in user')
    const { diff } = req.body
    if (loggedinUser.score + diff < 0) return res.status(400).send('No credit')
    loggedinUser.score += diff
    return userService.save(loggedinUser).then(user => {
        const token = userService.getLoginToken(user)
        res.cookie('loginToken', token)
        res.send(user)
    })
})


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = process.env.PORT ||3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
