import { readFile,stat } from "node:fs/promises";
import { resolve } from "node:path";
import { IMPORT_MAX_BYTES,parseAndValidateImport } from "../src/lib/question-import/schema";
const input=process.argv[2];if(!input){console.error("Usage: npm run content:validate-import -- path/to/file.json");process.exit(2);}const path=resolve(input);const info=await stat(path);if(info.size>IMPORT_MAX_BYTES){console.error(`ERROR FILE_TOO_LARGE: ${info.size} bytes`);process.exit(1);}const report=parseAndValidateImport(await readFile(path,"utf8"));const safe={...report};delete safe.parsed;console.log(JSON.stringify(safe,null,2));process.exitCode=report.valid?0:1;
