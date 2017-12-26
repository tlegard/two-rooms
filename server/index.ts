import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as morgan from 'morgan'
import * as http from 'http'

const app = express()
app.set('port', 8000)

app.use('/', express.static(path.join(__dirname, '../../build')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))

const server = http.createServer(app)

app.get('/*', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../../build/index.html'))
})

server.listen(app.get('port'), () => {
    console.log('express listening on port ' + app.get('port'))
})