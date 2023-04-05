const { all } = require('axios');
var express = require('express');
var router = express.Router();
const fs = require('fs')
const expressSession = require('express-session')
const { ObjectId } = require('mongodb');
const mongoose = require("mongoose");
const multer = require("multer");
const {
  GridFsStorage
} = require("multer-gridfs-storage");
const crypto = require('crypto')
const path = require('path')

var GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();


const users = require('./users');
var userModel = require('./users')
let imageModel = require('./image')
let boardModel = require('./board')

const passport = require('passport');


const localStrategy = require('passport-local');
const { findByIdAndDelete, findOneAndDelete } = require('./users');

passport.use(new localStrategy(userModel.authenticate()));

const mongouri = process.env['MONGO_URI']

try {
  mongoose.connect(mongouri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
} catch (error) {
  handleError(error);
}
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});



//creating bucket
let bucket;
mongoose.connection.on("connected", () => {
  let db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "uploads"
  });
  // console.log(bucket);
});


const storage = new GridFsStorage({
  url: mongouri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {

      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
            username: req.session.passport.user,
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
    cb(null, true)

  }
  else {
    cb(new Error("invalid file type"))
  }
}

const upload = multer({
  storage, fileFilter
});



/* GET home page. */

router.get('/', isLoggedIn, async function (req, res) {
  let user = await userModel.findOne(req.user ).populate('images')
  let image = await imageModel.find();
  let boards =await boardModel.find({username:user.username});
  const cursor = bucket.find({});
  const files = await cursor.toArray();
  res.render('index', { files, user, image, boards })
  

})

// profile

router.get('/profile', isLoggedIn, async function (req, res, next) {
  let user = await userModel.findOne(req.user).populate('boards')
  let image = await imageModel.find();
  const cursor = bucket.find({});
  const files = await cursor.toArray();


  res.render('profile', { files, user,image })


});


// comments

router.get('/comment/:imageid', isLoggedIn, async function (req, res, next) {
  let imageid = new ObjectId(req.params.imageid)
  let user = await userModel.findOne(req.user)

  let image = await imageModel.findById({ _id: imageid })
  let date = new Date();

  image.comments.unshift({ comment: req.query.comment, author: user.username, date: `${date.getMonth() + 1}/${date.getFullYear()}  ${date.getHours()}:${date.getMinutes()} ` })

  image.save();

  res.redirect('back')


});

router.get('/delete/comment/:imageid/:comment', isLoggedIn, async function (req, res, next) {
  let imageid = new ObjectId(req.params.imageid);
  let index = req.params.comment;
  let user = await userModel.findOne({ username: req.session.passport.user })

  let image = await imageModel.findById({ _id: imageid })

  image.comments.splice(index, 1)

  image.save();


  res.redirect('back')


});



// boards

router.get('/board/:boardid', isLoggedIn, async function (req, res, next) {
  let boardid = new ObjectId(req.params.boardid)
  let user = await userModel.findOne(req.user).populate('boards')
  let image = await imageModel.find();

  let board = await boardModel.findById(boardid)

  const cursor = bucket.find({});
  const files = await cursor.toArray();

  res.render('boards', { user, board, files ,image });
});


router.post('/create/board', async function (req, res) {
  let user = await userModel.findOne(req.user)

  let data = {
    name: req.body.name,
    username: user.username,
    userid: user.userid,
  }

  let board = await boardModel.create(data);
  user.boards.push(board._id);
  user.save();

  res.redirect('back')
})


// save to board


router.get("/save/:fileid/board/:boardid", isLoggedIn, async (req, res) => {

  let fileid = new ObjectId(req.params.fileid)
  let boardid = new ObjectId(req.params.boardid)

  let board = await boardModel.findById(boardid)
  const cursor = bucket.find({ _id: fileid });
  const files = await cursor.toArray();


  if (board.images.indexOf(files[0].filename) === -1) {
    board.images.push(files[0].filename)

  } else {
    board.images.splice(board.images.indexOf(files[0].filename), 1);
  }

  if (board.files.indexOf(files[0]._id) === -1) {
    board.files.push(files[0]._id)

  } else {
    board.files.splice(board.files.indexOf(files[0]._id), 1);

  }

  board.save()

  res.redirect('back')
});


// remove from board

router.get("/remove/:fileid/board/:boardid", isLoggedIn, async (req, res) => {

  let fileid = new ObjectId(req.params.fileid)
  let boardid = new ObjectId(req.params.boardid)

  let board = await boardModel.findById(boardid)
  const cursor = bucket.find({ _id: fileid });
  const files = await cursor.toArray();


  if (board.images.indexOf(files[0].filename) === -1) {
    board.images.push(files[0].filename)

  } else {
    board.images.splice(board.images.indexOf(files[0].filename), 1);
  }

  if (board.files.indexOf(files[0]._id) === -1) {
    board.files.push(files[0]._id)

  } else {
    board.files.splice(board.files.indexOf(files[0]._id), 1);

  }

  board.save()

  res.redirect('back')
});

// delete board 

router.get('/delete/board/:boardid', isLoggedIn, async function (req, res, next) {
  let boardid = new ObjectId(req.params.boardid);

  let user = await userModel.findOne(req.user)

  let board = await boardModel.findOne({ _id: boardid })

  if (user.boards?.indexOf(boardid) !== -1) {
    user.boards.splice(user.boards.indexOf(boardid), 1);
  };

  user.save();
  await boardModel.findOneAndDelete({ _id: boardid })

  res.redirect('/profile');
});

//  search in board
router.get('/search/board/:query', isLoggedIn, async function (req, res) {
  let user = await userModel.findOne(req.user)

  let resultBoard = await boardModel.find({ name: { $regex: req.params.query, $options: 'i' } })
  
  
  res.send({ resultBoard})
  

})

// pins

router.post("/createpin", isLoggedIn, upload.single("file"), async (req, res) => {
  let userData = await userModel.findOne(req.user);
  let data = {
    username: userData.username,
    fileid: req.file.id,
    userid: userData._id,
    desc: req.body.desc,
    link: req.body.link,
    title: req.body.title,
  }

  let image = await imageModel.create(data)
  userData.images.push(image._id)
  userData.files.push(image.fileid)

  userData.save();

  res.redirect('back')
});

router.get('/pin/:fileid', isLoggedIn, async function (req, res, next) {
  let fileid = new ObjectId(req.params.fileid);

  let user = await userModel.findOne(req.user).populate('boards')

  let imageData = await imageModel.findOne({ fileid })

  const cursor = bucket.find({ _id: fileid });
  const files = await cursor.toArray();


  res.render('pin', { user, imageData, files });
});



router.get('/delete/pin/:fileid', isLoggedIn, async function (req, res, next) {
  let fileid = new ObjectId(req.params.fileid);

  let user = await userModel.findOne(req.user)

  let image = await imageModel.find({ fileid: fileid })

  let board = await boardModel.findOne({ username: user.username })

  const cursor = bucket.find({ _id: fileid });
  const files = await cursor.toArray();

  if (user.files.indexOf(fileid)!==-1) {
 

  if (user.files?.indexOf(files[0]._id) !== -1) {
    user.files.splice(user.files.indexOf(files[0]._id), 1);

  }

  if (user.saved?.indexOf(files[0]._id) !== -1) {
    user.saved.splice(user.saved.indexOf(files[0]._id), 1);

  }

  if (user.images?.indexOf(image._id) !== -1) {
    user.images.splice(user.images.indexOf(image._id), 1);
    user.save();

  }

  if (board) {
    if (board.images?.indexOf(files[0].filename) !== -1) {
      board.images.splice(board.images.indexOf(files[0].filename), 1);
    }

    if (board.files?.indexOf(files[0]._id) !== -1) {
      board.files.splice(board.files.indexOf(files[0]._id), 1);
    }
  }



  let deleteImage = await imageModel.findOneAndDelete({ fileid: fileid })

  user.save();

  if (board) {

    board.save();
  }


  bucket.delete(new ObjectId(req.params.fileid));
  res.redirect('/');

}

  else {
  res.redirect('back')
}
});




router.get("/image/:filename", isLoggedIn, (req, res) => {
  const file = bucket
    .find({
      filename: req.params.filename
    })
  bucket.openDownloadStreamByName(req.params.filename)
    .pipe(res);

});


router.get('/save/pin/:id', isLoggedIn, async function (req, res) {

  let user = await userModel.findOne(req.user)

  if (user.saved.indexOf(req.params.id) === -1) {
    user.saved.push(req.params.id);
  } else {
    user.saved.splice(user.saved.indexOf(req.params.id), 1);
  }
  
  const cursor = bucket.find({});
  const files = await cursor.toArray();
  await user.save()

  res.send({user,files})
});

router.get('/saves/pin/:id', isLoggedIn, async function (req, res) {

  let user = await userModel.findOne(req.user)

  if (user.saved.indexOf(req.params.id) === -1) {
    user.saved.push(req.params.id);
  } else {
    user.saved.splice(user.saved.indexOf(req.params.id), 1);
  }
  await user.save()

  const cursor = bucket.find({});
  const files = await cursor.toArray();

  res.redirect('back')
});




//  user action accoount creation and log out

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/signup', function (req, res, next) {
  res.render('signup');
});


router.post('/register', function (req, res) {
  var newUser = new users({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
  })
  userModel.register(newUser, req.body.password).then(function () {
    passport.authenticate('local')(req, res, function () {
      res.redirect('/')
    })
  })
});


router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), function (req, res, next) { });



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login');
  }
}

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});


// user dp change

const dpStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/dp')
  },
  filename: function (req, file, cb) {
    var filename = Date.now() + Math.floor(Math.random() * 100000) + file.originalname;
    cb(null, filename)
  }
})

const dpupload = multer({ storage: dpStorage })

router.post('/change/userdp/:userid', dpupload.single('dp'), isLoggedIn, async function (req, res, next) {
  let user = await userModel.findOne({ username: req.session.passport.user })

  user.dp = req.file.filename;
  user.save();

  res.redirect('back')

});

// search feature

router.get('/search/result', isLoggedIn, async function (req, res) {
  let user = await userModel.findOne(req.user).populate('images')

  let image = await imageModel.find({ title: { $regex: req.query.searched, $options: 'i' } })

  let fileIds = []
  if (image) {
    image.forEach(async function (e) {

      fileIds.push(e.fileid)
    })
  }

  let files = [];
  for (let i = 0; i < fileIds.length; i++) {
    
    const cursor = bucket.find({ _id: new ObjectId(fileIds[i]) });
    const file = await cursor.toArray();
    files.push(file)
  }

  res.render('searchresult', { user , files, image })

})



passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['email', 'profile']
},async function verify(issuer, profile, cb) {
  // console.log(profile);
  let user = await userModel.findOne({ email: profile.emails[0].value })
  
    if (user) {

      return cb(null, user);

    }
    let newUser = new userModel();
    newUser.name = profile.displayName;
  newUser.email = profile.emails[0].value;
  newUser.username = profile.emails[0].value.split('@')[0];
    let result = await newUser.save()


    return cb(null, result);



}));

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/failed'
}));



module.exports = router;


