export function GET(event) {

 let snowflake = event.params.snowflake;

 return {
  status: 200,
  body: Number(BigInt(snowflake) >> 22n) + 1_420_070_400_000
 }

}