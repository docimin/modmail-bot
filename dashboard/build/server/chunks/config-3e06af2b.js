var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import fs from "fs";
var config = (() => {
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
  let config2 = JSON.parse(file), config22 = JSON.parse(file2);
  return __spreadProps(__spreadValues({}, config2), {
    sub: config22
  });
})();
export { config as c };
