import { Redirect } from "expo-router";

/** Root index just redirects to the main tab screen */
export default function Index() {
  return <Redirect href="/(tabs)/" />;
}
