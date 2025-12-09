import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const appName = 'BatesTrading Vision'; // Product Name
const appData = process.env.APPDATA || 'C:\\Users\\skouf\\AppData\\Roaming';
const dbPath = path.join(appData, appName, 'bates-trading.db');

console.log("Looking for DB at:", dbPath);

if (!fs.existsSync(dbPath)) {
    console.log("❌ DB file not found.");
    // Try alternate name from package.json 'name' field if product name differs
    const altPath = path.join(appData, 'bates-tading-vision', 'bates-trading.db');
    console.log("Trying alt path:", altPath);
    if (fs.existsSync(altPath)) {
         analyze(altPath);
    }
} else {
    analyze(dbPath);
}

function analyze(file) {
    console.log("✅ Found DB at:", file);
    try {
        const db = new Database(file, { readonly: true });
        
        // Get setting
        try {
            const settingStmt = db.prepare("SELECT value FROM app_settings WHERE key = 'be_threshold'");
            const setting = settingStmt.get();
            console.log("Current BE Threshold in DB:", setting ? setting.value : 'Not Set (Default 0.3)');
        } catch (e) {
            console.log("Error reading settings table:", e.message);
        }

        // Get recent trades
        try {
            const tradesStmt = db.prepare("SELECT * FROM trades ORDER BY open_date DESC LIMIT 5");
            const trades = tradesStmt.all();

            console.log("\n--- Recent Trades Analysis ---");
            if (trades.length === 0) console.log("No trades found.");
            
            trades.forEach(t => {
                const risk = t.risk || 0;
                const pnl = t.pnl || 0;
                const pctRisk = risk > 0 ? (Math.abs(pnl) / risk) * 100 : 0;
                console.log(`ID: ${t.id}, Date: ${t.open_date}, Pair: ${t.pair}, PnL: ${pnl}, Risk: ${risk}, %Risk (Calc): ${pctRisk.toFixed(4)}%`);
                if (t.pair === 'XAUUSD') {
                     console.log(">>> THIS IS THE TARGET TRADE <<<");
                }
            });
        } catch (e) {
             console.log("Error reading trades table:", e.message);
        }
        
    } catch (e) {
        console.error("Failed to open DB:", e);
    }
}