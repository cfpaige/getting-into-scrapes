const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios")
const db = require("../models")

router.get("/scrape", function (req, res) {
    axios.get("https://www.theguardian.com/us")
        .then(function (response) {
            const html = response.data;
            const $ = cheerio.load(html);
            $(".fc-item__container").each(function (i, elem) {
                var result = {};

                result.title = $(this).find("a").last().text();
                result.link = $(this).find("a").attr("href");

                //Searching by link because news sites often revise article titles, but keep the location:
                db.Article.find({ link: result.link }, function (err, dbArticle) {
                    if (dbArticle.length === 0) {
                        db.Article.create(result)
                            .then(dbArticle => console.log(dbArticle))
                            .catch(err => console.log(err))
                    };
                })
            });
            //Why won't it redirect or only loads one article?
            res.send("Scrape worked!")
        })
});

router.get("/", function (req, res) {
    db.Article.find({}, null, { sort: { created: -1 } }, function (err, data) {
        if (data.length === 0) {
            res.render("placeholder", { message: "There's nothing here yet. Click the Scrape button to get some news, then click Home to view." })
        } else {
            res.render("index", { articles: data });
        }
    })
});

router.get("/saved", (req, res) => {
    db.Article.find({isSaved: true})
        .then(function (data) {
            // If we were able to successfully find Articles, send them back to the client
            let hbsObject;
            hbsObject = {
                articles: data
            };
            res.render("saved", hbsObject);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

router.put("/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: true })
        .then(function (data) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(data);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });;
});

router.put("/remove/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: false })
        .then(function (data) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(data)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.find({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate({
            path: 'note',
            model: 'Note'
        })
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/note/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { note: dbNote._id }}, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

router.delete("/note/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.findOneAndRemove({ _id: req.params.id })
        .then(function (dbNote) {

            return db.Article.findOneAndUpdate({ note: req.params.id }, { $pullAll: [{ note: req.params.id }]});
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

module.exports = router;