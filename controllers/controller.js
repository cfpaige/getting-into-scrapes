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
            res.send("Scraped!")
        })
});

router.get("/", function (req, res) {
    db.Article.find({}, null, { sort: { created: -1 } }, function (err, data) {
        if (data.length === 0) {
            res.render("placeholder", { message: "There's nothing here yet. Click the Scrape button to get the latest news." })
        } else {
            res.render("index", { articles: data });
        }
    })
});

router.get("/saved", (req, res) => {
    db.Article.find({ isSaved: true }, function (err, data) {
        if (data.length === 0) {
            res.render("placeholder", { message: "There's nothing here yet. Go back to Home View to save articles." })
        } else {
            res.render("saved", { articles: data });
        }
    });
});

router.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.put("/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: true })
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.json(err);
        });;
});

router.put("/remove/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: false })
        .then(function (data) {
            res.json(data)
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.get("/articles/:id", function (req, res) {
    db.Article.find({ _id: req.params.id })
        .populate({
            path: 'note',
            model: 'Note'
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.post("/note/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.delete("/note/:id", function (req, res) {
    db.Note.findOneAndRemove({ _id: req.params.id })
        .then(function (dbNote) {

            return db.Article.findOneAndUpdate({ note: req.params.id }, { $pullAll: [{ note: req.params.id }] });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

module.exports = router;