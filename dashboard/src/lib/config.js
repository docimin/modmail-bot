import fs from "fs";

export default (() => {

 let file, file2;

 try {
  file = fs.readFileSync("../config.json");
 } catch (err) {
  file = fs.readFileSync("./config.json");
 }

 try {
  file2 = fs.readFileSync("../bot/assets/config.json");
 } catch (err) {
  file2 = fs.readFileSync("./bot/assets/config.json");
 }

 let config  = JSON.parse(file),
     config2 = JSON.parse(file2)

 return {
  ...config,
  sub: config2
 };

})()