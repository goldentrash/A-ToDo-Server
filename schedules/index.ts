import { Expo } from "expo-server-sdk";

if (typeof process.env.EXPO_ACCESS_TOKEN !== "string")
  throw Error("there's no EXPO_ACCESS_TOKEN");
const EXPO_ACCESS_TOKEN = process.env.EXPO_ACCESS_TOKEN;

export const expo = new Expo({ accessToken: EXPO_ACCESS_TOKEN });

import "./pushWatingAlarm";
import "./pushOldWorkingHint";
