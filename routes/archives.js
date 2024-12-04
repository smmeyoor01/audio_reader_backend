const express = require('express');
const router = express.Router()
const sql = require('../db');

router.get('/archive', async(req,res) =>{
    try {let query = 'SELECT * FROM subscription_data WHERE';
        input_values = [];
        const{pub_name, cost_start, cost_end, sub_start, sub_end, exp_start, exp_end} = req.query;
        if(Object.keys(req.params).length === 0){
            const all_subs = await sql.query("SELECT * from subscription_data where archived = $1", [false]);
            res.json(all_subs.rows);
        }
        else{
            if(pub_name){
                if(input_values.length != 0) {
                    query += ' AND';
                }
            query += (' publication_name = $', (input_values.length + 1));
            input_values.push(pub_name);
            }
            if (cost_start && cost_end){
                if(input_values.length != 0){
                    query += ' AND';
                }
            query += (' cost BETWEEN $' + (input_values.length + 1) + ' AND $' + (input_values.length + 2));
            input_values.push(parseInt(cost_start), parseInt(cost_end));
            }
            if (exp_start && exp_end){
                if(input_values.length != 0){
                    query += ' AND';
                }
            query += (' expiration_date BETWEEN $' + (input_values.length + 1) +   ' AND $' + (input_values.length + 2));
            input_values.push(exp_start, exp_end);
            }
            if (sub_start && sub_end){
                if(input_values.length != 0){
                    query += ' AND';
                }
            query += (' subscription_date BETWEEN ' + (cost_start + ' AND $' + (input_values.length + 2)));
            input_values.push(sub_start, sub_end);
            }
            query += ' AND archived = $' + (input_values.length + 1);
            input_values.push(true);
            const found_subscriptions = await sql.query(query, input_values);
            res.json(found_subscriptions.rows);
        }
    }
        
    catch(err){console.log(err.message);}
});

module.exports = router;