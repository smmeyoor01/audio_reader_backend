const express = require("express");
const router = express.Router();
const sql = require("../db");

router.post("/subscriptions", async (req, res) => {
  try {
    const vals = req.body;
    const new_subscription = await sql.query(
      "INSERT INTO subscription_data (date_bought, cost, receipt_info, expiration_date, publication_name, archived) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        vals.date_bought,
        vals.cost,
        vals.receipt_info,
        vals.expiration_date,
        vals.publication_name,
        false,
      ],
    );
    const sub_query = await sql.query(
      "SELECT MAX(subscription_id) from subscription_data",
    );
    let sub_id = sub_query.rows[0].max;
    const updated_account = await sql.query(
      "INSERT INTO account_data(account_number, username, password_hash, subscription_id) VALUES ($1, $2, $3, $4)",
      [vals.account_number, vals.username, vals.password_hash, sub_id],
    );
    const updated_publication = await sql.query(
      "INSERT INTO publication_data(subscription_id, website_login, program) VALUES ($1, $2, $3)",
      [sub_id, vals.website_login, vals.program],
    );
    //add payment date table
    console.log("Subscription added successfully");
    res.json({ success: true, message: "Subscription added successfully" });
  } catch (err) {
    console.log(err.message);
  }
});

router.delete("/subscriptions/:id", async (req, res) => {
  const client = await sql.connect();
  try {
    const { id } = req.params;

    // Check if there are any dependent records in publication_data
    const publicationRecords = await client.query(
      "SELECT * FROM publication_data WHERE subscription_id = $1",
      [id],
    );

    if (publicationRecords.rows.length > 0) {
      // If there are dependent records, delete them first
      await client.query(
        "DELETE FROM publication_data WHERE subscription_id = $1",
        [id],
      );
    }

    // Check if there are any dependent records in publication_data
    const accountRecords = await client.query(
      "SELECT * FROM account_data WHERE subscription_id = $1",
      [id],
    );

    if (accountRecords.rows.length > 0) {
      // If there are dependent records, delete them first
      await client.query(
        "DELETE FROM account_data WHERE subscription_id = $1",
        [id],
      );
    }

    // Now delete the subscription_data
    const deleteResult = await client.query(
      "DELETE FROM subscription_data WHERE subscription_id = $1",
      [id],
    );

    if (deleteResult.rowCount > 0) {
      res.json({ success: true, message: "Subscription deleted successfully" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }
  } catch (err) {
    console.error("Error deleting subscription:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete subscription" });
  } finally {
    client.release();
  }
});

router.patch("/subscriptions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedSubscription = await sql.query(
      "UPDATE subscription_data SET archived = true WHERE subscription_id = $1",
      [id],
    );

    if (updatedSubscription.rowCount === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({
      success: true,
      message: "Subscription archived successfully",
    });
  } catch (err) {
    console.error("Error updating subscription:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.put("/subscriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const vals = req.body;
    if ("archive" in vals) {
      const updated_subscription = await sql.query(
        "UPDATE subscription_data SET archived = $1 WHERE subscription_id = $2",
        [vals.archive, id],
      );
      res.json({
        success: true,
        message: "Subscription was archived successfully",
      });
    } else {
      const updated_subscription = await sql.query(
        "UPDATE subscription_data SET date_bought = $1, cost = $2, receipt_info = $3, expiration_date = $4, publication_name = $5, archived = $7 WHERE subscription_id = $6",
        [
          vals.date_bought,
          vals.cost,
          vals.receipt_info,
          req.body.expiration_date,
          vals.publication_name,
          id,
          false,
        ],
      );
      res.json({
        success: true,
        message: "Subscription was updated successfully",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/subscriptions", async (req, res) => {
  try {
    let query = "SELECT * FROM subscription_data WHERE";
    input_values = [];
    const {
      pub_name,
      cost_start,
      cost_end,
      sub_start,
      sub_end,
      exp_start,
      exp_end,
    } = req.query;
    if (Object.keys(req.params).length === 0) {
      const all_subs = await sql.query("SELECT * from subscription_data ");
      res.json(all_subs.rows);
    } else {
      if (pub_name) {
        if (input_values.length != 0) {
          query += " AND";
        }
        query += (" publication_name = $", input_values.length + 1);
        input_values.push(pub_name);
      }
      if (cost_start && cost_end) {
        if (input_values.length != 0) {
          query += " AND";
        }
        query +=
          " cost BETWEEN $" +
          (input_values.length + 1) +
          " AND $" +
          (input_values.length + 2);
        input_values.push(parseInt(cost_start), parseInt(cost_end));
      }
      if (exp_start && exp_end) {
        if (input_values.length != 0) {
          query += " AND";
        }
        query +=
          " expiration_date BETWEEN $" +
          (input_values.length + 1) +
          " AND $" +
          (input_values.length + 2);
        input_values.push(exp_start, exp_end);
      }
      if (sub_start && sub_end) {
        if (input_values.length != 0) {
          query += " AND";
        }
        query +=
          " subscription_date BETWEEN " +
          (cost_start + " AND $" + (input_values.length + 2));
        input_values.push(sub_start, sub_end);
      }
      query += " AND archived = $" + (input_values.length + 1);
      input_values.push(false);
      const found_subscriptions = await sql.query(query, input_values);
      res.json(found_subscriptions.rows);
    }
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
