const express = require('express');
const app = express();
const port = 3001;


const data = require('./data');

app.use(express.json());
app.use(express.raw());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));


app.get('', (req, res) => {
  res.send('服务启动成功.')
});
app.use('/data', data);

const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Server is started and listen on address${host} port ${port}`);
});