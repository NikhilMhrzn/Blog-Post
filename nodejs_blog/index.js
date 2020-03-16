const express = require('express');
const path = require('path');
const app = express();
const { config, engine } = require('express-edge');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const bcrypt = require('bcrypt');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require('connect-flash');
const edge = require('edge.js');
//For message and validation
/**
 * const expressValidator = require('express-validator');

const flash = require('connect-flash');

 */

const Post = require('./database/models/Post');
const Contact = require('./database/models/Contact');
const Register = require('./database/models/Register');
app.use(express.static('public'));

mongoose.connect(
  'mongodb://localhost/node-js-blog',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('DB connected..')
);

//For flash messaging
app.use(connectFlash());

//For storing session in db
const mongoStore = connectMongo(expressSession);

//Express Session middleware
app.use(
  expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

app.use('*', (req, res, next) => {
  edge.global('auth', req.session.userId);
  next();
});
app.use(fileupload());
app.use(express.json());
app.use(express.urlencoded());
app.use(engine);
app.set('views', `${__dirname}/views`);

/**
 * \


//Express message middleware
app.use(require('connect-flash'));
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator middleware

 */

//Middleware for authentication
//If user is logged in then only they can add new post
function auth(req, res, next) {
  Register.findById(req.session.userId, (error, user) => {
    if (error || !user) {
      return res.redirect('/login');
    }
    next();
  });
}

//Middleware for not letting logged in users into log in and register
function redirectIfAuthentcated(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
}

app.get('/', async (req, res) => {
  const posts = await Post.find({}).populate('author');
  console.log(posts);
  res.render('index', {
    posts: posts
  });
});

app.get('/posts/new', auth, (req, res) => {
  //Session store vayexa ve matra post garna dinxa
  if (req.session.userId) {
    return res.render('create');
  }
  res.redirect('/login');
});

app.post('/posts/store', (req, res) => {
  //console.log(req.files);
  const { image } = req.files;

  image.mv(path.resolve(__dirname, 'public/posts', image.name), error => {
    Post.create(
      {
        ...req.body,
        image: `/posts/${image.name}`,
        author: req.session.userId
      },
      (error, post) => {
        res.redirect('/');
      }
    );
  });
});

app.get('/post/:id', auth, async (req, res) => {
  console.log(req.params.id);
  const post = await (await Post.findById(req.params.id)).populate('author');
  res.render('post', {
    post
  });
});

app.get('/login', redirectIfAuthentcated, (req, res) => {
  res.render('login');
});
app.post('/login', redirectIfAuthentcated, (req, res) => {
  Register.findOne({ email: req.body.email }, (error, user) => {
    if (user) {
      bcrypt.compare(req.body.password, user.password, (error, isSame) => {
        if (isSame) {
          req.session.userId = user._id;
          console.log('inside login');
          console.log(req.session);
          res.redirect('/');
        } else {
          return res.redirect('/login');
        }
      });
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/register', redirectIfAuthentcated, (req, res) => {
  console.log(req.session.registrationError);
  res.render('register', {
    errors: req.flash('registrationError'),
    data: req.flash('data')[0]
  });
});

app.post('/register', redirectIfAuthentcated, async (req, res) => {
  req.body.password = await bcrypt.hash(req.body.password, 10);

  Register.create(req.body, (error, user) => {
    if (error) {
      const registrationError = Object.keys(error.errors).map(
        key => error.errors[key].message
      );
      //req.session.registrationError = registrationError;
      req.flash('registrationError', registrationError);
      //To bind the register field data
      req.flash('data', req.body);
      res.redirect('/register');
    } else {
      res.redirect('/login');
    }
  });
});

//for loading edit
app.get('/edit/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit', {
    post
  });
  //console.log(post);
});

//For posting the edited form
app.post('/edit/:id', (req, res) => {
  /**
   * const { image } = req.files;

  image.mv(path.resolve(__dirname, 'public/posts', image.name), error => {
    Post.update(
      {
        ...req.body,
        image: `/posts/${image.name}`
      },
      (error, post) => {
        res.redirect('/');
      }
    );
  });
   */

  let post = {};
  post.username = req.body.username;
  post.title = req.body.title;
  post.description = req.body.description;
  post.content = req.body.content;
  console.log(req.body.username, req.body.title);
  let query = { _id: req.params.id };

  Post.updateOne(query, post, err => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
});
//This is used for deletion
app.get('/delete/:id', (req, res) => {
  /**
 * let query = { _id: req.params.id };
  Post.remove(query, err => {
    if (err) {
      console.log(err);
    }
    res.send('Success');
  });
 */
  let id = req.params.id;
  Post.remove({ _id: id }, err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

//For contact
app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  console.log(req.body);
  y;

  console.log('Inside contact');
  Contact.create(req.body, (error, post) => {
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});
app.listen(4000, () => {
  console.log('App listening on port 4000!');
});
