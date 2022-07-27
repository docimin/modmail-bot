import { d as db } from "../../../../_app/immutable/chunks/db-90aa6d88.js";
import "mysql2";
async function GET(event) {
  var _a, _b, _c, _d, _e, _f, _g;
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
        managerIds: (_d = (_c = (_b = process.env) == null ? void 0 : _b.MANAGER_USER_IDS) == null ? void 0 : _c.split) == null ? void 0 : _d.call(_c, ","),
        userIds: [.../* @__PURE__ */ new Set([...(_g = (_f = (_e = process.env) == null ? void 0 : _e.MANAGER_USER_IDS) == null ? void 0 : _f.split) == null ? void 0 : _g.call(_f, ","), ...result.filter((r) => r.type === "user").map((r) => r.id)])].filter((id) => id),
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
async function PUT(event) {
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
async function DEL(event) {
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
export {
  DEL,
  GET,
  PUT
};
