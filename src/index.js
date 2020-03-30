require('dotenv').config()
const express = require('express');
const mysql = require('mysql');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

const db = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DB
})

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL is connected!')
    db.query("SET SESSION wait_timeout = 604800");
})

const app = express();
const port = 80;

app.get('/', (req, res) => {
    let sql = 'SELECT question,answer FROM crossWords';
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
        readline.question(`Ваш вопрос: `, (userQ) => {
            let QnA = new Object();
            let numOfQ = new Array();
            let arrOfA = new Array();
            userQ = userQ.split(' ');
            userQLength = userQ.length
            for (let i=0; i<result.length; i++) {
            let Q = result[i].question.split(' ');
            let A = result[i].answer;
            if (QnA.hasOwnProperty(A)) {
                for (let k=0, j=QnA[A].length; k<Q.length; k++, j++) {
                    QnA[A][j] = Q[k]
                    for (let i=0; i<userQ.length; i++) {
                        if (Q[k] == userQ[i]) {
                            if (A == arrOfA[arrOfA.length - 1]) {
                                numOfQ[numOfQ.length - 1]++
                            }
                            else {
                                arrOfA.push(A)
                                numOfQ.push(1)
                            }
                        }
                    }
                }
            }
            else {
                QnA[A] = Q
                for (let k=0, j=QnA[A].length; k<Q.length; k++, j++) {
                    for (let i=0; i<userQ.length; i++) {
                        if (Q[k] == userQ[i]) {
                            if (A == arrOfA[arrOfA.length - 1]) {
                                numOfQ[numOfQ.length - 1]++
                            }
                            else {
                                arrOfA.push(A)
                                numOfQ.push(1)
                            }
                        }
                    }
                }
            }
        }
            let orey = Object.values(numOfQ);
            let max = Math.max(...orey);
            let relevance = `${(max / userQLength) * 100}%`;
            let answerIndex = Object.values(orey).indexOf(max)
            console.log(`Ответ: ${Object.values(arrOfA)[answerIndex]}`)
            console.log(`Релевантность: ${relevance}`)
            readline.close()
          })
    })
})

app.listen(port, () => {
    console.log(`...Server started on port ${port}...`)
})