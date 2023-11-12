import { Expo } from "expo-server-sdk";
import { EXPO_ACCESS_TOKEN } from "../constants";

export const expo = new Expo({ accessToken: EXPO_ACCESS_TOKEN });

export { pushWatingAlarm } from "./pushWatingAlarm";
export { pushOldWorkingHint } from "./pushOldWorkingHint";
