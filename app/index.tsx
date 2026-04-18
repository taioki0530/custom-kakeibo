import { Redirect } from "expo-router";

const now = new Date();

export default function Index() {
  return <Redirect href={`/${now.getFullYear()}/${now.getMonth() + 1}`} />;
}
