import db from "$lib/db.js";

export async function get(event) {

 if (!event.locals.userData)
  return {
   status: 401,
   body: {
    error: "Unauthorized"
   }
  };

 let start    = event.url.searchParams.get("start") || 0,
     limit    = event.url.searchParams.get("limit") || 50,
     phrase   = event.url.searchParams.get("phrase") || null;

 try {

  let result = await new Promise((resolve, reject) => db.query(`SELECT * FROM snippets${phrase ? ` WHERE name LIKE ? OR content LIKE ?` : ""} LIMIT ${parseInt(start)}, ${parseInt(limit)}`, [`%${phrase}%`, `%${phrase}%`], (err, result) => err ? reject(err) : resolve(result)));

  return {
   status: 200,
   body: result
  };

 } catch (err) {

  return {
   status: 409,
   body: {
    error: err.message
   }
  };

 }

}

export async function del(event) {

 if (!event.locals.userData)
  return {
   status: 401,
   body: {
    error: "Unauthorized"
   }
  };

 let body = await event.request.json();

 try {

  await new Promise((resolve, reject) => db.query(`DELETE FROM snippets WHERE name = ?`, [body.name], (err, result) => err ? reject(err) : resolve(result)));

  return {
   status: 204
  };

 } catch (err) {

  return {
   status: 409,
   body: {
    error: err.message
   }
  };

 }

}

export async function patch(event) {

 if (!event.locals.userData)
  return {
   status: 401,
   body: {
    error: "Unauthorized"
   }
  };

 let body = await event.request.json();

 try {

  await new Promise((resolve, reject) => db.query(`UPDATE snippets SET content = ? WHERE name = ?`, [body.content, body.name], (err, result) => err ? reject(err) : resolve(result)));

  return {
   status: 204
  };

 } catch (err) {

  return {
   status: 409,
   body: {
    error: err.message
   }
  };

 }

}

export async function put(event) {

 if (!event.locals.userData)
  return {
   status: 401,
   body: {
    error: "Unauthorized"
   }
  };

 let body = await event.request.json();

 try {

  await new Promise((resolve, reject) => db.query(`INSERT INTO snippets (name, content) VALUES (?, ?)`, [body.name, (body.content || "Snippet")], (err, result) => err ? reject(err) : resolve(result)));

  return {
   status: 204
  };

 } catch (err) {

  return {
   status: 409,
   body: {
    error: err.message
   }
  };

 }

}