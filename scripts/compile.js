const fs = require("fs");
const path = require("path");
const solc = require("solc");

const input = {
  language: "Solidity",
  sources: {
    "contracts/BaiworPassport.sol": {
      content: fs.readFileSync(path.join(__dirname, "../contracts/BaiworPassport.sol"), "utf8"),
    },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
  },
};

function findImports(p) {
  const normalized = p.replace(/^@openzeppelin\//, "@openzeppelin/");
  const full = path.join(__dirname, "../node_modules", normalized);
  if (fs.existsSync(full)) return { contents: fs.readFileSync(full, "utf8") };
  return { error: "not found: " + p };
}

const out = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
const errors = (out.errors || []).filter((e) => e.severity === "error");
if (errors.length) { console.error(errors.map((e) => e.formattedMessage).join("\n")); process.exit(1); }
const c = out.contracts["contracts/BaiworPassport.sol"]["BaiworPassport"];
fs.mkdirSync(path.join(__dirname, "../out"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "../out/BaiworPassport.json"), JSON.stringify({ abi: c.abi, bytecode: "0x" + c.evm.bytecode.object }, null, 2));
console.log("OK compiled. bytecode bytes:", c.evm.bytecode.object.length / 2);
