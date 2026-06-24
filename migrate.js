import fs from "fs";
import path from "path";
import esbuild from "esbuild";

const SOURCE_DIR = "D:\\SONHAI\\SU26\\SWR302\\FE-V2\\src\\common";
const TARGET_DIR = "D:\\SONHAI\\HorseRace_FE\\src\\common";

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function runMigration() {
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  }
  
  walkDir(SOURCE_DIR, (filePath) => {
    const relPath = path.relative(SOURCE_DIR, filePath);
    const ext = path.extname(filePath);
    let targetPath = path.join(TARGET_DIR, relPath);

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    if (ext === ".ts" || ext === ".tsx") {
      const isTsx = ext === ".tsx";
      targetPath = targetPath.replace(/\.tsx?$/, isTsx ? ".jsx" : ".js");

      // We do not want to migrate test files
      if (filePath.includes(".test.")) {
        return;
      }

      const sourceCode = fs.readFileSync(filePath, "utf-8");

      try {
        const result = esbuild.transformSync(sourceCode, {
          loader: isTsx ? "tsx" : "ts",
          jsx: "preserve",
          target: "esnext",
          format: "esm",
        });

        // Some minor post-processing to replace import paths
        let jsCode = result.code;
        // Replace absolute aliases @/common/... with relative or keep them if they are relative
        // Since we are copying the whole common folder, we might need to adjust @/common/... to relative paths
        // Or we can configure alias in vite.config.js for @ to src
        
        fs.writeFileSync(targetPath, jsCode, "utf-8");
        console.log(`Transformed: ${relPath} -> ${path.basename(targetPath)}`);
      } catch (err) {
        console.error(`Failed to transform ${filePath}:`, err);
      }
    } else {
      // Just copy other files like images/css if any
      fs.copyFileSync(filePath, targetPath);
      console.log(`Copied: ${relPath}`);
    }
  });
  console.log("Migration complete.");
}

runMigration();
