import { c as config } from "../../../../chunks/config-3e06af2b.js";
import { d as db } from "../../../../chunks/db-27ceeaba.js";
import "fs";
import "mysql2";
async function get(event) {
  var _a;
  if (!((_a = event.locals.userData) == null ? void 0 : _a.manager))
    return {
      status: 401,
      body: {
        error: "Unauthorized"
      }
    };
  let result = await new Promise((resolve, reject) => db.query(`SELECT * FROM authorized`, (err, result2) => err ? reject(err) : resolve(result2))).catch((err) => {
    console.log(err);
    return null;
  });
  if (result) {
    return {
      status: 200,
      body: {
        managerIds: config.managerUserIds,
        userIds: [.../* @__PURE__ */ new Set([...config.managerUserIds, ...result.filter((r) => r.type === "user").map((r) => r.id)])].filter((id) => id),
        roleIds: [...new Set(result.filter((r) => r.type === "role").map((r) => r.id))]
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
async function put(event) {
  var _a;
  if (!((_a = event.locals.userData) == null ? void 0 : _a.manager))
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
    };
  let result = await new Promise((resolve, reject) => db.query(`INSERT INTO authorized (id, type) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id`, [bodyJSON.id, bodyJSON.type], (err, result2) => err ? reject(err) : resolve(result2))).catch((err) => {
    console.log(err);
    return null;
  });
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
async function del(event) {
  var _a;
  if (!((_a = event.locals.userData) == null ? void 0 : _a.manager))
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
    };
  let result = await new Promise((resolve, reject) => db.query(`DELETE FROM authorized WHERE id = ?`, [bodyJSON.id], (err, result2) => err ? reject(err) : resolve(result2))).catch((err) => {
    console.log(err);
    return null;
  });
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
export { del, get, put };
