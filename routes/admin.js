const keys = require("../config/nodeKeys");
const { spawn } = require('child_process');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require('path');
const bcrypt = require('bcrypt');

module.exports = (app, pool) => {

  /* Configure Passport, the login mechanism for the admin page */
  const initializePassport = require("../initializePassport");
  initializePassport(passport, pool);
  app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success")
    next();
  });

  /* Default handler for the admin page */
  app.get("/admin/dashboard", checkNotAuthenticated, async (req, res, next) => {
    try {

      const { action } = req.query;

      if (action === 'runetl') {
        /* The 'Import to Staging' button was clicked */
        console.log('here 1')
        /* Prepare to run the ETL script */
        await clearTables().catch(e => console.log(e));
        log('Job Start');

        /* Run the ETL script */
        const file = path.resolve('ETL/main.py');
        const python = spawn('python3', [file, keys.PG_CONNECTION_STRING]);
        console.log('here 2')
        python.on('spawn', (code) => {
          console.log('spawn: ' + code)
        })
        python.on('error', (err) => {
          console.log('error: ' + err)
        })
        python.on('exit', (code) => {
          console.log('exit code: ' + code)
        })
        python.stderr.on('data', (data) => {
          log(data.toString());
        })
        python.stdout.on('data', (data) => {
          log(data.toString());
        })
      }
      else if (action === 'runprod') {
        /* The 'Import to Production' button was clicked */
        const status = await importToProduction();
      }
      else {
        res.render('admin.ejs');
      }

    } catch (e) {
      return next(e);
    }
  });

  /* API method to pull ETL status from the public.etl_run_log table */
  app.get("/admin/dashboard/etlstatus", async (req, res, next) => {
    try {

      let log = null;

      await pool.query('select * from etl_run_log order by time_stamp asc;', async (err, result) => {
        if (err) {
          console.log(err)
          return;
        }
        log = result.rows;
        res.json(log);
      });

    } catch (e) {
      return next(e);
    }
  });

  /* Login */
  app.get("/admin/login", checkAuthenticated, (req, res) => {
    res.render("login.ejs", { message: null });
  });

  /* Register new user (NOTE: this is an admin privilege only, and is intentionally *not* outward facing) */
  app.get('/admin/register', checkNotAuthenticated, (req, res) => {
    res.render('registerUser.ejs');
  });

  app.post('/admin/register', (req, res) => {
    const registerUser = async () => {
      try {
        const { name, role, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO production_user (name, role, email, password) VALUES ($1, $2, $3, $4)', [name, role, email, hashedPassword]
        );
        console.log(`You have succesfully registered user ${email}.`);
        res.render('admin');
      } catch (err) {
        console.log(err);
      }
    }
    registerUser();
  });

  /* Change password */
  /* TODO: add logic to make this work, so that if a user has a default password they are required to change it */
  app.get('/admin/settings', checkNotAuthenticated, (req, res) => {
    res.render('changePassword.ejs');
  });

  /* Logout */
  app.get("/admin/logout", (req, res) => {
    req.logout();
    res.render("login.ejs", { message: "You have logged out successfully" });
  });

  /* Handle input from the login form */
  app.post(
    "/admin/login",
    passport.authenticate("local", {
      successRedirect: "/admin/dashboard",
      failureRedirect: "/admin/login",
      failureFlash: true
    })
  );

  /* Passport middleware function to protect routes */
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/admin/dashboard");
    }
    next();
  }

  /* Passport middleware function to protect routes */
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/admin/login");
  }

  /* Clear all tables like public.etl_% */
  const clearTables = async () => {
    await pool.query('select etl_clear_tables();', async (err, result) => {
      if (err) {
        console.log(err)
      }
    });
  }

  /* Log a message to the database */
  const log = async message => {
    await pool.query(`select etl_log('${message}');`, async (err, result) => {
      if (err) {
        console.log(err)
      }
    });
  }

  /* Import staging data to production */
  const importToProduction = async message => {
    await pool.query(`select etl_import_to_production();`, async (err, result) => {
      if (err) {
        console.log(err)
      }
    });
  }

};

