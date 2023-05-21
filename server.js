const express = require('express')
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const path = require('path')
const app = express();
const UserDetails = require('./userDetails');
const AdminDetails = require('./admindetail');
const PORT = 9918;
// app.set('view-engine', 'ejs')
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect("mongodb://0.0.0.0:27017/ProjectDB");

// STUDENT LOGIN Model
// const LogInSchema = new mongoose.Schema({
//     erp: {
//         type: String,
//         require: true
//     },
//     password: {
//         type: String,
//         require: true
//     }
// })
// const collection = new mongoose.model("Student", LogInSchema)

//Admin side


// COMPLAINT DATABASE MODEL

const nameSchema = new mongoose.Schema({
    erp: String,
    comptype: String,
    compstatus: String,
    message: String,
});



const complaint = mongoose.model('complaint', nameSchema);
//PASSPORT RELATED
app.use(
    session({
        secret: "hello",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use('user-local', UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

passport.use('admin-local', AdminDetails.createStrategy());
passport.serializeUser(AdminDetails.serializeUser());
passport.deserializeUser(AdminDetails.deserializeUser());




//ROUTES

app.get('/', (req, res) => {
    res.status(200);
    // console.log(__dirname);
    res.sendFile(path.join(__dirname, '/pages/homepage.html'));
})
app.get('/about', (req, res) => {
    res.status(200);
    // console.log(__dirname);
    res.sendFile(path.join(__dirname, '/pages/aboutpage.html'));
})
app.get('/adminlogin', (req, res) => {
    res.status(200);
    // console.log(__dirname);
    res.sendFile(path.join(__dirname, '/pages/adminlogin.html'));
})

app.post(
    '/adminlogin',
    passport.authenticate('admin-local', {

        failureRedirect: '/adminlogin ',
        // successRedirect: '/studentdash',
        // successFlash:true
        // failWithError:true
        failureFlash: false
    }),
    async function (req, res) {
        // console.log(req.body);
        const show = await complaint.find();
        const resolvcnt = await complaint.find({ compstatus: 'resolved' })
        const unresolvcnt = await complaint.find({ compstatus: 'unresolved' })


        res.render('admindash', {
            erp: req.body.username,
            count: show.length,
            resolvcnt: resolvcnt.length,
            unresolvcnt: unresolvcnt.length

        });
    }
);

app.get('/contact', (req, res) => {
    res.status(200);
    // console.log(__dirname);
    res.sendFile(path.join(__dirname, '/pages/contact.html'));
})
app.get('/studentdash/:id', isLoggedIn,(req, res) => {
    // console.log(req.isAuthenticated())
    // console.log(req.body)
    res.render('studentdash', {
        erp: req.params.id
    })
    // res.sendFile(path.join(__dirname, '/pages/studentdash.html'));
}
);
app.get('/form/:id', (req, res) => {
    res.render('formpage', {
        erp: req.params.id
    })
});


app.post('/form', (req, res) => {
    // console.log(req.body);
    let comp = new complaint(req.body);
    comp.save().then(item => {
        // res.send("item saved to database");
        // res.sendFile(path.join(__dirname, '/submitmsg.html'));
        res.render('studentdash', {
            erp: req.body.erp
        })
    }).catch(err => {
        console.log(err);
        res.status(400).send("unable to save to register complaint");
    });

})

app.get('/status/:id', async (req, res) => {
    const show = await complaint.find({ erp: req.params.id });
    res.render('student_table', {
        users: show,
        erp: req.params.id
    });

    // res.render('formpage',{
    //     erp:req.params.id
    // })
});
app.get('/admindash', async (req, res) => {
    const show = await complaint.find();
    const resolvcnt = await complaint.find({ compstatus: 'resolved' })
    const unresolvcnt = await complaint.find({ compstatus: 'unresolved' })


    res.render('admindash', {
        erp: 'admin',
        count: show.length,
        resolvcnt: resolvcnt.length,
        unresolvcnt: unresolvcnt.length

    });
});
app.get('/admintable', async (req, res) => {
    const show = await complaint.find({});

    res.render('admin_table', {
        users: show,
        erp: 'admin'
    });
});

app.get('/register', (req, res) => {
    res.status(200);
    // console.log(__dirname);
    res.sendFile(path.join(__dirname, '/pages/register.html'));
})

app.post("/register", async (req, res) => {
    
    const check_data = req.body;
    if (check_data.confirmpassword == check_data.password) {
       
        UserDetails.register({ username: req.body.username, active: false }, req.body.password);
        res.redirect('/')

        }
    
    else {
        res.send("Password Do not Match Try again ");
    }

}
);


app.get('/logout', (req, res) => {
    req.logOut(() => {
        res.clearCookie('connect.sid');
        res.status(205).redirect('/');
    });

});




app.post(
    '/',
    passport.authenticate('user-local', {

        failureRedirect: '/',
        // successRedirect: '/studentdash',
        // successFlash:true
        // failWithError:true
        failureFlash: false
    }),
    function (req, res) {
        console.log(req.body)
        res.render('studentdash', {
            erp: req.body.username
        });
    }
);

app.post("/complaint", async (req, res) => {
    const objid = req.body._id;
    // console.log(objid);

    const filter = { _id: objid };

    const temp = await complaint.findOne({ _id: objid });
    // console.log(temp);
    function myFunction(temp) {
        if (temp.compstatus === 'unresolved') {
            let update = { compstatus: 'resolved' };
            return update;
        }
        else if (temp.compstatus === "resolved") {
            let update = { compstatus: 'unresolved' };
            return update;
        }
        else { }
    }
    const update = myFunction(temp);
    //   console.log(update);

    const doc = await complaint.findOneAndUpdate(filter, update, {});
    const show = await complaint.find();
    res.status(205).render('admin_table', {
        users: show,
        erp:'admin'

    });

})
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}



// AdminDetails.register({ username: 'admin', active: false }, '123');



app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running,and App is listening on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);

}
);