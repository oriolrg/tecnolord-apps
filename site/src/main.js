import { installClientUpdates } from "./clientUpdates.js";
import { CONFIG } from "./config.js";
import { initAnalytics } from "./analytics.js";
import { initApp } from "./ui/screens/app.js";
import { installChartModalClicks } from "./ui/components/chartModal.js";


installClientUpdates(import.meta.url);

initAnalytics(CONFIG);
initApp(document.getElementById("app"));
installChartModalClicks(document);
