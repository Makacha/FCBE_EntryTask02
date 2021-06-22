import Express from 'express';
import Knex from 'knex';
import Bcrypt from 'bcryptjs';
import * as utils from './utils';
import fs from 'fs';
import BodyParser from 'body-parser';
const app = Express();
const port = 8888;
const salt = Bcrypt.genSaltSync(9)
const urlencodedParser = BodyParser.urlencoded({ extended: false });

const knex = Knex({
    client: 'sqlite3',
    connection: {
        filename: "db.sqlite3"
    },
    useNullAsDefault: true
});

knex.schema.hasTable('users').then((exists) => {
    if (!exists) {
        knex.schema.createTable('users', (table) => {
            table.increments('id').notNullable();
            table.string('username').notNullable();
            table.string('displayed_name');
            table.string('password').notNullable();
        }).then((err) => {
            console.log(err)
        });
    }
});

app.get('/', (req: Express.Request, res: Express.Response) => {
    const home_page = fs.readFileSync('./src/home_page.html', 'utf8');
    res.send(home_page);
});

app.get('/timestamp', (req: Express.Request, res: Express.Response) => {
    res.json({ timestamp: utils.getCurrentTimestamp() });
});

app.post('/registrations', urlencodedParser, (req: Express.Request, res: Express.Response) => {
    var new_user = {
        username: req.body.username,
        displayed_name: req.body.displayed_name,
        password: Bcrypt.hashSync(req.body.password, salt)
    };
    knex('users').insert(new_user).then(() => {
        console.log(`Insert successfull user: ${new_user.username}`);
    });
    res.json({ error: 0 });
});
app.get('/registrations', (req: Express.Request, res: Express.Response) => {
    knex.select('username', 'displayed_name', 'password').from('users').then((rows) => {
        res.json({
            error: 0,
            data: rows
        });
    })
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});