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

// ==================== MIGRATION ====================

export const migrateFromLocalStorage = (data) => {
  const transaction = db.transaction(() => {
    // Migrate accounts
    if (data.accounts) {
      data.accounts.forEach(account => {
        try {
          createAccount(account);
        } catch (e) {
          console.log('Account already exists:', account.id);
        }
      });
    }

    // Migrate trades
    if (data.trades) {
      data.trades.forEach(trade => {
        try {
          createTrade(trade);
        } catch (e) {
          console.log('Trade already exists:', trade.id);
        }
      });
    }

    // Migrate trading plan
    if (data.plan) {
      saveTradingPlan(data.plan);
    }

    // Migrate macro events
    if (data.macroEvents) {
      data.macroEvents.forEach(event => {
        try {
          createMacroEvent(event);
        } catch (e) {
          console.log('Event already exists:', event.id);
        }
      });
    }
  });

  transaction();
  console.log('✅ Migration completed');
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    console.log('✅ Database closed');
  }
};