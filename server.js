// import path from 'path'
// import express from 'express'
// import cors from 'cors'
// import cookieParser from 'cookie-parser'
// import { toyService } from './services/toy.service.js'
// import { loggerService } from './services/logger.service.js'
// import Cryptr from 'cryptr'

// const app = express()
// const crypter = new Cryptr(process.env.SECRET || 'secret-word-1234')
// // Express Config:

// const corsOptions = {
//   origin: [
//     'http://127.0.0.1:8080',
//     'http://localhost:8080',
//     'http://127.0.0.1:5174',
//     'http://localhost:5174',
//   ],
//   credentials: true
// }
// app.use(cors(corsOptions))
// app.use(express.static('public'))
// app.use(cookieParser())
// app.use(express.json())


// // Express Routing:
// app.get('/nono', (req, res) => res.redirect('/'))

// // REST API for toys

// //NEW toy LIST
// app.get('/api/toy', (req, res) => {
//   // console.log("req.query.params:", req.query)
//   const { filterBy = {}, sort = {} } = req.query.params

//   toyService.query(filterBy, sort)
//       .then(toys => {
//           res.send(toys)
//       })
//       .catch(err => {
//           console.log('Had issues getting toys', err);
//           res.status(400).send({ msg: 'Had issues getting toys' })
//       })
// })


// // GET SINGLE A TOY
// app.get('/api/toy/:id', (req, res) => {
//   console.log('detail');
//   const toyId = req.params.id
//   toyService.getById(toyId)
//       .then(toy => {
//           res.send(toy)
//       })
//       .catch(err => {
//           console.log('Had issues getting toy', err);
//           res.status(400).send({ msg: 'Had issues getting toy' })
//       })
// })

// // toy DELETE
// app.delete('/api/toy/:id', (req, res) => {
//   const toyId = req.params.id
//   toyService.remove(toyId)
//         .then(() => {
//             loggerService.info(`toy ${toyId} removed`)
//             res.send('Removed!')
//         })
//         .catch((err) => {
//             loggerService.error('Cannot remove toy', err)
//             res.status(400).send('Cannot remove toy')
//         })

// })



// // toy CREATE
// app.post('/api/toy', (req, res) => {
//   const toy = req.body
//   toyService.save(toy)
//       .then(savedToy => {
//           res.send(savedToy)
//       })
//       .catch(err => {
//           console.log('Had issues adding toy', err);
//           res.status(400).send({ msg: 'Had issues adding toy' })
//       })
// })

// // toy UPDATE
// app.put('/api/toy/:id', (req, res) => {
//   const toy = req.body
//   toyService.save(toy)
//       .then(savedToy => {
//           res.send(savedToy)
//       })
//       .catch(err => {
//           console.log('Had issues updating toy', err);
//           res.status(400).send({ msg: 'Had issues updating toy' })
//       })
// })



// // AUTH API
// app.get('/api/user', (req, res) => {
//     userService.query()
//         .then((users) => {
//             res.send(users)
//         })
//         .catch((err) => {
//             loggerService.error('Cannot load users', err)
//             res.status(400).send('Cannot load users')
//         })
// })

// app.post('/api/auth/login', (req, res) => {
//     const credentials = req.body
//     userService.checkLogin(credentials)
//         .then(user => {
//             if (user) {
//                 const loginToken = userService.getLoginToken(user)
//                 res.cookie('loginToken', loginToken)
//                 res.send(user)
//             } else {
//                 loggerService.info('Invalid Credentials', credentials)
//                 res.status(401).send('Invalid Credentials')
//             }
//         })
// })

// app.post('/api/auth/signup', (req, res) => {
//     const credentials = req.body
//     userService.save(credentials)
//         .then(user => {
//             if (user) {
//                 const loginToken = userService.getLoginToken(user)
//                 res.cookie('loginToken', loginToken)
//                 res.send(user)
//             } else {
//                 loggerService.info('Cannot signup', credentials)
//                 res.status(400).send('Cannot signup')
//             }
//         })
// })

// app.post('/api/auth/logout', (req, res) => {
//     res.clearCookie('loginToken')
//     res.send('logged-out!')
// })


// app.put('/api/user', (req, res) => {
//     const loggedinUser = userService.validateToken(req.cookies.loginToken)
//     if (!loggedinUser) return res.status(400).send('No logged in user')
//     const { diff } = req.body
//     if (loggedinUser.score + diff < 0) return res.status(400).send('No credit')
//     loggedinUser.score += diff
//     return userService.save(loggedinUser).then(user => {
//         const token = userService.getLoginToken(user)
//         res.cookie('loginToken', token)
//         res.send(user)
//     })
// })


// app.get('/**', (req, res) => {
//     res.sendFile(path.resolve('public/index.html'))
// })


// const PORT = process.env.PORT ||3030
// app.listen(PORT, () =>
//     loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
// )


import express  from 'express'
import cookieParser from 'cookie-parser'
import cors  from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')

const app = express()

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
    console.log('__dirname: ', __dirname)
} else {
    // Configuring CORS
    const corsOptions = {
        // Make sure origin contains the url your frontend is running on
        origin: ['http://127.0.0.1:5174', 'http://localhost:5174','http://127.0.0.1:3000', 'http://localhost:3000'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

// routes

import { authRoutes } from './api/auth/auth.routes.js'
app.use('/api/auth', authRoutes)

import { userRoutes } from './api/user/user.routes.js'
app.use('/api/user', userRoutes)

import { toyRoutes } from './api/toy/toy.routes.js'
app.use('/api/toy', toyRoutes)

// Make every unmatched server-side-route fall back to index.html
// So when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030

app.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})