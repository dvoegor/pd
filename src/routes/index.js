const express = require('express');
const router = express.Router();
const pool = require('../pools/pool');

/* GET home page. */
router.get('/', function (req, res, next) {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const question = req.query.question ? req.query.question : '%';
    const answer = req.query.answer ? req.query.answer : '%';
    const func = req.query.func ? req.query.func : '%';
    const method = req.query.method ? req.query.method : '%';
    const subjectArea = req.query.subjectArea ? req.query.subjectArea : '%';
    let sortBy;
    const order = 'ORDER BY '
    switch (req.query.sortBy) {
        case 'question':
            sortBy = order + 'question';
            break;
        case 'answer':
            sortBy = order + 'answer';
            break;
        case 'func':
            sortBy = order + 'function';
            break;
        case 'method':
            sortBy = order + 'method';
            break;
        case 'subjectArea':
            sortBy = order + 'subjectArea';
            break;
        default:
            sortBy = '';
    }
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    pool.query(
            `SELECT DISTINCT method FROM crossWords ORDER BY method`,
        function (err, data) {
            if (err) {
                console.log(err);
            } else {
                const sortedMethods = data.map(item => ({
                    method: item.method,
                }))
                // console.log(sortedMethods)
                pool.query(
                        `SELECT DISTINCT subjectArea FROM crossWords ORDER BY subjectArea`,
                    function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            const sortedAreas = data.map(item => ({
                                subjectArea: item.subjectArea,
                            }))
                            // console.log(sortedAreas)
                            pool.query(
                                `SELECT id,question,answer,function,method,subjectArea FROM crossWords WHERE question LIKE '%${question}%' AND answer LIKE '%${answer}%' AND function LIKE '${func}' AND method LIKE '${method}' AND subjectArea LIKE '${subjectArea}' ${sortBy}`,
                                function (err, data) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        const sortedData = data.map(item => ({
                                            idItem: item.id,
                                            question: item.question,
                                            answer: item.answer,
                                            function: item.function,
                                            method: item.method,
                                            subjectArea: item.subjectArea
                                        }))
                                        const foundLines = sortedData.length;
                                        const resultUsers = sortedData.slice(startIndex, endIndex)
                                        pool.query(
                                                `SELECT COUNT(*) FROM crossWords`,
                                            function (err, data) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    const count = data[0]['COUNT(*)'];
                                                    const results = {};
                                                    if (endIndex < count) {
                                                        results.next = {
                                                            page: page + 1,
                                                            limit: limit
                                                        };

                                                    } else {
                                                        results.next = {
                                                            page: 0,
                                                            limit: limit
                                                        };
                                                    }
                                                    if (startIndex > 0) {
                                                        results.previous = {
                                                            page: page - 1,
                                                            limit: limit
                                                        }
                                                    } else {
                                                        results.previous = {
                                                            page: 0,
                                                            limit: limit
                                                        };
                                                    }
                                                    const pageArr = [];
                                                    for (let i = 0; i <= foundLines / 50; i++) {
                                                        pageArr.push(i + 1);
                                                    }
                                                    res.render('index', {
                                                        title: 'ИСКЭ',
                                                        sortedData: resultUsers,
                                                        size: count,
                                                        currentPage: page,
                                                        nextPage: results.next.page,
                                                        previousPage: results.previous.page,
                                                        length: foundLines,
                                                        pageArr: pageArr,
                                                        sortedAreas: sortedAreas,
                                                        sortedMethods: sortedMethods,
                                                        success: req.session.success
                                                    });
                                                }
                                            });
                                    }
                                });
                        }
                    })
            }
        })
});
router.post('/loginAuth', function (req, res, next) {
    res.redirect('/login')
})

router.post('/clear', function (req, res, next) {
    res.redirect('/')
})

router.get('/edit/:id', (req, res) => {
    if (!req.session.success) {
        res.status(200).redirect("/")
    } else {
        const id = req.params.id
        pool.query(`SELECT * FROM crossWords WHERE id=${id}`,
            function (err, results) {
                // console.log(results)
                if (err) {
                    res.status(500).send({message: 'Ошибка', status: 'error'})
                } else {
                    res.status(200).render("edit.hbs", {
                        row: results[0]
                    })
                }
            });
    }
})

router.post('/edit/:id', (req, res) => {
    if (!req.session.success) {
        res.status(200).redirect("/login")
    } else {
        console.log(req.body)
        pool.query(`UPDATE crossWords SET question='${req.body.question}', answer='${req.body.answer}', function='${req.body.function}', method='${req.body.method}', subjectArea='${req.body.subjectArea}' WHERE id=${req.body.id}`,
            function (err, results) {
                if (err) {
                    res.status(500).send({message: 'Ошибка добавления', status: 'error'})
                } else {
                    res.status(200).redirect("/")
                }
            });
    }
})

router.get('/create', (req, res) => {
    if (!req.session.success) {
        res.status(200).redirect("/")
    } else {
        res.status(200).render("create.hbs")
    }
})

router.post('/create', (req, res) => {
    if (!req.session.success) {
        res.status(200).redirect("/")
    } else {
        pool.query(`INSERT INTO crossWords (question,answer,function,method,subjectArea)
                VALUES (
                '${req.body.question}',
                '${req.body.answer}',
                '${req.body.function}',
                '${req.body.method}',
                '${req.body.subjectArea}')
                `,
            function (err, results) {
                if (err) {
                    res.status(500).send({message: 'Ошибка добавления', status: 'error'})
                } else {
                    res.status(200).redirect("/")
                }
            });
    }
})

router.get('/delete/:id', (req, res) => {
    if (!req.session.success) {
        res.status(200).redirect("/")
    } else {
        const id = req.params.id
        pool.query(`SELECT * FROM crossWords WHERE id=${id}`,
            function (err, results) {
                // console.log(results)
                if (err) {
                    res.status(500).send({message: 'Ошибка', status: 'error'})
                } else {
                    res.status(200).render("delete.hbs", {
                        row: results[0]
                    })
                }
            });
    }
})

router.post('/delete/:id', (req, res) => {
    if (!req.session.success) {
        res.status(200).redirect("/")
    } else {
        pool.query(`DELETE FROM crossWords WHERE id=${req.body.id}`,
            function (err, results) {
                if (err) {
                    res.status(500).send({message: 'Ошибка удаления', status: 'error'})
                } else {
                    res.status(200).redirect("/")
                }
            });
    }
})

module.exports = router;
