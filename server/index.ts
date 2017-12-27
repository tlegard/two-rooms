import * as express from 'express'
import * as path from 'path'
import * as morgan from 'morgan'
import * as http from 'http'

const app = express()
app.set('port', 8000)

app.use(express.static(path.join(__dirname, '..', 'build', 'static')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))

app.all('/*', (req, res, next) => {
    console.log('Reading the main route through http request, sending index.html');
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

const server = http.createServer(app)
server.listen(app.get('port'), () => {
    console.log('express listening on port ' + app.get('port'))
})