import config from "$lib/config.js";
import db from "$lib/db.js";

export async function get(event) {

 if (!event.locals.userData?.manager)
  return {
   status: 401,
   body: {
    error: "Unauthorized"
   }
  };

 let result = await new Promise((resolve, reject) => db.query(`SELECT * FROM authorized`, (err, result) => err ? reject(err) : resolve(result))).catch((err) => { console.log(err); return null });

 if (result) {

  return {
   status: 200,
   body: {
    managerIds: config.managerUserIds,
    userIds: [...new Set([...config.managerUserIds, ...result.filter(r => r.type === "user").map(r => r.id)])].filter(id => id),
    roleIds: [...new Set(result.filter(r => r.type === "role").map(r => r.id))]
   }
  };

 }

 return {
  status: 409,
  body: {
   message: "Database error"
  }
 };

}

export async function put(event) {

 if (!event.locals.userData?.manager)
  return {
   status: 401,
   body: {
    error: "Unauthorized"
   }
  };

 let bodyJSON = await event.request.json();

 if (!bodyJSON.id || !Number.isInteger(parseInt(bodyJSON.id)))
  return {
   status: 400,
   body: {
    message: "ID invalid"
   }
  }

 let result = await new Promise((resolve, reject) => db.query(`INSERT INTO authorized (id, type) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id`, [bodyJSON.id, bodyJSON.type], (err, result) => err ? reject(err) : resolve(result))).catch((err) => { console.log(err); return null });

 if (result) {

  return {
   status: 204
  };

 }

 return {
  status: 409,
  body: {
   message: "Database error"
  }
 };

}

export async function del(event) {

 if (!event.locals.userData?.manager)
  return {
   status: 401,
   body: {
    error: "Unauthorized"
   }
  };

 let bodyJSON = await event.request.json();

 if (!bodyJSON.id || !Number.isInteger(parseInt(bodyJSON.id)))
  return {
   status: 400,
   body: {
    message: "ID invalid"
   }
  }

 let result = await new Promise((resolve, reject) => db.query(`DELETE FROM authorized WHERE id = ?`, [bodyJSON.id], (err, result) => err ? reject(err) : resolve(result))).catch((err) => { console.log(err); return null });

 if (result) {

  return {
   status: 204
  };

 }

 return {
  status: 409,
  body: {
   message: "Database error"
  }
 };

}