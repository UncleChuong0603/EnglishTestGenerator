import { baselineListening } from "./listening-fixture-data.mjs";
import { listeningManifest as task12Listening } from "../content/listening/task-12-listening.mjs";
import { questionBankExpansion } from "../content/listening/question-bank-expansion.mjs";
export const listeningManifest = [...task12Listening, ...questionBankExpansion];
export const productionListening = [...baselineListening, ...listeningManifest];
