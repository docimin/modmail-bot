function GET(event) {
  let snowflake = event.params.snowflake;
  return {
    status: 200,
    body: Number(BigInt(snowflake) >> 22n) + 14200704e5
  };
}
export {
  GET
};
