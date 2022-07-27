const userCache = /* @__PURE__ */ new Map();
function GET(event) {
  return new Promise((resolve) => {
    if (!event.locals.userData)
      return resolve({
        status: 401,
        body: {
          error: "Unauthorized"
        }
      });
    let userIds = event.url.searchParams.getAll("userId") || null;
    let users = [];
    let iUserIds = 0;
    getUser();
    async function getUser() {
      let userId = userIds[iUserIds];
      if (userId) {
        let cachedUser = userCache.get(userId);
        if (((cachedUser == null ? void 0 : cachedUser.timestamp) || 0) + 6e4 * 5 < Date.now()) {
          let result = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_TOKEN}`
            }
          });
          if (result.status === 200) {
            userCache.set(userId, {
              ...await result.json(),
              timestamp: Date.now()
            });
            users.push(userCache.get(userId));
          }
        } else {
          users.push(cachedUser);
        }
      }
      iUserIds++;
      if (iUserIds >= userIds.length)
        resolve({
          status: 200,
          body: users
        });
      else
        setTimeout(getUser);
    }
  });
}
export {
  GET
};
