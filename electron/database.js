import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to database (stored in userData folder)
const dbPath = path.join(app.getPath('userData'), 'bates-trading.db');
let db = null;

/**
 * Load data from legacy app folder
 */
export const loadLegacyData = () => {
  try {
    const legacyPath = path.join(
      process.env.APPDATA,
      'swingtrade-pro'
    );

    if (!fs.existsSync(legacyPath)) {
      console.log('❌ Legacy app folder not found at:', legacyPath);
      return null;
    }

    const data = {
      trades: [],
      accounts: [],
      plan: null,
      macroEvents: [],
    };

    // Try to load trades
    const tradesFile = path.join(legacyPath, 'trades.json');
    if (fs.existsSync(tradesFile)) {
      try {
        data.trades = JSON.parse(fs.readFileSync(tradesFile, 'utf8'));
        console.log(`✅ Loaded ${data.trades.length} trades from legacy folder`);
      } catch (e) {
        console.error('Error reading trades.json:', e);
      }
    }

    // Try to load accounts
    const accountsFile = path.join(legacyPath, 'accounts.json');
    if (fs.existsSync(accountsFile)) {
      try {
        data.accounts = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
        console.log(`✅ Loaded ${data.accounts.length} accounts from legacy folder`);
      } catch (e) {
        console.error('Error reading accounts.json:', e);
      }
    }

    // Try to load plan
    const planFile = path.join(legacyPath, 'plan.json');
    if (fs.existsSync(planFile)) {
      try {
        data.plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
        console.log('✅ Loaded plan from legacy folder');
      } catch (e) {
        console.error('Error reading plan.json:', e);
      }
    }

    // Try to load macro events
    const eventsFile = path.join(legacyPath, 'macroEvents.json');
    if (fs.existsSync(eventsFile)) {
      try {
        data.macroEvents = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
        console.log(`✅ Loaded ${data.macroEvents.length} macro events from legacy folder`);
      } catch (e) {
        console.error('Error reading macroEvents.json:', e);
      }
    }

    if (data.trades.length === 0 && data.accounts.length === 0) {
      console.log('⚠️ No data found in legacy folder');
      return null;
    }

    console.log('✅ Legacy data loaded successfully');
    return data;
  } catch (error) {
    console.error('Error loading legacy data:', error);
    return null;
  }
};

/**
 * Initialize SQLite Database
 */
export const initDatabase = () => {
  db = new Database(dbPath, { verbose: console.log });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables
  createTables();

  console.log(`✅ Database initialized at: ${dbPath}`);
  return db;
};

/**
 * Create all tables
 */
const createTables = () => {
  // Accounts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      balance REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT '$',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Trades table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY,
      account_id TEXT NOT NULL,
      open_date TEXT NOT NULL,
      close_date TEXT,
      pair TEXT NOT NULL,
      direction TEXT NOT NULL,
      position_size TEXT,
      setup TEXT,
      risk REAL,
      pnl REAL NOT NULL,
      r REAL,
      notes TEXT,
      psychology TEXT,
      screenshot_before TEXT,
      screenshot_after TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `);

  // Trading plan table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trading_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      daily_routine TEXT NOT NULL,
      rules TEXT NOT NULL,
      goals TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Macro events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS macro_events (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      event TEXT NOT NULL,
      category TEXT NOT NULL,
      actual REAL NOT NULL,
      forecast REAL NOT NULL,
      previous REAL,
      impact TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // App settings table (key/value)
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  console.log('✅ All tables created');
};

// ==================== ACCOUNTS ====================

export const getAllAccounts = () => {
  const stmt = db.prepare('SELECT * FROM accounts ORDER BY created_at ASC');
  return stmt.all();
};

export const createAccount = (account) => {
  const stmt = db.prepare(`
    INSERT INTO accounts (id, name, balance, currency)
    VALUES (@id, @name, @balance, @currency)
  `);
  return stmt.run(account);
};

export const deleteAccount = (id) => {
  const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
  return stmt.run(id);
};

// ==================== TRADES ====================

export const getAllTrades = () => {
  const stmt = db.prepare('SELECT * FROM trades ORDER BY open_date DESC');
  return stmt.all();
};

export const createTrade = (trade) => {
  const stmt = db.prepare(`
    INSERT INTO trades (
      id, account_id, open_date, close_date, pair, direction,
      position_size, setup, risk, pnl, r, notes, psychology,
      screenshot_before, screenshot_after
    ) VALUES (
      @id, @accountId, @openDate, @closeDate, @pair, @direction,
      @positionSize, @setup, @risk, @pnl, @r, @notes, @psychology,
      @screenshotBefore, @screenshotAfter
    )
  `);
  return stmt.run(trade);
};

export const updateTrade = (trade) => {
  const stmt = db.prepare(`
    UPDATE trades SET
      account_id = @accountId,
      open_date = @openDate,
      close_date = @closeDate,
      pair = @pair,
      direction = @direction,
      position_size = @positionSize,
      setup = @setup,
      risk = @risk,
      pnl = @pnl,
      r = @r,
      notes = @notes,
      psychology = @psychology,
      screenshot_before = @screenshotBefore,
      screenshot_after = @screenshotAfter
    WHERE id = @id
  `);
  return stmt.run(trade);
};

export const deleteTrade = (id) => {
  const stmt = db.prepare('DELETE FROM trades WHERE id = ?');
  return stmt.run(id);
};

// ==================== TRADING PLAN ====================

export const getTradingPlan = () => {
  const stmt = db.prepare('SELECT * FROM trading_plan ORDER BY id DESC LIMIT 1');
  const row = stmt.get();
  
  if (!row) return null;
  
  return {
    dailyRoutine: JSON.parse(row.daily_routine),
    rules: JSON.parse(row.rules),
    goals: row.goals,
  };
};

export const saveTradingPlan = (plan) => {
  // Delete old plan and insert new one
  db.exec('DELETE FROM trading_plan');
  
  const stmt = db.prepare(`
    INSERT INTO trading_plan (daily_routine, rules, goals)
    VALUES (?, ?, ?)
  `);
  
  return stmt.run(
    JSON.stringify(plan.dailyRoutine),
    JSON.stringify(plan.rules),
    plan.goals
  );
};

// ==================== MACRO EVENTS ====================

export const getAllMacroEvents = () => {
  const stmt = db.prepare('SELECT * FROM macro_events ORDER BY date DESC');
  return stmt.all();
};

export const createMacroEvent = (event) => {
  const stmt = db.prepare(`
    INSERT INTO macro_events (id, date, event, category, actual, forecast, previous, impact)
    VALUES (@id, @date, @event, @category, @actual, @forecast, @previous, @impact)
  `);
  return stmt.run(event);
};

export const deleteMacroEvent = (id) => {
  const stmt = db.prepare('DELETE FROM macro_events WHERE id = ?');
  return stmt.run(id);
};

export const cleanOldMacroEvents = (beforeDate = '2024-01-01') => {
  try {
    const stmt = db.prepare('DELETE FROM macro_events WHERE date < ?');
    const result = stmt.run(beforeDate);
    console.log(`✅ Deleted ${result.changes} macro events before ${beforeDate}`);
    return result.changes;
  } catch (e) {
    console.error('Error cleaning old macro events:', e);
    return 0;
  }
};

export const cleanOldTrades = (beforeDate = '2024-01-01') => {
  try {
    const stmt = db.prepare('DELETE FROM trades WHERE open_date < ?');
    const result = stmt.run(beforeDate);
    console.log(`✅ Deleted ${result.changes} trades before ${beforeDate}`);
    return result.changes;
  } catch (e) {
    console.error('Error cleaning old trades:', e);
    return 0;
  }
};

// ==================== SETTINGS ====================
export const getSetting = (key) => {
  try {
    const stmt = db.prepare('SELECT value FROM app_settings WHERE key = ?');
    const row = stmt.get(key);
    return row ? row.value : null;
  } catch (e) {
    console.error('Error reading setting', key, e);
    return null;
  }
};

export const setSetting = (key, value) => {
  try {
    const up = db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
    return up.run(key, String(value));
  } catch (e) {
    console.error('Error saving setting', key, e);
    return null;
  }
};

// ==================== MIGRATION ====================

export const migrateFromLocalStorage = (data) => {
  // Normalize incoming objects and dedupe before inserting
  const result = {
    accounts: { inserted: 0, skipped: 0 },
    trades: { inserted: 0, skipped: 0 },
    macroEvents: { inserted: 0, skipped: 0 },
    planInserted: false,
  };

  const transaction = db.transaction(() => {
    // Helper normalizers
    const normAccount = (a) => ({
      id: a.id || a._id || a.uuid || String(Date.now() + Math.random()),
      name: a.name || a.label || 'Compte',
      balance: parseFloat(a.balance || a.amount || 0) || 0,
      currency: a.currency || a.currency_code || '$',
    });

    const normTrade = (t) => ({
      id: t.id != null ? t.id : null,
      accountId: t.account_id || t.accountId || t.account || 'unknown',
      openDate: t.open_date || t.openDate || t.date || null,
      closeDate: t.close_date || t.closeDate || t.closed_at || null,
      pair: t.pair || t.symbol || '',
      direction: t.direction || t.side || 'LONG',
      positionSize: t.position_size || t.positionSize || t.position_size_text || null,
      setup: t.setup || t.strategy || null,
      risk: t.risk != null ? parseFloat(t.risk) : null,
      pnl: t.pnl != null ? parseFloat(t.pnl) : 0,
      r: t.r != null ? parseFloat(t.r) : null,
      notes: t.notes || t.note || null,
      psychology: t.psychology || null,
      screenshotBefore: t.screenshot_before || t.screenshotBefore || t.screenshot || null,
      screenshotAfter: t.screenshot_after || t.screenshotAfter || null,
    });

    const normMacro = (m) => ({
      id: m.id != null ? m.id : null,
      date: m.date || m.event_date || null,
      event: m.event || m.title || '',
      category: m.category || m.type || 'Other',
      actual: m.actual != null ? parseFloat(m.actual) : 0,
      forecast: m.forecast != null ? parseFloat(m.forecast) : 0,
      previous: m.previous != null ? parseFloat(m.previous) : null,
      impact: m.impact || 'Medium',
    });

    // Migrate accounts with dedupe by id
    if (data.accounts && Array.isArray(data.accounts)) {
      const checkAcct = db.prepare('SELECT 1 FROM accounts WHERE id = ?');
      data.accounts.forEach(raw => {
        const a = normAccount(raw);
        const exists = checkAcct.get(a.id);
        if (exists) {
          result.accounts.skipped += 1;
        } else {
          try {
            createAccount(a);
            result.accounts.inserted += 1;
          } catch (e) {
            result.accounts.skipped += 1;
          }
        }
      });
    }

    // Migrate trades with dedupe by id or signature
    if (data.trades && Array.isArray(data.trades)) {
      const checkById = db.prepare('SELECT 1 FROM trades WHERE id = ?');
      const checkBySig = db.prepare('SELECT id FROM trades WHERE account_id = ? AND open_date = ? AND pair = ? AND direction = ? LIMIT 1');
      data.trades.forEach(raw => {
        const t = normTrade(raw);
        let skip = false;
        if (t.id != null) {
          const exists = checkById.get(t.id);
          if (exists) skip = true;
        } else {
          // signature-based dedupe
          const found = checkBySig.get(t.accountId, t.openDate, t.pair, t.direction);
          if (found) skip = true;
        }

        if (skip) {
          result.trades.skipped += 1;
        } else {
          try {
            // createTrade expects camelCase keys matching prepared statement params
            createTrade(t);
            result.trades.inserted += 1;
          } catch (e) {
            result.trades.skipped += 1;
          }
        }
      });
    }

    // Migrate trading plan (replace existing)
    if (data.plan) {
      try {
        saveTradingPlan(data.plan);
        result.planInserted = true;
      } catch (e) {
        result.planInserted = false;
      }
    }

    // Migrate macro events with dedupe by id or (date+event) - Filter out old events (before 2024)
    if (data.macroEvents && Array.isArray(data.macroEvents)) {
      const checkById = db.prepare('SELECT 1 FROM macro_events WHERE id = ?');
      const checkBySig = db.prepare('SELECT 1 FROM macro_events WHERE date = ? AND event = ? LIMIT 1');
      const cutoffDate = '2024-01-01'; // Only keep events from 2024 onwards
      
      data.macroEvents.forEach(raw => {
        const m = normMacro(raw);
        
        // Skip old events (before 2024)
        if (m.date && m.date < cutoffDate) {
          result.macroEvents.skipped += 1;
          return;
        }
        
        let skip = false;
        if (m.id != null) {
          const exists = checkById.get(m.id);
          if (exists) skip = true;
        } else {
          const exists = checkBySig.get(m.date, m.event);
          if (exists) skip = true;
        }

        if (skip) {
          result.macroEvents.skipped += 1;
        } else {
          try {
            createMacroEvent(m);
            result.macroEvents.inserted += 1;
          } catch (e) {
            result.macroEvents.skipped += 1;
          }
        }
      });
    }
  });

  transaction();
  console.log('✅ Migration completed', result);
  return result;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    console.log('✅ Database closed');
  }
};