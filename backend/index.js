const express = require('express')
const app = express()
const port = 4000
const cors = require('cors')
const fs = require("fs")

app.use(cors({
  'allowedHeaders': ['Content-Type'],
  'origin': '*',
  'methods': 'GET'
}));


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get('/getratings', (req, res) => {

  const address = req.query.address;
  const index = parseInt(req.query.index);

  let ratings = JSON.parse(fs.readFileSync('./info/ratings.json', 'utf8'));

  if (isNaN(index)) {
    if (!ratings[address])
      ratings[address] = { likes: [], dislikes: [] }

    res.status(200).send({ ratings: ratings[address] });
  } else {

    var likes = 0;
    var dislikes = 0;

    Object.values(ratings).forEach((val, i) => {
      if (val.likes.includes(index))
        likes++;
      if (val.dislikes.includes(index))
        dislikes++;
    })

    res.status(200).send({ likes, dislikes });
  }
});

const filt = (ratings, address, index, v) => {
  return ratings[address][v].filter(function (e) { return e !== index });
}

app.get('/setrating', (req, res) => {

  const address = req.query.address;
  const index = parseInt(req.query.index);
  const action = req.query.action;

  let ratings = JSON.parse(fs.readFileSync('./info/ratings.json', 'utf8'));

  if (!ratings[address])
    ratings[address] = { likes: [], dislikes: [] }

  if (action === "like") {

    if (Object.values(ratings[address].likes).includes(index)) {
      ratings[address].likes = filt(ratings, address, index, "likes")
    } else {
      ratings[address].likes.push(index)
    }

    ratings[address].dislikes = filt(ratings, address, index, "dislikes")

  } else if (action === "dislike") {

    if (Object.values(ratings[address].dislikes).includes(index)) {
      ratings[address].dislikes = filt(ratings, address, index, "dislikes")
    } else {
      ratings[address].dislikes.push(index)
    }

    ratings[address].likes = filt(ratings, address, index, "likes")
  }

  fs.writeFile('./info/ratings.json', JSON.stringify(ratings, null, 2), (error) => {
    if (error)
      res.sendStatus(404);
  });

  res.sendStatus(200);
});

const nft_obj = {
  register: {
    minted: false,
    triggered: true
  },
  first_joke: {
    minted: false,
    triggered: false
  },
  rating_five: {
    minted: false,
    triggered: false
  },
};

app.get('/setnft', (req, res) => {

  const address = req.query.address;
  const name = req.query.name;
  const index = req.query.index;
  const value = req.query.value;

  let nfts = JSON.parse(fs.readFileSync('./info/nft.json', 'utf8'));

  if (!nfts[address])
    nfts[address] = nft_obj;

  nfts[address][name][index] = JSON.parse(value);

  fs.writeFile('./info/nft.json', JSON.stringify(nfts, null, 2), (error) => {
    if (error)
      res.sendStatus(404);
  });

  res.sendStatus(200);
});

app.get('/getnft', (req, res) => {

  const address = req.query.address;

  let nfts = JSON.parse(fs.readFileSync('./info/nft.json', 'utf8'));

  if (!nfts[address]) {
    nfts[address] = nft_obj;

    fs.writeFile('./info/nft.json', JSON.stringify(nfts, null, 2), (error) => {
      if (error)
        res.sendStatus(404);
    });
  }

  res.status(200).send(nfts[address]);
});